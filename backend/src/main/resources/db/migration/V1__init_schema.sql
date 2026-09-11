-- Flyway Database Migration: V1__init_schema.sql
-- System: Coinpath Digital Wallet & Payment Platform
-- Initial schema definition with strong financial invariants and indexes

-- 1. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_role CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN')),
    CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED'))
);

-- 2. WALLETS TABLE (1:1 with User)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    balance DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_wallet_balance_positive CHECK (balance >= 0.0000),
    CONSTRAINT chk_wallet_status CHECK (status IN ('ACTIVE', 'BLOCKED', 'CLOSED'))
);

-- 3. WALLET TRANSACTIONS TABLE
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id VARCHAR(100) NOT NULL UNIQUE,
    source_wallet_id UUID REFERENCES wallets(id) ON DELETE RESTRICT,
    target_wallet_id UUID REFERENCES wallets(id) ON DELETE RESTRICT,
    amount DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tx_amount_positive CHECK (amount > 0.0000),
    CONSTRAINT chk_tx_type CHECK (type IN ('CREDIT', 'DEBIT', 'TRANSFER', 'REFUND', 'WITHDRAWAL')),
    CONSTRAINT chk_tx_status CHECK (status IN ('INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED'))
);

-- 4. LEDGER ENTRIES TABLE (Immutable Double-Entry Accounting)
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES wallet_transactions(id) ON DELETE RESTRICT,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    entry_type VARCHAR(20) NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    balance_after DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_ledger_amount_positive CHECK (amount > 0.0000),
    CONSTRAINT chk_ledger_balance_after_positive CHECK (balance_after >= 0.0000),
    CONSTRAINT chk_ledger_entry_type CHECK (entry_type IN ('DEBIT', 'CREDIT'))
);

-- 5. PAYMENTS TABLE
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_reference VARCHAR(100) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    amount DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payment_amount_positive CHECK (amount > 0.0000),
    CONSTRAINT chk_payment_status CHECK (status IN ('INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED'))
);

-- 6. REFUNDS TABLE
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_reference VARCHAR(100) NOT NULL UNIQUE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    amount DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_refund_amount_positive CHECK (amount > 0.0000),
    CONSTRAINT chk_refund_status CHECK (status IN ('INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED'))
);

-- 7. IDEMPOTENCY KEYS TABLE
CREATE TABLE idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    idempotency_key VARCHAR(255) NOT NULL,
    request_path VARCHAR(255) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    response_status_code INT,
    response_body TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_user_idempotency_key UNIQUE (user_id, idempotency_key)
);

-- 8. TRANSACTIONAL OUTBOX EVENTS TABLE
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_outbox_status CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED'))
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR HIGH-CONCURRENCY QUERY PERFORMANCE
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallet_tx_source ON wallet_transactions(source_wallet_id, created_at DESC);
CREATE INDEX idx_wallet_tx_target ON wallet_transactions(target_wallet_id, created_at DESC);
CREATE INDEX idx_ledger_tx_id ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_wallet_id ON ledger_entries(wallet_id, created_at DESC);
CREATE INDEX idx_payments_user_id ON payments(user_id, created_at DESC);
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_idempotency_lookup ON idempotency_keys(user_id, idempotency_key);
CREATE INDEX idx_outbox_pending ON outbox_events(status, created_at ASC) WHERE status = 'PENDING';
CREATE INDEX idx_audit_user_time ON audit_logs(user_id, timestamp DESC);
