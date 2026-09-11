package com.wallet.common.ratelimit.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Enforces distributed sliding-window rate limiting on the annotated endpoint.
 * Returns HTTP 429 TOO_MANY_REQUESTS when limit is exceeded.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimited {

    /**
     * Maximum number of permitted requests within the window.
     */
    int limit() default 10;

    /**
     * Window duration in seconds.
     */
    int periodSeconds() default 60;
}
