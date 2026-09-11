package com.wallet.refund.repository;

import com.wallet.refund.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefundRepository extends JpaRepository<Refund, UUID> {

    Optional<Refund> findByRefundReference(String refundReference);

    List<Refund> findByPaymentId(UUID paymentId);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Refund r WHERE r.paymentId = :paymentId AND r.status = 'SUCCESS'")
    BigDecimal calculateTotalRefunded(@Param("paymentId") UUID paymentId);
}
