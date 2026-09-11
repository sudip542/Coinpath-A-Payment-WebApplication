package com.wallet.common.outbox.repository;

import com.wallet.common.outbox.entity.OutboxEvent;
import com.wallet.common.outbox.entity.OutboxStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    List<OutboxEvent> findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus status);

    @Query("SELECT e FROM OutboxEvent e WHERE e.status = :status AND e.retryCount < :maxRetries ORDER BY e.createdAt ASC")
    List<OutboxEvent> findPendingEvents(@Param("status") OutboxStatus status, @Param("maxRetries") int maxRetries, Pageable pageable);
}
