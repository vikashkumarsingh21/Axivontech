# AXIVON TECHNOLOGIES — PRODUCTION ARCHITECTURE SPECIFICATION

## 1. System Overview & Monolithic Design Choice
Axivon Technologies internal business management platform is architected as a high-efficiency Next.js 16 (Turbopack) unified web & API monolith.

```
+-------------------------------------------------------------------------+
|                              INTERNET                                   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                  Edge CDN / DNS / TLS Termination                       |
|           (Cloudflare / Vercel Edge / AWS CloudFront + ACM)            |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|              Web & API Application (Next.js 16 Monolith)                |
|  - React 19 Frontend (Public, Employee, Admin, Executive, CRM)          |
|  - Server-side Middleware Authentication (JWT Cookie Verification)       |
|  - Unified REST API Endpoints (/api/v1/*)                               |
+-------------------------------------------------------------------------+
                  |                                     |
                  v                                     v
+-----------------------------------+   +---------------------------------+
| Managed PostgreSQL (Neon Cloud)   |   | Background Job & Event Bus      |
| - Connection Pooling (pgBouncer)  |   | - JobRunner Engine              |
| - Daily PITR Backups & SSL        |   | - Attendance Cutoff Reconciliation|
+-----------------------------------+   | - Email Dispatches & Retry Queue|
                                        +---------------------------------+
                                                        |
                                                        v
                                        +---------------------------------+
                                        | Transactional Email Provider    |
                                        | (Resend API / SMTP Webhook)     |
                                        +---------------------------------+
```

### Architectural Decisions
1. **Single Deployable Unit**: Eliminates microservice network latency, complex service discovery, distributed tracing overhead, and operational friction.
2. **Neon Cloud PostgreSQL**: Leverages managed serverless PostgreSQL with connection pooling, autoscaling storage, point-in-time recovery, and zero maintenance overhead.
3. **In-Process Job Runner**: `JobRunner` handles asynchronous tasks, email retries, announcement scheduling, and attendance cutoff reconciliation without external queue infrastructure dependencies.

---

## 2. Component Responsibilities
- **Public Portal**: Marketing pages, service portfolio, career postings, public lead intake (`/api/v1/public/leads`).
- **Employee Portal**: Punching, live working target visualization, break tracking, regularization requests, leave requests, task management, document library, announcement feed.
- **Admin Panel**: Employee directory, company-wide attendance monitoring, leave approvals, task assignment, work report reviews, policy management.
- **Executive Portal**: Strategic metrics, governance, approval workflows, sensitive HR directory, compliance auditing.
- **CRM Module**: Lead management, qualification scoring, sales pipeline stages, client records, proposals, follow-ups.
- **Attendance Engine (`v2.0`)**: 08:00 AM - 07:00 PM company work window, required hours calculation, net time calculation (`Gross - Breaks`), lateness, early exit, 07:00 PM cutoff reconciliation, idempotent incomplete email alerts.

---

## 3. High Availability & Failure Points
| Failure Scenario | Mitigation & Resilience |
|---|---|
| Database Connection Outage | Prisma client retries with connection pooling timeout limits (30s). Endpoint `/api/ready` returns 503. |
| Email Provider Outage | Emails marked as `FAILED` in `EmailLog` and automatically enqueued for retry via `JobRunner` (`EMAIL_RETRY`). |
| Application Instance Crash | Hosting supervisor (Vercel / PM2 / Docker) automatically restarts instance in < 2 seconds. |
| Cutoff Job Interruption | `ATTENDANCE_CUTOFF_CHECK` is idempotent; safe to re-run without duplicate emails. |
