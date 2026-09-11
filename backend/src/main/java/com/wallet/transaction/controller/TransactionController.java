package com.wallet.transaction.controller;

import com.wallet.common.response.ApiResponse;
import com.wallet.common.security.SecurityUserPrincipal;
import com.wallet.transaction.dto.TransactionResponseDto;
import com.wallet.transaction.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@Tag(name = "Transactions", description = "Endpoints for querying transactions and immutable financial ledger records")
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    @Operation(summary = "Get user transactions", description = "Retrieves paginated transaction history for the authenticated user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Transactions retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<Page<TransactionResponseDto>>> getMyTransactions(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort direction: ASC or DESC") @RequestParam(defaultValue = "DESC") String direction) {

        Sort.Direction sortDirection = "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, "createdAt"));
        Page<TransactionResponseDto> transactions = transactionService.getUserTransactions(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(transactions, "Transactions retrieved successfully"));
    }

    @GetMapping("/{referenceId}")
    @Operation(summary = "Get transaction by reference", description = "Retrieves a specific transaction and its associated ledger entries")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Transaction details retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden: not party to this transaction"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public ResponseEntity<ApiResponse<TransactionResponseDto>> getTransactionByReference(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @PathVariable String referenceId) {
        TransactionResponseDto transaction = transactionService.getTransactionByReference(principal.getId(), referenceId);
        return ResponseEntity.ok(ApiResponse.success(transaction, "Transaction details retrieved successfully"));
    }
}
