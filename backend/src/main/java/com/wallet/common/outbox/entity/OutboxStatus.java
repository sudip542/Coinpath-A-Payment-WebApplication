package com.wallet.common.outbox.entity;

public enum OutboxStatus {
    PENDING,
    PROCESSING,
    SENT,
    FAILED
}
