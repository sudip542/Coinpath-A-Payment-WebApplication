package com.wallet;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class CoinpathApplicationTests {

    @Test
    @DisplayName("Application class should be loadable")
    void contextLoads() {
        CoinpathApplication app = new CoinpathApplication();
        assertNotNull(app);
    }
}
