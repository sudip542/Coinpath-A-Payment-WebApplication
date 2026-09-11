package com.wallet.integration;

import com.wallet.audit.entity.AuditLog;
import com.wallet.audit.repository.AuditLogRepository;
import com.wallet.auth.dto.RegisterRequest;
import com.wallet.auth.service.AuthService;
import com.wallet.common.outbox.entity.OutboxEvent;
import com.wallet.common.outbox.entity.OutboxStatus;
import com.wallet.common.outbox.publisher.OutboxPublisher;
import com.wallet.common.outbox.repository.OutboxEventRepository;
import com.wallet.notification.consumer.NotificationConsumer;
import com.wallet.notification.entity.Notification;
import com.wallet.notification.repository.NotificationRepository;
import com.wallet.payment.dto.CreatePaymentRequest;
import com.wallet.payment.dto.PaymentResponseDto;
import com.wallet.payment.entity.PaymentMethod;
import com.wallet.payment.entity.PaymentStatus;
import com.wallet.payment.service.PaymentService;
import com.wallet.refund.dto.CreateRefundRequest;
import com.wallet.refund.dto.RefundResponseDto;
import com.wallet.refund.entity.RefundStatus;
import com.wallet.refund.service.RefundService;
import com.wallet.transaction.dto.TransactionResponseDto;
import com.wallet.transaction.dto.TransferRequest;
import com.wallet.transaction.entity.EntryType;
import com.wallet.transaction.entity.LedgerEntry;
import com.wallet.transaction.repository.LedgerEntryRepository;
import com.wallet.transaction.service.TransactionService;
import com.wallet.user.entity.User;
import com.wallet.user.repository.UserRepository;
import com.wallet.wallet.entity.Wallet;
import com.wallet.wallet.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class EndToEndFlowIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private RefundService refundService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private OutboxPublisher outboxPublisher;

    @Autowired
    private NotificationConsumer notificationConsumer;

    @Autowired
    private com.wallet.audit.consumer.AuditConsumer auditConsumer;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @MockBean
    private StringRedisTemplate redisTemplate;

    @MockBean
    private KafkaTemplate<String, String> kafkaTemplate;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        auditLogRepository.deleteAll();
        outboxEventRepository.deleteAll();
        ledgerEntryRepository.deleteAll();
        walletRepository.deleteAll();
        userRepository.deleteAll();

        CompletableFuture<SendResult<String, String>> future = CompletableFuture.completedFuture(null);
        when(kafkaTemplate.send(any(), any(), any())).thenReturn(future);
    }

    @Test
    @DisplayName("Complete E2E Financial Lifecycle: Register -> Deposit -> Transfer -> Outbox Relay -> Consumer -> Safe Refund")
    void testCompleteFinancialLifecycle() throws Exception {
        // Step 1: Register User A (Alice) & User B (Bob) - Auto-provisions Wallets
        authService.register(RegisterRequest.builder()
                .fullName("Alice Wonderland")
                .email("alice@coinpath.com")
                .password("SecurePassword123!")
                .build());

        authService.register(RegisterRequest.builder()
                .fullName("Bob Builder")
                .email("bob@coinpath.com")
                .password("SecurePassword123!")
                .build());

        User alice = userRepository.findByEmail("alice@coinpath.com").orElseThrow();
        User bob = userRepository.findByEmail("bob@coinpath.com").orElseThrow();

        Wallet aliceWallet = walletRepository.findByUserId(alice.getId()).orElseThrow();
        Wallet bobWallet = walletRepository.findByUserId(bob.getId()).orElseThrow();

        assertEquals(new BigDecimal("0.0000"), aliceWallet.getBalance(), "New wallet must start with 0 balance");
        assertEquals(new BigDecimal("0.0000"), bobWallet.getBalance(), "New wallet must start with 0 balance");

        // Step 2: Alice deposits 1000 INR via Payment Gateway
        CreatePaymentRequest paymentRequest = CreatePaymentRequest.builder()
                .amount(new BigDecimal("1000.00"))
                .currency("INR")
                .paymentMethod(PaymentMethod.MOCK_GATEWAY)
                .build();

        PaymentResponseDto paymentResponse = paymentService.createPayment(alice.getId(), paymentRequest);
        assertNotNull(paymentResponse);
        assertEquals(PaymentStatus.SUCCESS, paymentResponse.getStatus());
        assertEquals(new BigDecimal("1000.0000"), paymentResponse.getAmount());

        // Verify Alice's wallet credited and ledger recorded
        aliceWallet = walletRepository.findById(aliceWallet.getId()).orElseThrow();
        assertEquals(new BigDecimal("1000.0000"), aliceWallet.getBalance(), "Alice balance must be 1000.0000");

        List<LedgerEntry> aliceLedger = ledgerEntryRepository.findByWalletIdOrderByCreatedAtAsc(aliceWallet.getId());
        assertEquals(1, aliceLedger.size());
        assertEquals(EntryType.CREDIT, aliceLedger.get(0).getEntryType());
        assertEquals(new BigDecimal("1000.0000"), aliceLedger.get(0).getAmount());

        // Verify Transactional Outbox registered PAYMENT_SUCCESS event
        List<OutboxEvent> outboxList = outboxEventRepository.findAll();
        assertEquals(1, outboxList.size(), "One outbox event should be registered");
        OutboxEvent paymentOutboxEvent = outboxList.get(0);
        assertEquals("PAYMENT_SUCCESS", paymentOutboxEvent.getEventType());
        assertEquals(OutboxStatus.PENDING, paymentOutboxEvent.getStatus());

        // Step 3: Outbox Publisher picks up event and sends to Kafka
        outboxPublisher.processPendingEvents();
        paymentOutboxEvent = outboxEventRepository.findById(paymentOutboxEvent.getId()).orElseThrow();
        assertEquals(OutboxStatus.SENT, paymentOutboxEvent.getStatus(), "Outbox event must transition to SENT");

        // Step 4: Consumers process the event payload (simulating Kafka delivery)
        notificationConsumer.handlePaymentEvent(paymentOutboxEvent.getPayload());
        auditConsumer.auditPaymentEvent(paymentOutboxEvent.getPayload());

        List<Notification> notifications = notificationRepository.findAll();
        assertEquals(1, notifications.size(), "Notification record should be saved");
        assertEquals("EMAIL", notifications.get(0).getChannel());
        assertTrue(notifications.get(0).getContent().contains("1000.0000"));

        List<AuditLog> auditLogs = auditLogRepository.findAll();
        assertEquals(1, auditLogs.size(), "Audit log must be persisted");
        assertEquals("PAYMENT_SUCCESS", auditLogs.get(0).getAction());

        // Step 5: Alice transfers 400 INR to Bob
        TransferRequest transferRequest = TransferRequest.builder()
                .targetWalletId(bobWallet.getId())
                .amount(new BigDecimal("400.00"))
                .currency("INR")
                .description("E2E Test Transfer")
                .build();

        TransactionResponseDto transferResponse = transactionService.transfer(alice.getId(), transferRequest);
        assertNotNull(transferResponse);

        aliceWallet = walletRepository.findById(aliceWallet.getId()).orElseThrow();
        bobWallet = walletRepository.findById(bobWallet.getId()).orElseThrow();

        assertEquals(new BigDecimal("600.0000"), aliceWallet.getBalance(), "Alice balance should be 600.0000");
        assertEquals(new BigDecimal("400.0000"), bobWallet.getBalance(), "Bob balance should be 400.0000");

        // Step 6: Alice requests refund of 200 INR on the original payment
        CreateRefundRequest refundRequest = CreateRefundRequest.builder()
                .paymentReference(paymentResponse.getPaymentReference())
                .amount(new BigDecimal("200.00"))
                .reason("Defective merchandise")
                .build();

        RefundResponseDto refundResponse = refundService.processRefund(alice.getId(), refundRequest);
        assertNotNull(refundResponse);
        assertEquals(RefundStatus.SUCCESS, refundResponse.getStatus());
        assertEquals(new BigDecimal("200.0000"), refundResponse.getAmount());

        aliceWallet = walletRepository.findById(aliceWallet.getId()).orElseThrow();
        assertEquals(new BigDecimal("400.0000"), aliceWallet.getBalance(), "Alice balance after refund must be 400.0000");

        // Financial Invariant Reconciliation across the entire lifecycle
        BigDecimal aliceCredits = ledgerEntryRepository.sumAmountByWalletIdAndType(aliceWallet.getId(), EntryType.CREDIT);
        BigDecimal aliceDebits = ledgerEntryRepository.sumAmountByWalletIdAndType(aliceWallet.getId(), EntryType.DEBIT);
        BigDecimal aliceExpectedBalance = aliceCredits.subtract(aliceDebits);

        assertEquals(aliceExpectedBalance, aliceWallet.getBalance(), "Alice balance must strictly match ledger sum(credits) - sum(debits)");

        BigDecimal bobCredits = ledgerEntryRepository.sumAmountByWalletIdAndType(bobWallet.getId(), EntryType.CREDIT);
        BigDecimal bobDebits = ledgerEntryRepository.sumAmountByWalletIdAndType(bobWallet.getId(), EntryType.DEBIT);
        BigDecimal bobExpectedBalance = bobCredits.subtract(bobDebits);

        assertEquals(bobExpectedBalance, bobWallet.getBalance(), "Bob balance must strictly match ledger sum(credits) - sum(debits)");
    }
}
