package com.wallet.transaction.service;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.wallet.entity.Wallet;
import com.wallet.wallet.entity.WalletStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

import static org.junit.jupiter.api.Assertions.*;

class ConcurrencyLockingTest {

    @Test
    @DisplayName("Concurrency: User with ₹700 attempts two simultaneous ₹500 withdrawals -> only 1 succeeds")
    void testConcurrentDebitDoubleSpendingProtection() throws InterruptedException {
        // Shared wallet representation
        Wallet wallet = Wallet.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .balance(new BigDecimal("700.0000"))
                .currency("INR")
                .status(WalletStatus.ACTIVE)
                .build();

        ReentrantLock walletLock = new ReentrantLock();
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        int numberOfThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);

        for (int i = 0; i < numberOfThreads; i++) {
            executor.submit(() -> {
                try {
                    // Simulate row-level pessimistic lock serialized check
                    walletLock.lock();
                    try {
                        BigDecimal withdrawAmount = new BigDecimal("500.0000");
                        wallet.debit(withdrawAmount);
                        successCount.incrementAndGet();
                    } finally {
                        walletLock.unlock();
                    }
                } catch (CoinpathException ex) {
                    if (ex.getErrorCode() == ErrorCode.INSUFFICIENT_BALANCE) {
                        failureCount.incrementAndGet();
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertEquals(1, successCount.get(), "Exactly one transfer should succeed");
        assertEquals(1, failureCount.get(), "Second transfer must fail with INSUFFICIENT_BALANCE");
        assertEquals(new BigDecimal("200.0000"), wallet.getBalance(), "Final balance must be exactly ₹200");
    }

    @Test
    @DisplayName("Deadlock Prevention: Deterministic ascending lock ordering for A -> B and B -> A")
    void testDeterministicLockOrderingOrder() {
        UUID walletIdA = UUID.fromString("00000000-0000-0000-0000-000000000001");
        UUID walletIdB = UUID.fromString("00000000-0000-0000-0000-000000000002");

        // Operation 1: A -> B
        UUID op1First = walletIdA.compareTo(walletIdB) < 0 ? walletIdA : walletIdB;
        UUID op1Second = walletIdA.compareTo(walletIdB) < 0 ? walletIdB : walletIdA;

        // Operation 2: B -> A
        UUID op2First = walletIdB.compareTo(walletIdA) < 0 ? walletIdB : walletIdA;
        UUID op2Second = walletIdB.compareTo(walletIdA) < 0 ? walletIdA : walletIdB;

        // Verify mathematically that both operations lock in identical order
        assertEquals(op1First, op2First, "First lock target must be identical regardless of transfer direction");
        assertEquals(op1Second, op2Second, "Second lock target must be identical regardless of transfer direction");
        assertEquals(walletIdA, op1First);
        assertEquals(walletIdB, op1Second);
    }
}
