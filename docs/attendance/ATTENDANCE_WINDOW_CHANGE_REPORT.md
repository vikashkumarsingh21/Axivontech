# Axivon Technologies — Attendance Window Change Report

## Date: 2026-09-12

## Change Summary

| Parameter | Before | After |
|---|---|---|
| Work Window Start | 08:00 AM | **06:00 AM** |
| Work Window End | 07:00 PM (19:00) | **11:00 PM (23:00)** |
| Cutoff Time | 07:00 PM (19:00) | **11:00 PM (23:00)** |
| Required Working Hours | 8 hours (480 minutes) | **8 hours (480 minutes) — UNCHANGED** |

## What Was Audited

Searched the entire `src/` directory for all occurrences of:
- `08:00` → **Found 10 occurrences** → All updated to `06:00`
- `19:00` → **Found 11 occurrences** → All updated to `23:00`
- `07:00 PM` → **Found 5 occurrences** → All updated to `11:00 PM`
- `08:00 AM` → **Found 4 occurrences** → All updated to `06:00 AM`

**Post-change verification**: Zero remaining occurrences of `08:00`, `19:00`, or `07:00 PM` in `src/`.

## Files Modified

### 1. `src/lib/services/attendance.service.ts` (Core Business Logic)
- Interface comments: `"08:00"` → `"06:00"`, `"19:00"` → `"23:00"`
- `DEFAULT_ATTENDANCE_POLICY.workWindowStart`: `"08:00"` → `"06:00"`
- `DEFAULT_ATTENDANCE_POLICY.workWindowEnd`: `"19:00"` → `"23:00"`
- `DEFAULT_ATTENDANCE_POLICY.cutoffTime`: `"19:00"` → `"23:00"`
- Late calculation comment: `"08:00 AM"` → `"06:00 AM"`
- Cutoff JSDoc comment: `"07:00 PM"` → `"11:00 PM"`

### 2. `src/app/admin/attendance/page.tsx` (Admin UI)
- Policy form default state: `workWindowStart: "08:00"` → `"06:00"`, `workWindowEnd: "19:00"` → `"23:00"`, `cutoffTime: "19:00"` → `"23:00"`
- `setPolicyForm` fetch fallback defaults: same updates
- Header description: `"08:00 AM"` → `"06:00 AM"`, `"07:00 PM"` → `"11:00 PM"`
- Form labels: `"Default: 08:00 AM"` → `"Default: 06:00 AM"`, `"Default: 07:00 PM"` → `"Default: 11:00 PM"`
- Input placeholders: `"08:00"` → `"06:00"`, `"19:00"` → `"23:00"`
- Cutoff checkbox label: `"07:00 PM"` → `"11:00 PM"`

### 3. `src/app/employee/attendance/page.tsx` (Employee UI)
- Work window display: `"08:00 AM"` → `"06:00 AM"`, `"07:00 PM"` → `"11:00 PM"`
- Cutoff display: `"07:00 PM"` → `"11:00 PM"`

### 4. `src/app/api/v1/admin/attendance/policies/route.ts` (API)
- Policy creation fallback: `"08:00"` → `"06:00"`, `"19:00"` → `"23:00"` (two occurrences)

## What Was Intentionally Left Unchanged

- **Required working hours**: Still 480 minutes (8 hours). Only the window changed, not the requirement.
- **Grace period**: Still 15 minutes.
- **Break calculation logic**: Unchanged — breaks are subtracted from gross time.
- **Late/early calculation logic**: Unchanged — lateness is calculated against window start + grace.
- **Leave/holiday/weekly-off exemptions**: Unchanged.
- **Regularization logic**: Unchanged.
- **Existing database records**: No database migration or reset performed.

## Tests

### Attendance-specific tests (10 tests)

| Test | Result |
|---|---|
| Session duration calculation | ✅ PASS |
| 05:59 AM punch (before window) | ✅ PASS |
| 06:00 AM punch (exact start) | ✅ PASS |
| 06:01 AM punch (within grace) | ✅ PASS |
| Normal attendance with breaks | ✅ PASS |
| 10:59 PM activity | ✅ PASS |
| 11:00 PM cutoff | ✅ PASS |
| After-window behavior | ✅ PASS |
| Leave/holiday/weekly off exemptions | ✅ PASS |
| Early exit calculation | ✅ PASS |

**File**: `tests/attendance-work-hours.test.ts`

### Full test suite
- `npx vitest run` → **62 tests passed, 0 failed**

### Production build
- `npm run build` → **✅ Compiled successfully, 135/135 pages generated**
