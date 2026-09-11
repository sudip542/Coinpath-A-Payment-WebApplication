package com.wallet.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSuccessEvent {

    private String eventId;
    private String paymentReference;
    private UUID userId;
    private UUID walletId;
    private BigDecimal amount;
    private String currency;
    private String gatewayTransactionId;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
