package com.wallet.payment.dto;

import com.wallet.payment.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentRequest {

    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be at least 0.01")
    private BigDecimal amount;

    @Builder.Default
    private String currency = "INR";

    @NotNull(message = "Payment method is required")
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.MOCK_GATEWAY;

    private String description;
}
