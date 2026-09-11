package com.wallet.transaction.service;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.transaction.dto.DepositRequest;
import com.wallet.transaction.dto.TransactionResponseDto;
import com.wallet.transaction.dto.TransferRequest;
import com.wallet.transaction.dto.WithdrawRequest;
import com.wallet.transaction.entity.TransactionStatus;
import com.wallet.transaction.entity.TransactionType;
import com.wallet.transaction.entity.WalletTransaction;
import com.wallet.transaction.ledger.LedgerService;
import com.wallet.transaction.repository.WalletTransactionRepository;
import com.wallet.user.repository.UserRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletTransactionRepository transactionRepository;

    @Mock
    private LedgerService ledgerService;

    @Mock
    private com.wallet.common.outbox.service.OutboxService outboxService;

    @InjectMocks
    private TransactionService transactionService;

    private UUID senderUserId;
    private UUID recipientUserId;
    private UUID senderWalletId;
    private UUID recipientWalletId;
    private Wallet senderWallet;
    private Wallet recipientWallet;

    @BeforeEach
    void setUp() {
        senderUserId = UUID.randomUUID();
        recipientUserId = UUID.randomUUID();
        senderWalletId = UUID.randomUUID();
        recipientWalletId = UUID.randomUUID();

        senderWallet = Wallet.builder()
                .id(senderWalletId)
                .userId(senderUserId)
                .balance(new BigDecimal("1000.0000"))
                .currency("INR")
                .status(WalletStatus.ACTIVE)
                .build();

        recipientWallet = Wallet.builder()
                .id(recipientWalletId)
                .userId(recipientUserId)
                .balance(new BigDecimal("500.0000"))
                .currency("INR")
                .status(WalletStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should successfully transfer funds atomically between two wallets")
    void testTransferSuccess() {
        TransferRequest request = TransferRequest.builder()
                .targetWalletId(recipientWalletId)
                .amount(new BigDecimal("300.00"))
                .currency("INR")
                .build();

        when(walletRepository.findByUserId(senderUserId)).thenReturn(Optional.of(senderWallet));
        when(walletRepository.findById(recipientWalletId)).thenReturn(Optional.of(recipientWallet));

        when(walletRepository.findByIdWithLock(senderWalletId)).thenReturn(Optional.of(senderWallet));
        when(walletRepository.findByIdWithLock(recipientWalletId)).thenReturn(Optional.of(recipientWallet));

        when(transactionRepository.save(any(WalletTransaction.class))).thenAnswer(i -> {
            WalletTransaction tx = i.getArgument(0);
            tx.setId(UUID.randomUUID());
            return tx;
        });
        when(ledgerService.getEntriesForTransaction(any(UUID.class))).thenReturn(List.of());

        TransactionResponseDto response = transactionService.transfer(senderUserId, request);

        assertNotNull(response);
        assertEquals(TransactionStatus.SUCCESS, response.getStatus());
        assertEquals(TransactionType.TRANSFER, response.getType());
        assertEquals(new BigDecimal("300.0000"), response.getAmount());

        // Assert balances after transfer
        assertEquals(new BigDecimal("700.0000"), senderWallet.getBalance());
        assertEquals(new BigDecimal("800.0000"), recipientWallet.getBalance());

        // Verify ledger entries were recorded for both parties
        verify(ledgerService, times(1)).recordDebit(any(), eq(senderWalletId), eq(new BigDecimal("300.0000")), eq(new BigDecimal("700.0000")), eq("INR"));
        verify(ledgerService, times(1)).recordCredit(any(), eq(recipientWalletId), eq(new BigDecimal("300.0000")), eq(new BigDecimal("800.0000")), eq("INR"));
    }

    @Test
    @DisplayName("Should reject self-transfer to the same wallet")
    void testTransferToSelfThrows() {
        TransferRequest request = TransferRequest.builder()
                .targetWalletId(senderWalletId)
                .amount(new BigDecimal("100.00"))
                .build();

        when(walletRepository.findByUserId(senderUserId)).thenReturn(Optional.of(senderWallet));
        when(walletRepository.findById(senderWalletId)).thenReturn(Optional.of(senderWallet));

        CoinpathException ex = assertThrows(CoinpathException.class, () ->
                transactionService.transfer(senderUserId, request));

        assertEquals(ErrorCode.INVALID_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("same wallet"));
    }

    @Test
    @DisplayName("Should reject transfer when sender has insufficient balance")
    void testTransferInsufficientBalanceThrows() {
        TransferRequest request = TransferRequest.builder()
                .targetWalletId(recipientWalletId)
                .amount(new BigDecimal("2000.00")) // sender only has 1000
                .build();

        when(walletRepository.findByUserId(senderUserId)).thenReturn(Optional.of(senderWallet));
        when(walletRepository.findById(recipientWalletId)).thenReturn(Optional.of(recipientWallet));
        when(walletRepository.findByIdWithLock(senderWalletId)).thenReturn(Optional.of(senderWallet));
        when(walletRepository.findByIdWithLock(recipientWalletId)).thenReturn(Optional.of(recipientWallet));

        CoinpathException ex = assertThrows(CoinpathException.class, () ->
                transactionService.transfer(senderUserId, request));

        assertEquals(ErrorCode.INSUFFICIENT_BALANCE, ex.getErrorCode());
        // Verify balance was untouched
        assertEquals(new BigDecimal("1000.0000"), senderWallet.getBalance());
        assertEquals(new BigDecimal("500.0000"), recipientWallet.getBalance());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should deposit money and append ledger record")
    void testAddMoneySuccess() {
        DepositRequest request = DepositRequest.builder()
                .amount(new BigDecimal("500.00"))
                .currency("INR")
                .build();

        when(walletRepository.findByUserIdWithLock(senderUserId)).thenReturn(Optional.of(senderWallet));
        when(transactionRepository.save(any(WalletTransaction.class))).thenAnswer(i -> {
            WalletTransaction tx = i.getArgument(0);
            tx.setId(UUID.randomUUID());
            return tx;
        });

        TransactionResponseDto response = transactionService.addMoney(senderUserId, request);

        assertNotNull(response);
        assertEquals(TransactionType.CREDIT, response.getType());
        assertEquals(new BigDecimal("1500.0000"), senderWallet.getBalance());
        verify(ledgerService, times(1)).recordCredit(any(), eq(senderWalletId), eq(new BigDecimal("500.0000")), eq(new BigDecimal("1500.0000")), eq("INR"));
    }

    @Test
    @DisplayName("Should withdraw money and append debit ledger record")
    void testWithdrawSuccess() {
        WithdrawRequest request = WithdrawRequest.builder()
                .amount(new BigDecimal("400.00"))
                .currency("INR")
                .build();

        when(walletRepository.findByUserIdWithLock(senderUserId)).thenReturn(Optional.of(senderWallet));
        when(transactionRepository.save(any(WalletTransaction.class))).thenAnswer(i -> {
            WalletTransaction tx = i.getArgument(0);
            tx.setId(UUID.randomUUID());
            return tx;
        });

        TransactionResponseDto response = transactionService.withdraw(senderUserId, request);

        assertNotNull(response);
        assertEquals(TransactionType.WITHDRAWAL, response.getType());
        assertEquals(new BigDecimal("600.0000"), senderWallet.getBalance());
        verify(ledgerService, times(1)).recordDebit(any(), eq(senderWalletId), eq(new BigDecimal("400.0000")), eq(new BigDecimal("600.0000")), eq("INR"));
    }
}
