package com.wallet.audit.repository;

import com.wallet.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findByUserIdOrderByTimestampDesc(UUID userId);

    Page<AuditLog> findByUserId(UUID userId, Pageable pageable);

    List<AuditLog> findByResourceTypeAndResourceId(String resourceType, String resourceId);
}
