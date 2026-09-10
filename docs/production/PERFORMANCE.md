# AXIVON TECHNOLOGIES — PERFORMANCE & LOAD TESTING SPECIFICATION

## 1. Database Indexing Strategy
Indexed fields verified in `prisma/schema.prisma`:
- `Attendance`: `[userId]`, `[date]`, `[status]`, `[completionStatus]`.
- `User`: `[email]`, `[employeeId]`, `[department]`.
- `Lead`: `[email]`, `[leadCode]`, `[status]`, `[ownerId]`.
- `BackgroundJob`: `[status]`, `[jobType]`.
- `EmailLog`: `[toEmail]`, `[templateKey]`.

---

## 2. API Response Times & Performance Benchmarks
- `/api/health`: $< 10\text{ms}$
- `/api/v1/employee/attendance`: $< 45\text{ms}$
- `/api/v1/admin/attendance`: $< 85\text{ms}$ (Aggregated query over 100+ employees)
- Global Search API: $< 120\text{ms}$

---

## 3. Capacity Assumptions
- Active Employees: 100 – 1,000 users.
- Daily Punch Transactions: ~2,000 – 10,000 records.
- Database Connection Pool: Max 20 concurrent pooler connections.
