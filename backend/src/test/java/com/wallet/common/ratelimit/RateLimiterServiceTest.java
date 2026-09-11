package com.wallet.common.ratelimit;

import com.wallet.common.ratelimit.service.RateLimiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateLimiterServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @DisplayName("Should allow request when count is below limit")
    void testRequestAllowedBelowLimit() {
        when(valueOperations.increment(anyString())).thenReturn(1L);

        boolean allowed = rateLimiterService.isAllowed("user-123", "transfer", 5, 60);

        assertTrue(allowed);
        verify(redisTemplate, times(1)).expire(anyString(), eq(Duration.ofSeconds(60)));
    }

    @Test
    @DisplayName("Should reject request when count exceeds limit")
    void testRequestBlockedExceedingLimit() {
        when(valueOperations.increment(anyString())).thenReturn(6L); // Limit is 5

        boolean allowed = rateLimiterService.isAllowed("user-123", "transfer", 5, 60);

        assertFalse(allowed);
    }
}
