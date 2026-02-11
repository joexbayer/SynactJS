package com.synact.syncserver.security;

public record AuthenticatedUser(Long userId, Long sessionId) {
}
