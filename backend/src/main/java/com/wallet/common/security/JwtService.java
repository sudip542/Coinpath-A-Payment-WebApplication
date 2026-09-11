package com.wallet.common.security;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.user.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final SecretKey key;
    private final long expirationMs;
    private final long refreshExpirationMs;

    public JwtService(
            @Value("${app.jwt.secret:c2VjdXJlLWNvaW5wYXRoLWp3dC1zZWNyZXQta2V5LTM1NjgyOTM4NDc1OTIwMTkzODQ3NTkyMDE5Mzg0NzU=}") String secret,
            @Value("${app.jwt.expiration-ms:900000}") long expirationMs,
            @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generateToken(User user) {
        return buildToken(user, expirationMs, Map.of(
                "userId", user.getId().toString(),
                "role", user.getRole().name()
        ));
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, refreshExpirationMs, Map.of(
                "userId", user.getId().toString(),
                "type", "REFRESH"
        ));
    }

    private String buildToken(User user, long expirationDurationMs, Map<String, Object> extraClaims) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(expirationDurationMs);

        return Jwts.builder()
                .subject(user.getEmail())
                .claims(extraClaims)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public UUID extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        String userIdStr = claims.get("userId", String.class);
        if (userIdStr == null) {
            throw new CoinpathException(ErrorCode.UNAUTHORIZED, "Token missing userId claim");
        }
        return UUID.fromString(userIdStr);
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token, String expectedEmail) {
        final String email = extractUsername(token);
        return (email.equals(expectedEmail)) && !isTokenExpired(token);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.warn("JWT token has expired: {}", e.getMessage());
            throw new CoinpathException(ErrorCode.UNAUTHORIZED, "JWT token has expired");
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            throw new CoinpathException(ErrorCode.UNAUTHORIZED, "Invalid JWT token signature or format");
        }
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}
