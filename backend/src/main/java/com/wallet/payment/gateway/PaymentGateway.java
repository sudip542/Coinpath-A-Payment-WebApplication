package com.wallet.payment.gateway;

import com.wallet.payment.entity.Payment;
import com.wallet.payment.entity.PaymentMethod;

import java.math.BigDecimal;

public interface PaymentGateway {

    PaymentGatewayResult processPayment(Payment payment);

    PaymentGatewayResult verifyPayment(String gatewayTransactionId);

    PaymentGatewayResult processRefund(Payment payment, BigDecimal refundAmount);

    PaymentMethod getSupportedMethod();
}
