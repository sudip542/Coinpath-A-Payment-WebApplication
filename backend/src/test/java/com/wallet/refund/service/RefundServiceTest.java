package com.wallet.refund.service;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.outbox.service.OutboxService;
import com.wallet.payment.entity.Payment;
import com.wallet.payment.entity.PaymentMethod;
import com.wallet.payment.entity.PaymentStatus;
import com.wallet.payment.gateway.MockPaymentGateway;
import com.wallet.payment.gateway.PaymentGatewayFactory;
import com.wallet.payment.gateway.PaymentGatewayResult;
import com.wallet.payment.repository.PaymentRepository;
import com.wallet.refund.dto.CreateRefundRequest;
import com.wallet.refund.dto.RefundResponseDto;
import com.wallet.refund.entity.Refund;
import com.wallet.refund.entity.RefundStatus;
import com.wallet.refund.repository.RefundRepository;
import com.wallet.transaction.entity.WalletTransaction;
import com.wallet.transaction.ledger.LedgerService;
import com.wallet.transaction.repository.WalletTransactionRepository;
import com.wallet.wallet.entity.Wallet;
import com.wallet.wallet.entity.WalletStatus;
import com.wallet.wallet.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefundServiceTest {

    @Mock
    private RefundRepository refundRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private PaymentGatewayFactory gatewayFactory;

    @Mock
    private WalletTransactionRepository transactionRepository;

    @Mock
    private LedgerService ledgerService;

    @Mock
    private OutboxService outboxService;

    @Mock
    private MockPaymentGateway mockPaymentGateway;

    @InjectMocks
    private RefundService refundService;

    private UUID userId;
    private UUID walletId;
    private UUID paymentId;
    private Payment testPayment;
    private Wallet testWallet;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        walletId = UUID.randomUUID();
        paymentId = UUID.randomUUID();

        testPayment = Payment.builder()
                .id(paymentId)
                .paymentReference("PAY-123456789")
                .userId(userId)
                .walletId(walletId)
                .amount(new BigDecimal("1000.0000"))
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .paymentMethod(PaymentMethod.MOCK_GATEWAY)
                .build();

        testWallet = Wallet.builder()
                .id(walletId)
                .userId(userId)
                .balance(new BigDecimal("1000.0000"))
                .currency("INR")
                .status(WalletStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should successfully process partial refund and deduct wallet balance with ledger record")
    void testPartialRefundSuccess() {
        CreateRefundRequest request = CreateRefundRequest.builder()
                .paymentReference("PAY-123456789")
                .amount(new BigDecimal("400.00"))
                .reason("Partial order return")
                .build();

        when(paymentRepository.findByPaymentReference("PAY-123456789")).thenReturn(Optional.of(testPayment));
        when(refundRepository.calculateTotalRefunded(paymentId)).thenReturn(BigDecimal.ZERO);
        when(refundRepository.save(any(Refund.class))).thenAnswer(i -> {
            Refund r = i.getArgument(0);
            if (r.getId() == null) r.setId(UUID.randomUUID());
            return r;
        });

        when(gatewayFactory.getGateway(PaymentMethod.MOCK_GATEWAY)).thenReturn(mockPaymentGateway);
        when(mockPaymentGateway.processRefund(any(Payment.class), any(BigDecimal.class)))
                .thenReturn(PaymentGatewayResult.success("PSP-REF-999"));

        when(walletRepository.findByIdWithLock(walletId)).thenReturn(Optional.of(testWallet));
        when(transactionRepository.save(any(WalletTransaction.class))).thenAnswer(i -> i.getArgument(0));

        RefundResponseDto response = refundService.processRefund(userId, request);

        assertNotNull(response);
        assertEquals(RefundStatus.SUCCESS, response.getStatus());
        assertEquals(new BigDecimal("400.0000"), response.getAmount());
        assertEquals(new BigDecimal("600.0000"), testWallet.getBalance(), "Wallet balance should decrease to 600");

        verify(ledgerService, times(1)).recordDebit(any(), eq(walletId), eq(new BigDecimal("400.0000")), eq(new BigDecimal("600.0000")), eq("INR"));
        verify(outboxService, times(1)).publish(eq("REFUND"), any(), eq("REFUND_COMPLETED"), any());
    }

    @Test
    @DisplayName("Should reject refund when total refunded exceeds original payment amount")
    void testRefundOverdraftRejected() {
        // Prior refund of 700 already completed out of 1000
        when(paymentRepository.findByPaymentReference("PAY-123456789")).thenReturn(Optional.of(testPayment));
        when(refundRepository.calculateTotalRefunded(paymentId)).thenReturn(new BigDecimal("700.0000"));

        CreateRefundRequest request = CreateRefundRequest.builder()
                .paymentReference("PAY-123456789")
                .amount(new BigDecimal("400.00")) // 700 + 400 = 1100 > 1000!
                .build();

        CoinpathException ex = assertThrows(CoinpathException.class, () ->
                refundService.processRefund(userId, request));

        assertEquals(ErrorCode.REFUND_EXCEEDS_LIMIT, ex.getErrorCode());
        verify(mockPaymentGateway, never()).processRefund(any(), any());
        verify(walletRepository, never()).findByIdWithLock(any());
    }

    @Test
    @DisplayName("Should reject refund for a payment that is not in SUCCESS status")
    void testRefundNonSuccessPaymentThrows() {
        testPayment.setStatus(PaymentStatus.PROCESSING);
        when(paymentRepository.findByPaymentReference("PAY-123456789")).thenReturn(Optional.of(testPayment));

        CreateRefundRequest request = CreateRefundRequest.builder()
                .paymentReference("PAY-123456789")
                .amount(new BigDecimal("100.00"))
                .build();

        CoinpathException ex = assertThrows(CoinpathException.class, () ->
                refundService.processRefund(userId, request));

        assertEquals(ErrorCode.INVALID_STATE_TRANSITION, ex.getErrorCode());
    }
}
