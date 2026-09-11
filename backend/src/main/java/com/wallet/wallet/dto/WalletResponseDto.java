package com.wallet.wallet.dto;

import com.wallet.common.util.Money;
import com.wallet.wallet.entity.Wallet;
import com.wallet.wallet.entity.WalletStatus;
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
public class WalletResponseDto {

    private UUID id;
    private UUID userId;
    private BigDecimal balance;
    private BigDecimal displayBalance;
    private String currency;
    private WalletStatus status;
    private Long version;
    private Instant createdAt;
    private Instant updatedAt;

    public static WalletResponseDto fromEntity(Wallet wallet) {
        return WalletResponseDto.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .displayBalance(wallet.getBalance().setScale(Money.DISPLAY_SCALE, Money.DEFAULT_ROUNDING))
                .currency(wallet.getCurrency())
                .status(wallet.getStatus())
                .version(wallet.getVersion())
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }
}
