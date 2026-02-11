package com.synact.syncserver.service;

import com.synact.syncserver.config.SyncProperties;
import com.synact.syncserver.domain.UserAccount;
import com.synact.syncserver.domain.UserSession;
import com.synact.syncserver.dto.AuthRequest;
import com.synact.syncserver.dto.UserDto;
import com.synact.syncserver.exception.ApiException;
import com.synact.syncserver.repository.UserAccountRepository;
import com.synact.syncserver.repository.UserSessionRepository;
import com.synact.syncserver.security.AuthenticatedUser;
import com.synact.syncserver.security.JwtService;
import com.synact.syncserver.security.RefreshTokenService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final UserSessionRepository userSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final SyncProperties syncProperties;

    public AuthService(
        UserAccountRepository userAccountRepository,
        UserSessionRepository userSessionRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        RefreshTokenService refreshTokenService,
        SyncProperties syncProperties
    ) {
        this.userAccountRepository = userAccountRepository;
        this.userSessionRepository = userSessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.syncProperties = syncProperties;
    }

    @Transactional
    public AuthResult register(AuthRequest request) {
        String email = normalizeEmail(request.email());
        String password = normalizePassword(request.password());
        String appId = normalizeAppId(request.appId(), "default");

        if (userAccountRepository.findByEmail(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "User already exists.");
        }

        Instant now = Instant.now();

        UserAccount user = new UserAccount();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        user = userAccountRepository.save(user);

        SessionResult sessionResult = createSession(user.getId(), now);
        String accessToken = jwtService.createAccessToken(user.getId(), sessionResult.session().getId(), appId);

        return new AuthResult(
            new UserDto(user.getId(), user.getEmail()),
            sessionResult.rawRefreshToken(),
            accessToken,
            syncProperties.getAccessTokenTtlSeconds()
        );
    }

    @Transactional
    public AuthResult login(AuthRequest request) {
        String email = normalizeEmail(request.email());
        String password = normalizePassword(request.password());
        String appId = normalizeAppId(request.appId(), "default");

        UserAccount user = userAccountRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
        }

        SessionResult sessionResult = createSession(user.getId(), Instant.now());
        String accessToken = jwtService.createAccessToken(user.getId(), sessionResult.session().getId(), appId);

        return new AuthResult(
            new UserDto(user.getId(), user.getEmail()),
            sessionResult.rawRefreshToken(),
            accessToken,
            syncProperties.getAccessTokenTtlSeconds()
        );
    }

    @Transactional
    public RefreshResult refresh(String refreshToken, String appIdInput) {
        String refreshTokenNormalized = normalizeRefreshToken(refreshToken);
        String appId = normalizeAppId(appIdInput, "default");

        UserSession session = findActiveSessionByRefreshToken(refreshTokenNormalized)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid or expired."));

        String newRefreshToken = refreshTokenService.generateToken();
        session.setRefreshTokenHash(refreshTokenService.hashToken(newRefreshToken));
        session.setExpiresAt(Instant.now().plus(syncProperties.getRefreshTokenTtlDays(), ChronoUnit.DAYS));
        session.setUpdatedAt(Instant.now());
        userSessionRepository.save(session);

        String accessToken = jwtService.createAccessToken(session.getUserId(), session.getId(), appId);
        return new RefreshResult(newRefreshToken, accessToken, syncProperties.getAccessTokenTtlSeconds());
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        String tokenHash = refreshTokenService.hashToken(refreshToken);
        userSessionRepository.findByRefreshTokenHash(tokenHash).ifPresent(session -> {
            Instant now = Instant.now();
            session.setRevokedAt(now);
            session.setUpdatedAt(now);
            userSessionRepository.save(session);
        });
    }

    @Transactional(readOnly = true)
    public Optional<AuthenticatedUser> authenticateAccessToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        Optional<JwtService.AccessTokenPayload> payloadOptional = jwtService.verify(token);
        if (payloadOptional.isEmpty()) {
            return Optional.empty();
        }

        JwtService.AccessTokenPayload payload = payloadOptional.get();
        Optional<UserSession> sessionOptional = userSessionRepository.findById(payload.sessionId());
        if (sessionOptional.isEmpty()) {
            return Optional.empty();
        }

        UserSession session = sessionOptional.get();
        if (!isSessionActive(session)) {
            return Optional.empty();
        }

        if (!payload.userId().equals(session.getUserId())) {
            return Optional.empty();
        }

        return Optional.of(new AuthenticatedUser(payload.userId(), payload.sessionId()));
    }

    private SessionResult createSession(Long userId, Instant now) {
        String refreshToken = refreshTokenService.generateToken();

        UserSession session = new UserSession();
        session.setUserId(userId);
        session.setRefreshTokenHash(refreshTokenService.hashToken(refreshToken));
        session.setExpiresAt(now.plus(syncProperties.getRefreshTokenTtlDays(), ChronoUnit.DAYS));
        session.setCreatedAt(now);
        session.setUpdatedAt(now);
        session.setRevokedAt(null);
        session = userSessionRepository.save(session);

        return new SessionResult(session, refreshToken);
    }

    private Optional<UserSession> findActiveSessionByRefreshToken(String refreshToken) {
        String tokenHash = refreshTokenService.hashToken(refreshToken);
        return userSessionRepository.findByRefreshTokenHash(tokenHash).filter(this::isSessionActive);
    }

    private boolean isSessionActive(UserSession session) {
        return session.getRevokedAt() == null && session.getExpiresAt().isAfter(Instant.now());
    }

    private String normalizeEmail(String emailInput) {
        String email = emailInput == null ? "" : emailInput.trim().toLowerCase();
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email format is invalid.");
        }
        return email;
    }

    private String normalizePassword(String passwordInput) {
        String password = passwordInput == null ? "" : passwordInput;
        if (password.length() < 10) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 10 characters.");
        }
        return password;
    }

    private String normalizeAppId(String appIdInput, String fallback) {
        String appId = appIdInput == null ? "" : appIdInput.trim();
        return appId.isEmpty() ? fallback : appId;
    }

    private String normalizeRefreshToken(String refreshToken) {
        String token = refreshToken == null ? "" : refreshToken.trim();
        if (token.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token is missing.");
        }
        return token;
    }

    private record SessionResult(UserSession session, String rawRefreshToken) {
    }

    public record AuthResult(UserDto user, String refreshToken, String accessToken, long expiresIn) {
    }

    public record RefreshResult(String refreshToken, String accessToken, long expiresIn) {
    }
}
