package com.wallet.common.security;

import com.wallet.common.exception.CoinpathException;
import com.wallet.user.entity.User;
import com.wallet.user.entity.UserRole;
import com.wallet.user.entity.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String SECRET = "c2VjdXJlLWNvaW5wYXRoLWp3dC1zZWNyZXQta2V5LTM1NjgyOTM4NDc1OTIwMTkzODQ3NTkyMDE5Mzg0NzU=";
    private static final long EXPIRATION_MS = 60000; // 1 minute
    private static final long REFRESH_EXPIRATION_MS = 120000;

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, EXPIRATION_MS, REFRESH_EXPIRATION_MS);
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("alice@coinpath.com")
                .fullName("Alice Wonderland")
                .passwordHash("hashed_pw")
                .role(UserRole.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should generate valid JWT token with user claims")
    void testGenerateToken() {
        String token = jwtService.generateToken(testUser);
        assertNotNull(token);
        assertFalse(token.isBlank());

        assertEquals("alice@coinpath.com", jwtService.extractUsername(token));
        assertEquals(testUser.getId(), jwtService.extractUserId(token));
        assertEquals("ROLE_USER", jwtService.extractRole(token));
        assertTrue(jwtService.isTokenValid(token, "alice@coinpath.com"));
    }

    @Test
    @DisplayName("Should reject token when email does not match")
    void testTokenValidationEmailMismatch() {
        String token = jwtService.generateToken(testUser);
        assertFalse(jwtService.isTokenValid(token, "bob@coinpath.com"));
    }

    @Test
    @DisplayName("Should throw CoinpathException when token is tampered with")
    void testTamperedTokenThrowsException() {
        String token = jwtService.generateToken(testUser);
        String tamperedToken = token + "xyz";

        assertThrows(CoinpathException.class, () -> jwtService.extractUsername(tamperedToken));
    }

    @Test
    @DisplayName("Should generate distinct refresh token")
    void testGenerateRefreshToken() {
        String refreshToken = jwtService.generateRefreshToken(testUser);
        assertNotNull(refreshToken);
        assertEquals("alice@coinpath.com", jwtService.extractUsername(refreshToken));
    }
}
