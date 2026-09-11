package com.wallet.payment.gateway;

public record PaymentGatewayResult(
        boolean success,
        String gatewayTransactionId,
        String message
) {
    public static PaymentGatewayResult success(String gatewayTransactionId) {
        return new PaymentGatewayResult(true, gatewayTransactionId, "Payment processed successfully");
    }

    public static PaymentGatewayResult failure(String message) {
        return new PaymentGatewayResult(false, null, message);
    }
}
