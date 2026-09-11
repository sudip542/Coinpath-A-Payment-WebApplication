package com.wallet.audit.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wallet.audit.entity.AuditLog;
import com.wallet.audit.repository.AuditLogRepository;
import com.wallet.common.event.PaymentSuccessEvent;
import com.wallet.common.event.RefundCompletedEvent;
import com.wallet.common.event.TransferCompletedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
public class AuditConsumer {

    private static final Logger log = LoggerFactory.getLogger(AuditConsumer.class);

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditConsumer(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(
            topics = "${app.kafka.topics.payment-events:coinpath.payment.events}",
            groupId = "${app.kafka.consumer.audit-group:coinpath-audit-group}"
    )
    @Transactional
    public void auditPaymentEvent(@Payload String payload) {
        try {
            PaymentSuccessEvent event = objectMapper.readValue(payload, PaymentSuccessEvent.class);
            log.info("AuditConsumer processing PaymentSuccessEvent: {}", event.getPaymentReference());

            AuditLog auditLog = AuditLog.builder()
                    .userId(event.getUserId())
                    .action("PAYMENT_SUCCESS")
                    .resourceType("PAYMENT")
                    .resourceId(event.getPaymentReference())
                    .details(payload)
                    .timestamp(Instant.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit record persisted for payment: {}", event.getPaymentReference());
        } catch (Exception e) {
            log.error("Failed to audit payment event: {}", payload, e);
            throw new RuntimeException("Audit payment event consumption failed", e);
        }
    }

    @KafkaListener(
            topics = "${app.kafka.topics.transfer-events:coinpath.transfer.events}",
            groupId = "${app.kafka.consumer.audit-group:coinpath-audit-group}"
    )
    @Transactional
    public void auditTransferEvent(@Payload String payload) {
        try {
            TransferCompletedEvent event = objectMapper.readValue(payload, TransferCompletedEvent.class);
            log.info("AuditConsumer processing TransferCompletedEvent: {}", event.getTransactionReference());

            AuditLog auditLog = AuditLog.builder()
                    .action("TRANSFER_COMPLETED")
                    .resourceType("TRANSFER")
                    .resourceId(event.getTransactionReference())
                    .details(payload)
                    .timestamp(Instant.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit record persisted for transfer: {}", event.getTransactionReference());
        } catch (Exception e) {
            log.error("Failed to audit transfer event: {}", payload, e);
            throw new RuntimeException("Audit transfer event consumption failed", e);
        }
    }

    @KafkaListener(
            topics = "${app.kafka.topics.refund-events:coinpath.refund.events}",
            groupId = "${app.kafka.consumer.audit-group:coinpath-audit-group}"
    )
    @Transactional
    public void auditRefundEvent(@Payload String payload) {
        try {
            RefundCompletedEvent event = objectMapper.readValue(payload, RefundCompletedEvent.class);
            log.info("AuditConsumer processing RefundCompletedEvent: {}", event.getRefundReference());

            AuditLog auditLog = AuditLog.builder()
                    .userId(event.getUserId())
                    .action("REFUND_COMPLETED")
                    .resourceType("REFUND")
                    .resourceId(event.getRefundReference())
                    .details(payload)
                    .timestamp(Instant.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit record persisted for refund: {}", event.getRefundReference());
        } catch (Exception e) {
            log.error("Failed to audit refund event: {}", payload, e);
            throw new RuntimeException("Audit refund event consumption failed", e);
        }
    }
}
