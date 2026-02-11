package com.synact.syncserver.dto;

import java.time.Instant;

public record SyncPutResponse(boolean ok, String appId, Instant updatedAt) {
}
