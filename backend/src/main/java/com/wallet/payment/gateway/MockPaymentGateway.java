package com.wallet.payment.gateway;

import com.wallet.payment.entity.Payment;
import com.wallet.payment.entity.PaymentMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class MockPaymentGateway implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(MockPaymentGateway.class);

    @Override
    public PaymentGatewayResult processPayment(Payment payment) {
        log.info("Processing payment via MockPaymentGateway for paymentRef: {}, amount: {} {}",
                payment.getPaymentReference(), payment.getAmount(), payment.getCurrency());

        // Simulated rejection trigger: exact amount 9999.00 indicates test failure scenario
        if (payment.getAmount().compareTo(new BigDecimal("9999.0000")) == 0) {
            log.warn("MockPaymentGateway simulated decline for test trigger amount 9999.00");
            return PaymentGatewayResult.failure("Declined by mock payment provider: insufficient card limit");
        }

        String pspTxId = "PSP-MOCK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        log.info("MockPaymentGateway approved payment. PSP Tx ID: {}", pspTxId);
        return PaymentGatewayResult.success(pspTxId);
    }

    @Override
    public PaymentGatewayResult verifyPayment(String gatewayTransactionId) {
        return PaymentGatewayResult.success(gatewayTransactionId);
    }

    @Override
    public PaymentGatewayResult processRefund(Payment payment, BigDecimal refundAmount) {
        log.info("Processing refund via MockPaymentGateway for payment: {}, refund amount: {}",
                payment.getPaymentReference(), refundAmount);
        String refundPspId = "PSP-REF-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        return PaymentGatewayResult.success(refundPspId);
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.MOCK_GATEWAY;
    }
}
