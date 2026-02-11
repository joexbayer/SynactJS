package com.synact.syncserver.controller;

import com.synact.syncserver.config.SyncProperties;
import com.synact.syncserver.dto.AuthRequest;
import com.synact.syncserver.dto.AuthResponse;
import com.synact.syncserver.dto.OkResponse;
import com.synact.syncserver.dto.RefreshRequest;
import com.synact.syncserver.dto.TokenOnlyResponse;
import com.synact.syncserver.exception.ApiException;
import com.synact.syncserver.service.AuthService;
import com.synact.syncserver.service.RateLimitService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final RateLimitService rateLimitService;
    private final SyncProperties syncProperties;

    public AuthController(AuthService authService, RateLimitService rateLimitService, SyncProperties syncProperties) {
        this.authService = authService;
        this.rateLimitService = rateLimitService;
        this.syncProperties = syncProperties;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request, HttpServletRequest servletRequest) {
        assertRateLimit(servletRequest, "/v1/auth/register", 5, 60_000);

        AuthService.AuthResult result = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(result.refreshToken()).toString())
            .body(new AuthResponse(result.user(), result.accessToken(), result.expiresIn()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request, HttpServletRequest servletRequest) {
        assertRateLimit(servletRequest, "/v1/auth/login", 10, 60_000);

        AuthService.AuthResult result = authService.login(request);
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(result.refreshToken()).toString())
            .body(new AuthResponse(result.user(), result.accessToken(), result.expiresIn()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenOnlyResponse> refresh(@RequestBody(required = false) RefreshRequest request,
                                                     HttpServletRequest servletRequest,
                                                     HttpServletResponse servletResponse) {
        String refreshToken = readRefreshCookie(servletRequest);
        if (refreshToken == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token is missing.");
        }

        String appId = request == null ? null : request.appId();

        try {
            AuthService.RefreshResult result = authService.refresh(refreshToken, appId);
            return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(result.refreshToken()).toString())
                .body(new TokenOnlyResponse(result.accessToken(), result.expiresIn()));
        } catch (ApiException exception) {
            if (exception.getStatus() == HttpStatus.UNAUTHORIZED) {
                servletResponse.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString());
            }
            throw exception;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<OkResponse> logout(HttpServletRequest servletRequest) {
        String refreshToken = readRefreshCookie(servletRequest);
        authService.logout(refreshToken);

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
            .body(new OkResponse(true));
    }

    private void assertRateLimit(HttpServletRequest request, String path, int limit, long windowMs) {
        String key = request.getRemoteAddr() + ":" + path;
        if (!rateLimitService.allow(key, limit, windowMs)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many requests. Try again in a minute.");
        }
    }

    private String readRefreshCookie(HttpServletRequest servletRequest) {
        Cookie[] cookies = servletRequest.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (syncProperties.getCookieName().equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }

    private ResponseCookie buildRefreshCookie(String refreshToken) {
        return ResponseCookie.from(syncProperties.getCookieName(), refreshToken)
            .httpOnly(true)
            .secure(syncProperties.isCookieSecure())
            .sameSite("Strict")
            .path("/")
            .maxAge(Duration.ofDays(syncProperties.getRefreshTokenTtlDays()))
            .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from(syncProperties.getCookieName(), "")
            .httpOnly(true)
            .secure(syncProperties.isCookieSecure())
            .sameSite("Strict")
            .path("/")
            .maxAge(Duration.ZERO)
            .build();
    }
}
