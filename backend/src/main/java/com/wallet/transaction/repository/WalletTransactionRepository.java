package com.wallet.transaction.repository;

import com.wallet.transaction.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {

    Optional<WalletTransaction> findByReferenceId(String referenceId);

    @Query("SELECT t FROM WalletTransaction t WHERE t.sourceWalletId = :walletId OR t.targetWalletId = :walletId ORDER BY t.createdAt DESC")
    Page<WalletTransaction> findByWalletId(@Param("walletId") UUID walletId, Pageable pageable);
}
