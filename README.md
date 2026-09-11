# Coinpath - Production-Grade Digital Wallet & Payment Backend System

Coinpath is an enterprise-grade digital wallet and payment backend system engineered in **Java 21** and **Spring Boot 3.x**. It is designed specifically to showcase rock-solid financial consistency, distributed event-driven architecture, resilient concurrency controls, and double-entry ledger bookkeeping.

> [!IMPORTANT]
> **Core Architectural Axiom**:
> **Financial Correctness > Performance > Convenience**. If any system optimization risks ledger divergence, negative balances, or duplicate funds, that optimization is rejected.

---

## 1. Project Overview
Coinpath manages digital wallets, peer-to-peer fund transfers, multi-provider payment abstractions, partial/full refunds, and event-driven downstream processing. The system handles race conditions, network failures, third-party timeouts, and mobile client retries without ever creating, dropping, or miscounting money.

---

## 2. Problem Statement
In naive digital wallet implementations:
- High-concurrency debit requests lead to negative balances (race conditions / double spending).
- Bidirectional transfers ($A \rightarrow B$ and $B \rightarrow A$) deadlock database connections.
- Network timeouts cause duplicate charges due to non-idempotent client retries.
- Publishing directly to message brokers during database commits creates distributed dual-write inconsistencies.
- Single-column wallet balances make auditing impossible and obscure historical accounting discrepancies.

Coinpath addresses each of these failure modes systematically.

---

## 3. Technology Stack
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.3.4
- **Database**: PostgreSQL 16
- **Cache & Rate Limiter**: Redis 7
- **Event Streaming**: Apache Kafka (KRaft mode)
- **Database Migrations**: Flyway
- **Security**: Spring Security, JWT (JJWT)
- **API Documentation**: Springdoc OpenAPI / Swagger 3
- **Testing**: JUnit 5, Mockito, Testcontainers (Postgres, Redis, Kafka)
- **Containerization**: Docker, Docker Compose

---

## 4. Architecture & Folder Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/wallet/
│   │   │       ├── common/          # Cross-cutting: config, exceptions, security, util (Money)
│   │   │       ├── auth/            # JWT authentication, login, registration
│   │   │       ├── user/            # User profile management & roles (USER, ADMIN)
│   │   │       ├── wallet/          # Wallet aggregate, lifecycle, balance operations
│   │   │       ├── transaction/     # Transfer orchestrator, double-entry ledger
│   │   │       ├── payment/         # Payment gateways (Mock, Wallet), state machine
│   │   │       ├── refund/          # Safe refund engine, refund limit verification
│   │   │       ├── notification/    # Kafka event consumers for user alerts
│   │   │       └── audit/           # Kafka event consumers for audit logging
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/migration/        # Flyway SQL migrations
│   └── test/                        # Unit, integration, concurrency test suites
├── docker/
├── docker-compose.yml
├── pom.xml
└── README.md
```

---

## 5. Database Schema & Entity Relationships

```
+----------------+       +-------------------+       +--------------------+
|     users      |       |      wallets      |       | wallet_transactions|
+----------------+       +-------------------+       +--------------------+
| id (PK, UUID)  |<------| id (PK, UUID)     |<------| id (PK, UUID)      |
| email (UNIQUE) |       | user_id (UNIQUE)  |       | reference_id (UQ)  |
| password_hash  |       | balance (CHECK>=0)|       | source_wallet_id   |
| role           |       | currency          |       | target_wallet_id   |
| status         |       | status            |       | amount             |
+----------------+       +-------------------+       | type & status      |
                                   ^                 +--------------------+
                                   |                           |
                         +-------------------+                 |
                         |  ledger_entries   |<----------------+
                         +-------------------+
                         | id (PK, UUID)     |
                         | transaction_id    |
                         | wallet_id         |
                         | entry_type (CR/DR)|
                         | amount            |
                         | balance_after     |
                         | created_at (IMMUT)|
                         +-------------------+
```

---

## 6. Financial Ledger & Double-Entry Invariant

Coinpath enforces an immutable double-entry ledger. For any transfer of amount $X$ from Wallet $A$ to Wallet $B$:
1. Wallet $A$ balance decreases by $X$.
2. Wallet $B$ balance increases by $X$.
3. Ledger Entry 1: `wallet_id = A, entry_type = DEBIT, amount = X`.
4. Ledger Entry 2: `wallet_id = B, entry_type = CREDIT, amount = X`.
5. Invariant: $\sum \text{Debit} = \sum \text{Credit} = X$.
6. Check Invariant: $\text{Current Balance} == \sum \text{Credits} - \sum \text{Debits}$.

---

## 7. Concurrency & Deadlock Prevention

### Row-Level Pessimistic Locking
Wallet updates acquire row-level locks via `SELECT ... FOR UPDATE` (`LockModeType.PESSIMISTIC_WRITE`).

### Deterministic Lock Ordering
To prevent circular deadlocks during concurrent transfers ($A \rightarrow B$ and $B \rightarrow A$ simultaneously):
```java
UUID firstId = idA.compareTo(idB) < 0 ? idA : idB;
UUID secondId = idA.compareTo(idB) < 0 ? idB : idA;

Wallet firstWallet = walletRepository.findByIdWithLock(firstId);
Wallet secondWallet = walletRepository.findByIdWithLock(secondId);
```
Both threads acquire locks in the exact same order, preventing cyclic waiting.

---

## 8. Idempotency & Rate Limiting

- **Idempotency Header**: Client supplies `Idempotency-Key: <unique-uuid>`.
- **Fast Path (Redis)**: Checks `idemp:{userId}:{key}`. If in-flight, returns `409 CONCURRENT_REQUEST`. If completed, returns cached response immediately.
- **Authoritative Defense (PostgreSQL)**: The `idempotency_keys` table enforces `UNIQUE (user_id, idempotency_key)`.
- **Rate Limiting**: Protected financial endpoints enforce Redis token-bucket limits, returning `429 TOO MANY REQUESTS` upon violation.

---

## 9. Transactional Outbox Pattern

```
Database Transaction (Single Commit)
├── 1. Mutate Wallets
├── 2. Insert Transaction Record
├── 3. Insert Ledger Entries
└── 4. Insert Outbox Event (status: PENDING)
         ↓ COMMIT
Outbox Publisher (Background Scheduler)
├── Reads PENDING outbox events with SKIP LOCKED
├── Dispatches to Kafka
└── Updates status to SENT
```

If Kafka fails or is unreachable, the database transaction is unaffected. Events accumulate safely in PostgreSQL and are published when Kafka recovers.

---

## 10. Observability & Distributed Tracing

Every incoming request is tagged with an `X-Correlation-ID` header (or auto-assigned a UUID) via `CorrelationIdFilter`.
- **Thread-Local Tracing**: Propagated through SLF4J MDC (`correlationId`).
- **Structured Logs**: Every console and container log entry embeds the correlation ID:
  ```
  2026-09-11 04:50:02.254 [c685b10d-055a-4b69-a641-c37fc8fae33d] [http-nio-8080-exec-1] INFO c.w.t.service.TransactionService - Initiating transfer...
  ```
- **Response Headers**: Returns `X-Correlation-ID` in HTTP responses for frontend tracing.
- **Actuator Endpoints**:
  - `GET /actuator/health`: System and dependency liveness/readiness.
  - `GET /actuator/metrics`: JVM, database connection pool, and application throughput metrics.

---

## 11. Local Development & Docker Setup

### Prerequisites
- Docker & Docker Compose (or local Java 21 LTS + Maven 3.9+)

### Starting Supporting Infrastructure
```bash
docker compose up -d postgres redis kafka
```

### Running Tests (All 59 Unit & Multi-Threaded Concurrency Tests)
```bash
mvn test
# Or using Maven container:
docker run --rm -v "%cd%:/app" -w /app maven:3.9.9-eclipse-temurin-21-alpine mvn test
```

### Building & Running Production Container
```bash
# 1. Build Multi-Stage Docker Image
docker build -t coinpath-backend:latest .

# 2. Run Containerized Backend
docker run -d --name coinpath-app \
  -p 8080:8080 \
  --network host \
  -e DB_HOST=localhost \
  -e REDIS_HOST=localhost \
  -e KAFKA_BOOTSTRAP_SERVERS=localhost:9092 \
  coinpath-backend:latest
```

### Accessing Interactive Documentation
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## 12. Core REST API Reference

| Domain | Method | Endpoint | Description | Headers / Annotations |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register new user + auto-provision wallet | Public |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & return JWT | Public |
| **Wallet** | `GET` | `/api/wallet` | Get authenticated user's wallet summary | `Bearer <JWT>` |
| **Wallet** | `GET` | `/api/wallet/balance` | Get wallet balance | `Bearer <JWT>` |
| **Wallet** | `POST` | `/api/wallet/add-money` | Deposit money into wallet | `@Idempotent`, `@RateLimited` |
| **Wallet** | `POST` | `/api/wallet/transfer` | P2P transfer with deterministic lock | `@Idempotent`, `@RateLimited` |
| **Wallet** | `POST` | `/api/wallet/withdraw` | Withdraw money from wallet | `@Idempotent`, `@RateLimited` |
| **Payment**| `POST` | `/api/payments` | Initiate checkout via Gateway Strategy | `@Idempotent`, `@RateLimited` |
| **Payment**| `GET` | `/api/payments/{ref}` | Query payment status | `Bearer <JWT>` |
| **Refund** | `POST` | `/api/refunds` | Process safe partial or full refund | `@Idempotent`, `@RateLimited` |
| **Refund** | `GET` | `/api/refunds/{ref}` | Query refund status | `Bearer <JWT>` |
| **Notif** | `GET` | `/api/notifications` | Query user notifications | `Bearer <JWT>` |
| **Audit** | `GET` | `/api/admin/audit-logs`| Query immutable audit log trail | `Bearer <JWT>` (`ROLE_ADMIN`) |

---

## 13. System Design Interview Discussion Guide

### 1. How is double spending prevented?
Double spending is prevented at two independent layers:
- **Database Row Lock**: `SELECT FOR UPDATE` serializes balance checks and decrements. No two threads can read the balance simultaneously and both decide sufficient funds exist.
- **Database Check Constraint**: PostgreSQL enforces `CHECK (balance >= 0)`. Even in the event of an application logic bug, the database rejects any statement that would reduce the balance below zero.

### 2. How are concurrent transfers handled and deadlocks prevented?
Dual-wallet transfers acquire row locks in deterministic ascending order of `wallet_id` (`min(A, B)` followed by `max(A, B)`). This eliminates cyclic lock dependency graphs ($A \rightarrow B$ and $B \rightarrow A$), preventing PostgreSQL deadlock aborts.

### 3. Why is the ledger required if we have a wallet balance?
A single balance column only provides the present snapshot. The ledger provides mathematical proof of every movement of funds, guarantees non-repudiation, allows historical auditing, and enables automated reconciliation to detect accounting drift.

### 4. Why is Redis NOT the financial source of truth?
Redis is an in-memory data store with asynchronous snapshotting (RDB/AOF) that can lose transactions during power cuts or crashes. PostgreSQL provides true ACID durability (fsync on WAL). Redis is solely an accelerator for fast rejection of duplicates and rate limiting.

### 5. What happens if Kafka fails?
Because of the Transactional Outbox pattern, the business transaction is decoupled from Kafka availability. If Kafka goes down, transfers continue normally, and events accumulate safely in the `outbox_events` table in PostgreSQL. The background outbox poller retries with exponential backoff until Kafka recovers.

### 6. What happens if payment succeeds at the gateway but wallet credit fails?
Payment state is persisted in an intermediate `PROCESSING` state before invoking the gateway. When the gateway confirms success, the wallet credit is wrapped in an idempotent state transition. If a crash occurs, a reconciliation worker queries unconfirmed `PROCESSING` payments from the gateway and credits the wallet idempotently.

### 7. How does idempotency work under concurrent retries?
When two requests arrive with the same `Idempotency-Key`, Redis immediately flags the key as `IN_FLIGHT`. If both bypass Redis, PostgreSQL's `UNIQUE (user_id, idempotency_key)` constraint forces the second thread to throw a `DataIntegrityViolationException`, which the exception handler catches and converts into the original cached response.

### 8. How are partial refunds handled safely?
Every refund records a foreign key to `payments(id)`. The refund service acquires a lock on the payment record and calculates $\sum \text{Refunds}$. If $\sum \text{Existing Refunds} + \text{Requested Refund} > \text{Payment Amount}$, the request is rejected with `REFUND_EXCEEDS_LIMIT`.

### 9. How do you scale transaction processing at extreme volumes?
At hyperscale:
- Wallets are sharded/partitioned by `wallet_id` or account region.
- Transfers across different shards utilize a distributed two-phase Saga orchestrator backed by Kafka events and compensating transactions.
- Read queries are directed to PostgreSQL read replicas, keeping primary nodes dedicated to write transactions.
