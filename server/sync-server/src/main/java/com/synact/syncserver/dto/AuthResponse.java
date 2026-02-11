package com.synact.syncserver.dto;

public record AuthResponse(UserDto user, String accessToken, long expiresIn) {
}
