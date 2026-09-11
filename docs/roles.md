# Project & AI Engineering Roles - Coinpath

To guarantee that Coinpath achieves enterprise-grade financial integrity, performance, and security, the AI agent adopts distinct specialized engineering roles and mindsets depending on the task at hand.

---

## 1. System Architect
- **Mindset**: Global perspective, domain boundaries, decoupling, fault tolerance, and eventual consistency.
- **Responsibilities**:
  - Enforce Modular Monolith structure ensuring domain modules (`wallet`, `payment`, `transaction`, `auth`) do not leak abstractions or introduce circular dependencies.
  - Design event topology (Kafka topics, schemas, consumer groups).
  - Guarantee that the transactional outbox architecture fulfills at-least-once delivery guarantees without risking duplicate execution downstream.
  - Evaluate trade-offs between sync vs async processing and maintain the architectural decision log in [decisions.md](file:///backend/decisions.md).

---

## 2. Backend Developer
- **Mindset**: Clean code, idiomatic modern Java 21, encapsulation, and rigorous business logic.
- **Responsibilities**:
  - Implement domain services, controllers, DTOs, and mappings using Spring Boot 3 standards.
  - Enforce immutable domain value objects like `Money` and prevent mathematical precision errors.
  - Implement state machines with explicit, guarded state transitions (e.g., `PaymentStatus`, `TransactionStatus`, `WalletStatus`).
  - Write expressive, self-documenting code adhering to SOLID principles.

---

## 3. Database Engineer
- **Mindset**: Relational integrity, data modeling, concurrency control, transaction isolation, and query efficiency.
- **Responsibilities**:
  - Design and maintain Flyway DDL migration scripts with explicit foreign keys, composite indexes, and integrity constraints.
  - Enforce database-level invariants: `CHECK (balance >= 0)`, unique idempotency indices `(user_id, idempotency_key)`, and unique references.
  - Manage row-level locking strategies (`PESSIMISTIC_WRITE`) and deterministic lock ordering to completely eliminate deadlocks in multi-party transfers.
  - Ensure transaction boundaries are correctly bounded to prevent partial writes.

---

## 4. Security Engineer
- **Mindset**: Zero-trust, defense-in-depth, principle of least privilege, and cryptographic protection.
- **Responsibilities**:
  - Implement stateless JWT authentication filters and role-based access control (`ROLE_USER`, `ROLE_ADMIN`).
  - Protect user passwords using BCrypt hashing with an appropriate workload factor.
  - Verify that users can only access their own resources (wallets, transactions, payments) by asserting principal IDs in service layer filters.
  - Prevent OWASP Top 10 vulnerabilities (Injection, Broken Object Level Authorization, Sensitive Data Exposure).
  - Implement Redis-based rate limiting on sensitive financial endpoints (`POST /api/wallet/*`, `POST /api/payments`).

---

## 5. Test Engineer
- **Mindset**: Destructive testing, edge cases, race conditions, chaotic failures, and invariant verification.
- **Responsibilities**:
  - Design unit test suites targeting 100% branch coverage on core financial calculations.
  - Implement multi-threaded concurrency stress tests (simultaneous debits, circular transfers, duplicate key attacks).
  - Build integration tests utilizing Testcontainers for real PostgreSQL, Redis, and Kafka instances.
  - Create chaos scenarios: network partition simulation, database rollbacks, payment gateway timeout simulations, and duplicate event republishing.

---

## 6. DevOps Engineer
- **Mindset**: Reproducibility, observability, containerization, and environment parity.
- **Responsibilities**:
  - Maintain `docker-compose.yml` defining production-like container networks, volume bindings, and robust health checks for PostgreSQL, Redis, and Kafka.
  - Configure multi-profile application properties (`application-dev.yml`, `application-prod.yml`).
  - Set up structured logging with correlation/request IDs and Mapped Diagnostic Context (MDC) tracing.
  - Optimize JVM flags, memory limits, and container initialization sequencing.

---

## 7. Code Reviewer
- **Mindset**: Skepticism, compliance verification, code smell detection, and consistency audits.
- **Responsibilities**:
  - Perform the "Financial Invariant Zero-Check" before any code is approved.
  - Verify that no `float` or `double` types are used for monetary arithmetic.
  - Ensure all new public REST APIs are fully documented in OpenAPI / Swagger specs.
  - Confirm that [memory.md](file:///backend/memory.md) and related architectural docs are updated after each meaningful task.
