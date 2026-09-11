package com.wallet.common.ratelimit.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);
    private static final String PREFIX = "ratelimit:";

    private final StringRedisTemplate redisTemplate;

    public RateLimiterService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Checks whether the request identified by clientKey is within the specified rate limit.
     *
     * @param clientKey     Identifier (e.g. userId or IP address)
     * @param action        Target action or route
     * @param limit         Maximum allowed requests
     * @param periodSeconds Window period in seconds
     * @return true if allowed; false if rate limit is exceeded
     */
    public boolean isAllowed(String clientKey, String action, int limit, int periodSeconds) {
        if (redisTemplate == null) {
            return true; // Graceful fallback when Redis is absent
        }

        try {
            String redisKey = PREFIX + action + ":" + clientKey;
            Long currentCount = redisTemplate.opsForValue().increment(redisKey);

            if (currentCount != null && currentCount == 1) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(periodSeconds));
            }

            if (currentCount != null && currentCount > limit) {
                log.warn("Rate limit breached for key: {} on action: {}. Count: {}, Limit: {}",
                        clientKey, action, currentCount, limit);
                return false;
            }

            return true;
        } catch (Exception e) {
            log.warn("Error communicating with Redis for rate limit check: {}. Allowing request.", e.getMessage());
            return true;
        }
    }
}
