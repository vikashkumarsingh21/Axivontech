# Production Deployment & Security Checklist
**Project:** Axivon Technologies  
**Target Domain:** `https://axivontech.in`  
**Audit Date:** October 2026  
**Status:** Mandatory Production Release Guide  

---

## 1. Overview & Scope

This checklist outlines the mandatory steps, environment configurations, database deployment procedures, and runtime security controls required to deploy and operate Axivon Technologies in a hardened, high-availability production environment.

---

## 2. Environment Variables Configuration

Ensure all required production secrets are configured in the hosting provider's secure secret store (e.g. Vercel Environment Variables, AWS Secrets Manager, or Doppler). **Never commit production `.env` files to git.**

| Variable Name | Required | Security Requirement | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **YES** | Enforce `sslmode=require` and use pooled connection string (PgBouncer) | Neon PostgreSQL connection string |
| `DIRECT_URL` | **YES** | Direct PostgreSQL connection string without pooler | Used strictly for Prisma migrations and schema sync |
| `SESSION_SECRET` | **YES** | Minimum 64-character high-entropy cryptographic hex or base64 key | Used by `jose` to sign and verify `axivon_session` JWTs |
| `NEXT_PUBLIC_APP_URL` | **YES** | Must equal exact production canonical URL: `https://axivontech.in` | Base URL for email verification links and redirects |
| `NODE_ENV` | **YES** | Must be set to `production` | Enables React production mode and secure cookies |
| `SMTP_HOST` | **YES** | Secure mail relay endpoint | Corporate SMTP provider (e.g. SendGrid, SES, Resend) |
| `SMTP_PORT` | **YES** | Set to `465` (SSL) or `587` (TLS) | Secure SMTP transmission port |
| `SMTP_USER` | **YES** | Dedicated service account identifier | SMTP authentication username |
| `SMTP_PASS` | **YES** | Dedicated API token / app password | SMTP authentication credential |
| `SMTP_FROM` | **YES** | Authorized verified corporate sender (e.g. `no-reply@axivontech.in`) | Sender address matching SPF/DKIM records |

---

## 3. Database Deployment & Migration Protocol

1. **Production Schema Deployment:**
   - Always run Prisma migrations against `DIRECT_URL` during the CI/CD build or deployment pipeline:
     ```bash
     npx prisma migrate deploy
     ```
   - For serverless branch deployments on Neon, ensure all new models (e.g. `LoginPagePoster`) exist in the active branch.
2. **Connection Pooling:**
   - Route standard application queries through Neon's connection pooler (`-pooler` host with port 5432 or 6543) to prevent PostgreSQL connection starvation under concurrent user load.
3. **Database User Least Privilege:**
   - Ensure the application database role has `SELECT`, `INSERT`, `UPDATE`, and `DELETE` privileges, but lacks `SUPERUSER` or unrestricted `DROP DATABASE` rights.
4. **Automated Point-in-Time Recovery (PITR):**
   - Confirm automated daily backups and 7-day point-in-time recovery are active in Neon / PostgreSQL console.

---

## 4. HTTPS, TLS & Network Edge Configuration

1. **TLS / SSL Certificates:**
   - Enforce TLS 1.3 as primary (with TLS 1.2 minimum). Disable all legacy SSLv3/TLS 1.0/1.1 protocols.
2. **HTTP Strict Transport Security (HSTS):**
   - Pre-configured in `next.config.ts`: `max-age=31536000; includeSubDomains; preload`.
   - Submit `axivontech.in` to the Chrome HSTS Preload list once verified.
3. **DNS & Email Authentication Records:**
   - Configure DNS records for the domain:
     - **A / CNAME:** Points to Vercel / serverless edge network.
     - **SPF Record:** `v=spf1 include:_spf.google.com include:sendgrid.net ~all` (or equivalent provider).
     - **DKIM:** Configure 2048-bit DKIM keys with your SMTP email provider.
     - **DMARC:** `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@axivontech.in; pct=100`.

---

## 5. Security & Operational Hardening Checklist

- [x] **Rate Limiting Active:** In-memory sliding window protects `/api/v1/auth/login` (5/min) and `/api/contact` / `/api/lead` (10/15min).
- [x] **Anti-Header-Spoofing:** `src/middleware.ts` scrubs client-sent `x-user-id` and `x-user-role` headers on all incoming requests.
- [x] **Content-Security-Policy (CSP):** `frame-ancestors 'none'` prevents clickjacking and embedding inside malicious frames.
- [x] **Secure Session Cookies:** `HttpOnly`, `SameSite=Lax`, and `Secure` attributes enabled in production.
- [x] **Logout Cookie Invalidation:** Cookie cleared with explicit `path="/"`, `maxAge=0`, and expired timestamp.
- [x] **Source Maps Disabled:** `productionBrowserSourceMaps: false` active in `next.config.ts`.
- [x] **Audit Trail Active:** Database records created in `AuditLog` for logins, logouts, user creation, and status updates.
- [x] **Zero TypeScript Errors:** Verified via `tsc --noEmit`.
- [x] **Full Test Suite Passing:** All 18 test files (162 tests) passing in Vitest.

---

## 6. Incident Response & Monitoring

1. **Uptime Monitoring:** Configure an external health check against `https://axivontech.in` and `https://axivontech.in/api/v1/public/login-posters`.
2. **Centralized Logging:** Pipe server runtime logs to Logflare, Datadog, or Vercel Log Drains.
3. **Exception Alerts:** Integrate Sentry to receive immediate notifications of unhandled 500 exceptions in production.
4. **Session Invalidation Drill:** In the event of a compromised admin credential, an administrator can immediately invoke the database session purge:
   ```sql
   DELETE FROM "Session" WHERE "userId" = '<compromised-user-id>';
   ```
   This immediately terminates all active browser sessions for that user account across all devices.
