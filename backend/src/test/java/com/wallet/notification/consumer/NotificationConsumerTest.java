package com.wallet.notification.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wallet.common.event.PaymentSuccessEvent;
import com.wallet.common.event.RefundCompletedEvent;
import com.wallet.common.event.TransferCompletedEvent;
import com.wallet.notification.entity.Notification;
import com.wallet.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationConsumerTest {

    @Mock
    private NotificationRepository notificationRepository;

    private ObjectMapper objectMapper;
    private NotificationConsumer consumer;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
        consumer = new NotificationConsumer(notificationRepository, objectMapper);
    }

    @Test
    @DisplayName("Should consume PaymentSuccessEvent and persist notification record")
    void testHandlePaymentEventSuccess() throws Exception {
        UUID userId = UUID.randomUUID();
        PaymentSuccessEvent event = PaymentSuccessEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .paymentReference("PAY-SUCCESS-001")
                .userId(userId)
                .walletId(UUID.randomUUID())
                .amount(new BigDecimal("500.00"))
                .currency("INR")
                .gatewayTransactionId("GW-101")
                .timestamp(Instant.now())
                .build();

        String json = objectMapper.writeValueAsString(event);
        when(notificationRepository.findByReferenceId("NOTIF-PAY-PAY-SUCCESS-001")).thenReturn(Collections.emptyList());

        consumer.handlePaymentEvent(json);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals(userId, saved.getUserId());
        assertEquals("EMAIL", saved.getChannel());
        assertEquals("NOTIF-PAY-PAY-SUCCESS-001", saved.getReferenceId());
        assertTrue(saved.getContent().contains("500.00"));
    }

    @Test
    @DisplayName("Should skip duplicate payment notification idempotently")
    void testDuplicatePaymentNotificationSkipped() throws Exception {
        PaymentSuccessEvent event = PaymentSuccessEvent.builder()
                .paymentReference("PAY-DUP-001")
                .userId(UUID.randomUUID())
                .amount(new BigDecimal("100.00"))
                .currency("INR")
                .build();

        String json = objectMapper.writeValueAsString(event);
        when(notificationRepository.findByReferenceId("NOTIF-PAY-PAY-DUP-001"))
                .thenReturn(List.of(new Notification()));

        consumer.handlePaymentEvent(json);

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should consume TransferCompletedEvent and persist push notification")
    void testHandleTransferEventSuccess() throws Exception {
        UUID senderWallet = UUID.randomUUID();
        UUID recipientWallet = UUID.randomUUID();

        TransferCompletedEvent event = TransferCompletedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .transactionReference("TXN-TRANSFER-999")
                .sourceWalletId(senderWallet)
                .targetWalletId(recipientWallet)
                .amount(new BigDecimal("250.00"))
                .currency("INR")
                .timestamp(Instant.now())
                .build();

        String json = objectMapper.writeValueAsString(event);
        when(notificationRepository.findByReferenceId("NOTIF-TX-TXN-TRANSFER-999")).thenReturn(Collections.emptyList());

        consumer.handleTransferEvent(json);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals("PUSH", saved.getChannel());
        assertEquals("NOTIF-TX-TXN-TRANSFER-999", saved.getReferenceId());
        assertTrue(saved.getContent().contains("250.00"));
    }

    @Test
    @DisplayName("Should consume RefundCompletedEvent and persist email notification")
    void testHandleRefundEventSuccess() throws Exception {
        UUID userId = UUID.randomUUID();
        RefundCompletedEvent event = RefundCompletedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .refundReference("REF-888-ABC")
                .paymentId(UUID.randomUUID())
                .userId(userId)
                .amount(new BigDecimal("150.00"))
                .currency("INR")
                .timestamp(Instant.now())
                .build();

        String json = objectMapper.writeValueAsString(event);
        when(notificationRepository.findByReferenceId("NOTIF-REF-REF-888-ABC")).thenReturn(Collections.emptyList());

        consumer.handleRefundEvent(json);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals(userId, saved.getUserId());
        assertEquals("EMAIL", saved.getChannel());
        assertEquals("NOTIF-REF-REF-888-ABC", saved.getReferenceId());
    }
}
