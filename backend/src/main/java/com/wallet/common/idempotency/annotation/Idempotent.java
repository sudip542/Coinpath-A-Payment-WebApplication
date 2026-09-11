package com.wallet.common.idempotency.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks an endpoint as requiring idempotent execution.
 * Intercepts requests, validates the 'Idempotency-Key' HTTP header,
 * checks Redis/PostgreSQL for previous responses, and prevents duplicate executions.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {

    /**
     * Name of the HTTP header containing the idempotency key.
     */
    String headerName() default "Idempotency-Key";

    /**
     * Duration in seconds before the idempotency record expires.
     */
    long ttlSeconds() default 86400; // 24 hours

    /**
     * Duration in seconds for the initial in-flight execution lock.
     */
    long lockTtlSeconds() default 30;
}
