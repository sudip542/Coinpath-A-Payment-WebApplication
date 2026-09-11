package com.wallet.wallet.dto;

import com.wallet.wallet.entity.WalletStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWalletStatusRequest {

    @NotNull(message = "Wallet status is required")
    private WalletStatus status;
}
