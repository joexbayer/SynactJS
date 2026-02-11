package com.synact.syncserver.dto;

public record TokenOnlyResponse(String accessToken, long expiresIn) {
}
