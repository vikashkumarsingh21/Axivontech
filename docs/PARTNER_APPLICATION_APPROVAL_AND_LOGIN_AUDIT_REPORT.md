# Technical Audit & Implementation Report: Partner Application Approval, Account Creation & Broker Login System

**Project:** Axivon Technologies (AxivonTech)  
**System:** Admin Portal → Business Partner Network (`/admin/business-partners/applications`)  
**Audit Date:** November 4, 2026  
**Status:** Verified & Production Ready (Build & Test Passed: 27/27 Automated Tests)

---

## 1. Executive Summary & Root Cause Analysis

An end-to-end audit of the Business Partner application approval and broker credential generation workflow was conducted across both the frontend (`src/app/admin/business-partners/applications` and `src/components/admin/partner/`) and backend services (`src/lib/auth/broker-account-service.ts`, `src/lib/email/service.ts`, and corresponding API route handlers).

### Previous Critical Defects & Root Causes:
1. **Unmounted Modal on Detail Page (`/admin/business-partners/applications/[id]/page.tsx`):**
   - *Symptom:* Clicking "Create Login" or "Approve & Login" on an individual application detail page either failed silently or triggered an error without opening the credential modal.
   - *Root Cause:* The page component imported `CreatePartnerLoginModal` and managed state `isCreateLoginOpen`, but completely omitted `<CreatePartnerLoginModal />` from its JSX return tree. Furthermore, an inline helper `handleCreateAccount` dispatched an empty body `{}` to `/create-account`, triggering `400 Bad Request ("Login email is required")`.
2. **Password Parameter Mismatch in Password Reset Modal (`ResetBrokerPasswordModal.tsx`):**
   - *Symptom:* When an admin entered a custom password in the reset modal, the backend generated an unwanted random password instead of applying the admin's chosen password.
   - *Root Cause:* The frontend payload key was named `password`, whereas `src/app/api/v1/admin/brokers/[id]/actions/route.ts` expected `newPassword`.
3. **Misleading Email Dispatch Claims:**
   - *Symptom:* The UI displayed toasts such as "Welcome email sent to applicant" even when neither `RESEND_API_KEY` nor `EMAIL_WEBHOOK_URL` was configured in the environment.
   - *Root Cause:* Frontend dialogs simulated email delivery with arbitrary `setTimeout` calls setting `emailSent = true` regardless of server-side email service capabilities.
4. **Fragile Role Hierarchy & Internal Account Corruption Risk:**
   - *Symptom:* If an applicant submitted an email matching an internal employee or admin, an approval attempt could have overwritten existing roles or passwords.
   - *Root Cause:* Absence of strict internal staff role guards prior to role assignment.
5. **Browser Polyfill TypeError on Password Generation (`crypto.randomInt is not a function`):**
   - *Symptom:* Clicking "Approve & Create Login" or "View" on `/admin/business-partners/applications` threw a Next.js Turbopack overlay runtime TypeError: `{imported module ...crypto-browserify...}.default.randomInt is not a function`.
   - *Root Cause:* Client components imported `generateStrongPassword` from `src/lib/auth/password.ts`, which used Node.js `crypto.randomInt`. In the browser, `crypto-browserify` lacks `randomInt`.
   - *Fix:* Extracted client-safe password helpers to `src/lib/auth/password-utils.ts` utilizing the standard Web Crypto API (`globalThis.crypto.getRandomValues`). Server utilities re-export these cleanly with zero Node `crypto` imports.

---

## 2. Complete Architecture & Data Flow

```
+----------------------------------------------------------------------------------------------------+
|                                    PARTNER APPLICATION WORKFLOW                                    |
+----------------------------------------------------------------------------------------------------+
                                                |
                                                v
               [ Public Application Submission: /business-partner/apply ]
                                                |
                                                v
               [ Admin Portal: /admin/business-partners/applications ]
                                                |
                 +------------------------------+------------------------------+
                 |                                                             |
                 v                                                             v
    [ Status: SUBMITTED / MEETING ]                               [ Status: APPROVED ]
    Badge: "Approval & Login Pending"                             Badge: "No login yet"
    Action: "Approve & Create Login"                              Action: "Create Login"
                 |                                                             |
                 +------------------------------+------------------------------+
                                                |
                                                v
                                 [ CreatePartnerLoginModal ]
        - Displays Applicant Summary Card (Name, Email, Phone, App ID, Location, Type)
        - Confirms Registered Email is Login ID (Read-only ID)
        - Password Choice: Tab 1 "Auto-Generate Strong Password" | Tab 2 "Set Custom Password"
        - Mandatory First-Login Password Change Checkbox (Default: Checked)
                                                |
                                                v
                        [ POST /api/v1/admin/business-partner/applications/[id]/create-account ]
                                                |
                                                v
                           [ broker-account-service.ts ]
                          (Atomic Prisma $transaction)
                                                |
       +----------------------------------------+----------------------------------------+
       |                                                                                 |
       v                                                                                 v
 [ Check Email Availability ]                                             [ Guard Internal Roles ]
 - Rejects ADMIN / EMPLOYEE / FOUNDER                                      - Throws 409 Conflict if
   with 409 Conflict                                                         email belongs to staff
                                                |
                                                v
                                  [ Atomic Account Provisioning ]
       1. Upsert User (bcrypt hash 10 salt rounds, mustChangePassword: true)
       2. Assign UserRole (BUSINESS_PARTNER)
       3. Upsert BrokerProfile (status: APPROVED, referralCode: BP-XXXXXX)
       4. Update BusinessPartnerApplication (status: APPROVED, approvedAt: now())
       5. Write AuditLog (action: "BROKER_ACCOUNT_CREATED", password redacted)
                                                |
                                                v
                               [ One-Time Credential Reveal Panel ]
       - Explicit copy buttons: "Copy Login ID", "Copy Temporary Password", "Copy Login Details"
       - Honest Outbound Email Notice: Detects isOutboundEmailConfigured()
         * Configured: Dispatches welcome email
         * Unconfigured: Alerts admin to copy and securely share credentials directly
                                                |
                                                v
                                 [ Broker First Sign-In: /login ]
       - Authenticates with email & temporary password
       - Intercepted by mustChangePassword: true -> Redirected to /auth/change-password
       - Upon password update -> Enters Broker Portal (/broker/dashboard)
```

---

## 3. Database Schema & State Mapping

The workflow integrates seamlessly with the existing Prisma schema without breaking migrations or primary keys:

1. **`BusinessPartnerApplication`**:
   - `id`: CUID primary key.
   - `email`: Applicant's contact and login email.
   - `status`: Enum (`SUBMITTED`, `UNDER_REVIEW`, `MEETING_SCHEDULED`, `APPROVED`, `REJECTED`, `WITHDRAWN`).
   - `brokerProfile`: 1-to-1 optional relation to `BrokerProfile`.
2. **`User`**:
   - `id`: CUID primary key.
   - `email`: Unique login identifier.
   - `passwordHash`: Salted bcrypt hash (`$2b$10$...`).
   - `mustChangePassword`: Boolean flag enforcing first-login password update.
   - `status`: Enum (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
3. **`UserRole` & `Role`**:
   - `role`: Canonical role `BUSINESS_PARTNER`.
4. **`BrokerProfile`**:
   - `userId`: Foreign key to `User.id`.
   - `applicationId`: Foreign key to `BusinessPartnerApplication.id`.
   - `status`: Enum (`PENDING_APPROVAL`, `APPROVED`, `SUSPENDED`, `INACTIVE`).
   - `referralCode`: Unique code (e.g. `BP-XXXXXX`).
5. **`AuditLog`**:
   - Records `action: "BROKER_ACCOUNT_CREATED"` or `"BROKER_PASSWORD_RESET"` with userId, IP, userAgent, and non-sensitive metadata (passwords are **never** logged).

---

## 4. Conflict & Duplicate Resolution Matrix (Scenarios 1-5)

| Scenario | Condition | System Behavior | HTTP Code |
| :--- | :--- | :--- | :--- |
| **Scenario 1: Brand New Email** | Email not in `User` table. | Creates `User`, assigns `BUSINESS_PARTNER` role, creates `BrokerProfile`, updates application to `APPROVED`. | `200 OK` (`isNewUser: true`) |
| **Scenario 2: Existing Partner (Same App)** | Partner already has active login for this exact application. | Idempotent response. Returns existing account details without creating duplicate rows or corrupting profile. | `200 OK` (`isNewUser: false`, `accountExisted: true`) |
| **Scenario 3: Internal Role Conflict** | Email belongs to an existing `ADMIN`, `EMPLOYEE`, `FOUNDER`, `CO_FOUNDER`, or `MANAGER`. | **Strict Block**. The system halts immediately. It never overwrites the staff member's password, never reassigns their role, and audits the rejected conflict. | `409 Conflict` (`INTERNAL_ROLE_CONFLICT`) |
| **Scenario 4: Existing Unlinked Account** | Email exists as an unlinked user without internal staff privileges. | Safely attaches `BrokerProfile` to existing `User.id`, adds `BUSINESS_PARTNER` role if missing, and updates application. | `200 OK` (`isNewUser: false`, `accountLinked: true`) |
| **Scenario 5: Transaction Failure** | Any error during multi-table writes (e.g., connection drop). | Database changes are wrapped in an atomic `db.$transaction`. Any error triggers an immediate 100% rollback, leaving no orphaned users. | `500 / Rollback` |

---

## 5. Security & Isolation Controls

1. **Password Safety:**
   - Passwords must be at least 10 characters long and include an uppercase letter, lowercase letter, number, and special symbol (`@$!%*?&`).
   - Passwords are encrypted using `bcrypt.hash(password, 10)` before storage.
   - Raw passwords exist in memory only during the single HTTP execution and are never saved to disk or printed in server logs.
2. **First-Login Enforcement:**
   - Every generated temporary password sets `mustChangePassword: true` on the `User` record.
   - On initial sign-in, the broker is redirected to `/auth/change-password` before access to `/broker/dashboard` is granted.
3. **Server-Side Tenant & IDOR Protection:**
   - All `/broker/*` API endpoints derive identity exclusively from the authenticated session token (`req.headers.get("x-user-id")`).
   - Project and lead access requires explicit ownership verification: `where: { id: projectId, brokerProfile: { userId: sessionUserId } }`. Cross-tenant IDOR access attempts return `403 Forbidden` or `404 Not Found`.
4. **Honest Outbound Communication:**
   - `src/lib/email/service.ts` provides `isOutboundEmailConfigured()` which verifies whether `process.env.RESEND_API_KEY` or `process.env.EMAIL_WEBHOOK_URL` is set.
   - If not configured, the UI clearly displays: *"Outbound email service is not configured. Please copy the temporary credentials below and provide them to the partner manually."*

---

## 6. Verification & Automated Test Results

An automated test suite (`scripts/audit-partner-workflow.ts`) was executed against the database verifying 27 distinct assertions:

| Test Group | Assertions Checked | Status |
| :--- | :--- | :--- |
| **Scenario 1: New Partner Account Creation** | Application status update, User creation, `mustChangePassword` flag, bcrypt verification, BrokerProfile linkage, referralCode format. | **PASSED** (6/6) |
| **Scenario 2: Idempotent Account Creation** | Second call on same application returns `accountExisted: true`, does not duplicate User or BrokerProfile records. | **PASSED** (4/4) |
| **Scenario 3: Internal Role Conflict Guard** | Admin/Employee email conflict returns `409 Conflict`, leaves staff password hash and roles untouched. | **PASSED** (4/4) |
| **Scenario 4: Safe Account Linking** | Existing user account linked cleanly with `BUSINESS_PARTNER` role. | **PASSED** (3/3) |
| **Scenario 5: Transaction Atomicity** | Aborted transaction leaves no orphaned records. | **PASSED** (2/2) |
| **Security & RBAC Enforcement** | Enforces `mustChangePassword`, verifies password complexity, validates IDOR isolation rejection on unauthorized broker projects. | **PASSED** (5/5) |
| **Audit Logging & Redaction** | Logs recorded with `action: "BROKER_ACCOUNT_CREATED"`, verified raw password string is absent from details JSON. | **PASSED** (3/3) |
| **Total Test Suite Assertions** | **27 Total Checks** | **27 PASSED / 0 FAILED** |

### Build & Typecheck Gate:
- `npx tsc --noEmit`: **0 Errors** (Clean Pass)
- `npx next build`: **Compiled successfully in 25.6s, 470 static/dynamic routes generated without errors.**
