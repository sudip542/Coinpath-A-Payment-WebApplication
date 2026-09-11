package com.wallet.common.idempotency.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.idempotency.entity.IdempotencyKey;
import com.wallet.common.idempotency.repository.IdempotencyKeyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
public class IdempotencyService {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyService.class);
    private static final String LOCK_PREFIX = "idemp:lock:";
    private static final String RESP_PREFIX = "idemp:resp:";

    private final IdempotencyKeyRepository repository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public IdempotencyService(
            IdempotencyKeyRepository repository,
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper) {
        this.repository = repository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public record CachedResponse(int statusCode, String body) {}

    /**
     * Attempts to acquire an in-flight lock for the given user and idempotency key.
     */
    public boolean acquireLock(UUID userId, String key, long lockTtlSeconds) {
        if (redisTemplate == null) {
            return true; // Graceful fallback if Redis is disabled in specific test profiles
        }
        try {
            String lockKey = LOCK_PREFIX + userId + ":" + key;
            Boolean acquired = redisTemplate.opsForValue()
                    .setIfAbsent(lockKey, "IN_FLIGHT", Duration.ofSeconds(lockTtlSeconds));
            return Boolean.TRUE.equals(acquired);
        } catch (Exception e) {
            log.warn("Redis lock error for key {}: {}. Proceeding with database authoritative check.", key, e.getMessage());
            return true;
        }
    }

    /**
     * Checks if a previous response exists for this user and idempotency key.
     * Verifies that the payload hash matches the original request.
     */
    @Transactional(readOnly = true)
    public Optional<CachedResponse> checkExisting(UUID userId, String key, String requestHash) {
        // 1. Fast-path: Check Redis cache
        if (redisTemplate != null) {
            try {
                String respKey = RESP_PREFIX + userId + ":" + key;
                String cachedJson = redisTemplate.opsForValue().get(respKey);
                if (cachedJson != null) {
                    CachedResponse cached = objectMapper.readValue(cachedJson, CachedResponse.class);
                    log.info("Idempotency cache hit in Redis for key: {}", key);
                    return Optional.of(cached);
                }
            } catch (Exception e) {
                log.warn("Redis read error: {}. Falling back to PostgreSQL.", e.getMessage());
            }
        }

        // 2. Authoritative check: PostgreSQL idempotency_keys table
        Optional<IdempotencyKey> existingDbKey = repository.findByUserIdAndIdempotencyKey(userId, key);
        if (existingDbKey.isPresent()) {
            IdempotencyKey dbRecord = existingDbKey.get();

            // Guard against payload mutation
            if (!dbRecord.getRequestHash().equals(requestHash)) {
                log.warn("Idempotency key {} reused with different request payload!", key);
                throw new CoinpathException(ErrorCode.INVALID_REQUEST,
                        "Idempotency key has already been used with a different request payload");
            }

            if (dbRecord.getResponseBody() != null && dbRecord.getResponseStatusCode() != null) {
                log.info("Idempotency hit in PostgreSQL for key: {}", key);
                return Optional.of(new CachedResponse(dbRecord.getResponseStatusCode(), dbRecord.getResponseBody()));
            }
        }

        return Optional.empty();
    }

    /**
     * Persists the response in PostgreSQL and caches it in Redis.
     */
    @Transactional
    public void saveResponse(
            UUID userId,
            String key,
            String requestPath,
            String requestHash,
            int statusCode,
            String responseJson,
            long ttlSeconds) {

        // 1. Authoritative persistence in PostgreSQL
        IdempotencyKey dbKey = repository.findByUserIdAndIdempotencyKey(userId, key)
                .orElseGet(() -> IdempotencyKey.builder()
                        .userId(userId)
                        .idempotencyKey(key)
                        .requestPath(requestPath)
                        .requestHash(requestHash)
                        .createdAt(Instant.now())
                        .expiresAt(Instant.now().plusSeconds(ttlSeconds))
                        .build());

        dbKey.setResponseStatusCode(statusCode);
        dbKey.setResponseBody(responseJson);
        repository.save(dbKey);
        log.info("Saved idempotency response to PostgreSQL for key: {}", key);

        // 2. Fast-path cache in Redis
        if (redisTemplate != null) {
            try {
                String respKey = RESP_PREFIX + userId + ":" + key;
                CachedResponse cachedResponse = new CachedResponse(statusCode, responseJson);
                String serialized = objectMapper.writeValueAsString(cachedResponse);
                redisTemplate.opsForValue().set(respKey, serialized, Duration.ofSeconds(ttlSeconds));
            } catch (Exception e) {
                log.warn("Failed to cache idempotency response in Redis: {}", e.getMessage());
            } finally {
                releaseLock(userId, key);
            }
        }
    }

    /**
     * Releases in-flight Redis lock.
     */
    public void releaseLock(UUID userId, String key) {
        if (redisTemplate != null) {
            try {
                String lockKey = LOCK_PREFIX + userId + ":" + key;
                redisTemplate.delete(lockKey);
            } catch (Exception e) {
                log.warn("Error releasing Redis lock for key {}: {}", key, e.getMessage());
            }
        }
    }

    /**
     * Computes SHA-256 fingerprint of request payload.
     */
    public String computePayloadHash(Object payload) {
        if (payload == null) {
            return "EMPTY_PAYLOAD";
        }
        try {
            String json = objectMapper.writeValueAsString(payload);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(json.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        } catch (Exception e) {
            return String.valueOf(payload.hashCode());
        }
    }
}
