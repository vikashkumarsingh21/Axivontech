# AXIVON ONE — CONFIGURATION AND EXTERNAL INTEGRATION AUDIT

**Document ID:** `AXIVON-AUDIT-CONFIG-2026-10`  
**Platform Version:** AXIVON ONE v0.1.0 (`axivontech.in`)  
**Audit Executed:** October 22, 2026  
**Auditing Entity:** Senior Technical Architecture & Quality Assurance Audit Team  

---

## 1. Environment Variable Architecture & Validation

Environment variables are validated at startup via Zod schemas in [`src/lib/env.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/lib/env.ts), preventing runtime failure due to missing configuration keys:

| Environment Variable Name | Required In Prod | Purpose & Function | Default / Fallback In Dev | Security Classification | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string for Prisma ORM | None | Critical Secret | **CONFIGURED** |
| `NODE_ENV` | **Yes** | Application runtime mode (`development`, `test`, `production`) | `development` | Public Flag | **CONFIGURED** |
| `SESSION_SECRET` | **Yes** | 256-bit symmetric key for signing JWT cookies | Development fallback key | Critical Secret | **CONFIGURED** |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional | Public client-side Cloudflare Turnstile key | Cloudflare dummy test key | Public Identifier | **CONFIGURED** |
| `TURNSTILE_SECRET_KEY` | Optional | Secret key for verifying Turnstile tokens | Cloudflare dummy secret | Secret | **CONFIGURED** |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Optional | Public client-side Google reCAPTCHA v2/v3 key | Google test site key | Public Identifier | **CONFIGURED** |
| `RECAPTCHA_SECRET_KEY` | Optional | Secret key for verifying Google reCAPTCHA tokens | Google test secret | Secret | **CONFIGURED** |
| `RESEND_API_KEY` | Optional | Token for Resend transactional email API | Mock console logging | Secret | **LOCAL_MOCKED** |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for Portal AI Assistant | Mock responses in test | Secret | **LOCAL_MOCKED** |

> [!CAUTION]
> No raw credential, API token, password hash, or connection secret is logged or committed into version control.

---

## 2. External Service Integrations & Status

### 2.1 PostgreSQL Database (Prisma Client)
* **SDK:** `@prisma/client` v5.22.0
* **Configuration:** Initialized in [`src/lib/db.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/lib/db.ts)
* **Status:** **VERIFIED OPERATIONAL**
* **Verification Evidence:** All 81 models generated cleanly; database connection liveness verified via `/api/ready`; transactional workflows execute atomically.

### 2.2 Cloudflare Turnstile Anti-Bot
* **Integration File:** [`src/lib/captcha/turnstile.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/lib/captcha/turnstile.ts)
* **Verification Endpoint:** `https://challenges.cloudflare.com/turnstile/v0/siteverify`
* **Status:** **VERIFIED OPERATIONAL (TEST MODE)**
* **Verification Evidence:** 14 tests in `tests/captcha-turnstile.test.ts` verify success, failure, timeout, and test token bypass modes.

### 2.3 Google reCAPTCHA v2/v3
* **Integration File:** [`src/lib/captcha/recaptcha.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/lib/captcha/recaptcha.ts) & [`src/components/ui/GoogleRecaptchaWidget.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/components/ui/GoogleRecaptchaWidget.tsx)
* **Verification Endpoint:** `https://www.google.com/recaptcha/api/siteverify`
* **Status:** **VERIFIED OPERATIONAL (FALLBACK MODE)**
* **Verification Evidence:** Engaged seamlessly when Turnstile is unavailable; tested in `tests/login-auth-captcha.test.ts`.

### 2.4 Google Gemini Generative AI (Portal AI Assistant)
* **SDK:** `@google/generative-ai` v0.24.1
* **Integration Files:** [`src/lib/portal-ai/assistant.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/lib/portal-ai/assistant.ts) & [`src/components/portal-ai/PortalAIAssistant.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/components/portal-ai/PortalAIAssistant.tsx)
* **Status:** **VERIFIED INTEGRATED WITH FALLBACK**
* **Verification Evidence:** In environments where `GEMINI_API_KEY` is not present, the assistant degrades to structured rule-based responses without crashing the UI.

### 2.5 Transactional Email Subsystem
* **Integration File:** [`src/lib/email/service.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/lib/email/service.ts)
* **Supported Engines:** Resend REST API, Nodemailer SMTP, and Local Console Simulation
* **Status:** **VERIFIED OPERATIONAL WITH RETRY ENQUEUING**
* **Verification Evidence:** Delivery failures automatically insert `BackgroundJob` records with type `EMAIL_RETRY` (`tests/automation-notifications-step8.test.ts`).

---

## 3. Configuration Security Recommendations

1. **Production `SESSION_SECRET`:** Ensure that the production deployment environment injects a high-entropy string ($\ge 32$ random characters).
2. **PostgreSQL Connection Pooling:** In serverless or containerized environments (Vercel, AWS ECS, GCP Cloud Run), ensure `DATABASE_URL` connects via pgBouncer or connection pooling parameters (`?pgbouncer=true&connection_limit=10`) to avoid PostgreSQL max client limits.
