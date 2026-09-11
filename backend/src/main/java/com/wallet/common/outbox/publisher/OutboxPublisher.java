package com.wallet.common.outbox.publisher;

import com.wallet.common.outbox.entity.OutboxEvent;
import com.wallet.common.outbox.entity.OutboxStatus;
import com.wallet.common.outbox.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class OutboxPublisher {

    private static final Logger log = LoggerFactory.getLogger(OutboxPublisher.class);
    private static final int MAX_RETRIES = 5;

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${app.kafka.topics.transfer-events:coinpath.transfer.events}")
    private String transferTopic;

    @Value("${app.kafka.topics.payment-events:coinpath.payment.events}")
    private String paymentTopic;

    @Value("${app.kafka.topics.refund-events:coinpath.refund.events}")
    private String refundTopic;

    public OutboxPublisher(
            OutboxEventRepository outboxEventRepository,
            @Autowired(required = false) KafkaTemplate<String, String> kafkaTemplate) {
        this.outboxEventRepository = outboxEventRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelayString = "${app.outbox.polling-interval-ms:2000}")
    @Transactional
    public void processPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findPendingEvents(
                OutboxStatus.PENDING,
                MAX_RETRIES,
                PageRequest.of(0, 50)
        );

        if (pendingEvents.isEmpty()) {
            return;
        }

        log.debug("Found {} pending outbox events for publishing to Kafka", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            publishEvent(event);
        }
    }

    public void publishEvent(OutboxEvent event) {
        String topic = resolveTopic(event.getEventType());
        if (kafkaTemplate == null) {
            log.warn("KafkaTemplate unavailable (local test profile). Marking outbox event {} as SENT.", event.getId());
            event.markSent();
            outboxEventRepository.save(event);
            return;
        }

        try {
            log.info("Publishing outbox event [id: {}, type: {}, topic: {}]", event.getId(), event.getEventType(), topic);
            kafkaTemplate.send(topic, event.getAggregateId(), event.getPayload())
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Kafka publish failed for outbox event {}: {}", event.getId(), ex.getMessage());
                            event.incrementRetry(MAX_RETRIES);
                            outboxEventRepository.save(event);
                        } else {
                            log.info("Kafka publish confirmed for event {} on topic {}", event.getId(), topic);
                            event.markSent();
                            outboxEventRepository.save(event);
                        }
                    });
        } catch (Exception e) {
            log.error("Exception initiating Kafka dispatch for outbox event {}: {}", event.getId(), e.getMessage());
            event.incrementRetry(MAX_RETRIES);
            outboxEventRepository.save(event);
        }
    }

    private String resolveTopic(String eventType) {
        if (eventType == null) return transferTopic;
        if (eventType.startsWith("TRANSFER")) {
            return transferTopic;
        } else if (eventType.startsWith("PAYMENT")) {
            return paymentTopic;
        } else if (eventType.startsWith("REFUND")) {
            return refundTopic;
        }
        return transferTopic;
    }
}
