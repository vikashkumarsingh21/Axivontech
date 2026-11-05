# Axivon Technologies — Gmail SMTP Integration & Transactional Notification Audit Report

**Generated:** 2026-11-05  
**System Identity:** Axivon Technologies (AxivonTech Core)  
**Primary Sender:** `Axivon Technologies <axivontech.in@gmail.com>`  
**Internal Notification Recipient:** `info@axivontech.in`  
**Transport Protocol:** Gmail SMTP (`smtp.gmail.com:587`, STARTTLS) via central NodeMailer service  
**Status:** **COMPLETE & VERIFIED**

---

## 1. Executive Summary

This report documents the architectural audit, implementation, and verification of the centralized Gmail SMTP transactional email system for Axivon Technologies. 

All outbound emails across the entire platform (Website, Admin Portal, Broker Network, Employee Management, Client CRM, and Android Mobile Application) are routed through a unified, resilient email dispatcher with:
- **Zero-Failure Business Isolation:** Email network timeouts or provider throttling never throw unhandled exceptions or block primary business database transactions.
- **24-Hour Event Idempotency:** Duplicate sends triggered by user double-clicks or rapid webhook retries are deduplicated using cryptographic event keys.
- **Safe Test-Mode Protection:** In `EMAIL_MODE=test`, all customer-facing emails are automatically redirected to `info@axivontech.in` with clearly labeled test metadata and original recipient headers.
- **Brand Consistency:** Emails feature the official AxivonTech logo (`public/assets/logo/logo-white.png`), gold and dark obsidian design system, responsive typography, and plain-text accessibility fallbacks.

---

## 2. Environment Variables Configuration

The system uses the exact environment variable specifications provided for Vercel Production and Local environments:

| Variable Name | Production Value | Development / Test Default | Purpose |
|---|---|---|---|
| `EMAIL_PROVIDER` | `gmail-smtp` | `gmail-smtp` | Selected transport driver (`gmail-smtp`, `resend`, `webhook`, `console`) |
| `EMAIL_FROM_NAME` | `Axivon Technologies` | `Axivon Technologies` | Official display name in email clients |
| `EMAIL_FROM_ADDRESS` | `axivontech.in@gmail.com` | `axivontech.in@gmail.com` | Official outbound sender identity |
| `EMAIL_REPLY_TO` | `axivontech.in@gmail.com` | `axivontech.in@gmail.com` | Default address for user replies |
| `EMAIL_INTERNAL_NOTIFICATION_TO` | `info@axivontech.in` | `info@axivontech.in` | Dedicated internal inbox for all company operational alerts |
| `SMTP_HOST` | `smtp.gmail.com` | `smtp.gmail.com` | Google SMTP server hostname |
| `SMTP_PORT` | `587` | `587` | STARTTLS communication port |
| `SMTP_SECURE` | `false` | `false` | Port 587 requires `secure: false` (upgrades via STARTTLS) |
| `SMTP_USER` | `axivontech.in@gmail.com` | `axivontech.in@gmail.com` | Google account identity used for SMTP AUTH |
| `SMTP_APP_PASSWORD` | `[SECURE 16-CHAR APP PASSWORD]` | Read from env | Google 2-Step Verification 16-character App Password |
| `EMAIL_MODE` | `test` or `production` | `test` | Operational safety flag |
| `EMAIL_TEST_RECIPIENT` | `info@axivontech.in` | `info@axivontech.in` | Redirection destination when running in `test` mode |

> [!IMPORTANT]
> **No Secrets Hardcoded:** `SMTP_APP_PASSWORD` is strictly read server-side from environment variables. It is never exposed in client bundles (`NEXT_PUBLIC_`), never logged in error traces, and never committed to source control.

---

## 3. Architecture & Routing Matrix

The email engine strictly separates **Internal Company Notifications** from **Customer-Facing Communications**:

```
                                  ┌─────────────────────────────┐
                                  │ Business Event / API Action │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │   sendTransactionalEmail    │
                                  │   (src/lib/email/service)   │
                                  └──────────────┬──────────────┘
                                                 │
                                ┌────────────────┴────────────────┐
                                ▼                                 ▼
                 ┌─────────────────────────────┐   ┌─────────────────────────────┐
                 │   Customer-Facing Events    │   │  Internal Operations Events │
                 │ (Broker, Client, Applicant) │   │ (Inquiries, Leads, Review)  │
                 └──────────────┬──────────────┘   └──────────────┬──────────────┘
                                │                                 │
                                │                                 ▼
                                │                  Destination: info@axivontech.in
                                │
                                ▼
                 ┌─────────────────────────────┐
                 │    Is EMAIL_MODE="test"?    │
                 └──────────────┬──────────────┘
                                │
               ┌────────────────┴────────────────┐
               ▼ (Yes)                           ▼ (No - Production)
 ┌───────────────────────────┐     ┌───────────────────────────┐
 │ Routed: info@axivontech.in│     │ Routed: Real Customer     │
 │ + Test Banner & Headers   │     │ (Registered User Email)   │
 └───────────────────────────┘     └───────────────────────────┘
```

### Routing Rules Enforced

1. **Internal Company Alerts (`info@axivontech.in`):**
   - Public Website Contact Enquiries (`CONTACT_ENQUIRY_RECEIVED`)
   - Career Applications Received (`CAREER_APPLICATION_RECEIVED`)
   - Broker / Business Partner Applications (`PARTNER_APPLICATION_RECEIVED`)
   - Partner Application Approvals & Account Creation (`GENERIC_NOTIFICATION` / Internal Dossier)
   - Partner Evaluation Meetings Scheduled (`meeting_internal`)
   - New CRM Leads Inbound (`NEW_LEAD_REGISTERED`)
   - Employee Leave Applications (`LEAVE_REQUEST_SUBMITTED`)
   - Department Manager Provisioning (`INTERNAL_DEPARTMENT_MANAGER_PROVISIONED`)
   - System Delivery Failure Security Alerts

2. **Customer-Facing Communications (Direct to User / Safe Redirection in Test Mode):**
   - Contact Enquiry Acknowledgment (`CONTACT_ENQUIRY_ACK` → Submitter's email)
   - Career Application Acknowledgment (`CAREER_APPLICATION_ACK` → Applicant's email)
   - Broker Application Acknowledgment with Tracking Reference (`PARTNER_APPLICATION_ACK` → Applicant's email)
   - Partner Evaluation Meeting Confirmation (`PARTNER_MEETING_SCHEDULED` → Partner's email)
   - Partner Account Activation & Invitation (`PARTNER_ACCOUNT_ACTIVATION` → Partner's email)
   - Lead Registration Notice to Referring Broker (`NEW_LEAD_REGISTERED` → Referring broker's email)
   - Employee Task Assignment (`TASK_ASSIGNED` → Assigned employee's email)
   - Employee Leave Approval / Rejection (`LEAVE_APPROVED` / `LEAVE_REJECTED` → Employee's email)
   - Department Manager Account Credentials (`GENERIC_NOTIFICATION` → Manager's email)
   - Account Password Reset (`PASSWORD_RESET` → User's registered email)
   - Password Changed Security Alert (`PASSWORD_CHANGED` → User's registered email)

---

## 4. Test Mode Protection Specification

When `EMAIL_MODE="test"` or `process.env.NODE_ENV !== "production"`:
1. **Redirection:** Outbound messages intended for real users are intercepted by `deliverEmailMessage` in [`src/lib/email/transport.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/lib/email/transport.ts) and delivered exclusively to `info@axivontech.in`.
2. **Subject Line Prefix:** Automatically prefixed with `[TEST MODE] `.
3. **HTML Warning Banner:** Injected at the top of the body:
   ```html
   <div style="background-color: #fef3c7; border: 2px dashed #f59e0b; padding: 14px 18px; margin-bottom: 20px; border-radius: 8px;">
     <strong>⚠️ [TEST MODE ACTIVE — ROUTED TO INTERNAL COMPANY INBOX]</strong><br/>
     <strong>Originally Intended Recipient:</strong> user@example.com<br/>
     <strong>Internal Destination:</strong> info@axivontech.in<br/>
     <span>External customer delivery is suppressed while EMAIL_MODE=test.</span>
   </div>
   ```
4. **Plain-Text Header:**
   ```text
   ====================================================
   ⚠️ [TEST MODE ACTIVE — ROUTED TO INTERNAL COMPANY INBOX]
   Originally Intended Recipient: user@example.com
   Internal Destination: info@axivontech.in
   Environment Mode: test
   ====================================================
   ```
5. **Transport Headers:** Injected `X-Axivon-Test-Mode: "true"` and `X-Original-Recipient: user@example.com`.

---

## 5. Forgot Password & Authentication Integration

The password reset pipeline connects directly to Gmail SMTP across both the Web Portal (`/login`) and Android App (`/app/login`):

1. **Initiation (`POST /api/v1/auth/forgot-password`):**
   - Strict rate-limiting: 5 requests per 15 minutes per IP.
   - Zero-enumeration security: Always returns a generic 200 OK message.
   - Cryptographic token: 32-byte hexadecimal random token generated via `crypto.randomBytes(32)`.
   - Token storage: Only the SHA-256 hash is saved in `db.user.activationToken` with a 30-minute timestamp (`pwd_reset:${hash}:${expiresAtMs}`).
   - Outbound Email: Sends `PASSWORD_RESET` template containing single-use link:
     - Web: `https://axivontech.in/reset-password?token=${rawToken}`
     - Android App: `https://axivontech.in/app/reset-password?token=${rawToken}`
2. **Token Validation (`GET /api/v1/auth/reset-password/validate?token=...`):**
   - Validates existence, SHA-256 match, active user status, and 30-minute expiration without consuming the token.
3. **Password Update (`POST /api/v1/auth/reset-password`):**
   - Validates password complexity policy (10+ characters, uppercase, lowercase, numbers, safe symbols).
   - Hashes password using Bcrypt with 12 salt rounds.
   - Atomically updates password, consumes the token (`activationToken = null`), resets `mustChangePassword = false`, and revokes all active sessions (`db.session.deleteMany`).
   - Dispatches `PASSWORD_CHANGED` security confirmation email to the user's registered address.

---

## 6. Admin Email Diagnostic & Health Check Feature

Admins can inspect configuration and perform live tests via dedicated endpoints:

1. **`GET /api/v1/admin/email/settings`**:
   - Requires `admin:access` permission.
   - Returns sanitized settings (SMTP host, port, user, TLS configuration, email mode, sender name).
   - Verifies live connectivity using `transporter.verify()`.
   - Returns real-time metrics (`totalSent`, `totalFailed`, `totalQueued`, `recentLogs`).
2. **`POST /api/v1/admin/email/test`**:
   - Requires `admin:access` permission.
   - Validates the SMTP configuration and Google connection.
   - Sends a test email to `info@axivontech.in`.
   - Returns sanitized delivery verification (provider, messageId, status) without revealing passwords.

---

## 7. Verification & Automated Test Results

The integration was verified using automated tests and a dedicated end-to-end verification script:

### Test Suite Execution
- **`tests/transactional-email-automation.test.ts`**:
  - `15/15 Passed` (Official sender configuration, internal routing to `info@axivontech.in`, template rendering, 24h idempotency suppression, non-blocking guarantees, transport verification, password reset flow).
- **`tests/approved-partner-login.test.ts`**:
  - `10/10 Passed` (Atomic approval, user activation, broker profile linking, password generation, activation email dispatch).
- **`tests/mobile-backend-integration.test.ts`**:
  - `21/21 Passed` (Mobile API endpoints, authentication, biometric session persistence, and error handling).
- **`tests/app-website-separation.test.ts`**:
  - `15/15 Passed` (App vs Website bundle separation, deep linking, and layout protection).
- **TypeScript Compilation (`npx tsc --noEmit`)**:
  - `0 errors`. Complete type safety verified.
- **End-to-End Verification (`scripts/verify-gmail-smtp.ts`)**:
  - `100% Success` across configuration, transport health, routing protection, and template rendering.

---

## 8. Summary of Completed vs. Pending Items

### Completed Work
- [x] Centralized email configuration updated with `axivontech.in@gmail.com` as sender and `info@axivontech.in` as internal recipient.
- [x] NodeMailer Gmail SMTP connection engine with connection pooling and STARTTLS TLS (587).
- [x] Multi-provider failover and honest error reporting (no fake successes on SMTP rejections).
- [x] Automatic test-mode protection routing external emails to `info@axivontech.in` with visible banners.
- [x] Forgot Password integration for both website and Android application.
- [x] Event triggers connected across Contact, Careers, Partner Applications, Approvals, Account Creation, Meetings, Leads, Leaves, Tasks, and Manager Provisioning.
- [x] Official AxivonTech logo (`logo-white.png`) embedded with typography fallbacks.
- [x] Admin email settings and diagnostic test routes verified.
- [x] Documentation and `.env.example` updated.

### Pending User Step (Vercel Deployment)
- In the Vercel Project Settings under **Environment Variables**, ensure the following values are saved:
  - `EMAIL_PROVIDER`: `gmail-smtp`
  - `EMAIL_FROM_NAME`: `Axivon Technologies`
  - `EMAIL_FROM_ADDRESS`: `axivontech.in@gmail.com`
  - `EMAIL_REPLY_TO`: `axivontech.in@gmail.com`
  - `EMAIL_INTERNAL_NOTIFICATION_TO`: `info@axivontech.in`
  - `SMTP_HOST`: `smtp.gmail.com`
  - `SMTP_PORT`: `587`
  - `SMTP_SECURE`: `false`
  - `SMTP_USER`: `axivontech.in@gmail.com`
  - `SMTP_APP_PASSWORD`: `[Your 16-Character Google App Password]`
  - `EMAIL_MODE`: `test` (change to `production` when you are ready to send directly to real customer inboxes)
