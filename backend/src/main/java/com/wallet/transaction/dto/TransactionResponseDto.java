package com.wallet.transaction.dto;

import com.wallet.common.util.Money;
import com.wallet.transaction.entity.TransactionStatus;
import com.wallet.transaction.entity.TransactionType;
import com.wallet.transaction.entity.WalletTransaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDto {

    private UUID id;
    private String referenceId;
    private UUID sourceWalletId;
    private UUID targetWalletId;
    private BigDecimal amount;
    private BigDecimal displayAmount;
    private String currency;
    private TransactionType type;
    private TransactionStatus status;
    private String failureReason;
    private Instant createdAt;
    private List<LedgerEntryResponseDto> ledgerEntries;

    public static TransactionResponseDto fromEntity(WalletTransaction tx, List<LedgerEntryResponseDto> ledgerEntries) {
        return TransactionResponseDto.builder()
                .id(tx.getId())
                .referenceId(tx.getReferenceId())
                .sourceWalletId(tx.getSourceWalletId())
                .targetWalletId(tx.getTargetWalletId())
                .amount(tx.getAmount())
                .displayAmount(tx.getAmount().setScale(Money.DISPLAY_SCALE, Money.DEFAULT_ROUNDING))
                .currency(tx.getCurrency())
                .type(tx.getType())
                .status(tx.getStatus())
                .failureReason(tx.getFailureReason())
                .createdAt(tx.getCreatedAt())
                .ledgerEntries(ledgerEntries != null ? ledgerEntries : List.of())
                .build();
    }
}
