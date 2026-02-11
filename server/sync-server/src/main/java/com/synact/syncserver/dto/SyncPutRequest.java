package com.synact.syncserver.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SyncPutRequest(
    @NotBlank(message = "appId is required.")
    String appId,

    @NotNull(message = "encryptedSnapshot is required.")
    JsonNode encryptedSnapshot,

    JsonNode metadata
) {
}
