package com.synact.syncserver.controller;

import com.synact.syncserver.dto.SyncBlobResponse;
import com.synact.syncserver.dto.SyncPutRequest;
import com.synact.syncserver.dto.SyncPutResponse;
import com.synact.syncserver.exception.ApiException;
import com.synact.syncserver.security.AuthenticatedUser;
import com.synact.syncserver.service.SyncBlobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/sync")
public class SyncController {

    private final SyncBlobService syncBlobService;

    public SyncController(SyncBlobService syncBlobService) {
        this.syncBlobService = syncBlobService;
    }

    @PutMapping("/blob")
    public SyncPutResponse putBlob(@Valid @RequestBody SyncPutRequest request, Authentication authentication) {
        AuthenticatedUser user = requireAuthenticatedUser(authentication);
        return syncBlobService.putBlob(user.userId(), request);
    }

    @GetMapping("/blob")
    public SyncBlobResponse getBlob(@RequestParam("appId") String appId, Authentication authentication) {
        AuthenticatedUser user = requireAuthenticatedUser(authentication);
        return syncBlobService.getBlob(user.userId(), appId);
    }

    private AuthenticatedUser requireAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized.");
        }
        return principal;
    }
}
