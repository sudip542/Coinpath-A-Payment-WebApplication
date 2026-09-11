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
public class TransferCompletedEvent {

    private String eventId;
    private String transactionReference;
    private UUID sourceWalletId;
    private UUID targetWalletId;
    private BigDecimal amount;
    private String currency;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
