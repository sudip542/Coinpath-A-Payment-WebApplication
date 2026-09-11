# Project Memory - Coinpath

This document represents the living memory and execution state of the Coinpath system. Any AI agent or developer continuing work must read and update this file after completing significant tasks.

---

## 1. Current Project State
- **Phase**: Phase 1 - Project Setup & Architecture Foundations.
- **Status**: Skeleton initialization, mandatory engineering documentation, build configuration, and database migration definition.
- **Current Workspace Path**: `c:\Users\sudipbhuniya\Desktop\Office Projects\Payment\backend`

---

## 2. Completed Features
- [x] Initialized project documentation suite (`prd.md`, `agent.md`, `roles.md`, `memory.md`, `decisions.md`, `design.md`, `architecture.md`, `testing.md`, `README.md`).
- [x] Created root-level and project-level `.gitignore`.
- [x] Configured Spring Boot 3.3.x Maven build (`pom.xml`) with Java 21, Spring Data JPA, Spring Security, Flyway, PostgreSQL, Redis, Kafka, Testcontainers, Lombok, and Swagger/OpenAPI.
- [x] Drafted initial DDL migration `V1__init_schema.sql` encompassing all 9 core system tables with hard financial constraints.
- [x] Established multi-container `docker-compose.yml` including PostgreSQL 16, Redis 7, and Apache Kafka (KRaft mode).
- [x] Created standard application configuration files (`application.yml`, `application-dev.yml`, `application-prod.yml`).
- [x] Structured package skeleton under `com.wallet` with base common classes (`Money` value object, `ApiResponse`, `ErrorCode`, `GlobalExceptionHandler`).
- [x] **Phase 2 Complete**: Implemented User identity, `User` JPA entity, `UserRepository`, `UserRole`, `UserStatus`, `JwtService` (HMAC-SHA256), `SecurityUserPrincipal`, `JwtAuthenticationFilter`, `SecurityConfig` (Spring Security 6 stateless filter chain, BCrypt 12 password hashing), `AuthService`, and `AuthController` (`/api/auth/register`, `/api/auth/login`).
- [x] Unit test suites created for `JwtServiceTest` and `AuthServiceTest`.
- [x] **Phase 3 Complete**: Implemented Wallet aggregate domain (`WalletStatus`, `Wallet` entity with non-negative balance checks and lifecycle assertions, `WalletRepository` with pessimistic write lock queries, `WalletService`, automated wallet provisioning on registration, `WalletController` exposing `/api/wallet` and `/api/wallet/balance`, and administrative wallet state management).
- [x] Unit test suite created for `WalletServiceTest`.
- [x] **Phase 4 & 5 Complete**: Implemented Transaction & Immutable Ledger Domain (`WalletTransaction`, `LedgerEntry`, `WalletTransactionRepository`, `LedgerEntryRepository`), `LedgerService` (immutable double-entry accounting), `TransactionService` (atomic P2P transfer, deposit `addMoney`, `withdraw`, deterministic lock ordering by wallet UUID to mathematically eliminate deadlocks), `WalletController` endpoints (`/api/wallet/transfer`, `/api/wallet/add-money`, `/api/wallet/withdraw`), and `TransactionController` (paginated history and reference query).
- [x] Concurrency and unit test suites created: `TransactionServiceTest` and `ConcurrencyLockingTest` (double spending prevention and deterministic lock ordering verification).
- [x] **Phase 6 & 9 Complete**: Implemented Dual-Tier Idempotency Engine (`IdempotencyKey` entity, `IdempotencyKeyRepository`, `@Idempotent` annotation, `IdempotencyService`, `IdempotencyAspect`) with Redis in-flight locks (`NX EX 30s`), SHA-256 payload tampering detection, and PostgreSQL `UNIQUE (user_id, idempotency_key)` authoritative guarantee. Implemented distributed Redis sliding window rate limiting (`@RateLimited`, `RateLimiterService`, `RateLimitingAspect`) returning HTTP 429 `RATE_LIMIT_EXCEEDED`. Applied to all financial mutation APIs in `WalletController`.
- [x] Unit test suites created: `IdempotencyServiceTest` and `RateLimiterServiceTest`.
- [x] **Phase 7 & 8 Complete**: Implemented Strategy-driven Payment Gateway Abstraction (`PaymentGateway`, `MockPaymentGateway`, `WalletPaymentGateway`, `PaymentGatewayFactory`), payment lifecycle state machine (`INITIATED` -> `PROCESSING` -> `SUCCESS` or `FAILED`), payment checkout APIs (`POST /api/payments`, `GET /api/payments/{id}` with `@Idempotent` and `@RateLimited`), and the Safe Refund Engine (`Refund`, `RefundRepository`, `RefundService`, `RefundController`) enforcing partial refund invariant ($\sum \text{Refunds} \le \text{Payment.amount}$) and recording double-entry ledger debits.
- [x] Unit test suites created: `PaymentServiceTest` and `RefundServiceTest`.

- [x] **Phase 10 & 11 Complete**: Implemented Transactional Outbox Pattern and Event-Driven Architecture (`OutboxStatus`, `OutboxEvent`, `OutboxEventRepository`, `OutboxService` with `Propagation.MANDATORY`, `OutboxPublisher` `@Scheduled` background poller with Kafka dispatch and retry policy). Emitted typed domain events (`TransferCompletedEvent`, `PaymentSuccessEvent`, `PaymentFailedEvent`, `RefundCompletedEvent`) from `TransactionService`, `PaymentService`, and `RefundService`. Implemented Kafka Consumer Groups: `NotificationConsumer` (with consumer-side idempotency, mock email/push dispatch, `notifications` table Flyway migration `V2__notification_schema.sql`, `NotificationRepository`, `NotificationController`) and `AuditConsumer` (writing immutable audit records to `audit_logs` table, `AuditLogRepository`, `AuditController`).
- [x] Unit test suites created: `OutboxPublisherTest`, `NotificationConsumerTest`, and `AuditConsumerTest`. Total test count: 54 tests passing with 0 failures.
- [x] **Phase 12 Complete**: Comprehensive Integration Testing Matrix & Financial Invariant Verification. Implemented multi-threaded concurrency suites (`TransferConcurrencyIntegrationTest`: 50 concurrent threads overdraft protection verifying exactly 20 succeed and 30 fail with `INSUFFICIENT_BALANCE` and balance = ₹0; bidirectional concurrent transfers verifying 0 deadlocks and exact conservation of total system balance) and end-to-end integration lifecycle test (`EndToEndFlowIntegrationTest`: user registration -> wallet provisioning -> payment checkout -> ledger recording -> outbox relay -> notification & audit consumption -> P2P transfer -> safe refund). Total test count: 57 tests passing with 0 failures across all domains.
- [x] **Phase 13 & 14 Complete**: Distributed Tracing with SLF4J MDC (`CorrelationIdFilter`, `X-Correlation-ID`), structured logging patterns (`[%X{correlationId}]`), OpenAPI 3.0 documentation polish (`OpenApiConfig`), Actuator health/metrics endpoints, unit tests (`CorrelationIdFilterTest`), and production-ready multi-stage Docker build (`coinpath-backend:latest`, 456MB). Total test count: 59 tests passing with 0 failures across all domains.

---

## 3. Current Task
- All 14 Core Engineering Phases Successfully Completed! System is fully functional, financially consistent, containerized, documented, and tested.

---

## 4. Current Architecture
- **Paradigm**: Modular Monolith with clear domain boundaries:
  - `com.wallet.common` (cross-cutting utilities, exception handling, response envelopes, security filters, OpenAPI config, `@Idempotent` aspect, `@RateLimited` aspect)
  - `com.wallet.auth` (JWT generation, user credentials, authentication filter, registration/login REST APIs)
  - `com.wallet.user` (user profiles, roles: USER, ADMIN)
  - `com.wallet.wallet` (wallet aggregate, balance, state machine: ACTIVE, BLOCKED, CLOSED, balance queries, transfer/deposit/withdraw APIs with idempotency & rate limiting)
  - `com.wallet.transaction` (transfer orchestrator, immutable double-entry ledger, transaction history APIs)
  - `com.wallet.payment` (payment gateway abstraction, strategy factory, payment state machine, checkout APIs)
  - `com.wallet.refund` (refund engine, original payment balance verification, safe partial refunds)
  - `com.wallet.notification` (Kafka notification consumer)
  - `com.wallet.audit` (Kafka audit logging consumer)
- **Financial Architecture**: Double-entry ledger with row-level pessimistic locking (`PESSIMISTIC_WRITE`) sorted deterministically by wallet ID to prevent deadlocks.
- **Event Bus**: Outbox table (`outbox_events`) committed within the main DB transaction and published asynchronously to Kafka.

---

## 5. Important Implementation Details
- **Money Handling**: Stored as `DECIMAL(19, 4)` in PostgreSQL and represented as `BigDecimal` in Java with rounding mode `HALF_EVEN`. Never `float` or `double`.
- **Authoritative Source of Truth**: PostgreSQL is the single source of truth. Redis is strictly an auxiliary cache, rate limiter, and fast-path idempotency checker.
- **Deadlock Prevention**: When locking multiple wallets (e.g. Sender and Receiver in a transfer), the application always acquires locks in ascending order of `wallet_id` (e.g., `min(idA, idB)` first, then `max(idA, idB)`).

---

## 6. Known Bugs
- None currently identified.

---

## 7. Known Limitations
- Real payment provider SDKs (Stripe / Razorpay) are mocked via `MockPaymentGateway` and `WalletPaymentGateway` for local and testing purposes.
- Frontend interface is deferred to a future phase; system is currently exposed via REST APIs and Swagger UI.

---

## 8. Pending Tasks (Roadmap)
- **Phase 10 & 11**: Transactional Outbox entity (`outbox_events`), transactional event publisher, scheduled outbox poller, Kafka topic producer, and asynchronous consumers (`NotificationConsumer`, `AuditConsumer`).
- **Phase 12**: Concurrency stress tests and Testcontainers integration tests.
- **Phase 13**: Swagger/OpenAPI documentation polish.
- **Phase 14**: Observability, correlation IDs, and production readiness checks.

---

## 9. Recent Changes
- Initial project creation, documentation suite setup, build configuration, and base schema specification.

---

## 10. Current Database State
- **Engine**: PostgreSQL 16.
- **Migration Manager**: Flyway.
- **Current Version**: `V1__init_schema.sql` (defining `users`, `wallets`, `wallet_transactions`, `ledger_entries`, `payments`, `refunds`, `idempotency_keys`, `audit_logs`, `outbox_events`).

---

## 11. Current Kafka Topics
- `coinpath.payment.events` (events: `PAYMENT_SUCCESS`, `PAYMENT_FAILED`)
- `coinpath.transfer.events` (events: `TRANSFER_COMPLETED`)
- `coinpath.refund.events` (events: `REFUND_COMPLETED`)

---

## 12. Current Redis Usage
- **Key Prefix `idemp:`**: Short-lived request locks and cached responses for duplicate request suppression.
- **Key Prefix `ratelimit:`**: Sliding-window counter for API rate limiting.

---

## 13. Testing Status
- Initial test configuration with Testcontainers defined in `pom.xml`. Unit and concurrency test suites to be written in Phase 2 through Phase 12.

---

## 14. Important Context For Next Agent
- All Java packages must begin with `com.wallet`. Do not use `com.example.wallet`.
- When adding entities or domain mutations, always respect the immutable ledger rule: balances are verified against ledger entries and never modified in isolation without a corresponding double-entry ledger row.
