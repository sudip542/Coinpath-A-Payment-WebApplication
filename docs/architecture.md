# System Architecture Specification - Coinpath

This document outlines the architectural blueprints, subsystem boundaries, data flow models, and resilience mechanics of the Coinpath backend.

---

## 1. High-Level Modular Monolith Architecture

Coinpath is designed as a **Modular Monolith** where each business domain exists within a strictly delineated package hierarchy. All domain transactions operate within a shared relational database boundary to guarantee ACID consistency, while remaining fully decoupled to allow seamless future extraction into microservices.

```
+---------------------------------------------------------------+
|                      Client Applications                      |
|                  (Web, Mobile, Admin Portal)                  |
+---------------------------------------------------------------+
                               | HTTPS / JSON (Idempotency-Key)
                               v
+---------------------------------------------------------------+
|                        API Gateway Layer                      |
|          Spring Security (JWT), Redis Rate Limiting           |
+---------------------------------------------------------------+
                               |
                               v
+---------------------------------------------------------------+
|                      Application Services                     |
|                                                               |
|  +----------------+  +----------------+  +-----------------+  |
|  |  Auth Module   |  |  User Module   |  |  Wallet Module  |  |
|  +----------------+  +----------------+  +-----------------+  |
|  +----------------+  +----------------+  +-----------------+  |
|  | Payment Module |  | Transfer/Tx    |  |  Refund Module  |  |
|  +----------------+  +----------------+  +-----------------+  |
+---------------------------------------------------------------+
            |                                      |
            v                                      v
+-----------------------+              +-----------------------+
|  Redis 7 (In-Memory)  |              | PostgreSQL 16 (Relational)|
| - Rate Limiter (Token)|              | - Authoritative State |
| - Idempotency Lock    |              | - Wallets & Balances  |
| - Fast Cache          |              | - Immutable Ledger    |
+-----------------------+              | - Transactional Outbox|
                                       +-----------------------+
                                                   |
                                                   | Polled / Streamed
                                                   v
                                       +-----------------------+
                                       | Outbox Relay Publisher|
                                       +-----------------------+
                                                   |
                                                   v
                                       +-----------------------+
                                       |      Apache Kafka     |
                                       +-----------------------+
                                           |       |       |
                 +-------------------------+       |       +-------------------------+
                 v                                 v                                 v
        +------------------+             +-------------------+             +-------------------+
        |  Notification    |             |  Audit Consumer   |             | Analytics Stream  |
        |  Consumer        |             +-------------------+             +-------------------+
        +------------------+
```

---

## 2. Core Execution Flow & Financial Transaction Path

When an atomic peer-to-peer transfer (`A` sends money to `B`) is invoked:

```
Client (POST /api/wallet/transfer)
  │
  ├─ 1. Intercept: Verify JWT Auth & Redis Rate Limiter
  ├─ 2. Idempotency Check: Verify (user_id, idempotency_key) in Redis / DB
  │
  └─ 3. Enter @Transactional Boundary
        │
        ├─ 4. Sort Wallet IDs deterministically: min(idA, idB), max(idA, idB)
        ├─ 5. Acquire PESSIMISTIC_WRITE locks on Wallet A and Wallet B
        ├─ 6. Validate Wallet States (Both must be ACTIVE)
        ├─ 7. Invariant Check: Sender balance >= transfer amount
        ├─ 8. Decrement Sender Balance (Wallet A)
        ├─ 9. Increment Receiver Balance (Wallet B)
        ├─ 10. Persist Transaction Record (Status: SUCCESS)
        ├─ 11. Append 2 Immutable Ledger Entries (1 DEBIT for A, 1 CREDIT for B)
        ├─ 12. Insert Outbox Event (TRANSFER_COMPLETED)
        ├─ 13. Persist Idempotency Record
        │
        └─ 14. Database COMMIT (PostgreSQL)
  │
  ├─ 15. Return 200 OK to Client
  │
Async Background Process:
  │
  ├─ 16. Outbox Poller reads pending events from `outbox_events`
  ├─ 17. Publishes `TRANSFER_COMPLETED` to Kafka topic `coinpath.transfer.events`
  ├─ 18. Marks outbox record as SENT
  │
Kafka Broker
  │
  ├─ 19. Notification Consumer emits Email/Push to sender & receiver
  └─ 20. Audit Consumer records append-only immutable audit trail
```

---

## 3. Transactional Outbox Architecture

To prevent the **Dual-Write Problem** (where the database transaction succeeds but the message broker publish fails, or vice-versa), Coinpath implements the Transactional Outbox Pattern:

1. Every financial transaction writes its business entities (`wallets`, `ledger_entries`, `wallet_transactions`) and an event record into `outbox_events` within the **exact same ACID transaction**.
2. If the database transaction aborts, the outbox record is rolled back, preventing phantom notifications.
3. An asynchronous outbox runner periodically selects pending events (`SELECT ... FOR UPDATE SKIP LOCKED`), dispatches them to Kafka, and updates their status to `SENT`.
4. If Kafka is temporarily down, the database transaction is unaffected, and events accumulate safely in the database to be published when Kafka recovers.

---

## 4. Redis Architecture & Fast-Path Layer

Redis operates exclusively as a non-authoritative acceleration and protection tier:

1. **Sliding-Window Rate Limiting**: Redis hashes/sorted sets enforce maximum request rates per IP or user on critical mutation routes (e.g. 10 requests/minute on `/api/wallet/transfer`).
2. **Idempotency Lock**: A distributed lock `SET idemp:{userId}:{key} PROCESSING NX EX 30` prevents race conditions between identical requests landing simultaneously before the DB transaction completes.
3. **Response Cache**: Completed responses are cached in Redis with a 24-hour TTL for lightning-fast identical retries.

---

## 5. Kafka Event Topology & Consumer Resiliency

### Topics:
- `coinpath.payment.events`: Partitioned by `userId` (Order guaranteed per user).
- `coinpath.transfer.events`: Partitioned by `sourceWalletId`.
- `coinpath.refund.events`: Partitioned by `paymentId`.

### Consumers:
- **Notification Consumer**: Sends receipts, notifications, alerts.
- **Audit Consumer**: Ingests events into centralized `audit_logs` for regulatory compliance.
- **Analytics Consumer**: Prepares real-time aggregations.

### Resiliency & Fault Tolerance:
- All consumers implement idempotent processing (ignoring duplicate event IDs).
- Consumer retries are managed via Spring Kafka `DefaultErrorHandler` with exponential backoff and a Dead Letter Topic (DLT) fallback.
