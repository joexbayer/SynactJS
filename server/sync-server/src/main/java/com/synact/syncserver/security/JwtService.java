package com.synact.syncserver.security;

import com.synact.syncserver.config.SyncProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Component
public class JwtService {

    private final SyncProperties syncProperties;
    private SecretKey signingKey;

    public JwtService(SyncProperties syncProperties) {
        this.syncProperties = syncProperties;
    }

    @PostConstruct
    public void init() {
        byte[] keyBytes = hashTo256Bits(syncProperties.getHmacSecret());
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String createAccessToken(Long userId, Long sessionId, String appId) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(syncProperties.getAccessTokenTtlSeconds());

        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("sid", String.valueOf(sessionId))
            .claim("appId", appId)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .signWith(signingKey)
            .compact();
    }

    public Optional<AccessTokenPayload> verify(String token) {
        try {
            Jws<Claims> claimsJws = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token);

            Claims claims = claimsJws.getPayload();
            String sub = claims.getSubject();
            String sid = claims.get("sid", String.class);

            if (sub == null || sid == null) {
                return Optional.empty();
            }

            return Optional.of(new AccessTokenPayload(
                Long.parseLong(sub),
                Long.parseLong(sid),
                claims.get("appId", String.class)
            ));
        } catch (Exception exception) {
            return Optional.empty();
        }
    }

    private byte[] hashTo256Bits(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available.", exception);
        }
    }

    public record AccessTokenPayload(Long userId, Long sessionId, String appId) {
    }
}
