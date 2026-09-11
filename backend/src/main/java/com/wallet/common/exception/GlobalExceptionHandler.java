package com.wallet.common.exception;

import com.wallet.common.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(CoinpathException.class)
    public ResponseEntity<ApiResponse<Void>> handleCoinpathException(CoinpathException ex) {
        log.warn("Business exception occurred: [{}] {}", ex.getErrorCode(), ex.getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getHttpStatus())
                .body(ApiResponse.error(ex.getMessage(), ex.getErrorCode().name()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        log.warn("Validation error: {}", errorMessage);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(errorMessage, ErrorCode.INVALID_REQUEST.name()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Database constraint or integrity violation: {}", ex.getMessage());
        String msg = "Data integrity violation. A unique constraint or invariant was violated.";
        if (ex.getMessage() != null && ex.getMessage().contains("chk_wallet_balance_positive")) {
            msg = "Financial invariant violation: Wallet balance cannot become negative.";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(msg, ErrorCode.INSUFFICIENT_BALANCE.name()));
        }
        if (ex.getMessage() != null && ex.getMessage().contains("uq_user_idempotency_key")) {
            msg = "Concurrent request with identical idempotency key is already in progress or completed.";
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(msg, ErrorCode.DUPLICATE_REQUEST.name()));
        }
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(msg, ErrorCode.INVALID_REQUEST.name()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access is denied to this resource", ErrorCode.FORBIDDEN.name()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
        log.warn("Authentication failure: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ex.getMessage(), ErrorCode.UNAUTHORIZED.name()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        log.error("Unhandled internal server exception", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected internal financial error occurred", ErrorCode.INTERNAL_ERROR.name()));
    }
}
