package com.wallet.transaction.service;

import com.wallet.common.event.TransferCompletedEvent;
import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.outbox.service.OutboxService;
import com.wallet.common.util.Money;
import com.wallet.transaction.dto.*;
import com.wallet.transaction.entity.TransactionStatus;
import com.wallet.transaction.entity.TransactionType;
import com.wallet.transaction.entity.WalletTransaction;
import com.wallet.transaction.ledger.LedgerService;
import com.wallet.transaction.repository.WalletTransactionRepository;
import com.wallet.user.entity.User;
import com.wallet.user.repository.UserRepository;
import com.wallet.wallet.entity.Wallet;
import com.wallet.wallet.repository.WalletRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final WalletTransactionRepository transactionRepository;
    private final LedgerService ledgerService;
    private final OutboxService outboxService;

    @PersistenceContext
    private EntityManager entityManager;

    public TransactionService(
            WalletRepository walletRepository,
            UserRepository userRepository,
            WalletTransactionRepository transactionRepository,
            LedgerService ledgerService,
            OutboxService outboxService) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.ledgerService = ledgerService;
        this.outboxService = outboxService;
    }

    /**
     * Executes an atomic fund transfer between two wallets.
     * Uses deterministic ascending lock ordering to mathematically eliminate deadlocks.
     */
    @Transactional
    public TransactionResponseDto transfer(UUID senderUserId, TransferRequest request) {
        log.info("Initiating transfer of {} {} from user: {}", request.getAmount(), request.getCurrency(), senderUserId);

        // 1. Resolve sender wallet
        Wallet senderWallet = walletRepository.findByUserId(senderUserId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Sender wallet not found"));

        // 2. Resolve recipient wallet
        Wallet recipientWallet = resolveRecipientWallet(request);

        // 3. Invariant: Prevent self-transfer
        if (senderWallet.getId().equals(recipientWallet.getId())) {
            throw new CoinpathException(ErrorCode.INVALID_REQUEST, "Cannot transfer funds to the same wallet");
        }

        // 4. Currency matching assertion
        if (!senderWallet.getCurrency().equalsIgnoreCase(recipientWallet.getCurrency())) {
            throw new CoinpathException(ErrorCode.INVALID_REQUEST, String.format(
                    "Currency mismatch between sender (%s) and recipient (%s)",
                    senderWallet.getCurrency(), recipientWallet.getCurrency()));
        }

        // 5. Deterministic lock ordering: lock smaller UUID first to eliminate deadlocks
        UUID idA = senderWallet.getId();
        UUID idB = recipientWallet.getId();
        UUID firstLockId = idA.compareTo(idB) < 0 ? idA : idB;
        UUID secondLockId = idA.compareTo(idB) < 0 ? idB : idA;

        if (entityManager != null) {
            entityManager.detach(senderWallet);
            entityManager.detach(recipientWallet);
        }

        Wallet firstLocked = walletRepository.findByIdWithLock(firstLockId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet not found during lock acquisition"));
        Wallet secondLocked = walletRepository.findByIdWithLock(secondLockId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet not found during lock acquisition"));

        Wallet lockedSender = firstLocked.getId().equals(idA) ? firstLocked : secondLocked;
        Wallet lockedRecipient = firstLocked.getId().equals(idB) ? firstLocked : secondLocked;

        // 6. Assert both wallets are active
        lockedSender.assertActive();
        lockedRecipient.assertActive();

        BigDecimal amount = request.getAmount().setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING);

        // 7. Atomic balance mutation
        lockedSender.debit(amount);
        lockedRecipient.credit(amount);

        walletRepository.save(lockedSender);
        walletRepository.save(lockedRecipient);

        // 8. Create transaction entity
        String referenceId = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        WalletTransaction transaction = WalletTransaction.builder()
                .referenceId(referenceId)
                .sourceWalletId(lockedSender.getId())
                .targetWalletId(lockedRecipient.getId())
                .amount(amount)
                .currency(lockedSender.getCurrency())
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.SUCCESS)
                .build();

        WalletTransaction savedTx = transactionRepository.save(transaction);

        // 9. Append immutable double-entry ledger records
        ledgerService.recordDebit(savedTx.getId(), lockedSender.getId(), amount, lockedSender.getBalance(), lockedSender.getCurrency());
        ledgerService.recordCredit(savedTx.getId(), lockedRecipient.getId(), amount, lockedRecipient.getBalance(), lockedRecipient.getCurrency());

        // 10. Register Outbox Event atomically within DB commit boundary
        TransferCompletedEvent event = TransferCompletedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .transactionReference(referenceId)
                .sourceWalletId(lockedSender.getId())
                .targetWalletId(lockedRecipient.getId())
                .amount(amount)
                .currency(lockedSender.getCurrency())
                .timestamp(Instant.now())
                .build();
        outboxService.publish("TRANSFER", referenceId, "TRANSFER_COMPLETED", event);

        log.info("Transfer completed successfully. Tx Reference: {}", referenceId);
        List<LedgerEntryResponseDto> ledgerEntries = ledgerService.getEntriesForTransaction(savedTx.getId());
        return TransactionResponseDto.fromEntity(savedTx, ledgerEntries);
    }

    /**
     * Deposits money into user's wallet with ledger entry.
     */
    @Transactional
    public TransactionResponseDto addMoney(UUID userId, DepositRequest request) {
        log.info("Depositing {} {} to user: {}", request.getAmount(), request.getCurrency(), userId);

        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet not found"));

        wallet.assertActive();
        BigDecimal amount = request.getAmount().setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING);
        wallet.credit(amount);
        walletRepository.save(wallet);

        String referenceId = "DEP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        WalletTransaction transaction = WalletTransaction.builder()
                .referenceId(referenceId)
                .targetWalletId(wallet.getId())
                .amount(amount)
                .currency(wallet.getCurrency())
                .type(TransactionType.CREDIT)
                .status(TransactionStatus.SUCCESS)
                .build();

        WalletTransaction savedTx = transactionRepository.save(transaction);
        ledgerService.recordCredit(savedTx.getId(), wallet.getId(), amount, wallet.getBalance(), wallet.getCurrency());

        List<LedgerEntryResponseDto> ledgerEntries = ledgerService.getEntriesForTransaction(savedTx.getId());
        return TransactionResponseDto.fromEntity(savedTx, ledgerEntries);
    }

    /**
     * Withdraws money from user's wallet with ledger entry.
     */
    @Transactional
    public TransactionResponseDto withdraw(UUID userId, WithdrawRequest request) {
        log.info("Withdrawing {} {} from user: {}", request.getAmount(), request.getCurrency(), userId);

        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet not found"));

        wallet.assertActive();
        BigDecimal amount = request.getAmount().setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING);
        wallet.debit(amount);
        walletRepository.save(wallet);

        String referenceId = "WTH-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        WalletTransaction transaction = WalletTransaction.builder()
                .referenceId(referenceId)
                .sourceWalletId(wallet.getId())
                .amount(amount)
                .currency(wallet.getCurrency())
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.SUCCESS)
                .build();

        WalletTransaction savedTx = transactionRepository.save(transaction);
        ledgerService.recordDebit(savedTx.getId(), wallet.getId(), amount, wallet.getBalance(), wallet.getCurrency());

        List<LedgerEntryResponseDto> ledgerEntries = ledgerService.getEntriesForTransaction(savedTx.getId());
        return TransactionResponseDto.fromEntity(savedTx, ledgerEntries);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponseDto> getUserTransactions(UUID userId, Pageable pageable) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet not found"));

        return transactionRepository.findByWalletId(wallet.getId(), pageable)
                .map(tx -> {
                    List<LedgerEntryResponseDto> entries = ledgerService.getEntriesForTransaction(tx.getId());
                    return TransactionResponseDto.fromEntity(tx, entries);
                });
    }

    @Transactional(readOnly = true)
    public TransactionResponseDto getTransactionByReference(UUID userId, String referenceId) {
        Wallet userWallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet not found"));

        WalletTransaction transaction = transactionRepository.findByReferenceId(referenceId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.TRANSACTION_NOT_FOUND, "Transaction not found: " + referenceId));

        boolean isAuthorized = userWallet.getId().equals(transaction.getSourceWalletId()) ||
                               userWallet.getId().equals(transaction.getTargetWalletId());

        if (!isAuthorized) {
            throw new CoinpathException(ErrorCode.FORBIDDEN, "Not authorized to view this transaction");
        }

        List<LedgerEntryResponseDto> entries = ledgerService.getEntriesForTransaction(transaction.getId());
        return TransactionResponseDto.fromEntity(transaction, entries);
    }

    private Wallet resolveRecipientWallet(TransferRequest request) {
        if (request.getTargetWalletId() != null) {
            return walletRepository.findById(request.getTargetWalletId())
                    .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Recipient wallet not found"));
        }
        if (request.getRecipientEmail() != null && !request.getRecipientEmail().isBlank()) {
            String email = request.getRecipientEmail().trim().toLowerCase();
            User recipientUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Recipient user not found with email: " + email));
            return walletRepository.findByUserId(recipientUser.getId())
                    .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Recipient wallet not found"));
        }
        throw new CoinpathException(ErrorCode.INVALID_REQUEST, "Must provide recipientEmail or targetWalletId");
    }
}
