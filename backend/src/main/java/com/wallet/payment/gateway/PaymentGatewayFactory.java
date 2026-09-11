package com.wallet.payment.gateway;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.payment.entity.PaymentMethod;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class PaymentGatewayFactory {

    private final Map<PaymentMethod, PaymentGateway> gatewayMap;
    private final MockPaymentGateway defaultMockGateway;

    public PaymentGatewayFactory(List<PaymentGateway> gateways, MockPaymentGateway defaultMockGateway) {
        this.gatewayMap = gateways.stream()
                .collect(Collectors.toMap(PaymentGateway::getSupportedMethod, g -> g));
        this.defaultMockGateway = defaultMockGateway;
    }

    public PaymentGateway getGateway(PaymentMethod method) {
        if (method == null) {
            throw new CoinpathException(ErrorCode.INVALID_REQUEST, "Payment method must not be null");
        }

        // Direct match
        if (gatewayMap.containsKey(method)) {
            return gatewayMap.get(method);
        }

        // CARD and UPI default to MockPaymentGateway in local/test environment
        if (method == PaymentMethod.CARD || method == PaymentMethod.UPI) {
            return defaultMockGateway;
        }

        throw new CoinpathException(ErrorCode.INVALID_REQUEST, "Unsupported payment method: " + method);
    }
}
