package com.synact.syncserver;

import com.synact.syncserver.config.SyncProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(SyncProperties.class)
public class SyncServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SyncServerApplication.class, args);
    }
}
