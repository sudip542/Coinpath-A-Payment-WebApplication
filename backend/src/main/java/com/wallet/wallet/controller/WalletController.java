package com.wallet.wallet.controller;

import com.wallet.common.response.ApiResponse;
import com.wallet.common.security.SecurityUserPrincipal;
import com.wallet.wallet.dto.UpdateWalletStatusRequest;
import com.wallet.wallet.dto.WalletBalanceDto;
import com.wallet.wallet.dto.WalletResponseDto;
import com.wallet.wallet.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/wallet")
@Tag(name = "Wallet", description = "Endpoints for digital wallet queries and lifecycle management")
@SecurityRequirement(name = "bearerAuth")
public class WalletController {

    private final WalletService walletService;
    private final com.wallet.transaction.service.TransactionService transactionService;

    public WalletController(
            WalletService walletService,
            com.wallet.transaction.service.TransactionService transactionService) {
        this.walletService = walletService;
        this.transactionService = transactionService;
    }

    @GetMapping
    @Operation(summary = "Get user wallet", description = "Retrieves wallet details for the authenticated user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Wallet retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Wallet not found")
    })
    public ResponseEntity<ApiResponse<WalletResponseDto>> getMyWallet(
            @AuthenticationPrincipal SecurityUserPrincipal principal) {
        WalletResponseDto response = walletService.getWalletByUserId(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Wallet retrieved successfully"));
    }

    @GetMapping("/balance")
    @Operation(summary = "Get wallet balance", description = "Retrieves authoritative wallet balance for the authenticated user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Balance retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<WalletBalanceDto>> getMyBalance(
            @AuthenticationPrincipal SecurityUserPrincipal principal) {
        WalletBalanceDto response = walletService.getBalanceByUserId(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Balance retrieved successfully"));
    }

    @PostMapping("/add-money")
    @com.wallet.common.idempotency.annotation.Idempotent
    @com.wallet.common.ratelimit.annotation.RateLimited(limit = 20, periodSeconds = 60)
    @Operation(summary = "Add money to wallet", description = "Deposits funds into the authenticated user's wallet with ledger entry (Supports Idempotency-Key)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Funds deposited successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid deposit amount"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Rate limit exceeded")
    })
    public ResponseEntity<ApiResponse<com.wallet.transaction.dto.TransactionResponseDto>> addMoney(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @Valid @RequestBody com.wallet.transaction.dto.DepositRequest request) {
        com.wallet.transaction.dto.TransactionResponseDto response = transactionService.addMoney(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Funds added successfully"));
    }

    @PostMapping("/transfer")
    @com.wallet.common.idempotency.annotation.Idempotent
    @com.wallet.common.ratelimit.annotation.RateLimited(limit = 10, periodSeconds = 60)
    @Operation(summary = "Transfer money", description = "Executes an atomic transfer of funds to another user's wallet (Supports Idempotency-Key)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Transfer completed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Insufficient balance or invalid request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Recipient not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Rate limit exceeded")
    })
    public ResponseEntity<ApiResponse<com.wallet.transaction.dto.TransactionResponseDto>> transfer(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @Valid @RequestBody com.wallet.transaction.dto.TransferRequest request) {
        com.wallet.transaction.dto.TransactionResponseDto response = transactionService.transfer(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Transfer completed successfully"));
    }

    @PostMapping("/withdraw")
    @com.wallet.common.idempotency.annotation.Idempotent
    @com.wallet.common.ratelimit.annotation.RateLimited(limit = 10, periodSeconds = 60)
    @Operation(summary = "Withdraw money", description = "Withdraws funds from the authenticated user's wallet with ledger entry (Supports Idempotency-Key)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Withdrawal completed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Insufficient balance or invalid amount"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Rate limit exceeded")
    })
    public ResponseEntity<ApiResponse<com.wallet.transaction.dto.TransactionResponseDto>> withdraw(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @Valid @RequestBody com.wallet.transaction.dto.WithdrawRequest request) {
        com.wallet.transaction.dto.TransactionResponseDto response = transactionService.withdraw(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Withdrawal completed successfully"));
    }

    @PutMapping("/admin/{walletId}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update wallet status", description = "Administrative endpoint to change wallet state (ACTIVE, BLOCKED, CLOSED)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Status updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid status transition"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden: requires admin privileges")
    })
    public ResponseEntity<ApiResponse<WalletResponseDto>> updateStatus(
            @PathVariable UUID walletId,
            @Valid @RequestBody UpdateWalletStatusRequest request) {
        WalletResponseDto response = walletService.updateWalletStatus(walletId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(response, "Wallet status updated successfully"));
    }
}
