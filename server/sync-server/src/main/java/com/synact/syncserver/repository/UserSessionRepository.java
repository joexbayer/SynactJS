package com.synact.syncserver.repository;

import com.synact.syncserver.domain.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByRefreshTokenHash(String refreshTokenHash);
}
