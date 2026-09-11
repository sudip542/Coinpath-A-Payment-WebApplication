package com.wallet.common.idempotency;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.idempotency.entity.IdempotencyKey;
import com.wallet.common.idempotency.repository.IdempotencyKeyRepository;
import com.wallet.common.idempotency.service.IdempotencyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdempotencyServiceTest {

    @Mock
    private IdempotencyKeyRepository repository;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private IdempotencyService idempotencyService;

    private UUID userId;
    private String idempotencyKey;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        idempotencyKey = "req-uuid-12345";
    }

    @Test
    @DisplayName("Should successfully acquire lock on first request")
    void testAcquireLockSuccess() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(anyString(), eq("IN_FLIGHT"), any(Duration.class))).thenReturn(true);

        boolean acquired = idempotencyService.acquireLock(userId, idempotencyKey, 30);
        assertTrue(acquired);
    }

    @Test
    @DisplayName("Should fail to acquire lock when concurrent request is already in-flight")
    void testAcquireLockConflict() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(anyString(), eq("IN_FLIGHT"), any(Duration.class))).thenReturn(false);

        boolean acquired = idempotencyService.acquireLock(userId, idempotencyKey, 30);
        assertFalse(acquired);
    }

    @Test
    @DisplayName("Should generate deterministic hash and detect payload mutation")
    void testPayloadHashComparison() {
        Map<String, Object> payload1 = Map.of("amount", "100.00", "recipient", "bob@coinpath.com");
        Map<String, Object> payload2 = Map.of("amount", "200.00", "recipient", "bob@coinpath.com");

        String hash1 = idempotencyService.computePayloadHash(payload1);
        String hash1Repeat = idempotencyService.computePayloadHash(payload1);
        String hash2 = idempotencyService.computePayloadHash(payload2);

        assertEquals(hash1, hash1Repeat, "Identical payloads must produce identical hashes");
        assertNotEquals(hash1, hash2, "Altered payloads must produce distinct hashes");
    }

    @Test
    @DisplayName("Should return cached response from PostgreSQL when record exists")
    void testCheckExistingHitPostgres() {
        String payloadHash = "hash-1234";
        IdempotencyKey dbKey = IdempotencyKey.builder()
                .userId(userId)
                .idempotencyKey(idempotencyKey)
                .requestPath("/api/wallet/transfer")
                .requestHash(payloadHash)
                .responseStatusCode(200)
                .responseBody("{\"success\":true}")
                .expiresAt(Instant.now().plusSeconds(86400))
                .build();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null); // Redis miss
        when(repository.findByUserIdAndIdempotencyKey(userId, idempotencyKey)).thenReturn(Optional.of(dbKey));

        var result = idempotencyService.checkExisting(userId, idempotencyKey, payloadHash);

        assertTrue(result.isPresent());
        assertEquals(200, result.get().statusCode());
        assertEquals("{\"success\":true}", result.get().body());
    }

    @Test
    @DisplayName("Should throw exception when key is reused with different request payload")
    void testPayloadMutationDetectionThrows() {
        String originalHash = "hash-original";
        String mutatedHash = "hash-mutated";

        IdempotencyKey dbKey = IdempotencyKey.builder()
                .userId(userId)
                .idempotencyKey(idempotencyKey)
                .requestPath("/api/wallet/transfer")
                .requestHash(originalHash)
                .responseStatusCode(200)
                .responseBody("{\"success\":true}")
                .expiresAt(Instant.now().plusSeconds(86400))
                .build();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(repository.findByUserIdAndIdempotencyKey(userId, idempotencyKey)).thenReturn(Optional.of(dbKey));

        CoinpathException ex = assertThrows(CoinpathException.class, () ->
                idempotencyService.checkExisting(userId, idempotencyKey, mutatedHash));

        assertEquals(ErrorCode.INVALID_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("different request payload"));
    }
}
