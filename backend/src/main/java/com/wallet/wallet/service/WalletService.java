package com.wallet.wallet.service;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.util.Money;
import com.wallet.wallet.dto.WalletBalanceDto;
import com.wallet.wallet.dto.WalletResponseDto;
import com.wallet.wallet.entity.Wallet;
import com.wallet.wallet.entity.WalletStatus;
import com.wallet.wallet.repository.WalletRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);

    private final WalletRepository walletRepository;

    public WalletService(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @Transactional
    public WalletResponseDto createWalletForUser(UUID userId, String currency) {
        if (walletRepository.existsByUserId(userId)) {
            log.warn("Wallet already exists for user: {}", userId);
            throw new CoinpathException(ErrorCode.INVALID_REQUEST, "User already has a registered wallet");
        }

        String targetCurrency = (currency != null && !currency.isBlank()) ? currency.toUpperCase() : "INR";

        Wallet wallet = Wallet.builder()
                .userId(userId)
                .balance(BigDecimal.ZERO.setScale(Money.STORAGE_SCALE, Money.DEFAULT_ROUNDING))
                .currency(targetCurrency)
                .status(WalletStatus.ACTIVE)
                .build();

        Wallet saved = walletRepository.save(wallet);
        log.info("Provisioned new wallet id: {} for user: {} in currency: {}", saved.getId(), userId, targetCurrency);
        return WalletResponseDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public WalletResponseDto getWalletByUserId(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet not found for user: " + userId));
        return WalletResponseDto.fromEntity(wallet);
    }

    @Transactional(readOnly = true)
    public Wallet getWalletEntityByUserId(UUID userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet not found for user: " + userId));
    }

    @Transactional(readOnly = true)
    public WalletBalanceDto getBalanceByUserId(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet not found for user: " + userId));
        return WalletBalanceDto.fromEntity(wallet);
    }

    @Transactional
    public WalletResponseDto updateWalletStatus(UUID walletId, WalletStatus newStatus) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new CoinpathException(ErrorCode.WALLET_NOT_FOUND, "Wallet not found with id: " + walletId));

        log.info("Transitioning wallet: {} status from {} to {}", walletId, wallet.getStatus(), newStatus);

        switch (newStatus) {
            case ACTIVE -> wallet.activate();
            case BLOCKED -> wallet.block();
            case CLOSED -> wallet.close();
        }

        Wallet updated = walletRepository.save(wallet);
        return WalletResponseDto.fromEntity(updated);
    }
}
