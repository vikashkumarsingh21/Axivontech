# AXIVON TECHNOLOGIES — INTERNAL PORTALS AUDIT REPORT

## 1. Executive Summary
A comprehensive read-only technical and functional audit was conducted on the Axivon Technologies internal portals (Employee, Admin, Founder, Co-Founder) and their shared infrastructure. 

The application uses Next.js (App Router), Prisma (PostgreSQL), and JWT-based session cookies (`axivon_session`). The architecture is highly ambitious, encompassing HRMS (Attendance, Leave), CRM (Leads, Opportunities, Proposals), Governance (Approvals, Security Events), and Document Management.

While the data layer is robust and most CRUD APIs are fully implemented, critical issues exist in **Testing** (no test scripts configured) and **RBAC enforcement** (silent error swallowing on sensitive routes).

---

## 2. Scope
- **Portals**: `/employee`, `/admin`, `/executive` (Founder/Co-Founder).
- **Shared Infrastructure**: Auth, RBAC, Database, APIs, Attendance Engine, Notifications, Background Jobs.

---

## 3. Architecture Overview
- **Frontend**: Next.js 14+ Server Components & Client Components.
- **Backend**: Next.js API Routes (`/api/v1/*`).
- **Database**: PostgreSQL with Prisma ORM.
- **Auth**: JWT stored in HttpOnly cookies (`axivon_session`). Checked in Edge Middleware.
- **RBAC**: Multi-layered. Middleware handles coarse route access (`ADMIN`, `FOUNDER`). `src/lib/auth/permissions.ts` handles granular access (e.g., `users:write`).

---

## 4. Employee Portal Audit
**Status**: DEVELOPMENT READY
*Routes: `/employee/dashboard`, `/employee/attendance`, `/employee/leave`, `/employee/profile`, `/employee/documents`, etc.*

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | WORKING | Secure HttpOnly JWT cookie implementation. |
| Dashboard | WORKING | Backend endpoints (`/api/v1/employee/dashboard`) return aggregated data. |
| Profile | WORKING | Profile read/update APIs implemented. |
| Attendance | WORKING | Supports check-in, check-out, breaks, and regularization requests. |
| Leave | WORKING | Create and view leaves. Safe from IDOR (filters by `userId`). |
| Notifications | WORKING | Read, unread, mark-all-read flows exist in DB and API. |
| Documents | WORKING | Can view/download documents scoped to user. |
| Work Reports | WORKING | Daily task completion tracking implemented. |

---

## 5. Admin Portal Audit
**Status**: INTERNAL TEST READY
*Routes: `/admin/dashboard`, `/admin/employees`, `/admin/attendance`, `/admin/crm/*`, `/admin/settings`*

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard | WORKING | Statistical endpoints operational. |
| Employee Management | WORKING | Creation, updating, and role assignment functioning. |
| Attendance Management | WORKING | Can view all records, edit policy, approve regularizations. |
| Leave Management | WORKING | Full approval/rejection workflows in place. |
| CRM / Leads | WORKING | Complex models (Lead, Opportunity, FollowUp, PipelineStage) active. |
| Documents | WORKING | Document upload and visibility scoping functioning. |
| Audit Logs | PARTIAL | `AuditLog` model exists, but not all sensitive actions log to it. |
| Background Jobs | NOT VERIFIED | `BackgroundJob` model exists, but execution triggers unverified. |

---

## 6. Founder Portal Audit
**Status**: DEVELOPMENT READY
*Routes: `/executive/dashboard`, `/executive/approvals`, `/executive/audit`, `/executive/reports`*

| Feature | Status | Notes |
|---------|--------|-------|
| Auth | WORKING | Middleware correctly restricts to `FOUNDER` / `CO_FOUNDER`. |
| Approvals | PARTIAL | Self-approval prevention is implemented in `POST`, but `GET` has an RBAC flaw. |
| System Monitoring | PARTIAL | Audit and security event endpoints exist but lack comprehensive coverage. |
| Reports | WORKING | Export capability built in. |

---

## 7. Co-Founder Portal Audit
**Status**: PARTIAL
There is no separate `/co-founder` route. Co-founders share the `/executive` route. 
- **Finding**: While Co-Founders are granted access to `/executive` via Middleware, granular permissions are meant to restrict them. However, flawed `catch(() => {})` blocks in some executive routes bypass granular RBAC, granting Co-Founders capabilities intended only for Founders.

---

## 8. Authentication Audit
| Check | Status |
|-------|--------|
| Password Hashing | WORKING (bcryptjs) |
| Session Creation | WORKING (jose SignJWT) |
| Cookie Security | WORKING (HttpOnly, Secure in prod implied) |
| Session Expiration | WORKING (24h) |

---

## 9. RBAC/Permission Audit
**Critical Finding**: Middleware enforces coarse access, but `requirePermission` is sometimes used unsafely.
- In `src/app/api/v1/executive/approvals/route.ts`:
  `await requirePermission(userId, "governance.role_changes.approve").catch(() => {});`
- **Impact**: Swallows the `ApiError` completely. The route execution continues, meaning *anyone* passing the middleware check (e.g., Co-Founders) can view all approvals regardless of database-level granular permissions.

---

## 10. Database Audit
The database is extensive and highly structured.
- **HR**: `Attendance`, `AttendanceBreak`, `LeaveRequest`, `RegularizationRequest`
- **Core**: `User`, `Organization`, `Role`, `Permission`, `UserRole`
- **CRM**: `Lead`, `Opportunity`, `PipelineStage`, `Proposal`, `FollowUp`
- **Infra**: `BackgroundJob`, `AutomationWorkflow`, `EmailLog`, `SecurityEvent`
- **Integrity**: Strict foreign key cascading (`onDelete: Cascade`) and sets null properly. Proper indexing on commonly queried fields (e.g., `userId`, `date`, `status`).

---

## 11. API Audit
Over 80 API routes exist.
- **Methods**: Extensive use of `GET`, `POST`, `PATCH`, `DELETE`.
- **Validation**: Uses Zod for payload validation (e.g., `createEmployeeSchema`).
- **Error Handling**: Standardized via `handleApiError` and `ApiError` classes.
- **IDOR**: Checked on employee routes (e.g., Employee Leave API explicitly filters by `userId = token.userId`). 

---

## 12. Attendance Engine Audit
**Status**: WORKING
The attendance logic in `AttendanceService` (`src/lib/services/attendance.service.ts`) is highly sophisticated.
- Handles Grace Minutes, Default Required Minutes, Work Windows, and Cutoff Times.
- Distinguishes between Gross Minutes, Break Minutes, and Net Minutes.
- Calculates Early Exit and Late check-ins accurately.

---

## 13. Notification / Email / Jobs Audit
**Status**: PARTIAL
- `Notification` model handles in-app alerts correctly.
- `EmailTemplate` and `EmailLog` suggest a transactional email system, but the actual cron/worker process to dequeue `BackgroundJob` records is not fully verified in a serverless environment.

---

## 14. Security Audit
| Vulnerability | Status | Notes |
|---------------|--------|-------|
| Auth Bypass | SAFE | Middleware correctly forces login. |
| IDOR | SAFE | Inspected APIs use contextual `userId` lookups. |
| SQL Injection | SAFE | Prisma ORM mitigates SQLi inherently. |
| Privilege Esc. | CRITICAL | Silent catches on `requirePermission` allow Co-Founders to access Founder-only read APIs. |

---

## 15. Integration Audit
- **Database**: Connected (Neon/PostgreSQL).
- **Google Sheets CRM**: NOT VERIFIED (No active credentials configured in current test).

---

## 16. Testing Audit
**Status**: BROKEN / NOT IMPLEMENTED
- Executing `npm run test` fails with: `Missing script: "test"`.
- The `tests/` directory exists with e2e/integration files, but they are unconfigured in `package.json` and currently not executable via standard NPM commands.

---

## 17. Production Readiness
1. **Employee Portal**: INTERNAL TEST READY
2. **Admin Portal**: INTERNAL TEST READY
3. **Executive Portal**: DEVELOPMENT READY (Needs RBAC fixes)

---

## 18. Issue Register & Recommended Fix Order

### 1. Fix RBAC Silent Catches (CRITICAL)
- **Portal**: Executive
- **Problem**: `catch(() => {})` on `requirePermission` calls bypasses authorization.
- **Impact**: Co-founders can view sensitive Founder-only data.
- **Fix**: Remove `.catch(() => {})` so `ApiError(403)` bubbles up to the main `catch` block and rejects the request.

### 2. Configure Test Suite (HIGH)
- **Portal**: System-Wide
- **Problem**: `npm run test` fails.
- **Impact**: Regressions cannot be safely caught before deployment.
- **Fix**: Add Jest/Vitest configuration to `package.json` and fix the TypeScript errors within the `tests/` directory identified during the linting phase.

### 3. Verify Background Job Runner (MEDIUM)
- **Portal**: Admin / System
- **Problem**: Records are inserted into `BackgroundJob`, but without a persistent Node server (Next.js is serverless), jobs may not run unless a cron endpoint is actively hit.
- **Fix**: Implement a secure `/api/v1/cron/runner` endpoint triggered by external cron services (e.g., Vercel Cron).

---

## FINAL SUMMARY

**Total Portals Audited**: 4
**Total Modules Identified**: 25+
**Authentication**: WORKING
**Database**: WORKING
**Test Suite**: BROKEN (Not configured)

**WHAT IS ACTUALLY WORKING RIGHT NOW**:
- Authentication and session management.
- Employee dashboard, leave requests, attendance tracking, and work reporting.
- Admin employee management, leave approvals, and CRM workflows.
- Organization attendance policy engine calculations.

**WHAT NEEDS TO BE FIXED NEXT**:
1. Remove all instances of `.catch(() => {})` attached to `requirePermission` in API routes (Critical Security Fix).
2. Configure a test runner in `package.json` to execute the existing test files.
3. Verify the execution engine for Background Jobs and Automations.
