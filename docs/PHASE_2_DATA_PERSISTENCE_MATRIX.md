# AXIVON ONE — PHASE 2
## DATA PERSISTENCE & TRANSACTION MATRIX

This document details the persistence specifications, unique constraints, transactional boundaries, timezone representations, financial precision types, and deletion cascades for all primary entities across the six portals of **AXIVON ONE**.

---

### Portal Matrix Overview

| Portal | Scope | Primary Entities |
| :--- | :--- | :--- |
| **Admin Portal** | System Administration, Role Configuration, CRM, Finance, Policies | `User`, `Role`, `UserRole`, `AttendancePolicy`, `CommissionRule`, `Holiday`, `OrganizationSetting` |
| **Executive Portal** | High-level Governance, Project Oversight, Approvals | `ExecutiveProfile`, `ApprovalRequest`, `SecurityEvent` |
| **Employee Portal** | Workforce Management, Daily Attendance, Tasks, Leave | `Attendance`, `AttendanceBreak`, `RegularizationRequest`, `Task`, `TaskComment`, `WorkReport`, `LeaveRequest` |
| **Broker / Partner Portal** | Partner Onboarding, Project Referrals, Commissions, Payouts | `BrokerProfile`, `BusinessPartnerApplication`, `ApplicationMeeting`, `Commission`, `PartnerDocument` |
| **Client Portal** | Direct Client Onboarding, Milestone Tracking, Contract Acceptance, Payment | `PartnerProject`, `PartnerContract`, `PartnerPayment`, `PartnerProjectMilestone` |
| **Public Website / CMS** | Lead Funnels, Career Submissions, Content Management, Privacy Logs | `Lead`, `CareerApplication`, `JobPosting`, `WebsiteArticle`, `PrivacyRequest`, `UserConsentRecord` |

---

## Detailed Data Persistence Matrix

| Portal / Module | Model Name | Primary Key | Business Key / Unique Constraints | Transaction Boundary | Timezone Handling | Financial Precision | Attachment / Blob | Deletion Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin: Identity** | `User` | CUID (`id`) | `email`, `employeeId` (unique) | Single Write / Managed | UTC `TIMESTAMPTZ` | N/A | `avatarUrl` (URL) | `Cascade` child roles; `SetNull` logs |
| **Admin: Identity** | `Role` | CUID (`id`) | `name` (unique) | Upsert / Single Write | UTC `TIMESTAMPTZ` | N/A | None | `Cascade` role mappings |
| **Admin: Identity** | `UserRole` | CUID (`id`) | `@@unique([userId, roleId])` | Upsert / Single Write | UTC `TIMESTAMPTZ` | N/A | None | `Cascade` on User or Role delete |
| **Admin: Audit** | `AuditLog` | CUID (`id`) | Indexed by `userId`, `action`, `resource` | Inside parent `$transaction` | UTC `TIMESTAMPTZ` | Stored in JSON `details` | None | `SetNull` on User delete (audit preserved) |
| **Admin: CRM** | `Lead` | CUID (`id`) | Indexed by `status`, `email`, `ownerId` | `$transaction` on conversion | UTC `TIMESTAMPTZ` | `budget Float?` | None | `SetNull` on User / Partner delete |
| **Admin: CRM** | `CrmClient` | CUID (`id`) | `clientCode` (unique), indexed `email` | Part of Lead Convert `$transaction` | UTC `TIMESTAMPTZ` | N/A | None | `SetNull` on owner delete |
| **Admin: CRM** | `Opportunity` | CUID (`id`) | `opportunityCode` (unique) | Part of Lead Convert `$transaction` | UTC `TIMESTAMPTZ` | `value Float` (default 0) | None | `SetNull` on owner delete |
| **Admin: Policy** | `AttendancePolicy` | CUID (`id`) | Single active record per org | Single Write / Admin API | Local Window string (`"06:00"`) | N/A | None | Restricted |
| **Admin: Policy** | `Holiday` | CUID (`id`) | Indexed by `date`, `country`, `state` | Single Write / Bulk Sync | `@db.Date` UTC Midnight | N/A | None | Restricted |
| **Admin: Finance** | `CommissionRule` | CUID (`id`) | Indexed `isActive` | Single Write | UTC `TIMESTAMPTZ` | `value Float` (paise rounded) | None | `SetNull` on creator delete |
| **Broker: Profile** | `BrokerProfile` | CUID (`id`) | `userId` (unique), `partnerId`, `referralCode` | Account Create `$transaction` | UTC `TIMESTAMPTZ` | N/A | None | `Cascade` on User delete |
| **Broker: Application** | `BusinessPartnerApplication` | CUID (`id`) | `applicationId` (unique), `email` (unique) | Single Write / Flow | UTC `TIMESTAMPTZ` | N/A | JSON payload fields | `Cascade` child meetings & history |
| **Broker: Application** | `ApplicationMeeting` | CUID (`id`) | Indexed `applicationId`, `status` | Single Write | UTC `TIMESTAMPTZ` | N/A | None | `Cascade` on Application delete |
| **Broker: Finance** | `Commission` | CUID (`id`) | `partnerProjectId` (unique: 1 per project) | Payment Verify `$transaction` | UTC `TIMESTAMPTZ` | `commissionAmount Float` (paise) | None | Retained / `SetNull` on approver delete |
| **Broker: Finance** | `Commission (Payout)` | CUID (`id`) | `payoutReference` (UTR deduplicated) | Payout Request & Pay `$transaction` | UTC `TIMESTAMPTZ` (48h SLA) | `commissionAmount Float` | JSON `payoutDetails` | Protected financial record |
| **Client: Projects** | `PartnerProject` | CUID (`id`) | `projectCode` (unique) | Lead Convert / Payment `$transaction` | UTC `TIMESTAMPTZ` | `finalProjectValue Float?` | None | `Cascade` milestones, contracts, payments |
| **Client: Legal** | `PartnerContract` | CUID (`id`) | `partnerProjectId` (unique) | Single Write / Flow | UTC `TIMESTAMPTZ` | N/A | None | `Cascade` on PartnerProject delete |
| **Client: Legal** | `PartnerContractVersion` | CUID (`id`) | Indexed `partnerContractId`, `version` | Single Write | UTC `TIMESTAMPTZ` | N/A | `fileUrl`, `storageKey` | `Cascade` on Contract delete |
| **Client: Finance** | `PartnerPayment` | CUID (`id`) | `transactionId` (UTR unique across table) | Submit & Verify `$transaction` | UTC `TIMESTAMPTZ` | `projectPrice`, `advanceAmount` | `proofFileUrl`, `proofStorageKey` | `Cascade` on PartnerProject delete |
| **Employee: Attendance** | `Attendance` | CUID (`id`) | `@@unique([userId, date])` | Single Write / Flow with auto-close | `@db.Date` UTC Midnight | N/A | None | `Cascade` on User delete |
| **Employee: Attendance** | `AttendanceBreak` | CUID (`id`) | Indexed `attendanceId` | Check-in / Break `$transaction` | UTC `TIMESTAMPTZ` | N/A | None | `Cascade` on Attendance delete |
| **Employee: Attendance** | `RegularizationRequest` | CUID (`id`) | `attendanceId` (unique) | Single Write / Flow | UTC `TIMESTAMPTZ` | N/A | None | `SetNull` on Attendance delete |
| **Employee: Tasks** | `Task` | CUID (`id`) | Indexed `userId`, `projectId`, `status` | Single Write | UTC `TIMESTAMPTZ` | N/A | None | `Cascade` comments |
| **Employee: Reports** | `WorkReport` | CUID (`id`) | `@@unique([userId, date])` | Single Write | `@db.Date` UTC Midnight | N/A | None | `Cascade` on User delete |
| **Employee: Leaves** | `LeaveRequest` | CUID (`id`) | Indexed `userId`, `status`, `startDate` | Approve & Reject `$transaction` | `@db.Date` UTC Midnight | N/A | None | `Cascade` on User delete |
| **Documents** | `Document` | CUID (`id`) | Indexed `category`, `visibility`, `uploadedById` | Single Write | UTC `TIMESTAMPTZ` | N/A | `fileUrl`, `storageKey` | `Cascade` versions & permissions |
| **Documents** | `PartnerDocument` | CUID (`id`) | Indexed `brokerProfileId`, `partnerProjectId` | Single Write | UTC `TIMESTAMPTZ` | N/A | `fileUrl`, `storageKey` | `Cascade` on broker delete |
| **Public: Careers** | `JobPosting` | CUID (`id`) | `slug` (unique) | Single Write | UTC `TIMESTAMPTZ` | `salaryMin`, `salaryMax` | None | `Cascade` career applications |
| **Public: Careers** | `CareerApplication` | CUID (`id`) | `applicationId` (unique) | Single Write with Honeypot | UTC `TIMESTAMPTZ` | N/A | `resumeUrl`, `resumeStorageKey` | `Cascade` on JobPosting delete |
| **Public: Legal** | `LegalPolicy` | CUID (`id`) | `slug` (unique) | Single Write | UTC `TIMESTAMPTZ` | N/A | None | `Cascade` policy versions |
| **Public: Privacy** | `PrivacyRequest` | CUID (`id`) | `requestId` (unique), indexed `email` | Single Write with Turnstile | UTC `TIMESTAMPTZ` | N/A | None | Permanent compliance record |
| **Public: Privacy** | `UserConsentRecord` | CUID (`id`) | Indexed `userId`, `consentType` | Single Write | UTC `TIMESTAMPTZ` | N/A | None | Permanent compliance record |

---

## Technical Audit Insights & Guidelines

### 1. Unique Key Invariants
- **Daily Uniqueness:** `Attendance` and `WorkReport` enforce `@@unique([userId, date])`, guaranteeing that an employee cannot have multiple conflicting daily records for the same calendar date.
- **Single Commission per Project:** `Commission.partnerProjectId` is unique (`@unique`), preventing accidental multi-crediting of commissions for the same customer contract.
- **Transaction Reference (UTR) Uniqueness:** Both `PartnerPayment.transactionId` and `Commission.payoutReference` require unique bank settlement identifiers, preventing double-processing of payments and payouts.

### 2. Timezone Normalization Rule
- For all daily calendar computations (`Attendance.date`, `WorkReport.date`, `Holiday.date`, `LeaveRequest.startDate`, `LeaveRequest.endDate`), dates are anchored at UTC midnight `Date.UTC(YYYY, MM, DD, 0, 0, 0, 0)` via `getUtcCalendarDate()`.
- Event and audit timestamps (`checkInAt`, `checkOutAt`, `createdAt`, `updatedAt`, `paidAt`) store complete ISO 8601 UTC timestamps with millisecond precision.

### 3. Monetary Precision Rule
- All currency calculations in API routes are rounded to Indian Paise (`2 decimal places`) using `Math.round(val * 100) / 100` before writing to `Float` columns, preventing IEEE 754 precision artifacts.
