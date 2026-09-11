package com.wallet.common.idempotency.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wallet.common.exception.CoinpathException;
import com.wallet.common.exception.ErrorCode;
import com.wallet.common.idempotency.annotation.Idempotent;
import com.wallet.common.idempotency.service.IdempotencyService;
import com.wallet.common.security.SecurityUserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Aspect
@Component
public class IdempotencyAspect {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyAspect.class);

    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    public IdempotencyAspect(IdempotencyService idempotencyService, ObjectMapper objectMapper) {
        this.idempotencyService = idempotencyService;
        this.objectMapper = objectMapper;
    }

    @Around("@annotation(idempotent)")
    public Object handleIdempotentOperation(ProceedingJoinPoint joinPoint, Idempotent idempotent) throws Throwable {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return joinPoint.proceed();
        }

        HttpServletRequest request = attributes.getRequest();
        String idempotencyKey = request.getHeader(idempotent.headerName());

        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return joinPoint.proceed();
        }

        UUID userId = resolveAuthenticatedUserId();
        if (userId == null) {
            return joinPoint.proceed();
        }

        // Find the request DTO argument (payload)
        Object payload = findPayloadArgument(joinPoint.getArgs());
        String requestHash = idempotencyService.computePayloadHash(payload);
        String requestPath = request.getRequestURI();

        // 1. Check if previous execution already recorded a response
        var existing = idempotencyService.checkExisting(userId, idempotencyKey, requestHash);
        if (existing.isPresent()) {
            IdempotencyService.CachedResponse cached = existing.get();
            log.info("Returning cached idempotent response for key: {}", idempotencyKey);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Cache-Lookup", "HIT");
            return ResponseEntity.status(cached.statusCode())
                    .headers(headers)
                    .body(objectMapper.readTree(cached.body()));
        }

        // 2. Acquire in-flight lock to prevent concurrent executions
        boolean lockAcquired = idempotencyService.acquireLock(userId, idempotencyKey, idempotent.lockTtlSeconds());
        if (!lockAcquired) {
            log.warn("Concurrent execution blocked for idempotency key: {}", idempotencyKey);
            throw new CoinpathException(ErrorCode.DUPLICATE_REQUEST,
                    "A request with the same idempotency key is already currently processing");
        }

        try {
            Object result = joinPoint.proceed();

            if (result instanceof ResponseEntity<?> responseEntity) {
                int status = responseEntity.getStatusCode().value();
                String bodyJson = objectMapper.writeValueAsString(responseEntity.getBody());

                idempotencyService.saveResponse(
                        userId,
                        idempotencyKey,
                        requestPath,
                        requestHash,
                        status,
                        bodyJson,
                        idempotent.ttlSeconds()
                );
            }
            return result;
        } catch (Throwable t) {
            idempotencyService.releaseLock(userId, idempotencyKey);
            throw t;
        }
    }

    private UUID resolveAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof SecurityUserPrincipal principal) {
            return principal.getId();
        }
        return null;
    }

    private Object findPayloadArgument(Object[] args) {
        for (Object arg : args) {
            if (arg != null && !(arg instanceof SecurityUserPrincipal) && !(arg instanceof HttpServletRequest)) {
                return arg;
            }
        }
        return null;
    }
}
