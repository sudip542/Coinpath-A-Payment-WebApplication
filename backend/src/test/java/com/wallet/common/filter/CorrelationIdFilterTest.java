package com.wallet.common.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class CorrelationIdFilterTest {

    private CorrelationIdFilter filter;

    @BeforeEach
    void setUp() {
        filter = new CorrelationIdFilter();
        MDC.clear();
    }

    @Test
    @DisplayName("Should extract existing X-Correlation-ID header and populate MDC and response header")
    void testExistingCorrelationId() throws ServletException, IOException {
        String existingId = "CORR-" + UUID.randomUUID();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(CorrelationIdFilter.CORRELATION_ID_HEADER, existingId);
        MockHttpServletResponse response = new MockHttpServletResponse();

        AtomicReference<String> capturedMdc = new AtomicReference<>();
        FilterChain chain = (req, res) -> {
            capturedMdc.set(MDC.get(CorrelationIdFilter.MDC_CORRELATION_ID_KEY));
        };

        filter.doFilterInternal(request, response, chain);

        assertEquals(existingId, capturedMdc.get(), "MDC must hold the incoming correlation ID during execution");
        assertEquals(existingId, response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER), "Response header must contain correlation ID");
        assertNull(MDC.get(CorrelationIdFilter.MDC_CORRELATION_ID_KEY), "MDC must be cleared after filter completion");
    }

    @Test
    @DisplayName("Should auto-generate UUID when X-Correlation-ID header is missing")
    void testGeneratedCorrelationId() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        AtomicReference<String> capturedMdc = new AtomicReference<>();
        FilterChain chain = (req, res) -> {
            capturedMdc.set(MDC.get(CorrelationIdFilter.MDC_CORRELATION_ID_KEY));
        };

        filter.doFilterInternal(request, response, chain);

        assertNotNull(capturedMdc.get(), "MDC must hold generated correlation ID");
        assertDoesNotThrow(() -> UUID.fromString(capturedMdc.get()), "Generated ID must be a valid UUID");
        assertEquals(capturedMdc.get(), response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER));
        assertNull(MDC.get(CorrelationIdFilter.MDC_CORRELATION_ID_KEY), "MDC must be cleared after execution");
    }
}
