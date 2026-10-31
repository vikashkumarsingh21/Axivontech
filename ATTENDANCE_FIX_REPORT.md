# Attendance Fix Report: Forgotten Check-Out Resolution

**Status:** Complete & Verified  
**Branch:** `forgotten-checkout-fix`  
**Test Suite:** `tests/forgotten-checkout.test.ts` (7 passing unit tests)  

---

## 1. Issue Overview
When an employee checked in on a calendar day (e.g., Oct 26 at 9:00 AM) and forgot to check out, the attendance record was never closed. The system treated the record as permanently open, allowing the duration timer to run continuously past midnight and into subsequent days, corrupting work metrics and causing inaccurate hours reporting.

## 2. Root Cause Analysis
1. Absence of an automated day boundary auto-closing service to transition past open sessions to `MISSED_CHECKOUT`.
2. Lack of lazy fallback evaluation on API endpoints (if cron did not execute, the record remained open indefinitely).
3. The check-out endpoint allowed check-outs across calendar days instead of requiring a regularization request.
4. Breaks opened during an unclosed session remained in an open state forever.

---

## 3. Implemented Solution

### A. Core Engine (`src/lib/attendance/stale-attendance.ts`)
- Implemented `closeStaleAttendance(referenceDate)`:
  - Finds all records where `checkOutAt` is null and `date < startOfCompanyDay(referenceDate)`.
  - Automatically updates records in an isolated transaction to:
    - `status = "MISSED_CHECKOUT"`
    - `autoClosedAt = now`
    - `grossMinutes = null`, `netMinutes = null`
  - Closes any dangling breaks on that record with `isAutoClosed = true`.
  - Sends an in-app notification to the employee prompting them to submit a correction request, deduplicated by key.

### B. Daily Cron & Lazy Auto-Closing
- **Cron Route:** `src/app/api/v1/cron/close-attendance/route.ts` runs securely with `CRON_SECRET` header or Bearer authorization.
- **Lazy Evaluation:** Invoked at the entry of:
  - `src/app/api/v1/employee/attendance/route.ts`
  - `src/app/api/v1/employee/dashboard/route.ts`
  - `src/app/api/v1/admin/attendance/route.ts`
  - `src/app/api/v1/executive/attendance/route.ts`

### C. Split Sessions & Off-Duty Gap (BUG-008 Fix)
- In `src/app/api/v1/employee/attendance/route.ts`:
  - When an employee re-checks in on the same calendar day after a prior check-out, the elapsed duration between check-out and re-check-in is logged as an off-duty break (`gap_off_duty`).
  - Past days are prevented from being checked out directly; returns 400 prompting the regularization flow.

### D. Admin Direct Fix & KPI Auditing
- In `src/app/api/v1/admin/attendance/route.ts`:
  - Added support for `action: "DIRECT_FIX"` with parameters `attendanceId`, `checkOutAt`, and `reason`.
  - Updates the record, recalculates hours, marks `regularizedAt`, and records an entry in `AuditLog`.
  - Added `missedCheckouts` metric to the admin summary.

### E. Frontend UI Enhancements
- **Employee Portal (`src/app/employee/attendance/page.tsx`):**
  - Added top alert banner for pending missed check-outs.
  - History table shows amber badge `Check-out pending`, subtitle `Check-out missed`, and worked hours `—`.
  - Modal to request check-out time regularization.
- **Employee Dashboard (`src/app/employee/dashboard/page.tsx`):**
  - Added alert pill linking to attendance page when missed check-outs exist.
- **Admin Portal (`src/app/admin/attendance/page.tsx`):**
  - Summary row features "Missed Check-Out" KPI card.
  - Status filter dropdown supports `MISSED_CHECKOUT`.
  - Direct Fix modal allows admins to set the actual check-out time with an administrative note.

---

## 4. Test Verification
The test suite `tests/forgotten-checkout.test.ts` passed 100%:
1. `closes open past-day attendance record as MISSED_CHECKOUT with null worked minutes` - PASSED
2. `is strictly idempotent: running closeStaleAttendance twice leaves record untouched` - PASSED
3. `closes and flags dangling open breaks at day end` - PASSED
4. `new day check-in creates independent session without merging or reopening past day` - PASSED
5. `re-check-in on same day logs off-duty gap as a break to prevent hour inflation` - PASSED
6. `returns null / 0 hours for MISSED_CHECKOUT days per NOT_COUNTED policy` - PASSED
7. `approving regularization sets checkOutAt, recalculates worked minutes, and updates status` - PASSED

---

## 5. Backfill Migration Script
- Created `scripts/backfill-missed-checkouts.ts`.
- Dry-run successfully identified 4 historical open records in the Neon database:
  - `admin@axivon.dev` (2026-10-23)
  - `Aditya Ajay Singh` (2026-10-24)
  - `Vikash Kumar` (2026-10-25)
  - `Mohan Deepak` (2026-10-26)
- Ready for execution with `--execute` upon request.
