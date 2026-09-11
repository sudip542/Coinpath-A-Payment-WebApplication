package com.wallet.notification.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wallet.common.event.PaymentSuccessEvent;
import com.wallet.common.event.RefundCompletedEvent;
import com.wallet.common.event.TransferCompletedEvent;
import com.wallet.notification.entity.Notification;
import com.wallet.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    public NotificationConsumer(NotificationRepository notificationRepository, ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(
            topics = "${app.kafka.topics.payment-events:coinpath.payment.events}",
            groupId = "${app.kafka.consumer.notification-group:coinpath-notification-group}"
    )
    @Transactional
    public void handlePaymentEvent(@Payload String payload) {
        try {
            PaymentSuccessEvent event = objectMapper.readValue(payload, PaymentSuccessEvent.class);
            log.info("NotificationConsumer received PaymentSuccessEvent: {}", event.getPaymentReference());

            // Consumer-side idempotency check
            if (!notificationRepository.findByReferenceId("NOTIF-PAY-" + event.getPaymentReference()).isEmpty()) {
                log.info("Duplicate notification detected for payment {}. Skipping dispatch.", event.getPaymentReference());
                return;
            }

            String content = String.format("Dear User, your payment of %s %s was successful. Reference: %s",
                    event.getAmount(), event.getCurrency(), event.getPaymentReference());

            // Mock external delivery (Email / SMS)
            log.info("[MOCK EMAIL/SMS] To User: {} -> {}", event.getUserId(), content);

            Notification notification = Notification.builder()
                    .userId(event.getUserId())
                    .channel("EMAIL")
                    .recipient(event.getUserId() + "@coinpath.com")
                    .subject("Payment Successful - " + event.getPaymentReference())
                    .content(content)
                    .referenceId("NOTIF-PAY-" + event.getPaymentReference())
                    .status("SENT")
                    .build();

            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to process payment notification event: {}", payload, e);
            throw new RuntimeException("Notification consumption failed", e);
        }
    }

    @KafkaListener(
            topics = "${app.kafka.topics.transfer-events:coinpath.transfer.events}",
            groupId = "${app.kafka.consumer.notification-group:coinpath-notification-group}"
    )
    @Transactional
    public void handleTransferEvent(@Payload String payload) {
        try {
            TransferCompletedEvent event = objectMapper.readValue(payload, TransferCompletedEvent.class);
            log.info("NotificationConsumer received TransferCompletedEvent: {}", event.getTransactionReference());

            if (!notificationRepository.findByReferenceId("NOTIF-TX-" + event.getTransactionReference()).isEmpty()) {
                log.info("Duplicate notification detected for transfer {}. Skipping.", event.getTransactionReference());
                return;
            }

            String content = String.format("Transfer of %s %s was completed successfully. Transaction Ref: %s",
                    event.getAmount(), event.getCurrency(), event.getTransactionReference());

            log.info("[MOCK PUSH NOTIFICATION] Wallets: {} -> {} | {}",
                    event.getSourceWalletId(), event.getTargetWalletId(), content);

            Notification notification = Notification.builder()
                    .channel("PUSH")
                    .recipient("wallet:" + event.getSourceWalletId())
                    .subject("Transfer Completed")
                    .content(content)
                    .referenceId("NOTIF-TX-" + event.getTransactionReference())
                    .status("SENT")
                    .build();

            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to process transfer notification event: {}", payload, e);
            throw new RuntimeException("Transfer notification consumption failed", e);
        }
    }

    @KafkaListener(
            topics = "${app.kafka.topics.refund-events:coinpath.refund.events}",
            groupId = "${app.kafka.consumer.notification-group:coinpath-notification-group}"
    )
    @Transactional
    public void handleRefundEvent(@Payload String payload) {
        try {
            RefundCompletedEvent event = objectMapper.readValue(payload, RefundCompletedEvent.class);
            log.info("NotificationConsumer received RefundCompletedEvent: {}", event.getRefundReference());

            if (!notificationRepository.findByReferenceId("NOTIF-REF-" + event.getRefundReference()).isEmpty()) {
                log.info("Duplicate notification detected for refund {}. Skipping.", event.getRefundReference());
                return;
            }

            String content = String.format("Refund of %s %s has been processed. Refund Ref: %s",
                    event.getAmount(), event.getCurrency(), event.getRefundReference());

            log.info("[MOCK EMAIL] To User: {} -> {}", event.getUserId(), content);

            Notification notification = Notification.builder()
                    .userId(event.getUserId())
                    .channel("EMAIL")
                    .recipient(event.getUserId() + "@coinpath.com")
                    .subject("Refund Processed - " + event.getRefundReference())
                    .content(content)
                    .referenceId("NOTIF-REF-" + event.getRefundReference())
                    .status("SENT")
                    .build();

            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to process refund notification event: {}", payload, e);
            throw new RuntimeException("Refund notification consumption failed", e);
        }
    }
}
