package com.synact.syncserver.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;

public record SyncBlobResponse(
    String appId,
    JsonNode encryptedSnapshot,
    JsonNode metadata,
    Instant updatedAt
) {
}
