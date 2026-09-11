# Architecture Decision Records (ADR) - Coinpath

This log documents all foundational architectural, technical, and domain decisions made in the Coinpath project.

---

## ADR-001: Selection of PostgreSQL as Authoritative Database
- **Status**: Accepted
- **Context**: Financial transactions require ACID compliance, strong serializability guarantees, row-level locking capabilities, and robust constraints.
- **Decision**: Use PostgreSQL 16 as the primary database.
- **Reason**: PostgreSQL provides rock-solid transaction semantics, strict `CHECK` constraints (e.g., `balance >= 0`), powerful index types (B-tree, unique composite indexes), and native row-locking syntax (`FOR UPDATE`).
- **Impact**: All financial state resides strictly in PostgreSQL. No distributed NoSQL databases or caches may serve as the system of record.

---

## ADR-002: Monetary Arithmetic Representation using BigDecimal
- **Status**: Accepted
- **Context**: IEEE 754 floating-point representations (`float`, `double`) introduce binary rounding errors (e.g. `0.1 + 0.2 != 0.3`), which are catastrophic in financial accounting.
- **Decision**: Represent all monetary values using `java.math.BigDecimal` with scale 4 internally and standard bankers rounding (`RoundingMode.HALF_EVEN`). Database columns use `DECIMAL(19, 4)`.
- **Reason**: Eliminates floating-point imprecision, meets international banking standards, and guarantees exact ledger equality.
- **Impact**: Primitive types (`double`, `float`) are forbidden across all entities, DTOs, and services.

---

## ADR-003: Pessimistic Row Locking over Optimistic Locking for Transfers
- **Status**: Accepted
- **Context**: In high-concurrency wallet operations (e.g. rapid withdrawals, simultaneous transfers), optimistic locking (`@Version`) causes frequent `OptimisticLockException` rollbacks, forcing client retries and degrading user experience.
- **Decision**: Use database row-level pessimistic write locking (`SELECT ... FOR UPDATE` via `LockModeType.PESSIMISTIC_WRITE`) when modifying wallet balances.
- **Reason**: Pessimistic locking serializes mutations on specific wallet accounts at the database level, ensuring deterministic order, avoiding costly optimistic conflict retry loops, and guaranteeing that balance checks and balance decrements occur without race conditions.
- **Impact**: Requires deterministic locking order to prevent database deadlocks.

---

## ADR-004: Deterministic Lock Ordering for Deadlock Elimination
- **Status**: Accepted
- **Context**: If User A transfers to User B while User B simultaneously transfers to User A, thread 1 locks Wallet A and waits for Wallet B, while thread 2 locks Wallet B and waits for Wallet A, producing a cyclic deadlock.
- **Decision**: Always acquire row locks in deterministic ascending order of `wallet_id` (e.g., `first = min(idA, idB)`, `second = max(idA, idB)`).
- **Reason**: Eliminates circular wait conditions, mathematically guaranteeing that deadlocks cannot occur during dual-wallet transfers.
- **Impact**: Transfer service must sort wallet IDs prior to requesting entity locks from the repository.

---

## ADR-005: Double-Entry Immutable Ledger Design
- **Status**: Accepted
- **Context**: Relying solely on a mutable `wallet.balance` column obscures transaction history, creates single points of corruption, and makes financial audits impossible.
- **Decision**: Implement an immutable, append-only ledger (`ledger_entries`). Every wallet balance mutation requires at least one corresponding ledger row (`DEBIT` or `CREDIT`).
- **Reason**: Ensures complete auditability, supports historical balance reconstruction, and allows continuous background verification ($\text{wallet.balance} == \sum \text{ledger\_entries}$).
- **Impact**: No `UPDATE` or `DELETE` statements are ever executed against the ledger table. Mistakes are corrected via compensating reversal transactions.

---

## ADR-006: Dual-Layer Idempotency Engine
- **Status**: Accepted
- **Context**: Network timeouts and mobile retries frequently submit duplicate HTTP POST requests for the same transfer or payment.
- **Decision**: Enforce idempotency using a two-tier strategy:
  1. Fast-path in-memory lock and cached response lookup via Redis with short TTL (e.g. 24 hours).
  2. Authoritative PostgreSQL database unique constraint on `(user_id, idempotency_key)` in the `idempotency_keys` table.
- **Reason**: Redis provides fast rejection of in-flight duplicate clicks, while the PostgreSQL unique constraint provides ironclad transactional protection even if Redis is restarted or evicts the key.
- **Impact**: Clients must supply the `Idempotency-Key` header on all non-idempotent financial APIs.

---

## ADR-007: Redis Scope and Boundaries
- **Status**: Accepted
- **Context**: High-performance in-memory stores are tempting for storing balances, but memory volatility risks catastrophic data loss during crashes.
- **Decision**: Confine Redis strictly to:
  1. Temporary idempotency locks and cached responses.
  2. Rate limiting counters (`ratelimit:*`).
  3. Non-authoritative metadata caching.
- **Reason**: Protects financial integrity. Redis is explicitly NOT the source of truth for wallet balances.
- **Impact**: Cache invalidation or complete Redis downtime may degrade latency or rate-limiting, but will never corrupt financial balances.

---

## ADR-008: Transactional Outbox Pattern for Kafka Event Publishing
- **Status**: Accepted
- **Context**: Emitting Kafka events directly inside a database transaction risks the dual-write problem: the database commit might succeed while Kafka fails (losing the event), or Kafka succeeds while the DB transaction rolls back (publishing phantom events).
- **Decision**: Implement the Transactional Outbox Pattern. Domain events are inserted into an `outbox_events` table within the same PostgreSQL transaction that modifies wallet balances and ledger entries. An asynchronous worker polls or streams outbox entries to Kafka and marks them `SENT`.
- **Reason**: Guarantees at-least-once event delivery to Kafka without distributed transactions (2PC/XA) and prevents phantom events.
- **Impact**: Consumers must implement idempotent event processing to tolerate at-least-once delivery duplicates.

---

## ADR-009: Payment Gateway Strategy Pattern
- **Status**: Accepted
- **Context**: The payment backend must support internal wallet payments, mock gateways for local testing, and external PSPs (Razorpay, Stripe) in the future without modifying core business services.
- **Decision**: Abstract payment provider interactions behind a `PaymentGateway` interface using the Strategy Pattern and a `PaymentGatewayFactory`.
- **Reason**: Decouples payment processing workflows from third-party vendor APIs, adhering to the Open/Closed Principle.
- **Impact**: New gateways can be added simply by implementing the interface and registering as a Spring `@Component`.

---

## ADR-010: Modular Monolith Architecture
- **Status**: Accepted
- **Context**: Microservices introduce distributed transactions (Saga), network latency, and operational complexity that are premature and risky for early-stage financial integrity.
- **Decision**: Build Coinpath as a Modular Monolith with strictly decoupled package-level domain boundaries (`wallet`, `payment`, `transaction`, `auth`, etc.).
- **Reason**: Provides the consistency benefits of single-database ACID transactions while maintaining clean domain boundaries that can be split into microservices in the future.
- **Impact**: Cross-module communication occurs via clean Java interfaces and domain events, avoiding direct entity manipulation across domain packages.
