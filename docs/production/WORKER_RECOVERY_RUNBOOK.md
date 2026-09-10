# AXIVON TECHNOLOGIES — WORKER & QUEUE RECOVERY RUNBOOK

## 1. Background Worker Architecture
Background jobs (`INACTIVE_USER_CLEANUP`, `EMAIL_RETRY`, `REMINDER_CHECK`, `ANNOUNCEMENT_PUBLISH`, `FOLLOWUP_REMINDER`, `ATTENDANCE_CUTOFF_CHECK`) are managed via `BackgroundJob` table and processed by `JobRunner.processPending()`.

---

## 2. Queue Inspection & Troubleshooting

### Inspect Failed Jobs
```sql
SELECT id, "jobType", status, attempts, error, "createdAt"
FROM "BackgroundJob"
WHERE status = 'FAILED'
ORDER BY "createdAt" DESC;
```

### Re-queue Failed Jobs Idempotently
```sql
UPDATE "BackgroundJob"
SET status = 'PENDING', attempts = 0, "scheduledAt" = NOW()
WHERE status = 'FAILED' AND "jobType" = 'ATTENDANCE_CUTOFF_CHECK';
```

---

## 3. Idempotency Safety Rules
- `ATTENDANCE_CUTOFF_CHECK`: Uses metadata idempotency key `ATTENDANCE_INCOMPLETE::{userId}::{date}` and checks `Attendance.emailAlertSent`. Will never duplicate emails even if re-triggered multiple times.
- `EMAIL_RETRY`: Checks `logId` and retry attempts limit (`maxAttempts = 3`).
