package com.wallet.audit.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wallet.audit.entity.AuditLog;
import com.wallet.audit.repository.AuditLogRepository;
import com.wallet.common.event.PaymentSuccessEvent;
import com.wallet.common.event.RefundCompletedEvent;
import com.wallet.common.event.TransferCompletedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditConsumerTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    private ObjectMapper objectMapper;
    private AuditConsumer auditConsumer;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
        auditConsumer = new AuditConsumer(auditLogRepository, objectMapper);
    }

    @Test
    @DisplayName("Should consume PaymentSuccessEvent and write immutable audit log")
    void testAuditPaymentEvent() throws Exception {
        UUID userId = UUID.randomUUID();
        PaymentSuccessEvent event = PaymentSuccessEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .paymentReference("PAY-AUDIT-001")
                .userId(userId)
                .walletId(UUID.randomUUID())
                .amount(new BigDecimal("1000.00"))
                .currency("INR")
                .gatewayTransactionId("GW-AUDIT-99")
                .timestamp(Instant.now())
                .build();

        String json = objectMapper.writeValueAsString(event);
        auditConsumer.auditPaymentEvent(json);

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository, times(1)).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertEquals(userId, saved.getUserId());
        assertEquals("PAYMENT_SUCCESS", saved.getAction());
        assertEquals("PAYMENT", saved.getResourceType());
        assertEquals("PAY-AUDIT-001", saved.getResourceId());
        assertNotNull(saved.getDetails());
        assertNotNull(saved.getTimestamp());
    }

    @Test
    @DisplayName("Should consume TransferCompletedEvent and write immutable audit log")
    void testAuditTransferEvent() throws Exception {
        TransferCompletedEvent event = TransferCompletedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .transactionReference("TXN-AUDIT-555")
                .sourceWalletId(UUID.randomUUID())
                .targetWalletId(UUID.randomUUID())
                .amount(new BigDecimal("750.00"))
                .currency("INR")
                .timestamp(Instant.now())
                .build();

        String json = objectMapper.writeValueAsString(event);
        auditConsumer.auditTransferEvent(json);

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository, times(1)).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertEquals("TRANSFER_COMPLETED", saved.getAction());
        assertEquals("TRANSFER", saved.getResourceType());
        assertEquals("TXN-AUDIT-555", saved.getResourceId());
    }

    @Test
    @DisplayName("Should consume RefundCompletedEvent and write immutable audit log")
    void testAuditRefundEvent() throws Exception {
        UUID userId = UUID.randomUUID();
        RefundCompletedEvent event = RefundCompletedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .refundReference("REF-AUDIT-123")
                .paymentId(UUID.randomUUID())
                .userId(userId)
                .amount(new BigDecimal("200.00"))
                .currency("INR")
                .timestamp(Instant.now())
                .build();

        String json = objectMapper.writeValueAsString(event);
        auditConsumer.auditRefundEvent(json);

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository, times(1)).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertEquals(userId, saved.getUserId());
        assertEquals("REFUND_COMPLETED", saved.getAction());
        assertEquals("REFUND", saved.getResourceType());
        assertEquals("REF-AUDIT-123", saved.getResourceId());
    }
}
