package com.wallet.common.exception;

public class CoinpathException extends RuntimeException {

    private final ErrorCode errorCode;

    public CoinpathException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
    }

    public CoinpathException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public CoinpathException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
