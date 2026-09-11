package com.wallet.common.util;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;
import java.util.Objects;

/**
 * Immutable Money Value Object ensuring financial precision and currency safety.
 * Under no circumstances does this class use or accept float or double.
 */
public final class Money implements Serializable, Comparable<Money> {

    public static final int STORAGE_SCALE = 4;
    public static final int DISPLAY_SCALE = 2;
    public static final RoundingMode DEFAULT_ROUNDING = RoundingMode.HALF_EVEN;
    public static final Currency DEFAULT_CURRENCY = Currency.getInstance("INR");

    private final BigDecimal amount;
    private final Currency currency;

    private Money(BigDecimal amount, Currency currency) {
        Objects.requireNonNull(amount, "Amount must not be null");
        Objects.requireNonNull(currency, "Currency must not be null");
        this.amount = amount.setScale(STORAGE_SCALE, DEFAULT_ROUNDING);
        this.currency = currency;
    }

    public static Money of(BigDecimal amount, Currency currency) {
        return new Money(amount, currency);
    }

    public static Money of(BigDecimal amount, String currencyCode) {
        Objects.requireNonNull(currencyCode, "Currency code must not be null");
        return new Money(amount, Currency.getInstance(currencyCode.toUpperCase()));
    }

    public static Money of(String amountStr, String currencyCode) {
        Objects.requireNonNull(amountStr, "Amount string must not be null");
        return of(new BigDecimal(amountStr), currencyCode);
    }

    public static Money of(BigDecimal amount) {
        return of(amount, DEFAULT_CURRENCY);
    }

    public static Money zero(Currency currency) {
        return new Money(BigDecimal.ZERO, currency);
    }

    public static Money zero(String currencyCode) {
        return of(BigDecimal.ZERO, currencyCode);
    }

    @JsonCreator
    public static Money fromJson(
            @JsonProperty("amount") BigDecimal amount,
            @JsonProperty("currency") String currency) {
        return of(amount, currency != null ? currency : DEFAULT_CURRENCY.getCurrencyCode());
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Currency getCurrency() {
        return currency;
    }

    public String getCurrencyCode() {
        return currency.getCurrencyCode();
    }

    public Money add(Money other) {
        assertSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money subtract(Money other) {
        assertSameCurrency(other);
        BigDecimal newAmount = this.amount.subtract(other.amount);
        if (newAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Subtraction results in negative amount: " + newAmount);
        }
        return new Money(newAmount, this.currency);
    }

    public boolean isGreaterThanOrEqual(Money other) {
        assertSameCurrency(other);
        return this.amount.compareTo(other.amount) >= 0;
    }

    public boolean isGreaterThan(Money other) {
        assertSameCurrency(other);
        return this.amount.compareTo(other.amount) > 0;
    }

    public boolean isPositive() {
        return this.amount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isZero() {
        return this.amount.compareTo(BigDecimal.ZERO) == 0;
    }

    public BigDecimal toDisplayAmount() {
        return this.amount.setScale(DISPLAY_SCALE, DEFAULT_ROUNDING);
    }

    private void assertSameCurrency(Money other) {
        Objects.requireNonNull(other, "Other Money instance must not be null");
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(String.format(
                    "Currency mismatch: cannot perform operation between %s and %s",
                    this.currency.getCurrencyCode(), other.currency.getCurrencyCode()));
        }
    }

    @Override
    public int compareTo(Money o) {
        assertSameCurrency(o);
        return this.amount.compareTo(o.amount);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money money)) return false;
        return amount.compareTo(money.amount) == 0 && currency.equals(money.currency);
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount.stripTrailingZeros(), currency);
    }

    @Override
    public String toString() {
        return String.format("%s %s", currency.getCurrencyCode(), toDisplayAmount().toPlainString());
    }
}
