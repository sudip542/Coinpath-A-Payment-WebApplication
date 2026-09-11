package com.wallet.payment.dto;

import com.wallet.common.util.Money;
import com.wallet.payment.entity.Payment;
import com.wallet.payment.entity.PaymentMethod;
import com.wallet.payment.entity.PaymentStatus;
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
public class PaymentResponseDto {

    private UUID id;
    private String paymentReference;
    private UUID userId;
    private UUID walletId;
    private BigDecimal amount;
    private BigDecimal displayAmount;
    private String currency;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private String gatewayTransactionId;
    private Instant createdAt;
    private Instant updatedAt;

    public static PaymentResponseDto fromEntity(Payment payment) {
        return PaymentResponseDto.builder()
                .id(payment.getId())
                .paymentReference(payment.getPaymentReference())
                .userId(payment.getUserId())
                .walletId(payment.getWalletId())
                .amount(payment.getAmount())
                .displayAmount(payment.getAmount().setScale(Money.DISPLAY_SCALE, Money.DEFAULT_ROUNDING))
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .gatewayTransactionId(payment.getGatewayTransactionId())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
