# AXIVON TECHNOLOGIES — DATA PRIVACY & RETENTION POLICY

## 1. Data Classification Schedule

| Data Category | Tables Covered | Purpose | Retention Period | Purge / Archive Rule |
|---|---|---|---|---|
| **Employee HR Data** | `User`, `ExecutiveProfile` | Employment records | Active + 7 Years | Soft-delete (`status = INACTIVE`); hard delete after 7 years |
| **Attendance Records** | `Attendance`, `AttendanceBreak`, `RegularizationRequest` | Payroll & compliance | 5 Years | Archived to cold storage annually |
| **CRM Leads & Clients** | `Lead`, `CrmClient`, `Opportunity` | Sales operations | Active + 3 Years | Unqualified duplicates purged after 90 days |
| **Audit Logs** | `AuditLog`, `Activity`, `SecurityEvent` | Security & compliance | 2 Years | Automated truncation after 730 days |
| **Email Logs** | `EmailLog` | Email delivery auditing | 90 Days | Hard delete logs older than 90 days |
| **Session Cookies** | `Session` | Auth sessions | Max 7 Days | Expired sessions automatically purged |

---

## 2. Privacy & Compliance Controls
1. **Right to Erasure**: Employee and lead data removal supported via Admin/HR privacy controls.
2. **Access Control**: Role-based access (RBAC) enforced server-side for all sensitive HR and document fields.
3. **Data Minimization**: Password hashes generated using bcrypt (salt rounds = 12); raw passwords never stored or logged.
