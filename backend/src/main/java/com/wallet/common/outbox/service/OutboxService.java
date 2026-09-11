package com.wallet.common.outbox.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wallet.common.outbox.entity.OutboxEvent;
import com.wallet.common.outbox.entity.OutboxStatus;
import com.wallet.common.outbox.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OutboxService {

    private static final Logger log = LoggerFactory.getLogger(OutboxService.class);

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    public OutboxService(OutboxEventRepository outboxEventRepository, ObjectMapper objectMapper) {
        this.outboxEventRepository = outboxEventRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Appends an outbox event into the database within the current ACID transaction.
     * Guarantees zero dual-write discrepancy between DB state and Kafka event publication.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public OutboxEvent publish(String aggregateType, String aggregateId, String eventType, Object payload) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(payload);
            OutboxEvent event = OutboxEvent.builder()
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId)
                    .eventType(eventType)
                    .payload(jsonPayload)
                    .status(OutboxStatus.PENDING)
                    .retryCount(0)
                    .build();

            OutboxEvent saved = outboxEventRepository.save(event);
            log.info("Outbox event registered: [id: {}, type: {}, aggregateId: {}]",
                    saved.getId(), eventType, aggregateId);
            return saved;
        } catch (Exception e) {
            log.error("Failed to serialize outbox event payload for aggregate: {}", aggregateId, e);
            throw new RuntimeException("Failed to register outbox event", e);
        }
    }
}
