# Attendance System Rules & Policy: Day Boundary & Missed Check-Out Handling

**Axivon Technologies Internal Engineering & HR Policy Standard**  
**Effective Date:** October 2026  
**Status:** Active & Implemented  

---

## 1. Executive Summary & Problem Addressed

Prior to this implementation, if an employee punched in on a work day (e.g., 9:00 AM) and departed without punching out, the system left the attendance session open. Consequently, the attendance timer accumulated 24+ hours into subsequent days, artificially inflating company worked hours, breaking daily targets, and causing false metric calculations across executive and admin reporting systems.

Under the new Day-Close engine:
1. Every open attendance session is automatically terminated at the company day boundary (midnight IST / cutoff time).
2. The session status is set to `MISSED_CHECKOUT`.
3. The check-out timestamp is **NEVER fabricated or guessed** (`checkOutAt` remains `null`).
4. Worked hours for unclosed sessions are **NOT COUNTED** (`netMinutes` = `null` / `0`) until regularized.
5. All dangling open breaks are terminated and flagged with `isAutoClosed = true`.
6. Past closed days never interfere with, merge into, or block the next day's check-in.

---

## 2. Core Operating Rules

### Rule 1: The Day Boundary & Cutoff
- **Default Cutoff:** Midnight IST (`23:59:59.999`) or the specific `cutoffTime` defined in `AttendancePolicy` (Asia/Kolkata).
- **Execution Mechanism:**
  - Automated Cron Endpoint: `GET /api/v1/cron/close-attendance` (Runs daily at 00:05 IST).
  - Lazy Evaluation Guard: At every entry to `/api/v1/employee/attendance`, `/api/v1/employee/dashboard`, `/api/v1/admin/attendance`, and `/api/v1/executive/attendance`, the system evaluates whether any open sessions exist from calendar days before `today`. If detected, they are closed immediately before rendering or processing.

### Rule 2: Strict Data Integrity (No Hallucinated Check-Outs)
- When a session is auto-closed:
  - `status`: `"MISSED_CHECKOUT"`
  - `autoClosedAt`: Current timestamp (`now()`)
  - `checkOutAt`: `null` (remains empty)
  - `grossMinutes`: `null` (or 0 for reporting aggregates)
  - `netMinutes`: `null` (or 0 for reporting aggregates)
  - `isAutoClosed`: `true` on any open break associated with the record.

### Rule 3: Zero Hour Inflation (`missedCheckoutHoursPolicy`)
- Under the `"NOT_COUNTED"` default policy:
  - Unregularized `MISSED_CHECKOUT` days count for **0 minutes** towards employee daily, weekly, or monthly completed hours.
  - They are excluded from the company's average hours per employee to avoid dragging down compliant workers while preventing unearned credit.
  - In executive metrics, workers on missed check-out days are classified as `NOT_WORKING` / `MISSED_CHECKOUT`, never as active workers.

### Rule 4: Total Separation Between Calendar Days
- An unclosed record from Day 1 never prevents an employee from checking in on Day 2.
- Day 2 check-in creates a brand new, isolated record for Day 2.
- Employees cannot retroactively punch out on a closed day; punching out when a past day is closed returns HTTP 400: `"This day was closed. Please submit a correction request."`

### Rule 5: Mid-Day Gap Logging (BUG-008 Fix)
- If an employee checks out during the day and later checks back in within the same company calendar day:
  - The elapsed time between check-out and re-check-in is logged as an off-duty gap / break (`gap_off_duty`).
  - This ensures that non-working hours between split sessions are never counted as productive work hours.

---

## 3. Employee Self-Service & Regularization Workflow

1. **Visibility:**
   - On `/employee/dashboard`: A gold warning pill highlights pending missed check-outs with a one-click "Fix" shortcut.
   - On `/employee/attendance`:
     - A top alert banner appears: *"You did not check out on [Date]. Request a correction so your hours are counted."*
     - The corresponding history row displays an amber badge: `"Check-out pending"` and note `"Check-out missed"`.
     - Worked time shows as `—`.
2. **Correction Submission:**
   - The employee clicks `"Request correction"`.
   - A modal allows the employee to propose their actual check-out time and provide an explanatory reason.
   - A `RegularizationRequest` is submitted with status `PENDING`.
3. **Approval & Recalculation:**
   - Once Admin or HR approves the request on `/admin/attendance`:
     - `checkOutAt` is updated to the verified timestamp.
     - `status` updates to `PRESENT`, `HALF_DAY`, or `LATE` (based on actual duration and policy).
     - `netMinutes` and `grossMinutes` are recalculated.
     - `regularizedAt` and `regularizedById` are stamped.

---

## 4. Admin Management & Direct Fix Privileges

1. **Dashboard & Filtering:**
   - Admin attendance overview includes a dedicated KPI card: **"Missed Check-Out"**.
   - Filter dropdown includes `MISSED_CHECKOUT` for instant auditing.
2. **Direct Fix Privilege:**
   - Admins can bypass employee submission if necessary via the **"Direct Fix"** button.
   - Admin supplies the true departure time and an audit reason (e.g., *"Employee confirmed shift end at client location via email"*).
   - An immutable `AuditLog` entry is generated logging the admin ID, previous state, new state, and rationale.

---

## 5. Summary Table of Attendance Statuses

| Status | Check-In | Check-Out | Worked Hours Counted? | Employee UI Badge | Action Allowed |
|---|---|---|---|---|---|
| `PRESENT` | Yes | Yes | Yes (Full) | Green `Present` | None needed |
| `HALF_DAY` | Yes | Yes | Yes (< target, >= 4h) | Amber `Half Day` | Correction optional |
| `LATE` | Yes (late) | Yes | Yes | Orange `Late` | Correction optional |
| `IN_PROGRESS` | Yes | No (Active today) | Live counter | Blue `Working` | Check out / Start break |
| `MISSED_CHECKOUT` | Yes | Null (Closed past day) | **No (0 hours)** | Amber `Check-out pending` | Request correction / Direct fix |
| `ABSENT` | No | No | No | Red `Absent` | Leave request |
