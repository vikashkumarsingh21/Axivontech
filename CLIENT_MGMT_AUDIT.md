# Client Management & Lifecycle Audit: Current State, Gaps & Deletion Risk Analysis

**Date:** 2026-10-26  
**Auditor:** Senior Full-Stack Engineer & QA Lead  
**Target Entity:** `CrmClient`, `ClientContact`, `User` (Role: `CLIENT`), `PartnerProject`  
**System Scope:** Axivon Technologies Enterprise Admin & CRM Platform  

---

## 1. Executive Summary

This audit assesses the current state of client data models, portal authentication links, and cascade behaviors across the Axivon Technologies codebase prior to implementing the comprehensive Client Management & Lifecycle system (Part B).

The current CRM client system stores basic directory information in `CrmClient` and contacts in `ClientContact`. However:
1. It lacks lifecycle state handling (`PENDING_ACTIVATION`, `SUSPENDED`, `ARCHIVED`, `DELETED`).
2. It lacks soft delete fields (`deletedAt`, `deleteReason`, `restoredAt`), meaning deletion would either cause unrecoverable data loss or orphan critical financial/project records.
3. Portal login (`User` with role `CLIENT`) has an informal and fragmented relationship to `CrmClient` (loosely matched by email), causing potential desynchronization during suspension or deactivation.
4. Client queries across the application lack exclusion filters for soft-deleted or archived clients.

---

## 2. Model & Architecture Audit

### 2.1 Current `CrmClient` Data Model
```prisma
model CrmClient {
  id          String  @id @default(cuid())
  clientCode  String  @unique
  companyName String
  contactName String
  email       String
  phone       String?
  website     String?
  industry    String?
  status      String  @default("ACTIVE") // Currently only ACTIVE, INACTIVE, ONBOARDING

  ownerId     String?
  owner       User?   @relation("ClientOwner", fields: [ownerId], references: [id], onDelete: SetNull)

  leads         Lead[]
  opportunities Opportunity[]
  activities    LeadActivity[]
  followUps     FollowUp[]
  contacts      ClientContact[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([ownerId])
  @@index([email])
  @@index([clientCode])
}
```

### 2.2 Current `ClientContact` Model
```prisma
model ClientContact {
  id        String    @id @default(cuid())
  clientId  String
  client    CrmClient @relation(fields: [clientId], references: [id], onDelete: Cascade)
  name      String
  email     String?
  phone     String?
  role      String?
  isPrimary Boolean   @default(false)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([clientId])
}
```

### 2.3 Client Portal Login (`User` Model with Role `CLIENT`)
- **Portal Account:** Clients access the portal (`/client/dashboard`, `/client/projects`, `/client/invoices`, `/client/documents`) using an account in the standard `User` table assigned the `CLIENT` role via `UserRole`.
- **Account Creation Flow:**
  - When an admin starts a project via `POST /api/v1/admin/partner-projects/[id]/start`, a `User` is provisioned with `status: "PENDING_ACTIVATION"`, an `activationToken`, and `passwordHash: "TEMPORARY_AWAITING_SETUP"`.
  - A corresponding `CrmClient` record is created, but `ownerId` was incorrectly set to `clientUser.id` instead of the internal account executive, and no direct `userId` foreign key was established on `CrmClient`.
- **Activation Flow:**
  - Client visits `/client/activate?token=...` and sets a password via `POST /api/v1/client/auth/activate`.
  - `User.status` transitions from `PENDING_ACTIVATION` to `ACTIVE`.
- **Current Linkage Gap:**
  - `CrmClient` has **no direct foreign key** pointing to `User` for client credentials. Links are resolved indirectly via matching `email` or through `PartnerProject.clientUserId`.
  - **Proposed Fix:** Add `userId String? @unique` to `CrmClient` with `@relation("ClientPortalAccount", fields: [userId], references: [id], onDelete: SetNull)` and reciprocal `clientProfile CrmClient?` on `User`.

---

## 3. Impact Analysis: What Happens If a Client Is Deleted Right Now?

| Model / Entity | Relation Type | On Delete Rule | Actual Consequence if `CrmClient` is Hard Deleted Today | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **`ClientContact`** | Direct foreign key | `Cascade` | **All contact persons are instantly wiped from the database.** Irreversible. | 🔴 Critical |
| **`LeadActivity`** | Direct foreign key | `Cascade` | **All call logs, meeting notes, and email history linked to this client are purged.** | 🔴 Critical |
| **`FollowUp`** | Direct foreign key | `Cascade` | **All scheduled follow-up tasks and reminders are permanently dropped.** | 🟠 High |
| **`Lead`** | Converted client relation | `SetNull` | `convertedClientId` becomes `NULL`. The historical link between the marketing lead and the converted account is permanently severed. | 🟠 High |
| **`Opportunity`** | Deal relation | `SetNull` | `clientId` becomes `NULL`. Revenue reporting, deal pipeline history, and CRM forecasting lose account attribution. | 🟠 High |
| **`PartnerProject`** | Soft reference via email/user | None (independent) | Projects remain in the database with their broker profile and payment records, but are **orphaned from the CRM client directory**. | 🔴 Critical |
| **`PartnerPayment`** | Linked via `PartnerProject` | None (independent) | Invoices and payments remain, but financial reporting cannot map them to an active client CRM profile. | 🔴 Critical |
| **`PartnerContract`** | Linked via `PartnerProject` | None (independent) | Signed legal contracts remain orphaned. | 🟠 High |
| **`User` (Portal Account)**| Soft reference via email | None (independent) | The client's login account remains active in `User`. **The client can still log in to the portal** even though their CRM account was deleted! | 🔴 Severe Security Risk |
| **`AuditLog`** | Polymorphic resource string | N/A | Preserved as immutable audit trails (`resource: "Client:<id>"`). | 🟢 Safe |

---

## 4. Missing Fields on `CrmClient`

To support the complete lifecycle, compliance (GDPR/privacy), and enterprise administrative requirements, the following fields are absent:

1. **Lifecycle & Status:**
   - `status`: Currently defaults to `"ACTIVE"`. Missing standardized values: `PENDING_ACTIVATION`, `ACTIVE`, `SUSPENDED`, `ARCHIVED`, `DELETED`.
2. **Soft Delete & Trash Bin:**
   - `deletedAt: DateTime?`: Timestamp when soft-deleted to Trash.
   - `deletedById: String?`: Admin who triggered deletion.
   - `deleteReason: String?`: Required reason for deletion.
   - `restoredAt: DateTime?`: Timestamp of restoration from Trash.
   - `restoredById: String?`: Admin who restored account.
3. **Suspension Tracking:**
   - `suspendedAt: DateTime?`: Timestamp when account access was suspended.
   - `suspendedById: String?`: Admin who suspended the client.
   - `suspendReason: String?`: Reason for suspension (shown on portal block screen).
4. **Archival Tracking:**
   - `archivedAt: DateTime?`: Timestamp when moved to archive.
   - `archivedById: String?`: Admin who archived the client.
   - `archiveReason: String?`: Optional reason for archival.
5. **GDPR / Privacy Anonymization:**
   - `anonymizedAt: DateTime?`: Timestamp when PII was stripped.
   - `anonymizedById: String?`: Admin who authorized anonymization.
6. **Business & Organization:**
   - `address: String?`: Physical/registered billing address.
   - `gstNumber: String?`: GSTIN / Tax Identification Number for invoicing.
   - `userId: String? @unique`: Direct link to client's portal login user.
7. **Database Indexes:**
   - Missing `@@index([status])` for fast tab queries.
   - Missing `@@index([deletedAt])` for soft-delete filtering.

---

## 5. Deletion Safeguard Rules

To eliminate data corruption and accidental loss of accounting/legal records:
1. **Permanent Delete Blockers:** Permanent deletion must be **BLOCKED (HTTP 409 Conflict)** if the client has:
   - Any linked `PartnerProject` records (active or historical).
   - Any recorded `PartnerPayment` transactions (paid, pending, or advance).
   - Any signed `PartnerContract` legal agreements.
   - Any open or won `Opportunity` records.
   *The API will return an explicit message detailing why deletion is blocked, advising the admin to soft-delete or archive instead.*
2. **Safe Permanent Deletion Prerequisites:**
   - Client is already in Trash (`status === "DELETED"`).
   - Zero financial, contract, or project records exist.
   - Admin re-enters their password.
   - Admin types the exact company name into the confirmation modal.
   - Safe cascade only to non-financial child records (`ClientContact`, notes, reminders).
3. **Session Invalidation on Suspension:**
   - When a client is suspended, all active portal sessions in `Session` table must be deleted immediately.
   - Middleware and `validateActiveUser` must reject any request from a suspended client with HTTP 403 `ACCOUNT_SUSPENDED`.
4. **GDPR Anonymization:**
   - Replaces PII (`contactName`, `email`, `phone`, `website`, `address`, `gstNumber`) with pseudonymized placeholders (`Anonymized Client [CL-XXXX]`).
   - Cascade-anonymizes or purges child `ClientContact` records.
   - Preserves financial balances and aggregate reporting integrity.
