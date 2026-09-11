package com.wallet.common.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Currency;

import static org.junit.jupiter.api.Assertions.*;

class MoneyTest {

    private final Currency INR = Currency.getInstance("INR");
    private final Currency USD = Currency.getInstance("USD");

    @Test
    @DisplayName("Should create Money with correct scale and currency")
    void testMoneyCreation() {
        Money money = Money.of(new BigDecimal("100.5"), INR);
        assertEquals(new BigDecimal("100.5000"), money.getAmount());
        assertEquals(INR, money.getCurrency());
        assertEquals(new BigDecimal("100.50"), money.toDisplayAmount());
    }

    @Test
    @DisplayName("Should add money of identical currency accurately")
    void testMoneyAddition() {
        Money m1 = Money.of(new BigDecimal("100.25"), INR);
        Money m2 = Money.of(new BigDecimal("50.75"), INR);

        Money result = m1.add(m2);

        assertEquals(new BigDecimal("151.0000"), result.getAmount());
        assertEquals(new BigDecimal("100.2500"), m1.getAmount(), "Original instance must remain immutable");
    }

    @Test
    @DisplayName("Should subtract money of identical currency accurately")
    void testMoneySubtraction() {
        Money m1 = Money.of(new BigDecimal("100.00"), INR);
        Money m2 = Money.of(new BigDecimal("40.50"), INR);

        Money result = m1.subtract(m2);

        assertEquals(new BigDecimal("59.5000"), result.getAmount());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException if subtraction results in negative amount")
    void testNegativeBalancePrevention() {
        Money m1 = Money.of(new BigDecimal("10.00"), INR);
        Money m2 = Money.of(new BigDecimal("20.00"), INR);

        assertThrows(IllegalArgumentException.class, () -> m1.subtract(m2));
    }

    @Test
    @DisplayName("Should reject operations across different currencies")
    void testCurrencyMismatch() {
        Money inrMoney = Money.of(new BigDecimal("100"), INR);
        Money usdMoney = Money.of(new BigDecimal("100"), USD);

        assertThrows(IllegalArgumentException.class, () -> inrMoney.add(usdMoney));
        assertThrows(IllegalArgumentException.class, () -> inrMoney.subtract(usdMoney));
    }
}
