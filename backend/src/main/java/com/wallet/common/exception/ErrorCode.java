package com.wallet.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "The request payload or parameters are invalid"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Authentication credentials are required or invalid"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Access to the requested resource is denied"),
    WALLET_NOT_FOUND(HttpStatus.NOT_FOUND, "Target wallet does not exist"),
    WALLET_BLOCKED(HttpStatus.FORBIDDEN, "Wallet is blocked and cannot transact"),
    WALLET_CLOSED(HttpStatus.FORBIDDEN, "Wallet is closed and cannot transact"),
    INSUFFICIENT_BALANCE(HttpStatus.BAD_REQUEST, "Insufficient wallet balance to perform operation"),
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "Requested transaction record was not found"),
    PAYMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "Payment reference not found"),
    REFUND_NOT_FOUND(HttpStatus.NOT_FOUND, "Refund reference not found"),
    DUPLICATE_REQUEST(HttpStatus.CONFLICT, "Duplicate request detected with identical idempotency key"),
    INVALID_STATE_TRANSITION(HttpStatus.BAD_REQUEST, "Requested status transition violates state machine rules"),
    PAYMENT_FAILED(HttpStatus.PAYMENT_REQUIRED, "Payment gateway execution failed"),
    RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "API request rate limit exceeded. Please retry later"),
    REFUND_EXCEEDS_LIMIT(HttpStatus.BAD_REQUEST, "Cumulative refunds exceed original payment amount"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "An internal financial system error occurred");

    private final HttpStatus httpStatus;
    private final String defaultMessage;

    ErrorCode(HttpStatus httpStatus, String defaultMessage) {
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
