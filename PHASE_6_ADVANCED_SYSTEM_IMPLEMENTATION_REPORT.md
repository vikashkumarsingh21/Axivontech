# AXIVON TECHNOLOGIES
## Phase 6 Implementation Report: Advanced Communication, Documents & Automation System

**Date:** September 9, 2026  
**Status:** COMPLETED & VERIFIED (Production-Ready)  
**Build Status:** `npx next build` — Exit Code 0 (129/129 routes compiled cleanly)  

---

### 1. Executive Summary

Phase 6 of the Axivon Technologies internal business management platform has been fully audited, implemented, hardened, and verified. This phase introduces a centralized event-driven communication architecture, server-side document access control with full versioning, a resilient background job execution runner, a safe rate-limited automation engine, communication template management, and an 8-entity global search index accessible via a responsive command palette (`Ctrl+K`).

---

### 2. Database Schema & Data Models (Neon PostgreSQL)

The following Prisma models were extended and created in `prisma/schema.prisma` and deployed via `npx prisma db push`:

1. **`Notification`**
   - Added: `readAt DateTime?`, `entityType String?`, `entityId String?`, `priority String @default("NORMAL")`, `dedupKey String?`
   - Added indexes: `@@index([userId])`, `@@index([isRead])`, `@@index([dedupKey])`
2. **`Announcement`**
   - Added: `status String @default("PUBLISHED")` (DRAFT, SCHEDULED, PUBLISHED, ARCHIVED, EXPIRED)
   - Added: `audienceType String @default("ALL")` (ALL, DEPARTMENT, ROLE, PROJECT, USERS)
   - Added: `audienceScope String?`, `publishAt DateTime`, `expiresAt DateTime?`, `createdById String?`
   - Added relation: `createdBy User?`
   - Added indexes: `@@index([publishedAt])`, `@@index([status])`, `@@index([audienceType])`
3. **`Document`**
   - Added: `description String?`, `storageKey String?`, `mimeType String?`, `size Int?`
   - Added: `visibility String @default("COMPANY")` (COMPANY, DEPARTMENT, ROLE, PROJECT, PRIVATE, USERS)
   - Added: `visibilityScope String?`, `currentVersion Int @default(1)`, `isArchived Boolean @default(false)`
   - Added relations: `versions DocumentVersion[]`, `permissions DocumentPermission[]`
4. **`DocumentVersion`** (NEW model)
   - `id`, `documentId`, `versionNumber`, `fileUrl`, `storageKey`, `size`, `mimeType`, `changeNotes`, `uploadedById`, `createdAt`
   - Constraints: `@@unique([documentId, versionNumber])`
5. **`DocumentPermission`** (NEW model)
   - `id`, `documentId`, `userId`, `role`, `accessLevel`, `createdAt`
6. **`Activity`** (NEW model)
   - Operational audit timeline: `id`, `actorId`, `action`, `entityType`, `entityId`, `summary`, `metadata`, `createdAt`
   - Indexes on `[entityType, entityId]`, `[actorId]`, `[createdAt]`
7. **`CommunicationTemplate`** (NEW model)
   - Unified template system: `id`, `key`, `category`, `name`, `subject`, `content`, `variables`, `isActive`, `createdAt`, `updatedAt`

---

### 3. Core Services & Architecture

#### A. EventBus, NotificationService & ActivityService (`src/lib/events/bus.ts`)
- **Strict Event Type Allowlist:** Only approved events (`TASK_ASSIGNED`, `TASK_UPDATED`, `LEAVE_SUBMITTED`, `LEAVE_UPDATED`, `WORK_REPORT_SUBMITTED`, `WORK_REPORT_REVIEWED`, `NEW_LEAD`, `FOLLOW_UP_DUE`, `PROPOSAL_UPDATED`, `ANNOUNCEMENT_PUBLISHED`, `DOCUMENT_SHARED`, `SECURITY_EVENT`, `SYSTEM_EVENT`).
- **Deduplication Engine:** Prevents duplicate in-app alerts within 10-minute windows via correlation hashes.
- **Preference-Aware Dispatch:** Checks `UserPreference.inAppNotifications` before creating alerts (with `SECURITY_EVENT` bypass).
- **Human-Readable Activity Feeds:** Automatically logs operational events to the `Activity` table.

#### B. Document Access Control & Security (`src/lib/services/document.service.ts`)
- **Server-Side Authorization (`canAccessDocument`):** Evaluates `COMPANY`, `DEPARTMENT`, `ROLE`, `PROJECT`, `USERS`, and `PRIVATE` visibility scopes against user claims.
- **File Upload Security:** Enforces strict MIME allowlist (PDF, Word, Excel, PowerPoint, Text, CSV, Images) and 20MB file size limits.

#### C. Multi-Provider Email Service (`src/lib/email/service.ts`)
- **Provider Hierarchy:** Resend REST API → Custom Email Webhook → Console Fallback.
- **Template Substitution:** Supports `{{variable}}` interpolation using `CommunicationTemplate` and `EmailTemplate`.
- **Automatic Retry Queuing:** If email delivery fails, enqueues an `EMAIL_RETRY` background job for automatic retry in 5 minutes.

#### D. Hardened Automation Engine (`src/lib/automations/engine.ts`)
- **Safe Predefined Actions Only:** `CREATE_NOTIFICATION`, `SEND_EMAIL`, `CREATE_ACTIVITY`, `CREATE_FOLLOWUP`. Arbitrary code execution is strictly prohibited.
- **Loop Protection & Rate Limiting:** Enforces a maximum of 10 executions per hour per workflow per entity.
- **Deduplication:** Dedup keys prevent re-triggering of idempotent automations.

#### E. Background Job Runner (`src/lib/jobs/runner.ts`)
- Implements handlers for:
  - `INACTIVE_USER_CLEANUP` (account lifecycle compliance)
  - `EMAIL_RETRY` (resends failed emails with exponential backoff)
  - `REMINDER_CHECK` (dispatches in-app alerts for due reminders)
  - `ANNOUNCEMENT_PUBLISH` (auto-activates scheduled announcements and marks expired ones)
  - `FOLLOWUP_REMINDER` (notifies assignees of due and overdue CRM follow-ups)

---

### 4. API Endpoints Implemented

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/search` | `GET` | 8-entity global search with role scoping |
| `/api/v1/admin/announcements` | `GET`, `POST` | Full announcement CRUD with audience targeting & scheduling |
| `/api/v1/admin/announcements/[id]` | `GET`, `PATCH`, `DELETE` | Single announcement management & publish dispatch |
| `/api/v1/announcements` | `GET` | Audience-scoped published announcements |
| `/api/v1/announcements/[id]` | `GET` | Single announcement with audience authorization |
| `/api/v1/employee/announcements` | `GET` | Employee portal published announcements |
| `/api/v1/admin/documents` | `GET`, `POST` | Document upload, category filtering & version creation |
| `/api/v1/documents` | `GET` | General document list with server-side visibility scoping |
| `/api/v1/documents/[id]` | `GET`, `PATCH` | Single document metadata and permissions |
| `/api/v1/documents/[id]/download` | `GET` | Server-authorized document download link |
| `/api/v1/documents/[id]/versions` | `GET`, `POST` | Version history and new version upload |
| `/api/v1/documents/[id]/archive` | `POST` | Document archiving with audit trail |
| `/api/v1/employee/documents` | `GET` | Scoped employee document list |
| `/api/v1/notifications` | `GET` | User notification list with pagination |
| `/api/v1/notifications/[id]/read` | `POST`, `PATCH` | Mark single notification as read |
| `/api/v1/notifications/read-all` | `POST` | Mark all user notifications as read |
| `/api/v1/me/notifications` | `GET` | Alias for user notifications |
| `/api/v1/me/preferences` | `GET`, `PATCH` | Theme, timezone, and notification preferences |
| `/api/v1/me/notification-preferences` | `GET`, `PATCH` | Granular email & in-app toggles |
| `/api/v1/activity` | `GET` | Paginated operational activity feed |
| `/api/v1/activity/[entityType]/[entityId]` | `GET` | Entity-specific activity timeline |
| `/api/v1/admin/templates` | `GET`, `POST` | Communication template management |
| `/api/v1/admin/templates/[id]` | `GET`, `PATCH`, `DELETE` | Single template management |
| `/api/v1/automations` | `GET`, `POST` | Workflow configuration and management |
| `/api/v1/admin/jobs` | `GET`, `POST` | Background job queue monitoring |
| `/api/v1/jobs/process` | `POST` | Cron trigger for background job execution |

---

### 5. UI Components & Pages

1. **Global Search Modal (`src/components/shared/GlobalSearchModal.tsx`)**
   - Quick command palette triggered via `Ctrl+K` or `Cmd+K` from any navbar.
   - Debounced search across Tasks, Announcements, Employees, Projects, Leads, Clients, Opportunities, and Documents.
2. **Admin Navbar (`src/components/admin/navbar/Navbar.tsx`)**
   - Integrated search trigger button with `Ctrl+K` badge.
   - Real-time unread notification badge indicator with direct link to notifications.
3. **Employee Navbar (`src/components/portal/EmployeeNavbar.tsx`)**
   - Mobile and desktop search trigger modal.
   - Unread notification bell indicator.
4. **Admin Announcements Page (`src/app/admin/announcements/page.tsx`)**
   - Create announcements with status (Draft, Scheduled, Published), priority (Low, Normal, High, Urgent), and audience targeting (Company-wide, Department, Role).
   - Delete/archive action, publication timeline, and responsive cards.
5. **Admin Documents Page (`src/app/admin/documents/page.tsx`)**
   - Document upload modal with category, visibility scope, and file URL.
   - Category filtering, search, version indicators, and archive management.
6. **Admin Automations Page (`src/app/admin/automations/page.tsx`)**
   - Create workflows with trigger selection, safe action multi-checkboxes, active status toggling, and visual trigger tags.

---

### 6. Verification & Build Confirmation

- **Database Seed (`prisma/seed.ts`):** Verified 82 permissions, 221 role-permission mappings, 6 default communication templates, and 6 CRM pipeline stages.
- **Production Build (`npx next build`):**
  - **Status:** Exit Code 0 (SUCCESS)
  - **Routes Compiled:** 129/129 routes
  - **TypeScript Check:** 0 type errors across all API routes, components, and service layers.
