package com.wallet.payment.gateway;

import com.wallet.payment.entity.Payment;
import com.wallet.payment.entity.PaymentMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class WalletPaymentGateway implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(WalletPaymentGateway.class);

    @Override
    public PaymentGatewayResult processPayment(Payment payment) {
        log.info("Processing internal wallet checkout for paymentRef: {}", payment.getPaymentReference());
        String walletPspId = "WLT-PAY-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        return PaymentGatewayResult.success(walletPspId);
    }

    @Override
    public PaymentGatewayResult verifyPayment(String gatewayTransactionId) {
        return PaymentGatewayResult.success(gatewayTransactionId);
    }

    @Override
    public PaymentGatewayResult processRefund(Payment payment, BigDecimal refundAmount) {
        log.info("Processing internal wallet refund for paymentRef: {}", payment.getPaymentReference());
        String walletRefundId = "WLT-REF-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        return PaymentGatewayResult.success(walletRefundId);
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.WALLET;
    }
}
