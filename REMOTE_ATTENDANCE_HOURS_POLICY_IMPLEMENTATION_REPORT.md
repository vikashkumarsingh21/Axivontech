# AXIVON TECHNOLOGIES — REMOTE ATTENDANCE & WORK HOURS POLICY SYSTEM
## PRODUCTION IMPLEMENTATION & AUDIT REPORT

**Date:** September 2026  
**Status:** COMPLETED & PRODUCTION-READY  
**Engine:** Axivon Unified Attendance Engine v2.0  

---

## 1. Executive Overview

Axivon Technologies internal attendance and remote workforce management system has been successfully enhanced with:
1. **Company Work Window (08:00 AM → 07:00 PM)**: Clear operational availability window within which remote employees check in, record sessions, and complete their work.
2. **Dynamic Required Working Hours**: Admin-configurable required daily work duration per employee (e.g., 8 hours / 480 mins, 6 hours / 360 mins).
3. **Deterministic Net Time Calculation**: `Net Work Time = Gross Duration - Unpaid Breaks`.
4. **Completion Classification**:
   - `COMPLETE`: Net Work Time $\ge$ Required Daily Target.
   - `INCOMPLETE`: Net Work Time < Required Daily Target.
   - `HALF_DAY`: Net Work Time $\ge 50\%$ but $< 100\%$ of target.
   - `ON_LEAVE`, `HOLIDAY`, `WEEKLY_OFF`: Non-working exemptions.
5. **Automated End-of-Day Cutoff Incomplete Alert**:
   - Evaluated at 07:00 PM company window end.
   - Dispatches a professional, factual HTML email notice to the employee's registered account email.
   - Idempotent deduplication key (`ATTENDANCE_INCOMPLETE::{userId}::{date}`) guarantees maximum 1 email per employee per calendar day.
6. **Breaks & Regularization Management**:
   - Granular break recording (Lunch, Tea, Personal, Short break).
   - Employee regularization submission workflow with Admin review, approval, and atomic attendance recalculation.

---

## 2. Core Architecture & Database Models

### Database Additions (`prisma/schema.prisma`):
- **`Attendance`**:
  - `grossMinutes`, `breakMinutes`, `netMinutes`, `remainingMinutes`, `lateMinutes`, `earlyExitMinutes`, `isLate`, `isEarlyExit`, `completionStatus`, `emailAlertSent`.
- **`AttendanceBreak`**:
  - `id`, `attendanceId`, `startTime`, `endTime`, `durationMinutes`, `type`, `notes`.
- **`AttendancePolicy`**:
  - `workWindowStart` (`"08:00"`), `workWindowEnd` (`"19:00"`), `defaultRequiredMinutes` (`480`), `graceMinutes` (`15`), `cutoffTime` (`"19:00"`), `weeklyOffDays`, `enableIncompleteAlerts`.
- **`RegularizationRequest`**:
  - `id`, `userId`, `date`, `requestedCheckIn`, `requestedCheckOut`, `requestedBreaks`, `reason`, `status`, `reviewedById`, `reviewNotes`.
- **`Holiday`**:
  - `id`, `name`, `date`, `isOptional`, `description`.

---

## 3. Endpoints Implemented

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/employee/attendance` | Returns today's company window, live break status, net minutes, and 60-day history |
| `POST` | `/api/v1/employee/attendance` | Handles `check-in`, `check-out`, `break-start`, `break-end` with instant recalculation |
| `GET` | `/api/v1/employee/attendance/regularize` | List employee's past regularization requests |
| `POST` | `/api/v1/employee/attendance/regularize` | Submit attendance regularization with date, times, and reason |
| `GET` | `/api/v1/admin/attendance` | Company-wide live attendance monitor with gross, break, net, target, shortfall, and alert statuses |
| `POST` | `/api/v1/admin/attendance` | Admin manual punch entry / correction |
| `GET/PATCH` | `/api/v1/admin/attendance/policies` | Configure company attendance window, grace time, and alert flags |
| `GET/POST` | `/api/v1/admin/attendance/regularize` | Review, approve, and reject regularization requests with atomic database recalculation |

---

## 4. Incomplete Hours Email Notification

- **Template Key**: `ATTENDANCE_INCOMPLETE_ALERT`
- **Trigger**: 07:00 PM company window cutoff via `JobRunner` (`ATTENDANCE_CUTOFF_CHECK`) or manual admin trigger.
- **Fields Delivered**:
  - Employee Name & ID
  - Date of record
  - Official Company Window (`08:00 AM - 07:00 PM`)
  - Required Hours Target
  - Net Worked Hours
  - Break Duration
  - Shortfall Duration
  - Check-in & Check-out timestamps
  - Attendance Status
  - Regularization instructions
