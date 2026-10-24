# Employee Portal Backend Audit Report (`EMPLOYEE_BACKEND_AUDIT.md`)

**Date:** 2026-10-24  
**Auditor:** Senior Full-Stack / Backend Engineer  
**Scope:** Complete Backend Infrastructure for Axivon Employee Portal (`/api/v1/employee/*` and related shared endpoints)  
**Stack:** Next.js 16 (App Router), Prisma 5.22.0, PostgreSQL (Neon Serverless), jose JWT Session, Zod  

---

## 1. Executive Summary

This audit assesses the backend APIs supporting the Axivon Employee Portal across authentication, authorization (RBAC), data isolation (IDOR), input validation (Zod), performance (N+1 queries, indexing, pagination), consistency (error formatting, response envelopes), transactional integrity, rate limiting, and business logic completeness.

### Key Audit Findings
1. **Foundation & Error Handling:** Route handlers across `/api/v1/employee/*` lack a standardized response shape. Some return `{ success: true, data: ... }`, others return `{ success: true, records: ... }` or bare JSON. Prisma database errors (`P2002`, `P2021`, `P2022`, `P2025`) are not cleanly translated to safe client messages.
2. **Attendance & Regularization:** Check-in, break, and check-out logic uses server timestamps, but missing idempotency checks allow rapid double-submits. Regularization lacks a cancellation endpoint, doesn't restrict to past allowed windows, and fails to notify managers. Monthly summary and running timer endpoints are missing.
3. **Leave Management:** Lacks database-backed `LeaveBalance` per type per calendar year (currently calculated ad-hoc on the frontend). Leave overlap detection is absent, half-day leaves are unsupported, and canceling approved future leaves does not alert HR/Admin.
4. **Tasks:** Missing task status state machine validation (employees can arbitrarily transition between any statuses). Task pagination, search, overdue flags, and comment edit/delete windows are missing.
5. **Work Reports:** No validation preventing negative hours or hours > 24. No text sanitization or length bounds. Draft saving vs final submission workflow is missing.
6. **Projects:** Leaks all active organization projects to unassigned employees if they have no specific assigned projects, violating data isolation. Does not return the employee's role in the project or task progress percentage.
7. **Documents:** Suffers from an N+1 query loop in `src/app/api/v1/employee/documents/route.ts` where permissions are queried per-document in a loop. Missing employee read/acknowledgment tracking.
8. **Announcements:** Lacks per-user read/unread tracking and does not prioritize pinned announcements in sorting.
9. **Notifications:** No deletion/archive endpoint and notification creation ignores user preferences (in-app vs email).
10. **Calendar:** Endpoint only accepts `year`/`month` rather than an arbitrary validated date range (max 62 days) and lacks event/meeting and anniversary feeds.
11. **Profile, Password & Onboarding:** Profile updates lack phone number and emergency contact Zod validation. Settings page saves to `localStorage` instead of persisting to `UserPreference` in PostgreSQL. Email verification workflow needs full linkage.
12. **Support Helpdesk:** No `SupportTicket` model exists in `schema.prisma`. Currently, `/api/v1/employee/support` only fires an in-app notification without storing tickets or supporting replies, conversation threads, or ticket status.

---

## 2. Detailed Feature Audit Table

| Feature | Endpoint(s) | HTTP | What Works | What is Missing / Broken | Severity |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **0. Auth & Foundation** | `/api/v1/employee/*` | ALL | Middleware blocks unauthenticated requests and non-employee roles via positive allowlist. | Inconsistent response envelopes; raw headers used instead of unified session extractor; Prisma exceptions (`P2002`, `P2025`) can leak raw details; rate limiting absent on employee mutation endpoints; double-click idempotency protection missing. | **HIGH** |
| **1. Attendance** | `/api/v1/employee/attendance` | GET, POST | Check-in, break-start, break-end, check-out using server time. Intermittent logoff gap recorded as break. | No monthly summary endpoint; no dedicated running timer endpoint; double-submits within 1 second can spawn concurrent break updates; check-in on approved leave day does not warn. | **HIGH** |
| **1. Regularization** | `/api/v1/employee/attendance/regularize` | GET, POST | Submits regularization request; prevents duplicate pending requests for same date; IDOR check on `attendanceId`. | No CANCEL/DELETE method for employee to cancel pending request; date not restricted to past window; no admin notification dispatched; reason not validated with Zod. | **HIGH** |
| **2. Leave** | `/api/v1/employee/leave` | GET, POST, PATCH | Zod enum for leave types; past date > 30 days blocked; pending leave can be cancelled. | No `LeaveBalance` model tracking yearly quota/used/balance; no check for overlapping pending/approved leaves; half-day leaves unsupported; cannot cancel approved future leave with notification; GET lacks status/year filtering. | **CRITICAL** |
| **3. Tasks** | `/api/v1/employee/tasks` | GET, POST, PATCH | Lists assigned tasks; filters by status/priority; updates status; adds comments; enforces ownership. | No status transition state machine (TODO → IN_PROGRESS → COMPLETED/BLOCKED); no completion timestamp recorded; no overdue flag or due-soon metadata; no task search/pagination; comments cannot be edited or deleted by creator. | **HIGH** |
| **4. Work Reports** | `/api/v1/employee/work-reports` | GET, POST | Upserts report per employee per date; emits EventBus event; returns reports ordered by date. | Hours worked can be negative or exceed 24; text inputs lack length limits and XSS sanitization; no draft vs submitted status; no edit cutoff window; no monthly filtering or streak metadata. | **HIGH** |
| **5. Projects** | `/api/v1/employee/projects` | GET | Returns projects where user is member or task assignee. | Leaks active organization projects if user has no assigned project (data isolation violation); lacks employee role in project, task progress %, and deadlines; N+1 risk on counts. | **MEDIUM** |
| **6. Documents** | `/api/v1/employee/documents` | GET | Filters by category; checks document permissions. | N+1 query loop checking permissions document by document; no search parameter; no read/acknowledgment tracking; no version history metadata returned. | **HIGH** |
| **7. Announcements** | `/api/v1/employee/announcements` | GET | Filters by active published status and audience targeting (ALL, DEPARTMENT, ROLE). | No read/unread tracking per employee; no unread count returned; does not prioritize pinned announcements in sorting order. | **MEDIUM** |
| **8. Notifications** | `/api/v1/employee/notifications`, `/api/v1/notifications/*` | GET, PATCH | Lists user notifications; marks single or all notifications as read. | No delete/archive endpoint; notification creation does not respect user notification preferences (`UserPreference`). | **MEDIUM** |
| **9. Calendar** | `/api/v1/employee/calendar` | GET | Returns holidays, leaves, task due dates, and announcements for query month/year. | Does not support arbitrary `startDate`/`endDate` range; does not enforce max 62-day range limit; missing meetings/events and work anniversaries. | **MEDIUM** |
| **10. Profile** | `/api/v1/employee/profile` | GET, PATCH | Updates editable profile fields (`name`, `phone`, `address`, `emergencyContact`, `avatarUrl`); logs audit entry. | Lacks Zod phone and emergency contact validation; avatar upload directly to storage endpoint lacks private URL handling; read-only fields (`email`, `role`, `department`) not protected if sent. | **MEDIUM** |
| **10. Password** | `/api/v1/employee/profile/password` | POST | Zod schema validation; verifies current password; hashes with 12 rounds; invalidates other sessions; logs audit trail. | Captcha required in local dev/testing without bypass header; rate limiting on password attempts absent. | **LOW** |
| **10. Settings & Preferences** | `/api/v1/me/preferences` | GET, PATCH | Updates `emailNotifications`, `inAppNotifications`, `timezone`, `theme`. | Frontend page (`/employee/settings`) currently saves to `localStorage` instead of calling this API. | **MEDIUM** |
| **10. Onboarding** | `/api/v1/employee/onboarding` | GET | Calculates completion progress based on profile, attendance, work report, task, and document counts. | Checklist items are hardcoded in API; cannot manually mark policy documents as acknowledged. | **LOW** |
| **11. Support Desk** | `/api/v1/employee/support` | POST | Dispatches in-app notifications to administrators with inquiry details. | No `SupportTicket` model in database; no GET endpoint to view submitted tickets or replies; cannot track ticket status (OPEN, IN_PROGRESS, RESOLVED, CLOSED) or converse with admin. | **CRITICAL** |
| **12. Dashboard** | `/api/v1/employee/dashboard` | GET | Fast aggregated response with live attendance calculations, today's report, task counts, leave summary, and notifications. | Hours this week missing; streak count missing; leave balance relies on hardcoded quota instead of database model. | **MEDIUM** |

---

## 3. Database Schema Needs (Prisma & Neon PostgreSQL)

To fully implement the backend requirements according to the prompt specifications, the following database models and schema adjustments are required:

1. **`LeaveBalance` Model:**
   - Tracks yearly allowances, used days, and remaining balances per employee per leave type per calendar year (`CASUAL`, `SICK`, `PAID`, `UNPAID`).
   - Fields: `id`, `userId`, `year`, `leaveType`, `totalDays`, `usedDays`, `pendingDays`, `remainingDays`.
   - Constraints: `@@unique([userId, year, leaveType])`.

2. **`LeaveRequest` Enhancements:**
   - Add `isHalfDay` (Boolean, default false), `halfDayType` (String: `FIRST_HALF`, `SECOND_HALF`, null).
   - Add `approvedById` (relation to User), `approvedAt` (DateTime).

3. **`SupportTicket` & `SupportTicketReply` Models:**
   - Enables complete support ticketing:
     - `SupportTicket`: `id`, `ticketNumber`, `userId`, `category`, `priority`, `subject`, `message`, `attachmentUrl`, `status` (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), `createdAt`, `updatedAt`, `resolvedAt`.
     - `SupportTicketReply`: `id`, `ticketId`, `userId`, `message`, `attachmentUrl`, `isStaffReply`, `createdAt`.

4. **`AnnouncementRead` Model:**
   - Tracks read state per user per announcement:
     - `id`, `announcementId`, `userId`, `readAt`.
     - Constraints: `@@unique([announcementId, userId])`.

5. **`DocumentAcknowledgment` Model:**
   - Records employee sign-off on mandatory corporate guidelines:
     - `id`, `documentId`, `userId`, `acknowledgedAt`.
     - Constraints: `@@unique([documentId, userId])`.

6. **Database Indexing Enhancements:**
   - `Attendance`: `@@index([userId, date])`
   - `Task`: `@@index([userId, status])`, `@@index([userId, dueDate])`
   - `WorkReport`: `@@index([userId, date])`
   - `LeaveRequest`: `@@index([userId, startDate])`

---

## 4. Next Implementation Steps (Phase 2 Roadmap)
1. **Foundation (`src/lib/api/*`):**
   - Centralize `getSessionUser(req)` and `requireEmployee(req)`.
   - Implement standardized response helpers `apiSuccess(data, meta)` and `apiError(code, message, status, fields)`.
   - Implement central error mapper translating Prisma errors (`P2002`, `P2021`, `P2022`, `P2025`) to standard 400/404/500 responses without leaking internal SQL.
   - Implement lightweight sliding-window rate limiter & double-submit idempotency cache for mutations.
2. **Database Proposal & Approval:**
   - Present migration SQL for `LeaveBalance`, `SupportTicket`, `AnnouncementRead`, `DocumentAcknowledgment`, and schema indexes to user for explicit approval.
3. **Step-by-Step Feature Implementation (0 through 12).**
4. **Automated Verification Testing:**
   - Execute test scripts covering happy path, validation errors, IDOR protection, and cross-role flows.
