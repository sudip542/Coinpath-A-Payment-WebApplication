package com.wallet.common.outbox.publisher;

import com.wallet.common.outbox.entity.OutboxEvent;
import com.wallet.common.outbox.entity.OutboxStatus;
import com.wallet.common.outbox.repository.OutboxEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OutboxPublisherTest {

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    private OutboxPublisher outboxPublisher;

    @BeforeEach
    void setUp() {
        outboxPublisher = new OutboxPublisher(outboxEventRepository, kafkaTemplate);
        ReflectionTestUtils.setField(outboxPublisher, "transferTopic", "coinpath.transfer.events");
        ReflectionTestUtils.setField(outboxPublisher, "paymentTopic", "coinpath.payment.events");
        ReflectionTestUtils.setField(outboxPublisher, "refundTopic", "coinpath.refund.events");
    }

    @Test
    @DisplayName("Should poll pending events and successfully dispatch to Kafka")
    void testProcessPendingEventsSuccess() {
        OutboxEvent event = OutboxEvent.builder()
                .id(UUID.randomUUID())
                .aggregateType("TRANSFER")
                .aggregateId("TXN-12345")
                .eventType("TRANSFER_COMPLETED")
                .payload("{\"amount\":100}")
                .status(OutboxStatus.PENDING)
                .retryCount(0)
                .build();

        when(outboxEventRepository.findPendingEvents(eq(OutboxStatus.PENDING), eq(5), any(Pageable.class)))
                .thenReturn(List.of(event));

        CompletableFuture<SendResult<String, String>> future = CompletableFuture.completedFuture(null);
        when(kafkaTemplate.send(eq("coinpath.transfer.events"), eq("TXN-12345"), eq("{\"amount\":100}")))
                .thenReturn(future);

        outboxPublisher.processPendingEvents();

        verify(kafkaTemplate, times(1)).send("coinpath.transfer.events", "TXN-12345", "{\"amount\":100}");
        assertEquals(OutboxStatus.SENT, event.getStatus());
        assertNotNull(event.getProcessedAt());
        verify(outboxEventRepository, times(1)).save(event);
    }

    @Test
    @DisplayName("Should route PAYMENT events to payment topic")
    void testPaymentTopicRouting() {
        OutboxEvent event = OutboxEvent.builder()
                .id(UUID.randomUUID())
                .aggregateType("PAYMENT")
                .aggregateId("PAY-999")
                .eventType("PAYMENT_SUCCESS")
                .payload("{\"amount\":500}")
                .status(OutboxStatus.PENDING)
                .build();

        CompletableFuture<SendResult<String, String>> future = CompletableFuture.completedFuture(null);
        when(kafkaTemplate.send(eq("coinpath.payment.events"), eq("PAY-999"), eq("{\"amount\":500}")))
                .thenReturn(future);

        outboxPublisher.publishEvent(event);

        verify(kafkaTemplate, times(1)).send("coinpath.payment.events", "PAY-999", "{\"amount\":500}");
        assertEquals(OutboxStatus.SENT, event.getStatus());
    }

    @Test
    @DisplayName("Should route REFUND events to refund topic")
    void testRefundTopicRouting() {
        OutboxEvent event = OutboxEvent.builder()
                .id(UUID.randomUUID())
                .aggregateType("REFUND")
                .aggregateId("REF-888")
                .eventType("REFUND_COMPLETED")
                .payload("{\"amount\":250}")
                .status(OutboxStatus.PENDING)
                .build();

        CompletableFuture<SendResult<String, String>> future = CompletableFuture.completedFuture(null);
        when(kafkaTemplate.send(eq("coinpath.refund.events"), eq("REF-888"), eq("{\"amount\":250}")))
                .thenReturn(future);

        outboxPublisher.publishEvent(event);

        verify(kafkaTemplate, times(1)).send("coinpath.refund.events", "REF-888", "{\"amount\":250}");
        assertEquals(OutboxStatus.SENT, event.getStatus());
    }

    @Test
    @DisplayName("Should increment retryCount when Kafka publish fails")
    void testKafkaPublishFailureIncrementsRetry() {
        OutboxEvent event = OutboxEvent.builder()
                .id(UUID.randomUUID())
                .aggregateType("TRANSFER")
                .aggregateId("TXN-ERR")
                .eventType("TRANSFER_COMPLETED")
                .payload("{}")
                .status(OutboxStatus.PENDING)
                .retryCount(0)
                .build();

        CompletableFuture<SendResult<String, String>> future = new CompletableFuture<>();
        future.completeExceptionally(new RuntimeException("Kafka broker unreachable"));
        when(kafkaTemplate.send(any(), any(), any())).thenReturn(future);

        outboxPublisher.publishEvent(event);

        assertEquals(1, event.getRetryCount());
        assertEquals(OutboxStatus.PENDING, event.getStatus());
        verify(outboxEventRepository, times(1)).save(event);
    }

    @Test
    @DisplayName("Should mark FAILED when max retries exceeded")
    void testMaxRetriesExceededMarksFailed() {
        OutboxEvent event = OutboxEvent.builder()
                .id(UUID.randomUUID())
                .aggregateType("TRANSFER")
                .aggregateId("TXN-ERR-MAX")
                .eventType("TRANSFER_COMPLETED")
                .payload("{}")
                .status(OutboxStatus.PENDING)
                .retryCount(4)
                .build();

        CompletableFuture<SendResult<String, String>> future = new CompletableFuture<>();
        future.completeExceptionally(new RuntimeException("Broker down permanently"));
        when(kafkaTemplate.send(any(), any(), any())).thenReturn(future);

        outboxPublisher.publishEvent(event);

        assertEquals(5, event.getRetryCount());
        assertEquals(OutboxStatus.FAILED, event.getStatus());
    }
}
