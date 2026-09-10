# AXIVON TECHNOLOGIES — PRODUCTION MONITORING & OBSERVABILITY SPECIFICATION

## 1. Health & Readiness Observability Endpoints
- `/api/health`: Returns HTTP 200 with process uptime, memory RSS/heap, Node version, environment.
- `/api/ready`: Returns HTTP 200 (`READY`) when PostgreSQL database query succeeds; returns HTTP 503 (`NOT_READY`) if database is unreachable.

---

## 2. Key Metrics Monitored
1. **HTTP Request Latency**: $p_{50} < 100\text{ms}$, $p_{99} < 500\text{ms}$.
2. **HTTP Error Rate**: Alert when 5xx status codes exceed 1% over 5 minutes.
3. **Database Connectivity**: Alert when `/api/ready` fails for 2 consecutive checks.
4. **Attendance Cutoff Job**: Alert if `ATTENDANCE_CUTOFF_CHECK` status is `FAILED`.
5. **Email Failure Rate**: Alert if `EmailLog` failure rate exceeds 5% in 1 hour.

---

## 3. Log Aggregation
Logs emitted in structured JSON format via `Logger` (`src/lib/logger.ts`) with redacted sensitive fields. Suitable for Datadog, AWS CloudWatch, or Grafana Loki ingestion.
