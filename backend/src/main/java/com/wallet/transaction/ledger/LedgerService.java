package com.wallet.transaction.ledger;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.util.Money;
import com.wallet.transaction.dto.LedgerEntryResponseDto;
import com.wallet.transaction.entity.EntryType;
import com.wallet.transaction.entity.LedgerEntry;
import com.wallet.transaction.repository.LedgerEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service orchestrating immutable double-entry ledger bookkeeping.
 * Ledger entries are append-only.
 */
@Service
public class LedgerService {

    private static final Logger log = LoggerFactory.getLogger(LedgerService.class);

    private final LedgerEntryRepository ledgerEntryRepository;

    public LedgerService(LedgerEntryRepository ledgerEntryRepository) {
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public LedgerEntry recordDebit(UUID transactionId, UUID walletId, BigDecimal amount, BigDecimal balanceAfter, String currency) {
        return recordEntry(transactionId, walletId, EntryType.DEBIT, amount, balanceAfter, currency);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public LedgerEntry recordCredit(UUID transactionId, UUID walletId, BigDecimal amount, BigDecimal balanceAfter, String currency) {
        return recordEntry(transactionId, walletId, EntryType.CREDIT, amount, balanceAfter, currency);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public LedgerEntry recordEntry(UUID transactionId, UUID walletId, EntryType entryType, BigDecimal amount, BigDecimal balanceAfter, String currency) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CoinpathException(ErrorCode.INVALID_REQUEST, "Ledger entry amount must be strictly positive");
        }
        if (balanceAfter.compareTo(BigDecimal.ZERO) < 0) {
            throw new CoinpathException(ErrorCode.INSUFFICIENT_BALANCE, "Financial invariant breach: balanceAfter cannot be negative");
        }

        LedgerEntry entry = LedgerEntry.builder()
                .transactionId(transactionId)
                .walletId(walletId)
                .entryType(entryType)
                .amount(amount.setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING))
                .balanceAfter(balanceAfter.setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING))
                .currency(currency)
                .build();

        LedgerEntry saved = ledgerEntryRepository.save(entry);
        log.info("Ledger entry appended: [Tx: {}, Wallet: {}, Type: {}, Amount: {} {}, BalanceAfter: {}]",
                transactionId, walletId, entryType, amount, currency, balanceAfter);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<LedgerEntryResponseDto> getEntriesForTransaction(UUID transactionId) {
        return ledgerEntryRepository.findByTransactionId(transactionId).stream()
                .map(LedgerEntryResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateReconciledBalance(UUID walletId) {
        return ledgerEntryRepository.calculateLedgerBalance(walletId);
    }
}
