package com.wallet.wallet.service;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.util.Money;
import com.wallet.wallet.dto.WalletBalanceDto;
import com.wallet.wallet.dto.WalletResponseDto;
import com.wallet.wallet.entity.Wallet;
import com.wallet.wallet.entity.WalletStatus;
import com.wallet.wallet.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @InjectMocks
    private WalletService walletService;

    private UUID userId;
    private UUID walletId;
    private Wallet testWallet;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        walletId = UUID.randomUUID();
        testWallet = Wallet.builder()
                .id(walletId)
                .userId(userId)
                .balance(BigDecimal.ZERO.setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING))
                .currency("INR")
                .status(WalletStatus.ACTIVE)
                .version(0L)
                .build();
    }

    @Test
    @DisplayName("Should successfully provision wallet for user")
    void testCreateWalletSuccess() {
        when(walletRepository.existsByUserId(userId)).thenReturn(false);
        when(walletRepository.save(any(Wallet.class))).thenReturn(testWallet);

        WalletResponseDto response = walletService.createWalletForUser(userId, "INR");

        assertNotNull(response);
        assertEquals(walletId, response.getId());
        assertEquals(userId, response.getUserId());
        assertEquals(BigDecimal.ZERO.setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING), response.getBalance());
        assertEquals(WalletStatus.ACTIVE, response.getStatus());

        verify(walletRepository, times(1)).save(any(Wallet.class));
    }

    @Test
    @DisplayName("Should reject duplicate wallet provisioning for same user")
    void testCreateWalletDuplicateThrows() {
        when(walletRepository.existsByUserId(userId)).thenReturn(true);

        CoinpathException ex = assertThrows(CoinpathException.class, () ->
                walletService.createWalletForUser(userId, "INR"));

        assertEquals(ErrorCode.INVALID_REQUEST, ex.getErrorCode());
        verify(walletRepository, never()).save(any(Wallet.class));
    }

    @Test
    @DisplayName("Should retrieve wallet balance accurately")
    void testGetBalanceSuccess() {
        testWallet.setBalance(new BigDecimal("1500.2500"));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(testWallet));

        WalletBalanceDto balanceDto = walletService.getBalanceByUserId(userId);

        assertNotNull(balanceDto);
        assertEquals(new BigDecimal("1500.2500"), balanceDto.getBalance());
        assertEquals(new BigDecimal("1500.25"), balanceDto.getDisplayBalance());
        assertEquals("INR", balanceDto.getCurrency());
    }

    @Test
    @DisplayName("Should block and unblock wallet successfully")
    void testWalletStatusTransitions() {
        when(walletRepository.findById(walletId)).thenReturn(Optional.of(testWallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WalletResponseDto blocked = walletService.updateWalletStatus(walletId, WalletStatus.BLOCKED);
        assertEquals(WalletStatus.BLOCKED, blocked.getStatus());

        WalletResponseDto activated = walletService.updateWalletStatus(walletId, WalletStatus.ACTIVE);
        assertEquals(WalletStatus.ACTIVE, activated.getStatus());
    }

    @Test
    @DisplayName("Should reject closing a wallet when balance is non-zero")
    void testCloseWalletWithNonZeroBalanceThrows() {
        testWallet.setBalance(new BigDecimal("50.0000"));
        when(walletRepository.findById(walletId)).thenReturn(Optional.of(testWallet));

        CoinpathException ex = assertThrows(CoinpathException.class, () ->
                walletService.updateWalletStatus(walletId, WalletStatus.CLOSED));

        assertEquals(ErrorCode.INVALID_STATE_TRANSITION, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("non-zero"));
    }

    @Test
    @DisplayName("Should allow closing a wallet when balance is zero")
    void testCloseWalletWithZeroBalanceSucceeds() {
        testWallet.setBalance(BigDecimal.ZERO.setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING));
        when(walletRepository.findById(walletId)).thenReturn(Optional.of(testWallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WalletResponseDto closed = walletService.updateWalletStatus(walletId, WalletStatus.CLOSED);
        assertEquals(WalletStatus.CLOSED, closed.getStatus());
    }

    @Test
    @DisplayName("Wallet domain method debit should throw when balance is insufficient")
    void testWalletDebitInsufficientBalance() {
        testWallet.setBalance(new BigDecimal("100.0000"));

        assertThrows(CoinpathException.class, () ->
                testWallet.debit(new BigDecimal("150.0000")));
    }

    @Test
    @DisplayName("Wallet domain method debit should throw when wallet is blocked")
    void testWalletDebitWhenBlocked() {
        testWallet.setBalance(new BigDecimal("100.0000"));
        testWallet.block();

        assertThrows(CoinpathException.class, () ->
                testWallet.debit(new BigDecimal("50.0000")));
    }
}
