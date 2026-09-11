package com.wallet.transaction.repository;

import com.wallet.transaction.entity.EntryType;
import com.wallet.transaction.entity.LedgerEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {

    List<LedgerEntry> findByTransactionId(UUID transactionId);

    List<LedgerEntry> findByWalletIdOrderByCreatedAtAsc(UUID walletId);

    Page<LedgerEntry> findByWalletIdOrderByCreatedAtDesc(UUID walletId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(CASE WHEN e.entryType = 'CREDIT' THEN e.amount ELSE -e.amount END), 0) " +
           "FROM LedgerEntry e WHERE e.walletId = :walletId")
    BigDecimal calculateLedgerBalance(@Param("walletId") UUID walletId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM LedgerEntry e WHERE e.walletId = :walletId AND e.entryType = :entryType")
    BigDecimal sumAmountByWalletIdAndType(@Param("walletId") UUID walletId, @Param("entryType") EntryType entryType);
}
