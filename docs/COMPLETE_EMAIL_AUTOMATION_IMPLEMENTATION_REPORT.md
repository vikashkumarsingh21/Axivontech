# Axivon Technologies — Centralized Transactional Email Automation System
## Complete Architecture, Workflow Triggers, Provider Setup & Reliability Report

---

### Executive Summary

Axivon Technologies has established a high-reliability, centralized transactional email notification engine designed to streamline communications across all company portals (Public Website, Admin Portal, Broker / Partner Network, Client Space, and Employee Operations).

The architecture eliminates fragmented or ad-hoc SMTP calls in route handlers, routing every notification through `src/lib/email/service.ts`, protected by **24-hour business event idempotency**, **multi-provider failover (Gmail SMTP → Resend → Webhooks → Console Simulation)**, and a **non-blocking asynchronous outbox design** that ensures business transactions never fail if an email service is unreachable.

---

### 1. Official Sender & Company Identity Configuration

All outbound communications are strictly configured with the official company identity:

| Configuration Parameter | Environment Variable | Default Production Value |
| :--- | :--- | :--- |
| **Default Sender Name** | `EMAIL_FROM_NAME` | `Axivon Technologies` |
| **Default Sender Email** | `EMAIL_FROM_ADDRESS` | `axivontech.in@gmail.com` |
| **Default Reply-To Address** | `EMAIL_REPLY_TO` | `axivontech.in@gmail.com` |
| **Internal Business Notification Recipient** | `EMAIL_INTERNAL_NOTIFICATION_TO` | `axivontech.in@gmail.com` |
| **Company Website** | `NEXT_PUBLIC_APP_URL` | `https://axivontech.in` |
| **Timezone Standard** | `EMAIL_TIMEZONE` | `Asia/Kolkata` (IST) |

---

### 2. Architecture & File Inventory

The complete email subsystem is housed centrally under `src/lib/email/`:

```
src/lib/email/
├── config.ts               # Configuration parsing, identity defaults, provider flags
├── transport.ts            # Gmail SMTP connection pool, Resend API, Webhook, health check
├── service.ts              # sendTransactionalEmail(), 24h idempotency, outbox logging
└── templates/
    ├── base-layout.ts      # Mobile-first responsive HTML layout (#0d0d11 header, #C2A878 gold border)
    └── index.ts            # Complete catalogue of 25+ business event templates
```

#### Supporting Systems & Routes
- `src/lib/jobs/runner.ts`: Background job queue handling `SEND_EMAIL` and `EMAIL_RETRY` exponential backoff.
- `src/app/api/v1/admin/email/settings/route.ts`: Administrator health check and diagnostics API.
- `src/app/api/v1/admin/email/test/route.ts`: Administrator test email trigger to `axivontech.in@gmail.com`.
- `src/app/api/v1/auth/forgot-password/route.ts`: Public password reset route with single-use SHA-256 tokens.
- `tests/transactional-email-automation.test.ts`: Automated integration test suite (13 passing tests).

---

### 3. Step-by-Step Gmail SMTP Configuration Guide

Gmail SMTP provides a cost-effective, high-deliverability transport for Axivon Technologies. Because Google disabled "Less Secure Apps", authentication requires a **Google App Password**.

#### Step 1: Enable 2-Step Verification
1. Log into the official Google Account: `axivontech.in@gmail.com`.
2. Go to **Google Account Settings** → **Security**.
3. Under "How you sign in to Google", ensure **2-Step Verification** is turned **ON**.

#### Step 2: Generate Google App Password
1. In the search bar at the top of the Google Account page, search for **App passwords**.
2. Alternatively, navigate to: `https://myaccount.google.com/apppasswords`.
3. In the "App name" field, enter `Axivon Technologies Portal`.
4. Click **Create**.
5. Google will display a 16-character passcode (formatted as `xxxx xxxx xxxx xxxx`).
6. Copy this passcode without spaces (e.g., `abcdefghijklmnop`).

#### Step 3: Configure Environment Variables
Set the following keys in your deployment platform (Vercel Project Settings → Environment Variables) or `.env.production`:

```bash
# Outbound Transactional Email
EMAIL_PROVIDER="gmail-smtp"
EMAIL_MODE="production"

# Official Sender Identity
EMAIL_FROM_NAME="Axivon Technologies"
EMAIL_FROM_ADDRESS="axivontech.in@gmail.com"
EMAIL_REPLY_TO="axivontech.in@gmail.com"
EMAIL_INTERNAL_NOTIFICATION_TO="axivontech.in@gmail.com"

# Gmail SMTP Settings
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="axivontech.in@gmail.com"
SMTP_APP_PASSWORD="your-16-character-app-password"
```

> **Note on Port 587 vs 465**: Port 587 uses explicit STARTTLS (`SMTP_SECURE=false`), which upgrades the plaintext connection to TLS immediately after the handshake. Port 465 uses implicit SSL (`SMTP_SECURE=true`). For Gmail with connection pooling, port 587 is standard and recommended.

---

### 4. Business Event Triggers & Recipient Routing

Every operational trigger automatically sends transactional emails with dedicated metadata:

| Business Event | Trigger Location | Primary Recipient | Internal Alert Recipient | Idempotency Key Format |
| :--- | :--- | :--- | :--- | :--- |
| **Contact Enquiry** | `src/app/api/contact/route.ts` | Inbound Client (`CONTACT_ENQUIRY_ACK`) | `axivontech.in@gmail.com` (`CONTACT_ENQUIRY_RECEIVED`) | `contact_enquiry:{leadCode}` |
| **Career Application** | `src/app/api/careers/route.ts` | Candidate (`CAREER_APPLICATION_ACK`) | `axivontech.in@gmail.com` (`CAREER_APPLICATION_RECEIVED`) | `career_app:{applicationId}` |
| **Public Lead Submission** | `src/app/api/v1/public/leads/route.ts` | Prospect Client (`LEAD_ACKNOWLEDGEMENT`) | `axivontech.in@gmail.com` (`NEW_LEAD_REGISTERED`) | `public_lead:{leadCode}` |
| **Partner Application** | `.../public/business-partner/applications/` | Applicant (`PARTNER_APPLICATION_ACK`) | `axivontech.in@gmail.com` (`PARTNER_APPLICATION_RECEIVED`) | `partner_app:{applicationId}` |
| **Partner Meeting Scheduled** | `.../admin/business-partner/applications/[id]/meetings/` | Partner Applicant (`PARTNER_MEETING_SCHEDULED`) | — | `partner_meeting:{id}:{date}` |
| **Partner Application Approved** | `.../admin/business-partner/applications/[id]/` | Approved Partner (`PARTNER_APPLICATION_APPROVED`) | — | `partner_approved:{id}` |
| **Partner Application Rejected** | `.../admin/business-partner/applications/[id]/` | Applicant (`PARTNER_APPLICATION_REJECTED`) | — | `partner_rejected:{id}` |
| **Broker Account Provisioning** | `src/lib/auth/broker-account-service.ts` | Registered Email (`PARTNER_ACCOUNT_ACTIVATION`) | — | `broker_activation:{id}` |
| **Leave Request Submitted** | `src/app/api/v1/employee/leave/route.ts` | — | `axivontech.in@gmail.com` (`LEAVE_REQUEST_SUBMITTED`) | `leave_submit:{id}` |
| **Leave Approved** | `.../leaves/[id]/approve/` | Employee (`LEAVE_APPROVED`) | — | `leave_approved:{id}` |
| **Leave Rejected** | `.../leaves/[id]/reject/` | Employee (`LEAVE_REJECTED`) | — | `leave_rejected:{id}` |
| **Task Assigned** | `src/app/api/v1/admin/tasks/route.ts` | Assigned Employee (`TASK_ASSIGNED`) | — | `task_assigned:{id}:{assigneeId}` |
| **Payment Verified** | `.../admin/partner-payments/[id]/` | Client (`PAYMENT_RECEIVED`) | `axivontech.in@gmail.com` | `payment_verified:{id}` |
| **Password Changed** | `src/app/api/v1/auth/change-password/route.ts` | Authenticated User (`PASSWORD_CHANGED`) | — | `pwd_changed:{userId}:{timestamp}` |
| **Password Reset Request** | `src/app/api/v1/auth/forgot-password/route.ts` | Account Email (`PASSWORD_RESET`) | — | `pwd_reset:{tokenHash}` |

---

### 5. Reliability & Security Guarantees

1. **Safe Test Mode (`EMAIL_MODE="test"`)**:
   - In development, staging, or test environments, all outbound messages destined for external recipients are automatically re-routed to `axivontech.in@gmail.com` with a clear `[TEST MODE]` header banner.
   - Prevents accidental spamming of real clients, brokers, or job applicants during testing.

2. **24-Hour Idempotency & Duplicate Suppression**:
   - Every email dispatch is guarded by an `idempotencyKey` / `eventKey`.
   - If an administrator double-clicks "Approve", or if a webhook retries, `sendTransactionalEmail()` checks `db.emailLog` for any matching `SENT` event within the preceding 24 hours. If found, the existing record is returned and duplicate SMTP dispatch is suppressed.

3. **Non-Blocking Architecture**:
   - All email dispatches are wrapped in non-blocking try-catch handlers.
   - A network timeout or SMTP authentication failure will log an error to `db.emailLog` and enqueue a background retry job without interrupting the primary database transaction (e.g. partner approvals or payment verifications always succeed).

4. **Credential Isolation**:
   - No passwords or SMTP secrets are exposed to the frontend client bundle.
   - Password reset links use one-time SHA-256 tokens that expire in 1 hour.
   - API responses return sanitized boolean statuses.

---

### 6. Resolution of User-Reported Issues

#### Issue 1: GitHub 404 on Mobile App Download (`axivon-mobile/releases/download/...`)
- **Root Cause**: The mobile release configuration previously defaulted to a placeholder GitHub Releases URL (`https://github.com/axivon/axivon-mobile/releases/download/v1.0.0/axivon-app.apk`) which returned a 404 error on GitHub.
- **Resolution**:
  - `src/features/app-mode/apk-delivery.ts` and `src/features/app-mode/release.ts` were updated to intercept any placeholder GitHub URLs and serve the verified local APK binary from `public/downloads/axivon-app.apk` directly via `/download/axivon-app`.
  - Downloads now initiate immediately as direct binary streams (`Content-Type: application/vnd.android.package-archive`) without redirecting to external 404 pages.

#### Issue 2: Runtime TypeError `crypto.randomInt is not a function` in Partner Applications
- **Root Cause**: Next.js client components (`CreatePartnerLoginModal.tsx`, `ResetBrokerPasswordModal.tsx`) imported `generateStrongPassword` from `src/lib/auth/password.ts`, which used Node.js `crypto.randomInt()`. In browser bundles, Turbopack/Webpack polyfilled `crypto` with `crypto-browserify`, which lacks `randomInt`.
- **Resolution**:
  - Created `src/lib/auth/password-utils.ts` utilizing `globalThis.crypto.getRandomValues(new Uint32Array(1))` (browser Web Crypto API standard) with safe fallback to `Math.random`.
  - Fully decoupled client components from Node.js-only crypto modules.
  - Resolved all TypeScript and bundle compile errors across the application.
