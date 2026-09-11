package com.wallet.notification.repository;

import com.wallet.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<Notification> findByUserId(UUID userId, Pageable pageable);

    List<Notification> findByReferenceId(String referenceId);
}
