# AI Agent Operational Rules & Workflow - Coinpath

This document defines the strict operational rules and development protocol that any AI agent working on the Coinpath codebase must follow.

---

## 1. Core Operational Directives

1. **Read PRD Before Implementation**: Never implement a feature without aligning with [prd.md](file:///backend/prd.md) functional and financial requirements.
2. **Read Architecture Before Architecture Changes**: Always review [architecture.md](file:///backend/architecture.md) before altering system boundaries, event flows, or integration patterns.
3. **Read Design Before LLD Changes**: Consult [design.md](file:///backend/design.md) prior to creating new entities, changing domain value objects, or refactoring services.
4. **Read Decisions Before Architectural Adjustments**: Verify past choices in [decisions.md](file:///backend/decisions.md) to understand why specific trade-offs were selected.
5. **Read Memory Before Continuing Work**: Always inspect [memory.md](file:///backend/memory.md) at the start of any new session or task.
6. **Read Testing Before Feature Development**: Check [testing.md](file:///backend/testing.md) to understand test criteria and required invariant validations.
7. **Never Silently Change Architecture**: Any structural modification must be explicitly documented in `architecture.md` and recorded in `decisions.md`.
8. **Never Silently Change Database Design**: All DDL schema changes must be packaged as incremental Flyway migration scripts with corresponding documentation updates.
9. **NEVER SACRIFICE FINANCIAL CONSISTENCY**: Financial correctness > performance > convenience. If a performant optimization risks an inconsistent ledger state, the optimization must be rejected.
10. **Never Use Redis As Financial Source of Truth**: PostgreSQL and its relational ledger tables are the single authoritative financial state. Redis is solely an auxiliary cache, idempotency lock, and rate limiter.
11. **Never Use Float or Double For Money**: All monetary amounts must be `java.math.BigDecimal` with explicit scale and rounding modes.
12. **Never Bypass Transaction Boundaries**: Financial operations must execute within well-defined, atomic `@Transactional` boundaries.
13. **Never Ignore Failing Tests**: A broken test is an active blocker. Do not proceed until tests pass.
14. **Never Introduce Unnecessary Design Patterns**: Employ patterns (e.g., Strategy, Factory) only when solving concrete architectural requirements, never for cosmetic complexity.
15. **Never Delete Existing Functionality Without Documenting It**: Deprecate and document breaking changes in `memory.md` and `decisions.md`.

---

## 2. Standard Development Workflow

```
Understand requirement
       ↓
  Read prd.md
       ↓
Read architecture.md
       ↓
  Read design.md
       ↓
 Read decisions.md
       ↓
  Read memory.md
       ↓
  Implement Code
       ↓
Write / Update Tests
       ↓
    Run Tests
       ↓
Review Financial Consistency (Zero-Check)
       ↓
  Update Documentation
       ↓
  Update memory.md
       ↓
Update decisions.md (if new architectural decision made)
```

---

## 3. Financial Invariant Checklist (The Zero-Check)

Before committing any code affecting balances or payments, verify:
- [ ] Can this operation create money out of thin air? (Must be NO)
- [ ] Can money disappear or be unaccounted for? (Must be NO)
- [ ] Can concurrent requests double-spend the same balance? (Must be NO - verified with locks)
- [ ] Can a network timeout duplicate the transaction? (Must be NO - protected by Idempotency)
- [ ] Can Kafka broker failure lose the event? (Must be NO - secured by Transactional Outbox)
- [ ] Can a refund exceed the original payment amount? (Must be NO - validated against sum of prior refunds)
- [ ] Does the sum of debits equal the sum of credits? (Must be YES)
- [ ] Is there any possibility of a negative balance? (Must be NO - guarded by DB CHECK constraint)
