# AXIVON TECHNOLOGIES — INCIDENT RESPONSE PLAN

## 1. Severity Classifications & SLAs

| Severity | Definition | SLA Response | SLA Resolution |
|---|---|---|---|
| **P0 (Critical)** | Entire application down, database inaccessible, security breach. | 15 Minutes | 2 Hours |
| **P1 (High)** | Core feature degraded (e.g. attendance engine broken, login failing). | 30 Minutes | 4 Hours |
| **P2 (Medium)** | Non-critical module issue (e.g. CRM report export failing). | 2 Hours | 24 Hours |
| **P3 (Low)** | Minor cosmetic bug, minor UI layout alignment. | 1 Business Day | Next Sprint |

---

## 2. Incident Management Workflow
```
Detection (Monitoring Alert / Bug Report)
                  |
                  v
Acknowledge & Assign Incident Commander (IC)
                  |
                  v
Containment (Rollback / Maintenance Page / Feature Toggle)
                  |
                  v
Investigation & Root Cause Analysis
                  |
                  v
Resolution & Verification via Smoke Tests
                  |
                  v
Post-Mortem & Action Items Report
```

---

## 3. Scenario Playbooks

### Scenario A: Database Unreachable
1. Check `/api/ready` response.
2. Log into Neon Cloud Console; check connection pooler status.
3. If pooler locked, restart connection pooler or update connection string.

### Scenario B: Attendance Cutoff Job Failure
1. Check `BackgroundJob` table logs for `ATTENDANCE_CUTOFF_CHECK`.
2. Inspect `EmailLog` table for delivery errors.
3. Re-trigger `/api/v1/jobs/process` manually via authorized Admin endpoint.
