# Audit Report: Approved Partner Login & Account Provisioning Workflow

**Axivon Technologies — Technical & Security Audit**  
**Component:** Business Partner / Broker Partner Application, Approval, and Authentication System  
**Audit Date:** October 31, 2026  
**Status:** Issue Diagnosed; Solution Engineered  

---

## 1. Executive Summary

When an applicant submits an inquiry through the partner application form, administrators review the candidate in the Admin CRM (`/admin/business-partners/applications` and detail page). Upon clicking **"Approve"**, the application record's status transitioned to `"APPROVED"`, but **no login credentials were created**, no password was established, and no usable login was generated. 

Consequently, approved partners were unable to log into the partner portal (`/login` → `/broker/dashboard`), blocking onboarding, KYC verification, and referral link generation.

---

## 2. Root Cause Analysis

### A. Disconnected Two-Step Approval Architecture
1. **Approval Endpoint (`/api/v1/admin/business-partner/applications/[id]/route.ts`):**
   - The `PUT` handler only performed a status update:
     ```ts
     await db.businessPartnerApplication.update({
       where: { id },
       data: { status: "APPROVED", decisionReason: reason, reviewedById: userId, reviewedAt: new Date() }
     });
     ```
   - It did not create a `User` entity or link a `BrokerProfile`.

2. **Orphaned Account Creation Endpoint (`/api/v1/admin/business-partner/applications/[id]/create-account/route.ts`):**
   - Account creation existed as an optional secondary action.
   - However, it generated a **random, non-human-readable UUID** as the temporary password:
     ```ts
     const temporaryPassword = crypto.randomUUID(); // unrecoverable
     ```
   - It created the user with `status = "PENDING_ACTIVATION"` and `mustChangePassword = true`, dispatching an activation email token.
   - If email sending was unconfigured, failed, was delayed, or landed in spam, the user was left permanently stuck in `PENDING_ACTIVATION`.

3. **Login Route Gate (`/api/v1/auth/login/route.ts`):**
   - The login endpoint strictly rejected any user where `status !== "ACTIVE"` or `mustChangePassword === true`:
     ```ts
     if (user.status !== "ACTIVE") {
       throw new ApiError(403, `Account is ${user.status}. Please check your email or contact support.`);
     }
     if (user.mustChangePassword) {
       throw new ApiError(403, "Please complete your account activation and password setup using the link sent to your email.");
     }
     ```
   - As a result, approved partners could **never** log in directly.

4. **UI Visibility Gaps:**
   - The application list (`/admin/business-partners/applications`) displayed an `"APPROVED"` green badge, giving admins the false impression that the partner's account was complete.
   - There was no `"No login yet"` badge, and no direct `"Create login"` action from the list table.

---

## 3. Database State Audit

Running the diagnostic dry-run script (`scripts/db/list-approved-without-login.ts`) against the live database revealed:
- Total `APPROVED` applications: **2**
- Both applications were stuck in `PENDING_ACTIVATION`:
  1. `BPA-2026-C3YROD` — `ROKHIYA KHANAM` (`rokhiyakhanam83@gmail.com`)
  2. `BPA-2026-GUNZRF` — `Vikas Kumar` (`vikas.kumar129118@marwadiuniversity.ac.in`)
- **100% of approved applications currently lack a usable login account.**

---

## 4. Role & Status Hierarchy Map

| Layer | Model / Key | Current Behavior | Target Behavior |
|---|---|---|---|
| Application | `BusinessPartnerApplication.status` | Set to `APPROVED` independently of user creation | Updated atomically in the same transaction as user creation |
| Authentication | `User.status` | Created as `PENDING_ACTIVATION` | Created as `ACTIVE` so credentials work immediately on `/login` |
| Security | `User.mustChangePassword` | Caused immediate HTTP 403 on `/login` | Allows initial login to exchange temp password on forced `/change-password` screen |
| Authorization | `UserRole` / `Role` | Assigned `BUSINESS_PARTNER` (normalized) | Strictly assigned `BUSINESS_PARTNER` (with `BROKER` alias compatibility) |
| Entity Profile | `BrokerProfile` | Created with `partnerId` and `referralCode` | Maintained; Partner status stays in onboarding until Partner Manager signs off |

---

## 5. Architectural Solution

1. **Unified Transactional Backend Service (`src/lib/auth/broker-account-service.ts`):**
   - Atomic transaction executing approval, user creation, role assignment, and broker profile generation.
   - Supports dual credential provisioning:
     - **Mode A (Direct Password):** Admin generates secure 14+ character password or sets manually; returns one-time masked credentials in response.
     - **Mode B (Activation Link):** Admin sends 48h secure single-use activation token.
2. **Interactive Admin Modal:**
   - Opens automatically on "Approve" click.
   - Provides live password generator, manual strength checker, and email duplicate validation.
   - Displays a one-time "Credentials Created" card with quick copy buttons and email dispatch.
3. **Admin List Badging:**
   - Shows a amber `"No login yet"` badge for approved applications lacking active credentials, with an inline `"Create Login"` button.
4. **Forced First-Login Password Change:**
   - When `mustChangePassword === true`, `/login` permits authenticated session but forces user directly into `/auth/change-password`.
   - All other broker endpoints are blocked by session guard until the temporary password is changed.
5. **Broker Management Extras on `/admin/crm/brokers/[id]`:**
   - Direct password reset modal.
   - Resend activation link action.
   - Suspend / Reactivate controls with audit logging.
