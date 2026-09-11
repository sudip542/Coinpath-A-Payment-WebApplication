package com.wallet.refund.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRefundRequest {

    @NotBlank(message = "Payment reference is required")
    private String paymentReference;

    @DecimalMin(value = "0.01", message = "Refund amount must be at least 0.01 if specified")
    private BigDecimal amount;

    private String reason;
}
