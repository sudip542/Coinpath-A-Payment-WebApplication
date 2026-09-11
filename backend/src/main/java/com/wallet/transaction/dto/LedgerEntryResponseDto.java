package com.wallet.transaction.dto;

import com.wallet.common.util.Money;
import com.wallet.transaction.entity.EntryType;
import com.wallet.transaction.entity.LedgerEntry;
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
public class LedgerEntryResponseDto {

    private UUID id;
    private UUID transactionId;
    private UUID walletId;
    private EntryType entryType;
    private BigDecimal amount;
    private BigDecimal displayAmount;
    private BigDecimal balanceAfter;
    private BigDecimal displayBalanceAfter;
    private String currency;
    private Instant createdAt;

    public static LedgerEntryResponseDto fromEntity(LedgerEntry entry) {
        return LedgerEntryResponseDto.builder()
                .id(entry.getId())
                .transactionId(entry.getTransactionId())
                .walletId(entry.getWalletId())
                .entryType(entry.getEntryType())
                .amount(entry.getAmount())
                .displayAmount(entry.getAmount().setScale(Money.DISPLAY_SCALE, Money.DEFAULT_ROUNDING))
                .balanceAfter(entry.getBalanceAfter())
                .displayBalanceAfter(entry.getBalanceAfter().setScale(Money.DISPLAY_SCALE, Money.DEFAULT_ROUNDING))
                .currency(entry.getCurrency())
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
