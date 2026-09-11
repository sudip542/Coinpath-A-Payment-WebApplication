package com.wallet.payment.service;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.payment.dto.CreatePaymentRequest;
import com.wallet.payment.dto.PaymentResponseDto;
import com.wallet.payment.entity.Payment;
import com.wallet.payment.entity.PaymentMethod;
import com.wallet.payment.entity.PaymentStatus;
import com.wallet.payment.gateway.MockPaymentGateway;
import com.wallet.payment.gateway.PaymentGatewayFactory;
import com.wallet.payment.gateway.PaymentGatewayResult;
import com.wallet.payment.repository.PaymentRepository;
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
import com.wallet.common.outbox.service.OutboxService;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

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
    private PaymentService paymentService;

    private UUID userId;
    private UUID walletId;
    private Wallet testWallet;
    private CreatePaymentRequest paymentRequest;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        walletId = UUID.randomUUID();

        testWallet = Wallet.builder()
                .id(walletId)
                .userId(userId)
                .balance(new BigDecimal("100.0000"))
                .currency("INR")
                .status(WalletStatus.ACTIVE)
                .build();

        paymentRequest = CreatePaymentRequest.builder()
                .amount(new BigDecimal("500.00"))
                .currency("INR")
                .paymentMethod(PaymentMethod.MOCK_GATEWAY)
                .build();
    }

    @Test
    @DisplayName("Should successfully process payment, credit wallet, and record ledger entry")
    void testPaymentSuccess() {
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(testWallet));
        when(walletRepository.findByIdWithLock(walletId)).thenReturn(Optional.of(testWallet));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            if (p.getId() == null) p.setId(UUID.randomUUID());
            return p;
        });

        when(gatewayFactory.getGateway(PaymentMethod.MOCK_GATEWAY)).thenReturn(mockPaymentGateway);
        when(mockPaymentGateway.processPayment(any(Payment.class)))
                .thenReturn(PaymentGatewayResult.success("PSP-TX-12345"));

        when(transactionRepository.save(any(WalletTransaction.class))).thenAnswer(i -> i.getArgument(0));

        PaymentResponseDto response = paymentService.createPayment(userId, paymentRequest);

        assertNotNull(response);
        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertEquals("PSP-TX-12345", response.getGatewayTransactionId());
        assertEquals(new BigDecimal("600.0000"), testWallet.getBalance(), "Wallet must be credited by 500");

        verify(ledgerService, times(1)).recordCredit(any(), eq(walletId), eq(new BigDecimal("500.0000")), eq(new BigDecimal("600.0000")), eq("INR"));
        verify(outboxService, times(1)).publish(eq("PAYMENT"), any(), eq("PAYMENT_SUCCESS"), any());
    }

    @Test
    @DisplayName("Should mark payment as FAILED and not credit wallet when gateway declines")
    void testPaymentGatewayDecline() {
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(testWallet));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            if (p.getId() == null) p.setId(UUID.randomUUID());
            return p;
        });

        when(gatewayFactory.getGateway(PaymentMethod.MOCK_GATEWAY)).thenReturn(mockPaymentGateway);
        when(mockPaymentGateway.processPayment(any(Payment.class)))
                .thenReturn(PaymentGatewayResult.failure("Insufficient funds on credit card"));

        CoinpathException ex = assertThrows(CoinpathException.class, () ->
                paymentService.createPayment(userId, paymentRequest));

        assertEquals(ErrorCode.PAYMENT_FAILED, ex.getErrorCode());
        assertEquals(new BigDecimal("100.0000"), testWallet.getBalance(), "Wallet balance must remain unchanged");
        verify(walletRepository, never()).findByIdWithLock(any());
        verify(ledgerService, never()).recordCredit(any(), any(), any(), any(), any());
    }
}
