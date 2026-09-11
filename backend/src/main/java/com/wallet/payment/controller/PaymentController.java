package com.wallet.payment.controller;

import com.wallet.common.idempotency.annotation.Idempotent;
import com.wallet.common.ratelimit.annotation.RateLimited;
import com.wallet.common.response.ApiResponse;
import com.wallet.common.security.SecurityUserPrincipal;
import com.wallet.payment.dto.CreatePaymentRequest;
import com.wallet.payment.dto.PaymentResponseDto;
import com.wallet.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Endpoints for payment initiation, checkout, and status verification")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @Idempotent
    @RateLimited(limit = 10, periodSeconds = 60)
    @Operation(summary = "Initiate payment", description = "Initiates and processes a payment checkout through the configured gateway strategy")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Payment created and processed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request parameters"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "402", description = "Payment declined by payment provider"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Rate limit exceeded")
    })
    public ResponseEntity<ApiResponse<PaymentResponseDto>> createPayment(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @Valid @RequestBody CreatePaymentRequest request) {
        PaymentResponseDto response = paymentService.createPayment(principal.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Payment processed successfully"));
    }

    @GetMapping("/{paymentReference}")
    @Operation(summary = "Get payment details", description = "Retrieves payment status and provider reference")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payment details retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden: not authorized to view this payment"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Payment not found")
    })
    public ResponseEntity<ApiResponse<PaymentResponseDto>> getPayment(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @PathVariable String paymentReference) {
        PaymentResponseDto response = paymentService.getPaymentByReference(principal.getId(), paymentReference);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment details retrieved successfully"));
    }
}
