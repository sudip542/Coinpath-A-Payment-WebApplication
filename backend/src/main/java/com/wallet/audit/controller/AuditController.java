package com.wallet.audit.controller;

import com.wallet.audit.entity.AuditLog;
import com.wallet.audit.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/audit-logs")
@Tag(name = "Audit Trail", description = "Immutable audit log inspection for financial transactions")
@SecurityRequirement(name = "Bearer Authentication")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    public AuditController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Query audit trail", description = "Search immutable audit logs by user or resource")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(required = false) UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("timestamp").descending());
        if (userId != null) {
            return ResponseEntity.ok(auditLogRepository.findByUserId(userId, pageRequest));
        }
        return ResponseEntity.ok(auditLogRepository.findAll(pageRequest));
    }
}
