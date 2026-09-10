# AXIVON TECHNOLOGIES — SECURITY HARDENING SPECIFICATION

## 1. Authentication & Cookie Hardening
- **JWT Cookies**: `axivon_session` signed using HMAC-SHA256 (`jose` library).
- **Flags**: `HttpOnly`, `Secure` (production), `SameSite=Lax`.
- **Expiration**: 7 Days with automatic refresh on active usage.

---

## 2. Server-Side RBAC & IDOR Enforcement
- All route handlers enforce server-side validation using `validateActiveUser()` and `hasPermission()`.
- Employee endpoints scope database queries directly to `x-user-id` from verified JWT headers.
- Employees attempting to access another user's ID receive HTTP 403 Forbidden.

---

## 3. Security Headers
Enforced in `next.config.ts`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

---

## 4. Rate Limiting
Managed via `src/lib/rate-limit.ts`:
- Login API: 5 requests / min per IP.
- Public Lead Intake: 10 submissions / 15 min per IP.
- Sensitive APIs: 30 requests / min per user.
