package com.wallet.payment.repository;

import com.wallet.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByPaymentReference(String paymentReference);

    Page<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
