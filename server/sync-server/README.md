# SynactJS Sync Server (Spring Boot)

Spring Boot reference sync server for `SynactJS.sync`.

## What it provides

- User registration and login.
- Refresh-token cookie flow (`HttpOnly`, rotating refresh token).
- JWT access tokens for API authorization.
- Encrypted opaque sync payload storage (`encryptedSnapshot`) keyed by `userId + appId`.

## Tech stack

- Spring Boot 3
- Spring Web
- Spring Data JPA
- Spring Security
- Flyway migrations
- H2 database (file-backed by default)

## Prerequisites

- Java 17+
- Maven 3.9+

Verify locally:

```bash
java -version
mvn -version
```

## Start the server

From repo root (`/Users/joebayer/Documents/experiments/SynactJS`):

```bash
npm run start:sync-server
```

Or directly with Maven:

```bash
mvn -f sync-server/pom.xml spring-boot:run
```

Server default URL:

- `http://localhost:8787`

Health check:

```bash
curl http://localhost:8787/health
```

## Run tests

```bash
mvn -f sync-server/pom.xml test
```

## Environment variables

- `PORT` (default `8787`)
- `SYNC_DB_PATH` (default `./sync-server/syncdb`)
- `SYNC_HMAC_SECRET` (required in production)
- `SYNC_ALLOWED_ORIGINS` (comma-separated, example: `http://localhost:4173,http://localhost:3000`)
- `SYNC_COOKIE_NAME` (default `synact_refresh`)
- `SYNC_COOKIE_SECURE` (`true` on HTTPS production)
- `SYNC_ACCESS_TOKEN_TTL_SECONDS` (default `900`)
- `SYNC_REFRESH_TOKEN_TTL_DAYS` (default `30`)

Example secure start:

```bash
PORT=8787 \
SYNC_HMAC_SECRET='replace-with-strong-random-secret' \
SYNC_ALLOWED_ORIGINS='http://localhost:4173' \
SYNC_COOKIE_SECURE=false \
mvn -f sync-server/pom.xml spring-boot:run
```

## API endpoints

- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `PUT /v1/sync/blob`
- `GET /v1/sync/blob?appId=<appId>`
- `GET /health`

## Quick smoke test (curl)

Register:

```bash
curl -i -X POST http://localhost:8787/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"StrongPass!123","appId":"plants-local"}'
```

Use cookie jar + refresh:

```bash
curl -c /tmp/synact.cookies -X POST http://localhost:8787/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"StrongPass!123","appId":"plants-local"}'

curl -b /tmp/synact.cookies -c /tmp/synact.cookies -X POST http://localhost:8787/v1/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{"appId":"plants-local"}'
```

## Security notes

- Passwords are hashed with BCrypt.
- Refresh tokens are random and stored as SHA-256 hashes.
- Access tokens are signed JWTs with short TTL.
- Sync payloads should remain encrypted on the client before upload.
- Always set a strong `SYNC_HMAC_SECRET` before production use.
