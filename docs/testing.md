# Testing Strategy & Verification Guide - Coinpath

Testing in Coinpath is designed around financial verification. Because financial bugs can lead to irreparable capital loss, testing focuses rigorously on concurrency, distributed failure injection, and strict mathematical accounting checks.

---

## 1. Test Categories & Tools

- **Unit Testing**: JUnit 5, Mockito, AssertJ. Isolated business logic, value object arithmetic, state machine rules, and validator assertions.
- **Integration Testing**: Spring Boot Test, Testcontainers (PostgreSQL 16, Redis 7, Kafka 3.7+). Real database transactions, constraints, queries, and messaging mechanics.
- **Concurrency Testing**: Multi-threaded stress suites using `ExecutorService`, `CountDownLatch`, and `CompletableFuture`.
- **Failure / Chaos Testing**: Simulated network timeouts, mock gateway exceptions, Kafka publisher crashes, and transactional rollbacks.

---

## 2. Mandatory Concurrency Test Matrix

| Concurrency Test Case | Setup | Expected Outcome | Financial Invariant Validated |
| :--- | :--- | :--- | :--- |
| **1. Competing Transfers** | Wallet A has ₹1,000. Two threads simultaneously attempt to transfer ₹800 to Wallet B and Wallet C. | Exactly **1** transfer succeeds with 200 OK. The second fails with `400 INSUFFICIENT_BALANCE`. Wallet A balance = ₹200. | Zero negative balance; zero double-spending. |
| **2. Multi-Threaded Withdrawals** | Wallet A has ₹500. 10 threads concurrently attempt to withdraw ₹100 each. | Exactly **5** withdrawals succeed, **5** fail with `INSUFFICIENT_BALANCE`. Wallet A balance = ₹0.00. | Negative balance target = 0. |
| **3. Bidirectional Transfers (Deadlock Elimination)** | Thread 1: Wallet A $\rightarrow$ Wallet B (₹100). Thread 2: Wallet B $\rightarrow$ Wallet A (₹100). Executed simultaneously across 50 iterations. | All transfers complete without database deadlock (`DeadlockLoserDataAccessException`). | Deterministic ascending lock ordering prevents circular locks. |
| **4. Concurrent Idempotency Replay** | 20 threads simultaneously post identical request payload with the same `Idempotency-Key`. | Exactly **1** execution mutates balance; remaining 19 receive the identical cached/committed response. Wallet is debited exactly once. | Idempotency unique constraint + Redis fast-path. |
| **5. Duplicate Payment Retry** | Client calls payment callback/webhook twice simultaneously for the same payment reference. | Exactly **1** payment transitions to `SUCCESS` and credits wallet. Second request is safely deduplicated. | No duplicate credit to user wallet. |
| **6. Concurrent Refund Race** | Payment was ₹1,000. Two threads attempt concurrent refunds of ₹700 each. | Exactly **1** refund succeeds. The second is rejected because ₹700 + ₹700 > ₹1,000. | Total refunded $\le$ original payment. |

---

## 3. Failure & Resilience Test Cases

1. **Transaction Rollback Integrity**:
   - Throw an unhandled runtime exception during outbox insertion after wallet balances have been mutated in memory.
   - Assert that Spring `@Transactional` executes complete database rollback: neither balances nor ledger entries are altered in PostgreSQL.
2. **Kafka Broker Outage**:
   - Terminate the Kafka Testcontainer while executing transfers.
   - Assert that the transfer completes successfully with 200 OK, balances and ledger entries persist, and outbox records remain in `PENDING` status.
   - Restart Kafka container, trigger outbox publisher job, and verify events are published and marked `SENT`.
3. **Payment Gateway Timeout**:
   - Mock gateway delay exceeding HTTP read timeout.
   - Verify payment transitions to `PROCESSING` or triggers safe reversal without crediting destination wallet.
4. **Consumer Idempotency**:
   - Force Kafka consumer to process the identical `TRANSFER_COMPLETED` event twice.
   - Assert audit log and notification handlers detect duplicate message ID and do not duplicate side-effects.

---

## 4. Automated Ledger Reconciliation Check

Every integration test suite concludes by running the ledger reconciliation query:
$$\text{wallet.balance} = \sum_{\text{ledger}} \text{CREDIT} - \sum_{\text{ledger}} \text{DEBIT}$$

Any deviation triggers an immediate assertion failure and halts the build.
