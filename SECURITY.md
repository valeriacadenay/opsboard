# Frontend Security Posture

## Interceptors
- **Sanitization**: `sanitizationInterceptor` deep-cleans outbound request payloads (strips scripts/inline handlers) to reduce reflected XSS vectors.
- **Correlation ID**: `correlationIdInterceptor` injects a v4 UUID in `X-Correlation-ID` for every request; reused across pipelines for traceability.
- **Auth + Refresh**: `authInterceptor` attaches `Authorization: Bearer <access>` and transparently refreshes on 401 using the stored refresh token. Concurrent 401s are queued to a single refresh. Refresh and auth endpoints are excluded to avoid loops.
- **Retry with Backoff**: `retryInterceptor` retries idempotent GETs up to 3 times on network/5xx errors with exponential backoff.
- **Error Normalization**: `errorNormalizationInterceptor` converts backend errors into a stable shape `{ message, status, code, correlationId, timestamp, path, details }` and logs with the correlation ID.

## Global Error Handling
- `GlobalErrorHandler` is the app-level `ErrorHandler` and only exposes a minimal console notice; full details are logged with correlation IDs through the logger.

## Token Strategy
- Tokens are stored in `localStorage` for demo purposes via `TokenService`. On each request, `authInterceptor` adds the access token. On 401, it uses the refresh token to obtain a new access token; failures clear tokens and propagate the error. Auth/login/refresh requests are never decorated.
- For production, move tokens to httpOnly cookies + SameSite=Lax/Strict and pair with server-side CSRF defenses; the current approach is acceptable only for local/mock setups.

## Sanitization
- `SanitizationService` recursively strips `<script>` blocks and inline handlers from strings before sending data to the backend. Components should continue to avoid `innerHTML` and rely on Angular templates for output encoding.

## Content Security Policy
- CSP is defined in `src/index.html` and restricts sources to `self`, Google Fonts (styles/fonts), blocks embedding (`frame-ancestors 'none'`), disallows plugins (`object-src 'none'`), and locks `base-uri` to `self`.

## Logging
- All HTTP errors and global errors are logged with correlation IDs. `SecureLoggerService` masks common sensitive keys before logging.

## Deployment Notes
- When integrating a real backend: ensure refresh endpoint supports rotating refresh tokens; invalidate sessions on refresh failure; and align server CSP headers with the meta tag for parity.
