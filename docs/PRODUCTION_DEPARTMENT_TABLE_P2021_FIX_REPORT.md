# Production Database Audit & Resolution Report: Missing public.Department Table (Prisma P2021)

**Application:** AxivonTech Enterprise Platform  
**Environment:** Production (Vercel Serverless / AWS Neon Serverless PostgreSQL)  
**Date:** November 5, 2026  
**Status:** **FIXED & VERIFIED**

---

## 1. Exact Production Error

In the Vercel Runtime Logs during background scheduler executions:

```text
[Reminders] Error resolving department managers:

PrismaClientKnownRequestError:

Invalid `prisma.department.findFirst()` invocation:

The table `public.Department` does not exist
in the current database.

Error Code: P2021
Prisma Client Version: 5.22.0
Model: Department
Table: public.Department
```

---

## 2. Root Cause Analysis

1. **Model Introduced Without Migration:** On November 2, 2026 (Git commit `94ef247fa9884ad6d9e3952ce21a6a73aff6e2e6` — *"update admin portal and attendance system"*), `model Department` and `model DepartmentManager` were introduced into `prisma/schema.prisma` alongside the Department Manager portal.
2. **Missing Migration File:** The corresponding migration was never created in `prisma/migrations/`.
3. **Database Divergence:** Production had executed all 11 existing migrations through `20261023190000_add_email_change_request`. Because no migration existed for `Department`, `npx prisma migrate deploy` in the deployment pipeline never executed the DDL statements to create the `Department` and `DepartmentManager` tables.
4. **Trigger Point:** When the central scheduler executed attendance reminders past the 11:30 AM cutoff, `runAttendanceReminders` called `getDepartmentManagersForUser`, which invoked `db.department.findFirst(...)`. PostgreSQL rejected the query with error code `P2021`.

---

## 3. Production Database Identity (Sanitized)

- **Provider:** AWS Neon Serverless PostgreSQL
- **Region:** `ap-southeast-1` (AWS Asia Pacific - Singapore)
- **Host (Sanitized):** `ep-super-king-b3813msu-pooler.c-4.ap-southeast-1.aws.neon.tech` (Pooler, port 5432)
- **Direct Host (Sanitized):** `ep-super-king-b3813msu.c-4.ap-southeast-1.aws.neon.tech` (Direct, port 5432)
- **Database Name:** `neondb`
- **Schema:** `public`
- **SSL Mode:** `require`
- **Pooler Parameters:** `connect_timeout=30&pool_timeout=30`

---

## 4. Prisma Model Audit

The models defined in `prisma/schema.prisma` lines 21–56:

```prisma
model Department {
  id          String   @id @default(cuid())
  name        String   @unique
  code        String   @unique
  description String?
  status      String   @default("ACTIVE") // ACTIVE, INACTIVE

  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)

  managerId   String?
  manager     User?    @relation("DepartmentPrimaryManager", fields: [managerId], references: [id], onDelete: SetNull)

  managers    DepartmentManager[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status])
  @@index([managerId])
  @@index([organizationId])
}

model DepartmentManager {
  id           String     @id @default(cuid())
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  isPrimary    Boolean    @default(false)
  assignedAt   DateTime   @default(now())

  @@unique([departmentId, userId])
  @@index([userId])
  @@index([departmentId])
}
```

Relationship links in `User`:
- `managedDepartments`: `Department[] @relation("DepartmentPrimaryManager")`
- `departmentManagerAssignments`: `DepartmentManager[]`
- `department`: `String?` (scalar field on User storing the employee's assigned department name/code)

---

## 5. Migration History Audit

Querying `_prisma_migrations` on the production database confirmed:

| Order | Migration Name | Applied At | Status |
|---|---|---|---|
| 1 | `20260902182239_init` | 2026-09-02 | APPLIED |
| 2 | `20260902190443_phase3_admin` | 2026-09-02 | APPLIED |
| 3 | `20260903042435_phase4_executive` | 2026-09-03 | APPLIED |
| 4 | `20260903055124_phase6_shared_system` | 2026-09-03 | APPLIED |
| 5 | `20261016000000_add_login_page_posters` | 2026-10-16 | APPLIED |
| 6 | `20261016143000_add_dynamic_careers` | 2026-10-16 | APPLIED |
| 7 | `20261017000000_add_calendar_and_holidays_system` | 2026-10-24 | APPLIED |
| 8 | `20261017120000_add_website_content_management` | 2026-10-24 | APPLIED |
| 9 | `20261019000000_add_legal_and_privacy_models` | 2026-10-24 | APPLIED |
| 10 | `20261021190000_payout_and_direct_project` | 2026-10-24 | APPLIED |
| 11 | `20261023190000_add_email_change_request` | 2026-10-24 | APPLIED |
| **12** | **`20261102000000_add_department_and_manager_models`** | **2026-11-05 08:45:41 UTC** | **APPLIED & VERIFIED** |

---

## 6. Generated & Applied Migration SQL

Created migration file `prisma/migrations/20261102000000_add_department_and_manager_models/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "organizationId" TEXT,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentManager" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepartmentManager_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "Department_status_idx" ON "Department"("status");

-- CreateIndex
CREATE INDEX "Department_managerId_idx" ON "Department"("managerId");

-- CreateIndex
CREATE INDEX "Department_organizationId_idx" ON "Department"("organizationId");

-- CreateIndex
CREATE INDEX "DepartmentManager_userId_idx" ON "DepartmentManager"("userId");

-- CreateIndex
CREATE INDEX "DepartmentManager_departmentId_idx" ON "DepartmentManager"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentManager_departmentId_userId_key" ON "DepartmentManager"("departmentId", "userId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentManager" ADD CONSTRAINT "DepartmentManager_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentManager" ADD CONSTRAINT "DepartmentManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## 7. Database Schema Changes & Safety Audit

- **Tables Created:** `Department`, `DepartmentManager`.
- **Existing Tables Modified:** None.
- **Columns Altered / Dropped:** None (0 drop operations).
- **Data Loss Risk:** **ZERO (0%)**.
- **Existing Users & Employees:** All 27 existing users, roles, and department assignments in `User.department` remain 100% untouched.

---

## 8. Migration Execution & Verification

Migration was executed using standard Prisma production workflow:

```bash
npx prisma migrate deploy
```

Execution output:
```text
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-super-king-b3813msu-pooler.c-4.ap-southeast-1.aws.neon.tech"

12 migrations found in prisma/migrations
Applying migration `20261102000000_add_department_and_manager_models`
The following migration(s) have been applied:
migrations/
  └─ 20261102000000_add_department_and_manager_models/
    └─ migration.sql

All migrations have been successfully applied.
```

Direct live query verification via `@prisma/client`:
- `db.department.findFirst()` -> returned `null` (success, no error).
- `db.departmentManager.findMany()` -> returned `[]` (success, no error).
- `db.department.count()` -> returned `0` (success, no error).
- **Error `P2021` is completely eliminated.**

---

## 9. Department Data Relationship Verification

Verified across all 27 user records in the production database:
- **Design Department Employees:** Resolved successfully.
- **Engineering Department Employees:** Resolved successfully.
- **Fallback Behavior:** Because no managers have been manually assigned to the newly created empty department table yet, `getDepartmentManagersForUser` successfully falls back to active platform administrators/founders (`Tech Co-Founder`, `Ops Co-Founder`, `VIKASH KUMAR | FOUNDER & CEO`, and `Admin Profile`).
- **Data Isolation:** Managers only manage their own department; employee records remain private.

---

## 10. Reminder Service Enhancements (`src/lib/notifications/reminders.ts`)

1. **Whitespace & Case-Insensitive Matching:** Department query now trims whitespace and uses `mode: "insensitive"` matching for `name` and `code`.
2. **Defensive Error Fallback:** If any database glitch occurs during department query, `getDepartmentManagersForUser` catches the exception and immediately falls back to active platform administrators so no reminder notifications are lost.

---

## 11. Scheduler Error Reporting Enhancements (`src/lib/scheduler/central-scheduler.ts` & API)

1. **Explicit Status Classification:** Central scheduler now classifies every execution into:
   - `SUCCESS`: All jobs ran with 0 errors.
   - `PARTIAL`: Some operations ran, but one or more sub-jobs recorded errors.
   - `FAILED`: All attempted background jobs encountered critical failure.
   - `LOCKED`: Skipped due to an active concurrency lock.
2. **Transparent Error Telemetry:** When errors occur in sub-jobs, they are surfaced in `result.errors` (sanitized, max 5 entries) in the API response.
3. **HTTP Status Code Alignment:**
   - Returns **HTTP 200** with detailed execution breakdown for `SUCCESS`, `PARTIAL`, or `LOCKED`.
   - Returns **HTTP 500** if `status === "FAILED"`, allowing external monitoring (cron-job.org) to trigger alert webhooks.

---

## 12. Actual Scheduler Dry-Run Results

Tested against the live production database:

```json
{
  "success": true,
  "status": "SUCCESS",
  "dryRun": true,
  "processed": 8,
  "sent": 13,
  "skipped": 25,
  "failed": 0,
  "durationMs": 7708,
  "details": {
    "attendance": {
      "executed": true,
      "time": "14:51",
      "employeesEvaluated": 6,
      "checkInRemindersSent": 0,
      "managerAlertsSent": 12,
      "exemptedOnLeave": 0,
      "alreadyCheckedIn": 3,
      "dryRun": true
    },
    "workReports": {
      "executed": true,
      "time": "14:51",
      "employeesEvaluated": 6,
      "regularRemindersSent": 0,
      "overdueAlertsSent": 0,
      "alreadySubmitted": 0,
      "exemptedOnLeave": 0,
      "dryRun": true
    },
    "tasks": {
      "executed": true,
      "tasksEvaluated": 1,
      "dueTomorrowSent": 0,
      "dueTodaySent": 0,
      "overdueSent": 1,
      "dryRun": true
    },
    "approvals": {
      "executed": true,
      "approvalsEvaluated": 0,
      "remindersSent": 0,
      "dryRun": true
    },
    "backgroundJobs": {
      "pendingCount": 19,
      "dryRun": true
    },
    "staleAttendance": {
      "success": true,
      "closedCount": 0,
      "updatedRecordIds": [],
      "timestamp": "2026-11-05T09:21:15.864Z"
    }
  }
}
```

- **Execution Duration:** **7.71 seconds** (well within the 30-second cron-job.org timeout).
- **Manager Alerts Sent:** **12** (cleanly resolved without `P2021`).
- **Failures:** **0**.

---

## 13. Test Results Summary

| Test Suite | Result |
|---|---|
| `tests/external-scheduler.test.ts` | **11 / 11 Passed** |
| `tests/department-manager-portal.test.ts` | **20 / 20 Passed** |
| `tests/smart-notification-system.test.ts` | **24 / 24 Passed** |
| `tests/app-website-separation.test.ts` | **15 / 15 Passed** |
| `tests/mobile-backend-integration.test.ts` | **21 / 21 Passed** |
| `tests/mobile-transformation-verification.test.ts` | **6 / 6 Passed** |
| `tests/mobile-login-captcha-bypass.test.ts` | **2 / 2 Passed** |
| **Prisma Schema Validation** | `npx prisma validate` **Valid 🚀** |
| **Prisma Migration Status** | `12 migrations found, up to date` |
| **TypeScript Typecheck** | `npx tsc --noEmit` **0 errors** |
| **Next.js Production Build** | **475 / 475 pages generated successfully** |

---

## 14. Verification Status

| Item | Classification | Description |
|---|---|---|
| Missing `public.Department` table | **FIXED** | Migration `20261102000000_add_department_and_manager_models` applied to production Neon DB. |
| Missing `public.DepartmentManager` table | **FIXED** | Table created with cascade constraints and composite uniqueness. |
| Production Error `P2021` | **FIXED** | Queries to `db.department.findFirst` execute successfully. |
| Attendance reminder manager resolution | **VERIFIED** | Successfully resolves managers with fallback to platform admins. |
| Scheduler Error Reporting | **FIXED** | Sub-job telemetry, status classification (`SUCCESS`/`PARTIAL`/`FAILED`), and HTTP status alignment. |
| Scheduler Performance | **VERIFIED** | Full dry-run execution completes in 7.7s (< 30s timeout). |
| Production Data Safety | **VERIFIED** | 100% of existing user, employee, and portal records preserved intact. |
| Next.js Build & Compilation | **VERIFIED** | Zero TypeScript errors, Turbopack build succeeded. |

---

## 15. Next Steps for Administrator

1. Commit and push the new migration file (`prisma/migrations/20261102000000_add_department_and_manager_models/migration.sql`) to GitHub so future CI/CD and branch deployments remain in sync.
2. In the Admin Portal (`/admin/departments`), administrators can now create official department entries (e.g. Engineering, Design, Operations) and optionally assign Department Managers. If unassigned, the platform will continue to deliver managerial notifications to company administrators and founders.
