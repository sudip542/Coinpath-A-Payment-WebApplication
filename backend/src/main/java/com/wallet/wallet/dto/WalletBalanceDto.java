package com.wallet.wallet.dto;

import com.wallet.common.util.Money;
import com.wallet.wallet.entity.Wallet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletBalanceDto {

    private UUID walletId;
    private BigDecimal balance;
    private BigDecimal displayBalance;
    private String currency;

    public static WalletBalanceDto fromEntity(Wallet wallet) {
        return WalletBalanceDto.builder()
                .walletId(wallet.getId())
                .balance(wallet.getBalance())
                .displayBalance(wallet.getBalance().setScale(Money.DISPLAY_SCALE, Money.DEFAULT_ROUNDING))
                .currency(wallet.getCurrency())
                .build();
    }
}
