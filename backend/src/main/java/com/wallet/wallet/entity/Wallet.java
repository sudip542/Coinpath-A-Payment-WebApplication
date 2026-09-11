package com.wallet.wallet.entity;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.util.Money;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "balance", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO.setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING);

    @Column(name = "currency", nullable = false, length = 10)
    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private WalletStatus status = WalletStatus.ACTIVE;

    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public void assertActive() {
        if (this.status == WalletStatus.BLOCKED) {
            throw new CoinpathException(ErrorCode.WALLET_BLOCKED, "Wallet is blocked and cannot perform operations");
        }
        if (this.status == WalletStatus.CLOSED) {
            throw new CoinpathException(ErrorCode.WALLET_CLOSED, "Wallet is closed and cannot perform operations");
        }
    }

    public boolean hasSufficientBalance(BigDecimal amount) {
        Objects.requireNonNull(amount, "Amount must not be null");
        return this.balance.compareTo(amount) >= 0;
    }

    public void credit(BigDecimal amount) {
        assertActive();
        Objects.requireNonNull(amount, "Credit amount must not be null");
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CoinpathException(ErrorCode.INVALID_REQUEST, "Credit amount must be strictly positive");
        }
        this.balance = this.balance.add(amount).setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING);
    }

    public void debit(BigDecimal amount) {
        assertActive();
        Objects.requireNonNull(amount, "Debit amount must not be null");
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CoinpathException(ErrorCode.INVALID_REQUEST, "Debit amount must be strictly positive");
        }
        if (!hasSufficientBalance(amount)) {
            throw new CoinpathException(ErrorCode.INSUFFICIENT_BALANCE, 
                    String.format("Insufficient balance. Available: %s %s, Requested: %s", currency, balance, amount));
        }
        this.balance = this.balance.subtract(amount).setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING);
    }

    public void block() {
        if (this.status == WalletStatus.CLOSED) {
            throw new CoinpathException(ErrorCode.INVALID_STATE_TRANSITION, "Cannot block a closed wallet");
        }
        this.status = WalletStatus.BLOCKED;
    }

    public void activate() {
        if (this.status == WalletStatus.CLOSED) {
            throw new CoinpathException(ErrorCode.INVALID_STATE_TRANSITION, "Cannot activate a closed wallet");
        }
        this.status = WalletStatus.ACTIVE;
    }

    public void close() {
        if (this.balance.compareTo(BigDecimal.ZERO) != 0) {
            throw new CoinpathException(ErrorCode.INVALID_STATE_TRANSITION, 
                    "Wallet cannot be closed while balance is non-zero. Current balance: " + balance);
        }
        this.status = WalletStatus.CLOSED;
    }
}
