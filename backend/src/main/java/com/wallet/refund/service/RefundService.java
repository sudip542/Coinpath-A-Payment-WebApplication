package com.wallet.refund.service;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.util.Money;
import com.wallet.payment.entity.Payment;
import com.wallet.payment.entity.PaymentStatus;
import com.wallet.payment.gateway.PaymentGateway;
import com.wallet.payment.gateway.PaymentGatewayFactory;
import com.wallet.payment.gateway.PaymentGatewayResult;
import com.wallet.payment.repository.PaymentRepository;
import com.wallet.refund.dto.CreateRefundRequest;
import com.wallet.refund.dto.RefundResponseDto;
import com.wallet.refund.entity.Refund;
import com.wallet.refund.entity.RefundStatus;
import com.wallet.refund.repository.RefundRepository;
import com.wallet.transaction.entity.TransactionStatus;
import com.wallet.transaction.entity.TransactionType;
import com.wallet.transaction.entity.WalletTransaction;
import com.wallet.common.event.RefundCompletedEvent;
import com.wallet.common.outbox.service.OutboxService;
import com.wallet.transaction.ledger.LedgerService;
import com.wallet.transaction.repository.WalletTransactionRepository;
import com.wallet.wallet.entity.Wallet;
import com.wallet.wallet.repository.WalletRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class RefundService {

    private static final Logger log = LoggerFactory.getLogger(RefundService.class);

    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final WalletRepository walletRepository;
    private final PaymentGatewayFactory gatewayFactory;
    private final WalletTransactionRepository transactionRepository;
    private final LedgerService ledgerService;
    private final OutboxService outboxService;

    public RefundService(
            RefundRepository refundRepository,
            PaymentRepository paymentRepository,
            WalletRepository walletRepository,
            PaymentGatewayFactory gatewayFactory,
            WalletTransactionRepository transactionRepository,
            LedgerService ledgerService,
            OutboxService outboxService) {
        this.refundRepository = refundRepository;
        this.paymentRepository = paymentRepository;
        this.walletRepository = walletRepository;
        this.gatewayFactory = gatewayFactory;
        this.transactionRepository = transactionRepository;
        this.ledgerService = ledgerService;
        this.outboxService = outboxService;
    }

    @Transactional
    public RefundResponseDto processRefund(UUID userId, CreateRefundRequest request) {
        log.info("Initiating refund for paymentRef: {}, requestedBy: {}", request.getPaymentReference(), userId);

        Payment payment = paymentRepository.findByPaymentReference(request.getPaymentReference())
                .orElseThrow(() -> new CoinpathException(ErrorCode.PAYMENT_NOT_FOUND, "Payment not found"));

        // Invariant: User must own the payment or have admin authority
        if (!payment.getUserId().equals(userId)) {
            throw new CoinpathException(ErrorCode.FORBIDDEN, "Not authorized to refund this payment");
        }

        // Invariant: Only successful payments can be refunded
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            log.warn("Attempt to refund unconfirmed payment: {} in status: {}", payment.getPaymentReference(), payment.getStatus());
            throw new CoinpathException(ErrorCode.INVALID_STATE_TRANSITION,
                    "Cannot refund payment with status: " + payment.getStatus());
        }

        // Calculate cumulative prior refunds
        BigDecimal totalRefundedSoFar = refundRepository.calculateTotalRefunded(payment.getId());
        BigDecimal remainingRefundable = payment.getAmount().subtract(totalRefundedSoFar);

        // Determine refund amount
        BigDecimal refundAmount;
        if (request.getAmount() == null) {
            refundAmount = remainingRefundable;
        } else {
            refundAmount = request.getAmount().setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING);
        }

        if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CoinpathException(ErrorCode.INVALID_REQUEST, "Refund amount must be strictly positive");
        }

        // Invariant: Total refunded <= original payment amount
        if (refundAmount.compareTo(remainingRefundable) > 0) {
            log.warn("Refund overdraft attempt: requested {} exceeds remaining refundable {}", refundAmount, remainingRefundable);
            throw new CoinpathException(ErrorCode.REFUND_EXCEEDS_LIMIT,
                    String.format("Requested refund amount (%s) exceeds remaining refundable limit (%s)",
                            refundAmount, remainingRefundable));
        }

        String refundRef = "REF-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        Refund refund = Refund.builder()
                .refundReference(refundRef)
                .paymentId(payment.getId())
                .amount(refundAmount)
                .currency(payment.getCurrency())
                .status(RefundStatus.PROCESSING)
                .reason(request.getReason())
                .build();

        Refund savedRefund = refundRepository.save(refund);

        // Invoke payment gateway refund
        PaymentGateway gateway = gatewayFactory.getGateway(payment.getPaymentMethod());
        PaymentGatewayResult result = gateway.processRefund(payment, refundAmount);

        if (!result.success()) {
            log.warn("Payment gateway declined refund for ref: {}. Reason: {}", refundRef, result.message());
            savedRefund.markFailed(result.message());
            refundRepository.save(savedRefund);
            throw new CoinpathException(ErrorCode.PAYMENT_FAILED, "Refund processing failed: " + result.message());
        }

        // Deduct from wallet and append ledger entry
        Wallet lockedWallet = walletRepository.findByIdWithLock(payment.getWalletId())
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet lock failure during refund"));

        lockedWallet.debit(refundAmount);
        walletRepository.save(lockedWallet);

        WalletTransaction tx = WalletTransaction.builder()
                .referenceId("TXN-" + refundRef)
                .sourceWalletId(lockedWallet.getId())
                .amount(refundAmount)
                .currency(lockedWallet.getCurrency())
                .type(TransactionType.REFUND)
                .status(TransactionStatus.SUCCESS)
                .build();
        WalletTransaction savedTx = transactionRepository.save(tx);

        ledgerService.recordDebit(
                savedTx.getId(),
                lockedWallet.getId(),
                refundAmount,
                lockedWallet.getBalance(),
                lockedWallet.getCurrency()
        );

        savedRefund.markSuccess();
        Refund successfulRefund = refundRepository.save(savedRefund);

        // Append Transactional Outbox Event
        RefundCompletedEvent event = RefundCompletedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .refundReference(refundRef)
                .paymentId(payment.getId())
                .userId(payment.getUserId())
                .amount(refundAmount)
                .currency(payment.getCurrency())
                .timestamp(Instant.now())
                .build();
        outboxService.publish("REFUND", refundRef, "REFUND_COMPLETED", event);

        log.info("Refund completed successfully. RefundRef: {}, Amount: {}", refundRef, refundAmount);
        return RefundResponseDto.fromEntity(successfulRefund);
    }

    @Transactional(readOnly = true)
    public RefundResponseDto getRefundByReference(UUID userId, String refundReference) {
        Refund refund = refundRepository.findByRefundReference(refundReference)
                .orElseThrow(() -> new CoinpathException(ErrorCode.REFUND_NOT_FOUND, "Refund record not found: " + refundReference));

        Payment payment = paymentRepository.findById(refund.getPaymentId())
                .orElseThrow(() -> new CoinpathException(ErrorCode.PAYMENT_NOT_FOUND, "Associated payment not found"));

        if (!payment.getUserId().equals(userId)) {
            throw new CoinpathException(ErrorCode.FORBIDDEN, "Not authorized to view this refund");
        }

        return RefundResponseDto.fromEntity(refund);
    }
}
