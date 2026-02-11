package com.synact.syncserver.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synact.syncserver.domain.SyncBlob;
import com.synact.syncserver.dto.SyncBlobResponse;
import com.synact.syncserver.dto.SyncPutRequest;
import com.synact.syncserver.dto.SyncPutResponse;
import com.synact.syncserver.exception.ApiException;
import com.synact.syncserver.repository.SyncBlobRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class SyncBlobService {

    private final SyncBlobRepository syncBlobRepository;
    private final ObjectMapper objectMapper;

    public SyncBlobService(SyncBlobRepository syncBlobRepository, ObjectMapper objectMapper) {
        this.syncBlobRepository = syncBlobRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public SyncPutResponse putBlob(Long userId, SyncPutRequest request) {
        String appId = normalizeRequiredAppId(request.appId());

        Instant now = Instant.now();
        SyncBlob blob = syncBlobRepository.findByUserIdAndAppId(userId, appId).orElseGet(SyncBlob::new);

        if (blob.getId() == null) {
            blob.setUserId(userId);
            blob.setAppId(appId);
            blob.setCreatedAt(now);
        }

        blob.setEncryptedSnapshot(toObjectJson(request.encryptedSnapshot(), "encryptedSnapshot is required."));
        blob.setMetadata(request.metadata() == null ? null : toAnyJson(request.metadata(), "Invalid metadata."));
        blob.setUpdatedAt(now);

        syncBlobRepository.save(blob);
        return new SyncPutResponse(true, appId, now);
    }

    @Transactional(readOnly = true)
    public SyncBlobResponse getBlob(Long userId, String appIdInput) {
        String appId = normalizeRequiredAppId(appIdInput);
        SyncBlob blob = syncBlobRepository.findByUserIdAndAppId(userId, appId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No sync snapshot found for this appId."));

        return new SyncBlobResponse(
            blob.getAppId(),
            toNode(blob.getEncryptedSnapshot(), "Stored encryptedSnapshot is invalid."),
            blob.getMetadata() == null ? null : toNode(blob.getMetadata(), "Stored metadata is invalid."),
            blob.getUpdatedAt()
        );
    }

    private String normalizeRequiredAppId(String appIdInput) {
        String appId = appIdInput == null ? "" : appIdInput.trim();
        if (appId.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "appId is required.");
        }
        return appId;
    }

    private String toObjectJson(JsonNode node, String messageOnError) {
        if (node == null || !node.isObject()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, messageOnError);
        }

        return toAnyJson(node, messageOnError);
    }

    private String toAnyJson(JsonNode node, String messageOnError) {
        if (node == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, messageOnError);
        }

        try {
            return objectMapper.writeValueAsString(node);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, messageOnError);
        }
    }

    private JsonNode toNode(String json, String messageOnError) {
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, messageOnError);
        }
    }
}
