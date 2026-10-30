# Attendance Audit: Forgotten Check-Out & Hours Calculation Analysis

**Date:** 2026-10-30  
**Project:** Axivon Technologies  
**Focus:** Bug Investigation — Forgotten Check-Out & Stale Open Attendance Records  
**Environment:** Next.js 16 App Router, React 19, Prisma ORM 5, PostgreSQL / Neon  

---

## 1. Executive Summary

When an employee checks in (e.g., at 09:00 AM on 26 Oct), works a few hours, and leaves without checking out:
1. **The current system keeps the session open across calendar midnight.**
2. **Hours accumulate indefinitely into the next day**: live timers and calculation endpoints calculate `(now - checkInAt)` elapsed time, reporting 24+ hours of work.
3. **Lazy auto-checkout in `GET /api/v1/employee/attendance` was inventing hours**: it was computing `checkInAt + requiredDailyMinutes` (fabricating an artificial check-out time of e.g. 8 hours) rather than closing the record as `MISSED_CHECKOUT` with uncalculated/null hours.
4. **Active session prioritization was bleeding into the next day**: `records.find(r => !r.checkOutAt && !!r.checkInAt)` matched yesterday's unclosed session instead of today's record in both Employee and Executive dashboards.
5. **Next-day check-in and check-out were updating yesterday's session**: checking out on the new day would set `checkOutAt = now` on yesterday's record.

---

## 2. Current Handling of Open Records

### 2.1 Employee Attendance Route (`src/app/api/v1/employee/attendance/route.ts`)
- **Lines 38–101 (GET Lazy Auto-close):**
  - Scanned for `checkOutAt: null` with `date: { lt: todayCalendarDate }`.
  - **Flaw:** Fabricated `autoCheckOut = new Date(checkInTime.getTime() + requiredMinutes * 60000)` and set `checkOutAt: autoCheckOut` with `grossMinutes`, `netMinutes`, and `status: "INCOMPLETE"`. This invented hours that were never worked.
  - Closed open breaks with a static 30-minute duration.
- **Lines 116–122 (GET Active Session Match):**
  - `const activeSession = records.find((r) => !r.checkOutAt && !!r.checkInAt);`
  - `const todayRecord = activeSession || records.find(...);`
  - **Flaw:** Prioritized any unclosed past session over today's calendar date, causing the frontend to treat yesterday's open punch as today's active session.
- **Lines 337–365 & 470 (POST Check-In, Break, Check-Out):**
  - `activeSession` query found any record with `checkOutAt: null`.
  - `const activeTarget = activeSession || (todayRecord && !todayRecord.checkOutAt ? todayRecord : null);`
  - **Flaw:** When an employee clicked "Check Out" the next morning, `activeTarget` was yesterday's unclosed record. It updated yesterday's record with today's timestamp (`checkOutAt: now`), recording a 24+ hour session!

### 2.2 Attendance Service (`src/lib/services/attendance.service.ts`)
- **Lines 177–189 (`calculateDay`):**
  - If `checkOutAt` was null, it evaluated `now.getTime() - checkInDateObj.getTime()`.
  - Only considered unclosed if elapsed time was `> 24 hours`. If an employee checked in at 09:00 AM yesterday and checked in at 08:00 AM today (23 hours elapsed), it counted all 23 hours as active work!
  - If `> 24 hours`, it set `effectiveEnd = cappedDate` (cutoff time) or `checkInAt + requiredDailyMinutes`, still inventing hours.

### 2.3 Employee Dashboard (`src/app/api/v1/employee/dashboard/route.ts`)
- **Lines 130–166:**
  - `const activeAttendance = attendances.find((r) => !r.checkOutAt && !!r.checkInAt);`
  - `rawAttendance = activeAttendance || ...`
  - Calculated `now.getTime() - rawAttendance.checkInAt`, showing the live timer running continuously from yesterday on the dashboard attendance card.

### 2.4 Admin Attendance Route (`src/app/api/v1/admin/attendance/route.ts`)
- **Lines 294–341:**
  - In daily live monitor, query included `{ checkOutAt: null }`.
  - If an employee had a forgotten check-out from 3 days ago, `{ checkOutAt: null }` pulled that past record into today's live monitoring screen and counted them as currently working today.

### 2.5 Executive Attendance Route (`src/app/api/v1/executive/attendance/route.ts`)
- **Lines 107–113:**
  - If `!att.checkOutAt`, calculated `elapsedMs = Date.now() - att.checkInAt`, incrementing `currentlyWorking++` and adding hours across calendar boundaries.

---

## 3. Comprehensive Inventory of Where Hours Are Calculated

Every place in the codebase where worked hours / minutes are calculated:

| Location | Function / Code Block | Current Logic | Problem / Required Fix |
|:---|:---|:---|:---|
| `src/lib/services/attendance.service.ts` | `calculateDay()` (lines 170–215) | Computes grossMinutes, breakMinutes, netMinutes. If checkOutAt is null, uses `now` or caps at cutoff. | For `MISSED_CHECKOUT`, must NOT calculate worked minutes (return `null` / 0 per policy `NOT_COUNTED`). Must never calculate past midnight boundary. |
| `src/app/api/v1/employee/attendance/route.ts` | Lazy auto-close (lines 38–88) | Invented checkOutAt (`checkInAt + requiredMinutes`) and calculated full day hours. | Replace with central `closeStaleAttendance(now)`. Set `status = "MISSED_CHECKOUT"`, `autoClosedAt = now`, `checkOutAt = null`, `netMinutes = null`, `grossMinutes = null`. |
| `src/app/api/v1/employee/attendance/route.ts` | Monthly summary (lines 244–266) | Sums `r.netMinutes` into `totalWorkedMinutes`. | Must strictly exclude `MISSED_CHECKOUT` records from worked hours, average hours, and shortfall calculations. |
| `src/app/api/v1/employee/attendance/route.ts` | Action check-out (lines 581–608) | Calls `calculateDay()` with `checkOutAt: now`. | If target record is from a past calendar day, check-out must be REJECTED: *"This day was closed. Please submit a correction request."* |
| `src/app/api/v1/admin/attendance/route.ts` | Individual history stats (lines 72–128) | Accumulates `calc.netMinutes` and computes `averageWorkedMinutes`. | Exclude `MISSED_CHECKOUT` records from worked hours and averages. |
| `src/app/api/v1/admin/attendance/route.ts` | Company-wide history (lines 215–283) | Sums `calc.netMinutes` into `totalWorkedMinutes`. | Exclude `MISSED_CHECKOUT` records from totals; format status with amber badge. |
| `src/app/api/v1/admin/attendance/route.ts` | Daily monitor (lines 481–530) | Calls `calculateDay()`. If unclosed past record, counted as currently working. | Must run `closeStaleAttendance(now)` first so stale punches are not in daily live monitor. |
| `src/app/api/v1/admin/attendance/regularize/route.ts` | POST approval (lines 107–157) | Recalculates `AttendanceService.calculateDay()` from requested check-in and check-out. | Sets `checkOutAt`, `status = calc.completionStatus`, `regularizedAt = now`, `regularizedById = admin.id`. |
| `src/app/api/v1/employee/dashboard/route.ts` | Lines 138–166 | Computes live elapsed time if `!checkOutAt`. | Exclude past-day unclosed sessions. If yesterday had a missed check-out, show amber notice/badge. |
| `src/app/api/v1/executive/attendance/route.ts` | Lines 107–121 | If `!att.checkOutAt`, adds `Date.now() - att.checkInAt`. | Exclude past unclosed sessions from `currentlyWorking` and hours totals. |
| `src/app/employee/attendance/page.tsx` | Live timer tick (lines 111–124) | `Date.now() - prev.checkInAt` runs every 20s. | Must stop at company day boundary (midnight IST) and never run for past days. |

---

## 4. Screens and Reports Affected

1. **Employee Attendance (`/employee/attendance`)**:
   - Live Session Card: Shows today's punch only. If today not started, shows "Not Checked In".
   - Notice Banner: At top of page: *"You did not check out on <Date>. Request a correction so your hours are counted"* with a direct *"Request correction"* button.
   - History Table: Shows "Check-out pending" (amber badge, with check-in time and "Check-out missed"), net worked minutes as `—` (not 0, not counted).
   - Regularization Modal: Pre-fills date, check-in, and enforces valid time range.
2. **Employee Dashboard (`/employee/dashboard`)**:
   - Attendance Card: Shows today's status. If yesterday has missed check-out, displays warning pill: *"Check-out pending for <Date>"* with link to request correction.
3. **Admin Attendance Monitor & History (`/admin/attendance`)**:
   - Filter dropdown: Added *"Missed check-out"* option (`MISSED_CHECKOUT`).
   - Summary Cards: Added *"Missed Check-Out"* count card.
   - History & Live Table: Amber badge *"MISSED CHECKOUT"* / *"Check-out pending"*.
   - Direct Fix Modal: Admin can set check-out time with mandatory reason and audit log.
   - Regularization Review Queue: Approves/rejects with audit trail, updates attendance status and recalculates hours.
4. **Executive Attendance & Company Dashboard (`/executive/attendance`, `/executive/dashboard`)**:
   - Totals and KPIs: Exclude unregularized missed check-outs from total hours, average hours, and shortfall.
   - Metrics match exactly between Employee, Admin, and Executive views.

---

## 5. Central Function Architecture: `closeStaleAttendance(now)`

A centralized, idempotent, transaction-safe service in `src/lib/attendance/stale-attendance.ts`:
- **Injectable clock**: Accepts `now: Date` (defaults to `new Date()`).
- **Timezone-aware**: Uses `getCompanyTimezone()` (default `"Asia/Kolkata"`).
- **Day Boundary**: Identifies company calendar date for `now`. Any record where `date < todayCalendarDate` and `checkOutAt: null` is processed.
- **Idempotency**: Only targets records where `status != "MISSED_CHECKOUT"` and `checkOutAt: null`. Re-running does nothing to already-closed records.
- **Transaction**:
  1. Closes any open breaks on that attendance record: `endTime: autoBreakEnd`, `isAutoClosed: true`, `notes: "[Auto-closed at day boundary]"`.
  2. Updates attendance: `status: "MISSED_CHECKOUT"`, `completionStatus: "MISSED_CHECKOUT"`, `autoClosedAt: now`, `checkOutAt: null`, `grossMinutes: null`, `netMinutes: null`, `totalMinutes: null`.
  3. Dispatches high-priority in-app notification to employee: *"You forgot to check out on <date>. Request a correction so your hours are counted"*.
- **Invoked from**:
  1. Cron endpoint `/api/v1/cron/close-attendance` (protected by `CRON_SECRET`).
  2. Lazily at the start of:
     - `GET /api/v1/employee/attendance`
     - `POST /api/v1/employee/attendance` (check-in, check-out, breaks)
     - `GET /api/v1/employee/dashboard`
     - `GET /api/v1/admin/attendance`
     - `GET /api/v1/executive/attendance`
