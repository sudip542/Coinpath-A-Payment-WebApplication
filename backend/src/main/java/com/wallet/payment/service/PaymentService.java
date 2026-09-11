package com.wallet.payment.service;

import com.wallet.common.event.PaymentSuccessEvent;
import com.wallet.common.outbox.service.OutboxService;
import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.util.Money;
import com.wallet.payment.dto.CreatePaymentRequest;
import com.wallet.payment.dto.PaymentResponseDto;
import com.wallet.payment.entity.Payment;
import com.wallet.payment.entity.PaymentStatus;
import com.wallet.payment.gateway.PaymentGateway;
import com.wallet.payment.gateway.PaymentGatewayFactory;
import com.wallet.payment.gateway.PaymentGatewayResult;
import com.wallet.payment.repository.PaymentRepository;
import com.wallet.transaction.entity.TransactionStatus;
import com.wallet.transaction.entity.TransactionType;
import com.wallet.transaction.entity.WalletTransaction;
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
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final WalletRepository walletRepository;
    private final PaymentGatewayFactory gatewayFactory;
    private final WalletTransactionRepository transactionRepository;
    private final LedgerService ledgerService;
    private final OutboxService outboxService;

    public PaymentService(
            PaymentRepository paymentRepository,
            WalletRepository walletRepository,
            PaymentGatewayFactory gatewayFactory,
            WalletTransactionRepository transactionRepository,
            LedgerService ledgerService,
            OutboxService outboxService) {
        this.paymentRepository = paymentRepository;
        this.walletRepository = walletRepository;
        this.gatewayFactory = gatewayFactory;
        this.transactionRepository = transactionRepository;
        this.ledgerService = ledgerService;
        this.outboxService = outboxService;
    }

    @Transactional
    public PaymentResponseDto createPayment(UUID userId, CreatePaymentRequest request) {
        log.info("Initiating payment for user: {}, amount: {} {}, method: {}",
                userId, request.getAmount(), request.getCurrency(), request.getPaymentMethod());

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet not found for user: " + userId));

        wallet.assertActive();

        BigDecimal amount = request.getAmount().setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING);
        String paymentRef = "PAY-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        // 1. Persist payment in INITIATED state
        Payment payment = Payment.builder()
                .paymentReference(paymentRef)
                .userId(userId)
                .walletId(wallet.getId())
                .amount(amount)
                .currency(wallet.getCurrency())
                .status(PaymentStatus.INITIATED)
                .paymentMethod(request.getPaymentMethod())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // 2. Transition to PROCESSING state
        savedPayment.markProcessing();
        paymentRepository.save(savedPayment);

        // 3. Invoke Payment Gateway Strategy
        PaymentGateway gateway = gatewayFactory.getGateway(request.getPaymentMethod());
        PaymentGatewayResult result = gateway.processPayment(savedPayment);

        // 4. Handle Gateway Decline / Failure
        if (!result.success()) {
            log.warn("Payment gateway declined for payment: {}. Reason: {}", paymentRef, result.message());
            savedPayment.markFailed(result.message());
            paymentRepository.save(savedPayment);
            throw new CoinpathException(ErrorCode.PAYMENT_FAILED, "Payment declined: " + result.message());
        }

        // 5. Gateway Success -> Acquire row lock, Credit Wallet, Record Ledger
        Wallet lockedWallet = walletRepository.findByIdWithLock(wallet.getId())
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet lock failure"));

        lockedWallet.credit(amount);
        walletRepository.save(lockedWallet);

        // 6. Record transaction
        WalletTransaction transaction = WalletTransaction.builder()
                .referenceId("TXN-" + paymentRef)
                .targetWalletId(lockedWallet.getId())
                .amount(amount)
                .currency(lockedWallet.getCurrency())
                .type(TransactionType.CREDIT)
                .status(TransactionStatus.SUCCESS)
                .build();
        WalletTransaction savedTx = transactionRepository.save(transaction);

        // 7. Append immutable ledger entry
        ledgerService.recordCredit(
                savedTx.getId(),
                lockedWallet.getId(),
                amount,
                lockedWallet.getBalance(),
                lockedWallet.getCurrency()
        );

        // 8. Transition payment to SUCCESS
        savedPayment.markSuccess(result.gatewayTransactionId());
        Payment successfulPayment = paymentRepository.save(savedPayment);

        // 9. Register Transactional Outbox Event
        PaymentSuccessEvent event = PaymentSuccessEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .paymentReference(successfulPayment.getPaymentReference())
                .userId(successfulPayment.getUserId())
                .walletId(successfulPayment.getWalletId())
                .amount(amount)
                .currency(successfulPayment.getCurrency())
                .gatewayTransactionId(successfulPayment.getGatewayTransactionId())
                .timestamp(Instant.now())
                .build();
        outboxService.publish("PAYMENT", successfulPayment.getPaymentReference(), "PAYMENT_SUCCESS", event);

        log.info("Payment succeeded and wallet credited. PaymentRef: {}, GatewayTxId: {}",
                paymentRef, result.gatewayTransactionId());

        return PaymentResponseDto.fromEntity(successfulPayment);
    }

    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentByReference(UUID userId, String paymentReference) {
        Payment payment = paymentRepository.findByPaymentReference(paymentReference)
                .orElseThrow(() -> new CoinpathException(ErrorCode.PAYMENT_NOT_FOUND, "Payment not found: " + paymentReference));

        if (!payment.getUserId().equals(userId)) {
            throw new CoinpathException(ErrorCode.FORBIDDEN, "Not authorized to access this payment");
        }

        return PaymentResponseDto.fromEntity(payment);
    }
}
