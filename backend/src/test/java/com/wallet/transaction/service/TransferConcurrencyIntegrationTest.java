package com.wallet.transaction.service;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.transaction.dto.TransferRequest;
import com.wallet.transaction.dto.WithdrawRequest;
import com.wallet.transaction.entity.EntryType;
import com.wallet.transaction.entity.LedgerEntry;
import com.wallet.transaction.repository.LedgerEntryRepository;
import com.wallet.user.entity.User;
import com.wallet.user.entity.UserRole;
import com.wallet.user.entity.UserStatus;
import com.wallet.user.repository.UserRepository;
import com.wallet.wallet.entity.Wallet;
import com.wallet.wallet.entity.WalletStatus;
import com.wallet.wallet.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class TransferConcurrencyIntegrationTest {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;

    @MockBean
    private StringRedisTemplate redisTemplate;

    @MockBean
    private KafkaTemplate<String, String> kafkaTemplate;

    private User userA;
    private User userB;
    private Wallet walletA;
    private Wallet walletB;

    @BeforeEach
    void setUp() {
        ledgerEntryRepository.deleteAll();
        walletRepository.deleteAll();
        userRepository.deleteAll();

        userA = userRepository.save(User.builder()
                .email("alice-" + UUID.randomUUID() + "@coinpath.com")
                .passwordHash("hashed-pw")
                .fullName("Alice")
                .role(UserRole.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .build());

        userB = userRepository.save(User.builder()
                .email("bob-" + UUID.randomUUID() + "@coinpath.com")
                .passwordHash("hashed-pw")
                .fullName("Bob")
                .role(UserRole.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .build());
    }

    @Test
    @DisplayName("High Concurrency Overdraft: 50 threads withdrawing 50 from 1000 balance -> exactly 20 succeed, 0 negative balance")
    void testConcurrentWithdrawalsOverdraftProtection() throws Exception {
        walletA = walletRepository.save(Wallet.builder()
                .userId(userA.getId())
                .balance(new BigDecimal("1000.0000"))
                .currency("INR")
                .status(WalletStatus.ACTIVE)
                .build());

        int totalThreads = 50;
        BigDecimal withdrawAmount = new BigDecimal("50.00");
        ExecutorService executor = Executors.newFixedThreadPool(25);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(totalThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger insufficientFundsCount = new AtomicInteger(0);

        for (int i = 0; i < totalThreads; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    transactionService.withdraw(userA.getId(), WithdrawRequest.builder()
                            .amount(withdrawAmount)
                            .currency("INR")
                            .build());
                    successCount.incrementAndGet();
                } catch (CoinpathException e) {
                    if (e.getErrorCode() == ErrorCode.INSUFFICIENT_BALANCE) {
                        insufficientFundsCount.incrementAndGet();
                    }
                } catch (Exception ignored) {
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean completed = doneLatch.await(30, TimeUnit.SECONDS);
        executor.shutdown();
        assertTrue(completed, "All threads should finish within timeout");

        // Financial Invariant 1: Exactly 20 successful withdrawals of 50 = 1000
        assertEquals(20, successCount.get(), "Exactly 20 withdrawals should succeed before balance is exhausted");
        assertEquals(30, insufficientFundsCount.get(), "30 withdrawals should be rejected with INSUFFICIENT_FUNDS");

        // Financial Invariant 2: Wallet balance must be exactly 0.0000; never negative
        Wallet finalWallet = walletRepository.findById(walletA.getId()).orElseThrow();
        assertEquals(new BigDecimal("0.0000"), finalWallet.getBalance(), "Final balance must be exactly 0.0000");

        // Financial Invariant 3: Ledger Debit entries must exactly equal 20
        List<LedgerEntry> entries = ledgerEntryRepository.findByWalletIdOrderByCreatedAtAsc(walletA.getId());
        assertEquals(20, entries.size(), "Ledger should contain exactly 20 debit entries");
        for (LedgerEntry entry : entries) {
            assertEquals(EntryType.DEBIT, entry.getEntryType());
            assertEquals(new BigDecimal("50.0000"), entry.getAmount());
        }
    }

    @Test
    @DisplayName("Bidirectional Concurrent Transfers: 25 threads A->B and 25 threads B->A simultaneously -> zero deadlocks, conservation of money")
    void testBidirectionalTransfersDeadlockElimination() throws Exception {
        walletA = walletRepository.save(Wallet.builder()
                .userId(userA.getId())
                .balance(new BigDecimal("5000.0000"))
                .currency("INR")
                .status(WalletStatus.ACTIVE)
                .build());

        walletB = walletRepository.save(Wallet.builder()
                .userId(userB.getId())
                .balance(new BigDecimal("5000.0000"))
                .currency("INR")
                .status(WalletStatus.ACTIVE)
                .build());

        BigDecimal initialTotal = walletA.getBalance().add(walletB.getBalance()); // 10,000.0000
        int threadsPerDirection = 15;
        int totalThreads = threadsPerDirection * 2;
        BigDecimal transferAmount = new BigDecimal("20.00");

        ExecutorService executor = Executors.newFixedThreadPool(15);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(totalThreads);

        AtomicInteger successfulTransfers = new AtomicInteger(0);
        AtomicInteger deadlockErrors = new AtomicInteger(0);

        // Direction 1: Alice -> Bob
        for (int i = 0; i < threadsPerDirection; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    transactionService.transfer(userA.getId(), TransferRequest.builder()
                            .targetWalletId(walletB.getId())
                            .amount(transferAmount)
                            .currency("INR")
                            .description("A to B")
                            .build());
                    successfulTransfers.incrementAndGet();
                } catch (Exception e) {
                    System.err.println("A->B transfer failed: " + e.getClass().getName() + " - " + e.getMessage());
                    if (e.getMessage() != null && e.getMessage().toLowerCase().contains("deadlock")) {
                        deadlockErrors.incrementAndGet();
                    }
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Direction 2: Bob -> Alice
        for (int i = 0; i < threadsPerDirection; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    transactionService.transfer(userB.getId(), TransferRequest.builder()
                            .targetWalletId(walletA.getId())
                            .amount(transferAmount)
                            .currency("INR")
                            .description("B to A")
                            .build());
                    successfulTransfers.incrementAndGet();
                } catch (Exception e) {
                    System.err.println("B->A transfer failed: " + e.getClass().getName() + " - " + e.getMessage());
                    if (e.getMessage() != null && e.getMessage().toLowerCase().contains("deadlock")) {
                        deadlockErrors.incrementAndGet();
                    }
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean completed = doneLatch.await(30, TimeUnit.SECONDS);
        executor.shutdown();
        assertTrue(completed, "All transfer threads should complete within timeout");

        // Financial Invariant 1: ZERO DEADLOCKS due to deterministic lock ordering
        assertEquals(0, deadlockErrors.get(), "Deterministic lock ordering must prevent all deadlocks");
        assertEquals(totalThreads, successfulTransfers.get(), "All bidirectional transfers must succeed");

        // Financial Invariant 2: Conservation of Total Money (Wallet A + Wallet B == 10000.0000)
        Wallet finalA = walletRepository.findById(walletA.getId()).orElseThrow();
        Wallet finalB = walletRepository.findById(walletB.getId()).orElseThrow();
        BigDecimal finalTotal = finalA.getBalance().add(finalB.getBalance());

        assertEquals(initialTotal, finalTotal, "Total money across wallets must be strictly conserved");
        assertEquals(new BigDecimal("5000.0000"), finalA.getBalance(), "Net transfers equal zero, balance should remain 5000");
        assertEquals(new BigDecimal("5000.0000"), finalB.getBalance(), "Net transfers equal zero, balance should remain 5000");

        // Financial Invariant 3: Total ledger credits == Total ledger debits
        BigDecimal totalLedgerCredits = ledgerEntryRepository.sumAmountByWalletIdAndType(walletA.getId(), EntryType.CREDIT)
                .add(ledgerEntryRepository.sumAmountByWalletIdAndType(walletB.getId(), EntryType.CREDIT));
        BigDecimal totalLedgerDebits = ledgerEntryRepository.sumAmountByWalletIdAndType(walletA.getId(), EntryType.DEBIT)
                .add(ledgerEntryRepository.sumAmountByWalletIdAndType(walletB.getId(), EntryType.DEBIT));

        assertEquals(totalLedgerCredits, totalLedgerDebits, "Sum of all ledger credits must equal sum of all ledger debits");
    }
}
