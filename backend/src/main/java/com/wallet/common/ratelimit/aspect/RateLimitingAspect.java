package com.wallet.common.ratelimit.aspect;

import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.ratelimit.annotation.RateLimited;
import com.wallet.common.ratelimit.service.RateLimiterService;
import com.wallet.common.security.SecurityUserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class RateLimitingAspect {

    private final RateLimiterService rateLimiterService;

    public RateLimitingAspect(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @Around("@annotation(rateLimited)")
    public Object enforceRateLimit(ProceedingJoinPoint joinPoint, RateLimited rateLimited) throws Throwable {
        String clientKey = resolveClientKey();
        String action = joinPoint.getSignature().getName();

        boolean allowed = rateLimiterService.isAllowed(
                clientKey,
                action,
                rateLimited.limit(),
                rateLimited.periodSeconds()
        );

        if (!allowed) {
            throw new CoinpathException(ErrorCode.RATE_LIMIT_EXCEEDED,
                    String.format("Rate limit exceeded. Maximum %d requests allowed per %d seconds",
                            rateLimited.limit(), rateLimited.periodSeconds()));
        }

        return joinPoint.proceed();
    }

    private String resolveClientKey() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof SecurityUserPrincipal principal) {
            return principal.getId().toString();
        }

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String xfHeader = request.getHeader("X-Forwarded-For");
            if (xfHeader != null && !xfHeader.isBlank()) {
                return xfHeader.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }

        return "ANONYMOUS";
    }
}
