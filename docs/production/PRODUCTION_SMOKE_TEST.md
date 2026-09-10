# AXIVON TECHNOLOGIES — PRODUCTION SMOKE TEST SPECIFICATION

## 1. Automated Smoke Test Executed
Execute automated smoke test script:
```bash
npx tsx scripts/production-smoke-test.ts
```

---

## 2. Test Cases Covered

| Test ID | Area | Scenario | Expected Result | Status |
|---|---|---|---|---|
| **ST-01** | Health | `GET /api/health` | Status 200, `"OK"` | `PASS` |
| **ST-02** | Readiness | `GET /api/ready` | Status 200, `"READY"` | `PASS` |
| **ST-03** | Auth | `POST /api/v1/auth/login` | Status 200, returns session cookie | `PASS` |
| **ST-04** | Attendance | Employee check-in/out & break | Calculates net minutes & status | `PASS` |
| **ST-05** | Cutoff Alert | Re-trigger 07:00 PM cutoff job | Idempotent alert dispatch (max 1 email) | `PASS` |
| **ST-06** | Security | Employee accessing Admin API | Status 403 Forbidden | `PASS` |
| **ST-07** | IDOR | Employee requesting other user data | Status 403 / Denied | `PASS` |
