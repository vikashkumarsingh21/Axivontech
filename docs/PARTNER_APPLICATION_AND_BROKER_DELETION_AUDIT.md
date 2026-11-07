# Audit Summary: Partner Applications & Broker Account Management Architecture

**Date:** 2026-11-07  
**Module:** Partner Applications (`/admin/business-partners/applications`) & Brokers (`/admin/crm/brokers`)  
**Target:** Secure Delete, Deactivation, and Permanent Removal Architecture

---

## 1. Existing Application & Broker Architecture

### 1.1 Partner Applications (`/admin/business-partners/applications`)
- **Page Component:** `src/app/admin/business-partners/applications/page.tsx`
- **Existing APIs:**
  - `GET /api/v1/admin/business-partner/applications`: Lists applications with pagination, search, status filters, and enriches with `linkedUser` and `accountStatus` by matching email.
  - `GET /api/v1/admin/business-partner/applications/[id]`: Full details of an application including status history, meetings, and linked user/broker.
  - `PUT /api/v1/admin/business-partner/applications/[id]`: Status updates with status transition validation and transactional emails.
  - `POST /api/v1/admin/business-partner/applications/[id]/create-account`: Approves and provisions login credentials via `approveAndCreateBrokerAccount`.
  - **Status:** No `DELETE` endpoint currently exists for applications.

### 1.2 Brokers / Partners (`/admin/crm/brokers`)
- **Page Component:** `src/app/admin/crm/brokers/page.tsx`
- **Existing APIs:**
  - `GET /api/v1/admin/brokers`: Queries users with role `BUSINESS_PARTNER` or `BROKER`, including `brokerProfile` and counts of `ownedLeads` and `ownedOpportunities`.
  - `POST /api/v1/admin/brokers`: Direct broker user creation with profile and referral code.
  - `GET /api/v1/admin/brokers/[id]`: Full dossier including KYC, stats, leads, partner projects, contracts, commissions, documents, notes, and audit logs.
  - `PATCH /api/v1/admin/brokers/[id]`: Updates broker user details, profile information, and status (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
  - **Status:** No `DELETE` endpoint currently exists for brokers, and no pre-deletion dependency check endpoint exists.

---

## 2. Database Models & Linkage Identification

### 2.1 `BusinessPartnerApplication`
- Master entity storing the application form submission.
- **Cascading relations:** `meetings` (`ApplicationMeeting[]`) and `statusHistory` (`ApplicationStatusHistory[]`) both have `onDelete: Cascade`.
- **Link to User/Broker:** Linked via `email` (case-insensitive normalized match). There is intentionally **no hard foreign key constraint** between `BusinessPartnerApplication` and `User` or `BrokerProfile`.
- **Implication:** Deleting a `BusinessPartnerApplication` record is database-safe and will NOT cascade-delete or damage the `User` or `BrokerProfile` account.

### 2.2 `User` and `BrokerProfile`
- `User`: Master auth entity (`id`, `email`, `passwordHash`, `status`, `activationToken`, etc.).
- `BrokerProfile`: Relates to `User` (`userId @unique`, `onDelete: Cascade`). Stores `partnerId` (e.g. `AXP-2026-XXXXXX`) and `referralCode` (e.g. `AXP-NAME-XXXX`).
- **Dependencies referencing `BrokerProfile` & `User`:**
  - `PartnerProject` (`brokerProfileId`): Client project requests and delivery contracts (`onDelete: SetNull`).
  - `Commission` (`brokerProfileId`): Commission financial records (`onDelete: Cascade` on profile, but links to `PartnerProject`).
  - `Lead` (`ownerId` on `User`): CRM referral leads.
  - `PartnerDocument` (`brokerProfileId`): Verification and contract files.
  - `PartnerPayment`: Payment transactions tied to `PartnerProject`.
  - `Session`: Active JWT login sessions (`onDelete: Cascade` on `User`).
- **Critical Finding on Cascading:** Blindly executing `db.user.delete()` on a broker with existing projects or commissions would trigger cascading deletion of `BrokerProfile` and `Commission`, violating data retention requirements.
- **Architectural Safeguard:** A dependency check must run prior to any deletion. If any historical records (leads, projects, commissions, contracts, payments, documents) exist, **permanent deletion is strictly BLOCKED**. The system mandates **Option A: Deactivate Broker & Keep History**.

---

## 3. Application-to-Broker Onboarding Workflow

1. Applicant submits public form -> `BusinessPartnerApplication` created in `SUBMITTED` status.
2. Admin reviews -> Sets status `UNDER_REVIEW` / `MEETING_SCHEDULED` / etc.
3. Admin approves -> Calls `POST /api/v1/admin/business-partner/applications/[id]/create-account`.
4. `approveAndCreateBrokerAccount` in `src/lib/auth/broker-account-service.ts`:
   - Upserts `User` (with `ACTIVE` or `PENDING_ACTIVATION` status).
   - Assigns canonical role `BUSINESS_PARTNER`.
   - Creates `BrokerProfile` with `partnerId` and `referralCode`.
   - Updates `BusinessPartnerApplication` status to `APPROVED`.
   - Logs audit event.

---

## 4. Planned Implementation Architecture

### 4.1 Partner Applications Deletion
- **Endpoint:** `DELETE /api/v1/admin/business-partner/applications/[id]`
- **RBAC:** Requires `users:delete` permission (Admin/Founder/Co-Founder).
- **Protection Logic:**
  - Checks if linked to an active `User` / `BrokerProfile`. If yes, warns Admin that deleting the application will NOT delete or affect the broker's active login or CRM records.
  - If linked to an unactivated pending invite (`PENDING_ACTIVATION`), provides an optional flag `revokePendingInvite: boolean` to cancel the invitation safely.
  - Deletes `BusinessPartnerApplication` (cascades meetings and status history).
  - Emits `AuditLog` with `action: "BUSINESS_PARTNER_APPLICATION_DELETED"` and mandatory deletion reason.
- **Bulk Action:** Supports `POST /api/v1/admin/business-partner/applications/bulk-delete` for selected IDs with individual result reporting.

### 4.2 Broker Account Deactivation & Permanent Deletion
- **Dependency Check Endpoint:** `GET /api/v1/admin/brokers/[id]/dependency-check`
  - Evaluates counts of: leads, projects, commissions, contracts, documents, payments.
  - Returns whether permanent deletion is permitted or blocked.
- **Deactivation Endpoint:** `POST /api/v1/admin/brokers/[id]/deactivate` (Option A - Recommended)
  - Sets `user.status = "INACTIVE"`, sets `user.inactiveAt = new Date()`.
  - Clears `activationToken`.
  - Purges all active sessions (`db.session.deleteMany({ where: { userId } })`).
  - Purges permission cache (`invalidateUserPermissionCache(userId)`).
  - All existing leads, projects, commissions, contracts, documents remain 100% intact.
  - Referral code is disabled from receiving new submissions (enforced on `/api/v1/public/leads` and `/api/v1/public/project-requests`).
  - Emits `AuditLog` with `action: "BROKER_DEACTIVATED"`.
- **Permanent Deletion Endpoint:** `DELETE /api/v1/admin/brokers/[id]` (Option B - Guarded)
  - BLOCKED by default if any historical business records exist.
  - Self-deletion is blocked (`adminId === id`).
  - Privileged account deletion is blocked (cannot delete Founder, Co-Founder, Admin).
  - If 100% clean with 0 records: Requires reason + typing `DELETE` confirmation.
  - Safely deletes roles, profile, sessions, user record.
  - Emits `AuditLog` with `action: "BROKER_PERMANENTLY_DELETED"`.
- **Bulk Actions:** Bulk deactivation and bulk deletion for eligible brokers with dependency verification.
