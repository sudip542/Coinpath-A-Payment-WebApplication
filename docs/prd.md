# Project Requirement Document (PRD) - Coinpath

## 1. Problem Statement
Digital wallet systems and payment backends process high volumes of financial transactions under heavy concurrency and distributed conditions. Traditional CRUD-oriented architectures routinely fail in these environments, resulting in race conditions, double-spending, partial fund transfers during network partitions, phantom credits from unhandled third-party webhook duplicates, and phantom ledger mismatches. 

Coinpath is architected to address these structural failure modes. It is an enterprise-grade, resilient digital wallet and payment backend system engineered with an uncompromising priority: **FINANCIAL CONSISTENCY OVER PERFORMANCE AND CONVENIENCE**. Under no circumstances will the system create funds arbitrarily, silently drop transactions, permit negative balances, or bypass double-entry ledger verification.

---

## 2. Project Goals
- Deliver a robust, modular monolith backend implementing double-entry ledger bookkeeping.
- Provide sub-second atomic fund transfers with zero race conditions and zero deadlocks.
- Ensure strict idempotency across all financial mutation endpoints (`POST /api/wallet/*`, `POST /api/payments`, `POST /api/refunds`).
- Implement an asynchronous, reliable event pipeline using the Transactional Outbox pattern backed by PostgreSQL and Apache Kafka.
- Protect endpoints with Redis-backed distributed rate limiting and state validation.
- Provide a clean, extensible payment gateway abstraction (supporting mock gateways and future external PSPs like Razorpay and Stripe).
- Maintain 100% financial correctness, verifiable via automated concurrency stress tests and reconciliation scripts.

---

## 3. Core Features
1. **User Identity & Access Management**: Secure registration, login, role-based authorization (`USER`, `ADMIN`), BCrypt password hashing, and stateless JWT authentication.
2. **Wallet Management**: User wallet creation, multi-currency support, lifecycle state machine (`ACTIVE`, `BLOCKED`, `CLOSED`), and high-integrity balance queries.
3. **Money Abstraction**: Strict monetary domain representation utilizing `BigDecimal` with 4 decimal places of internal precision and currency validation.
4. **Financial Ledger & Transfers**: Double-entry ledger recordings (`CREDIT`, `DEBIT`, `TRANSFER`, `REFUND`, `WITHDRAWAL`) where each balance mutation is backed by immutable ledger entries.
5. **Deterministic Concurrency & Deadlock Prevention**: Deterministic row-level pessimistic locking (`PESSIMISTIC_WRITE`) by ordering wallet IDs numerically prior to acquiring locks.
6. **Strict Idempotency Engine**: Dual-layer idempotency defense (Redis fast-path check + PostgreSQL unique constraint on `(user_id, idempotency_key)`).
7. **Payment Gateway Integration**: Strategy-driven payment abstraction handling payment initiation, processing, success callback/polling, and failure isolation.
8. **Refund Subsystem**: Safe partial and full refunds with strict validation ensuring cumulative refunds never exceed the original successful payment amount (`total_refunded <= original_payment`).
9. **Transactional Outbox & Event-Driven Architecture**: Outbox table commits atomically with financial changes; asynchronous workers publish events to Apache Kafka (`PAYMENT_SUCCESS`, `TRANSFER_COMPLETED`, etc.) for downstream notification, audit, and analytics consumers.
10. **Security & Rate Limiting**: Token-bucket / sliding window rate limiting via Redis (`429 Too Many Requests`), global exception handling, and sensitive data masking.

---

## 4. Non-Goals
- Real money settlement with actual banking networks (this system uses mock gateways and simulated PSP webhooks).
- Crypto/Blockchain token integrations.
- Multi-region active-active distributed database clustering (PostgreSQL single-primary with read replicas is the assumed deployment target).
- Frontend user interface (the project is strictly an enterprise backend API service at this phase).

---

## 5. Technology Stack
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.3.x
- **Data Persistence**: Spring Data JPA / Hibernate, PostgreSQL 16
- **Database Migrations**: Flyway
- **Caching & Rate Limiting**: Redis 7 (Lettuce / Spring Data Redis)
- **Event Streaming**: Apache Kafka (KRaft mode / Strimzi)
- **Security**: Spring Security, JJWT (Java JWT)
- **API Documentation**: Springdoc OpenAPI / Swagger UI
- **Testing**: JUnit 5, Mockito, Testcontainers (Postgres, Redis, Kafka)
- **Build Tool**: Maven 3.9+
- **Containerization**: Docker, Docker Compose

---

## 6. Functional Requirements
- **FR-1**: Users must be able to register, log in, and receive a secure JWT bearer token.
- **FR-2**: Every user must be allocated a primary digital wallet upon account creation.
- **FR-3**: Wallets must transition between `ACTIVE`, `BLOCKED`, and `CLOSED` states; inactive wallets cannot transact.
- **FR-4**: Users can deposit funds (`Add Money`) and withdraw funds with immediate ledger verification.
- **FR-5**: Users can transfer funds atomically to any other active wallet using the recipient's identifier.
- **FR-6**: Clients can initiate payments through an abstracted gateway interface and query payment status.
- **FR-7**: Merchants/Users can request refunds against completed payments; refunds must fail if amount exceeds remaining refundable balance.
- **FR-8**: Clients must provide an `Idempotency-Key` header on all fund-mutating POST requests.
- **FR-9**: The system must asynchronously emit domain events to Kafka for audit and notification consumption.

---

## 7. Non-Functional Requirements
- **NFR-1 (Financial Consistency)**: Invariants must hold under 100% of scenarios, including database failures, node crashes, and network timeouts.
- **NFR-2 (Latency)**: 95th percentile wallet transfer response time < 150ms under normal load.
- **NFR-3 (Availability)**: 99.9% uptime for read and balance query operations.
- **NFR-4 (Security)**: Passwords hashed with BCrypt (cost factor 12); sensitive authorization tokens validated on every authenticated route.
- **NFR-5 (Auditability)**: Complete append-only audit trail for all authorization, payment, transfer, and administrative actions.

---

## 8. Financial Consistency Requirements
1. **Never Float/Double**: All monetary amounts represented using `java.math.BigDecimal` (scale 4 for storage, scale 2 for display).
2. **Immutable Ledger**: Ledger entries are insert-only. Updating or deleting a ledger entry is forbidden at the database schema level.
3. **Double-Entry Principle**: For peer-to-peer transfers, the debit amount on the sender wallet must exactly equal the credit amount on the receiver wallet ($\sum \Delta Debit = \sum \Delta Credit$).
4. **Non-Negative Balance**: Wallets must enforce `CHECK (balance >= 0)` in PostgreSQL. Application-level validation is secondary defense.
5. **Atomic Transfer**: Sender debit, receiver credit, transaction record, ledger entries, and outbox event must reside within a single `@Transactional` database commit.

---

## 9. Success Matrix (Measurable Goals)

| Requirement | Target Metric | Validation Method |
| :--- | :--- | :--- |
| **Duplicate Transfers** | **0** duplicate financial records | Automated 50-thread concurrent transfer tests with identical/unique keys |
| **Negative Balances** | **0** occurrences under heavy concurrency | 100 simultaneous withdrawal requests exceeding wallet balance |
| **Ledger Mismatches** | **0** discrepancies ($\text{balance} == \sum \text{ledger}$) | Scheduled automated ledger reconciliation test runner |
| **Duplicate Payments** | **0** duplicate charges | Idempotent gateway retry verification suite |
| **Duplicate Refunds** | **0** duplicate refund credits | Concurrent refund execution against identical payment reference |
| **Refund Overdraft** | **0** cases where $\sum \text{Refunds} > \text{Payment}$ | Boundary test with multi-part refunds exceeding 100% total |
| **Failed Tx Rollback** | **100%** rollback of state on exception | Simulated unhandled runtime exception during intermediate transfer step |
| **Financial Invariants** | **0** invariant violations | Testcontainers automated suite executing full lifecycle |

---

## 10. Validation Strategy
- **Unit Testing**: Complete isolated testing of domain logic, state machines, math precision, and validation rules using Mockito and AssertJ.
- **Integration Testing**: Testcontainers-driven integration tests spinning up isolated PostgreSQL, Redis, and Kafka containers.
- **Concurrency Testing**: Multi-threaded stress tests utilizing `ExecutorService` and `CountDownLatch` executing concurrent debits, cyclic transfers ($A \rightarrow B$ and $B \rightarrow A$), and duplicate idempotency retries.
- **Chaos & Failure Testing**: Simulated container kills, connection drops, and gateway timeout simulations to ensure transactional boundaries and outbox retry capabilities remain completely resilient.

---

## 11. Security Requirements
- JWT token expiration (15 minutes for access tokens, 7 days for refresh tokens).
- Role-based authorization rules: users can only view their own transactions, wallets, and payments; administrative endpoints restricted to `ROLE_ADMIN`.
- SQL injection prevention via Spring Data JPA parameterized queries.
- Constant-time comparison for credentials and hashes to prevent timing attacks.
- Strict payload validation using Jakarta Bean Validation (`@Valid`, `@NotNull`, `@Positive`, `@Email`).

---

## 12. Scalability Requirements
- Stateless application tier permitting horizontal scaling behind an API gateway or load balancer.
- Connection pooling tuned via HikariCP for high-throughput transactional throughput.
- Redis-based rate limiting offloading unauthorized/abusive bursts prior to hitting PostgreSQL.
- Kafka topic partitioning allowing partitioned parallel processing of outbox events and consumer workers.

---

## 13. Failure Handling Requirements
- If the payment gateway times out, the payment status transitions to `PROCESSING` or triggers automated reversal; wallet balances are not prematurely credited.
- If Kafka publishing fails, the message remains stored in `outbox_events` and will be republished on the next polling cycle by the transactional outbox scheduler.
- If a database transaction aborts or throws, Spring's transaction manager performs an immediate rollback, leaving zero partial state.
