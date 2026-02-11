package com.synact.syncserver.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class StartupSecurityWarning {

    private static final Logger LOGGER = LoggerFactory.getLogger(StartupSecurityWarning.class);

    private final SyncProperties syncProperties;

    public StartupSecurityWarning(SyncProperties syncProperties) {
        this.syncProperties = syncProperties;
    }

    @PostConstruct
    public void warnIfDefaultSecret() {
        if ("dev-only-change-me".equals(syncProperties.getHmacSecret())) {
            LOGGER.warn("SYNC_HMAC_SECRET is using a development fallback value. Set a strong secret before production.");
        }
    }
}
