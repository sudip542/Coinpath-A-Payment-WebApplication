package com.wallet.refund.controller;

import com.wallet.common.idempotency.annotation.Idempotent;
import com.wallet.common.ratelimit.annotation.RateLimited;
import com.wallet.common.response.ApiResponse;
import com.wallet.common.security.SecurityUserPrincipal;
import com.wallet.refund.dto.CreateRefundRequest;
import com.wallet.refund.dto.RefundResponseDto;
import com.wallet.refund.service.RefundService;
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
@RequestMapping("/api/refunds")
@Tag(name = "Refunds", description = "Endpoints for partial and full payment refunds")
@SecurityRequirement(name = "bearerAuth")
public class RefundController {

    private final RefundService refundService;

    public RefundController(RefundService refundService) {
        this.refundService = refundService;
    }

    @PostMapping
    @Idempotent
    @RateLimited(limit = 10, periodSeconds = 60)
    @Operation(summary = "Initiate refund", description = "Executes a partial or full refund against a successful payment record")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Refund executed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Refund exceeds remaining payment amount or invalid state"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden: not authorized to refund this payment"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Payment not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Rate limit exceeded")
    })
    public ResponseEntity<ApiResponse<RefundResponseDto>> processRefund(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @Valid @RequestBody CreateRefundRequest request) {
        RefundResponseDto response = refundService.processRefund(principal.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Refund processed successfully"));
    }

    @GetMapping("/{refundReference}")
    @Operation(summary = "Get refund details", description = "Retrieves details of a specific refund record")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Refund details retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden: not authorized to view this refund"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Refund not found")
    })
    public ResponseEntity<ApiResponse<RefundResponseDto>> getRefund(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @PathVariable String refundReference) {
        RefundResponseDto response = refundService.getRefundByReference(principal.getId(), refundReference);
        return ResponseEntity.ok(ApiResponse.success(response, "Refund details retrieved successfully"));
    }
}
