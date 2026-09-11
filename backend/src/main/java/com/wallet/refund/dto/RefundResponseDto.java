package com.wallet.refund.dto;

import com.wallet.common.util.Money;
import com.wallet.refund.entity.Refund;
import com.wallet.refund.entity.RefundStatus;
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
public class RefundResponseDto {

    private UUID id;
    private String refundReference;
    private UUID paymentId;
    private BigDecimal amount;
    private BigDecimal displayAmount;
    private String currency;
    private RefundStatus status;
    private String reason;
    private Instant createdAt;
    private Instant updatedAt;

    public static RefundResponseDto fromEntity(Refund refund) {
        return RefundResponseDto.builder()
                .id(refund.getId())
                .refundReference(refund.getRefundReference())
                .paymentId(refund.getPaymentId())
                .amount(refund.getAmount())
                .displayAmount(refund.getAmount().setScale(Money.DISPLAY_SCALE, Money.DEFAULT_ROUNDING))
                .currency(refund.getCurrency())
                .status(refund.getStatus())
                .reason(refund.getReason())
                .createdAt(refund.getCreatedAt())
                .updatedAt(refund.getUpdatedAt())
                .build();
    }
}
