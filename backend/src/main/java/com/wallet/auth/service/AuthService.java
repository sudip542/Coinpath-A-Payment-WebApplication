package com.wallet.auth.service;

import com.wallet.auth.dto.AuthResponse;
import com.wallet.auth.dto.LoginRequest;
import com.wallet.auth.dto.RegisterRequest;
import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.security.JwtService;
import com.wallet.user.dto.UserResponseDto;
import com.wallet.user.entity.User;
import com.wallet.user.entity.UserRole;
import com.wallet.user.entity.UserStatus;
import com.wallet.user.repository.UserRepository;
import com.wallet.wallet.service.WalletService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final WalletService walletService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            WalletService walletService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.walletService = walletService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            log.warn("Registration attempt with existing email: {}", normalizedEmail);
            throw new CoinpathException(ErrorCode.INVALID_REQUEST, "Email address is already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Registered new user with id: {}", savedUser.getId());

        // Automatically provision primary wallet for user
        walletService.createWalletForUser(savedUser.getId(), "INR");

        String accessToken = jwtService.generateToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresInMs(jwtService.getExpirationMs())
                .user(UserResponseDto.fromEntity(savedUser))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new CoinpathException(ErrorCode.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Failed login attempt for email: {}", normalizedEmail);
            throw new CoinpathException(ErrorCode.UNAUTHORIZED, "Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("Login attempt for non-active user: {}, status: {}", normalizedEmail, user.getStatus());
            throw new CoinpathException(ErrorCode.FORBIDDEN, "Account is " + user.getStatus().name().toLowerCase());
        }

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresInMs(jwtService.getExpirationMs())
                .user(UserResponseDto.fromEntity(user))
                .build();
    }
}
