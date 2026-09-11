package com.wallet.auth.service;

import com.wallet.auth.dto.AuthResponse;
import com.wallet.auth.dto.LoginRequest;
import com.wallet.auth.dto.RegisterRequest;
import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.security.JwtService;
import com.wallet.user.entity.User;
import com.wallet.user.entity.UserRole;
import com.wallet.user.entity.UserStatus;
import com.wallet.user.repository.UserRepository;
import com.wallet.wallet.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private WalletService walletService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .fullName("Alice Wonderland")
                .email("alice@coinpath.com")
                .password("Password123!")
                .build();

        loginRequest = LoginRequest.builder()
                .email("alice@coinpath.com")
                .password("Password123!")
                .build();

        testUser = User.builder()
                .id(UUID.randomUUID())
                .fullName("Alice Wonderland")
                .email("alice@coinpath.com")
                .passwordHash("encodedPassword")
                .role(UserRole.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void testRegisterSuccess() {
        when(userRepository.existsByEmail("alice@coinpath.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("access.jwt.token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh.jwt.token");
        when(jwtService.getExpirationMs()).thenReturn(900000L);

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("access.jwt.token", response.getAccessToken());
        assertEquals("refresh.jwt.token", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals("alice@coinpath.com", response.getUser().getEmail());

        verify(userRepository, times(1)).save(any(User.class));
        verify(walletService, times(1)).createWalletForUser(eq(testUser.getId()), eq("INR"));
    }

    @Test
    @DisplayName("Should throw exception if email is already registered")
    void testRegisterDuplicateEmailThrowsException() {
        when(userRepository.existsByEmail("alice@coinpath.com")).thenReturn(true);

        CoinpathException ex = assertThrows(CoinpathException.class, () -> authService.register(registerRequest));

        assertEquals(ErrorCode.INVALID_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("already registered"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully log in with valid credentials")
    void testLoginSuccess() {
        when(userRepository.findByEmail("alice@coinpath.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("Password123!", "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken(testUser)).thenReturn("access.jwt.token");
        when(jwtService.generateRefreshToken(testUser)).thenReturn("refresh.jwt.token");
        when(jwtService.getExpirationMs()).thenReturn(900000L);

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("access.jwt.token", response.getAccessToken());
        assertEquals("alice@coinpath.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("Should reject login with invalid password")
    void testLoginInvalidPassword() {
        when(userRepository.findByEmail("alice@coinpath.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("WrongPassword", "encodedPassword")).thenReturn(false);

        LoginRequest wrongPwRequest = LoginRequest.builder()
                .email("alice@coinpath.com")
                .password("WrongPassword")
                .build();

        CoinpathException ex = assertThrows(CoinpathException.class, () -> authService.login(wrongPwRequest));
        assertEquals(ErrorCode.UNAUTHORIZED, ex.getErrorCode());
    }

    @Test
    @DisplayName("Should reject login if user is suspended")
    void testLoginSuspendedUser() {
        testUser.setStatus(UserStatus.SUSPENDED);
        when(userRepository.findByEmail("alice@coinpath.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("Password123!", "encodedPassword")).thenReturn(true);

        CoinpathException ex = assertThrows(CoinpathException.class, () -> authService.login(loginRequest));
        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("suspended"));
    }
}
