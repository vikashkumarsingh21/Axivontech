# AxivonTech — Complete Mobile App API Integration Matrix
**Document Version:** 2.0.0  
**Target Platform:** Axivon Dedicated Android Application (Capacitor 6 / Android 14+ / Next.js Backend)  
**Security Standard:** Strict Server-Side RBAC, HTTP-Only Persistent Cookies, Zero Public Data Leakage  
**Status:** FULLY INTEGRATED & VERIFIED  

---

## 1. Architectural Overview & System Invariants

The AxivonTech Android Application interacts with the existing monolithic and micro-service API architecture without introducing separate mobile databases, duplicate business logic, or mock production endpoints.

### Key Invariants
1. **Single Source of Truth:** Neon PostgreSQL managed database with Prisma ORM. No secondary mobile database exists.
2. **Server-Side Authorization Authority:** All role permissions, data ownership boundaries, and department scopes are enforced on the server. No client-supplied role or department ID is trusted.
3. **Session Persistence:** HTTP-only cookies (`axivon_session`) persisted natively across Android WebView lifecycles using `android.webkit.CookieManager.getInstance().flush()`.
4. **App-Mode Isolation:** Requests carry the `X-Requested-With: AxivonApp` header and `AxivonApp/1.0.0` user-agent, suppressing marketing website elements and routing directly to role-authorized dashboards.
5. **Consolidated Executive Governance:** `FOUNDER` and `CO_FOUNDER` share equal 50-50 executive partner authority on `/executive/dashboard`.
6. **Consolidated Business Partner Role:** `BUSINESS_PARTNER` and legacy alias `BROKER` operate on the identical backend business module `/broker/dashboard`.

---

## 2. Central Mobile API Client (`src/lib/mobile/api-client.ts`)

All mobile components interface with the backend via the centralized `mobileApi` client singleton:

| Property | Implementation | Details |
|---|---|---|
| **Base URL** | `process.env.NEXT_PUBLIC_API_BASE_URL \|\| ""` | Resolves to current host in Android WebView; enforces HTTPS in production |
| **Credentials** | `credentials: "include"` | Automatically attaches HTTP-only JWT session cookies to every outbound request |
| **Headers** | `Accept: application/json`<br>`X-Requested-With: AxivonApp`<br>`X-Axivon-Client: AndroidMobileApp/1.0.0` | Injected into all requests to guarantee server-side app-mode detection |
| **Timeout Handling** | `AbortController` (15s default, 60s for file uploads) | Cancels dead network connections on degraded mobile carriers |
| **Retries** | Exponential backoff (up to 2 retries) | Strictly scoped to idempotent `GET` requests; never retries state-mutating POST/PATCH |
| **Error Handling** | `MobileApiError` typed exception | Extracts HTTP status, error codes, and field validation errors |
| **Session Expiry** | Automatic HTTP 401 interception | Redirects unauthenticated sessions immediately to `/app/login?session_expired=1` |

---

## 3. Authentication & Session Management APIs

| Feature | Existing API Endpoint | Method | Required Role | Request Payload | Response Structure | Data Ownership & Scoping | Mobile Screen |
|---|---|---|---|---|---|---|---|
| **Mobile Login** | `/api/v1/auth/login` | `POST` | Public | `{ email, password, captchaToken }` | `{ success: true, user: { id, email, name, role }, mustChangePassword }` | Rate limited (5 req/15min per IP); validates bcrypt hash | `/app/login` |
| **Session Verification** | `/api/v1/auth/session` | `GET` | Authenticated | None | `{ authenticated: true, user: { id, email, name, role }, mustChangePassword }` | Reads `axivon_session` cookie; validates signature | `/app`, Root bootloader |
| **Mobile Logout** | `/api/v1/auth/logout` | `POST` | Authenticated | None | `{ success: true, loggedOut: true }` | Deletes server session, clears `axivon_session` cookie | Mobile More Sheet, Settings |
| **Change Password** | `/api/v1/auth/change-password` | `POST` | Authenticated | `{ currentPassword, newPassword }` | `{ success: true, message: "Password updated" }` | Verifies old password; checks 14-char complexity | `/auth/change-password` |
| **User Profile / Me** | `/api/v1/me/profile` | `GET` | Authenticated | None | `{ success: true, user: { id, name, email, phone, role } }` | Scoped strictly to authenticated `userId` | App Header, Profile Tab |

---

## 4. Admin Portal API Integration Matrix

| Feature | Existing API Endpoint | Method | Required Role | Request Payload | Response Structure | Data Ownership & Scoping | Mobile Screen |
|---|---|---|---|---|---|---|---|
| **Admin Dashboard** | `/api/v1/admin/dashboard` | `GET` | `ADMIN` | None | `{ stats: { totalLeads, activeEmployees, partners, revenue }, recentActivity: [...] }` | Global organization scope | `/admin/dashboard` |
| **Partner Applications Review** | `/api/v1/admin/business-partner/applications` | `GET` | `ADMIN` | `?status=...&search=...` | `{ applications: [{ id, applicationId, fullName, email, status, occupation }] }` | Read-only listing of all broker applications | `/admin/business-partners/applications` |
| **Approve Partner & Create Login** | `/api/v1/admin/business-partner/applications/[id]/create-account` | `POST` | `ADMIN` | `{ mode: "DIRECT_PASSWORD" \| "ACTIVATION_LINK", password?: string, partnerType?: string }` | `{ success: true, partnerId, referralCode, email }` | Idempotent transaction; creates User + BrokerProfile records | `CreatePartnerLoginModal` |
| **Employee Roster** | `/api/v1/admin/employees` | `GET` | `ADMIN` | `?departmentId=...&status=...` | `{ employees: [{ id, name, email, role, status, department }] }` | Company-wide workforce directory | `/admin/employees` |
| **Onboard Employee** | `/api/v1/admin/employees` | `POST` | `ADMIN` | `{ name, email, role, departmentId, password }` | `{ success: true, employee: { id, name, email } }` | Creates User + UserRole + EmployeeProfile | `/admin/employees/new` |
| **Department Management** | `/api/v1/admin/departments` | `GET`, `POST` | `ADMIN` | `{ name, code, managerId? }` | `{ departments: [{ id, name, code, manager, employeeCount }] }` | Global organizational taxonomy | `/admin/departments` |
| **Attendance Records** | `/api/v1/admin/attendance` | `GET` | `ADMIN` | `?date=...&departmentId=...` | `{ records: [{ id, user, checkInAt, checkOutAt, status }] }` | Company-wide daily attendance oversight | `/admin/attendance` |
| **Task Delegation Board** | `/api/v1/admin/tasks` | `GET`, `POST` | `ADMIN` | `{ title, description, assigneeId, priority, dueDate }` | `{ tasks: [{ id, title, status, priority, assignee }] }` | Organization task backlog | `/admin/tasks` |
| **Leads & CRM Pipeline** | `/api/v1/admin/leads` | `GET` | `ADMIN` | `?status=...&brokerId=...` | `{ leads: [{ id, clientName, clientEmail, status, estimatedBudget, broker }] }` | Global CRM pipeline | `/admin/leads` |
| **Mobile App Release Settings** | `/api/v1/admin/app/settings` | `GET`, `POST` | `ADMIN` | `{ latestVersion, minVersion, apkUrl, notes, enabled }` | `{ config: { latestVersion, apkUrl, sizeMb }, metrics: { downloadsCount } }` | Global app release gatekeeper | `/admin/settings/app` |

---

## 5. Executive Governance Portal API Matrix (Founder & Co-Founder 50-50 Governance)

| Feature | Existing API Endpoint | Method | Required Role | Request Payload | Response Structure | Data Ownership & Scoping | Mobile Screen |
|---|---|---|---|---|---|---|---|
| **Executive Dashboard** | `/api/v1/executive/dashboard` | `GET` | `FOUNDER`, `CO_FOUNDER`, `EXECUTIVE` | None | `{ financialKPIs: { grossRevenue, netProfit, ebitda }, teamSize, activeProjects }` | Shared 50-50 executive partner oversight | `/executive/dashboard` |
| **Pending Approvals Queue** | `/api/v1/executive/approvals` | `GET` | `FOUNDER`, `CO_FOUNDER`, `EXECUTIVE` | None | `{ pendingApprovals: [{ id, type, title, amount, requester, createdAt }] }` | High-value payments, major contracts, promotions | `/executive/approvals` |
| **Review Approval Action** | `/api/v1/executive/approvals/[id]/review` | `POST` | `FOUNDER`, `CO_FOUNDER`, `EXECUTIVE` | `{ action: "APPROVE" \| "REJECT", comment?: string }` | `{ success: true, approval: { id, status, reviewedAt } }` | Writes audit log; triggers notification to requester | `/executive/approvals` |
| **People Directory** | `/api/v1/executive/people` | `GET` | `FOUNDER`, `CO_FOUNDER`, `EXECUTIVE` | None | `{ managers: [...], executiveStaff: [...] }` | Direct access to all department heads | `/executive/people` |
| **Financial & EBITDA Reports** | `/api/v1/executive/reports` | `GET` | `FOUNDER`, `CO_FOUNDER`, `EXECUTIVE` | `?period=quarterly&year=2026` | `{ reports: [{ id, title, period, totalRevenue, totalExpenses, profit }] }` | Confidential financial dossiers | `/executive/reports` |

---

## 6. Employee Portal API Integration Matrix

| Feature | Existing API Endpoint | Method | Required Role | Request Payload | Response Structure | Data Ownership & Scoping | Mobile Screen |
|---|---|---|---|---|---|---|---|
| **Employee Dashboard** | `/api/v1/employee/dashboard` | `GET` | `EMPLOYEE` | None | `{ summary: { tasksPending, leaveBalance, attendanceToday }, announcements: [...] }` | Strictly scoped to authenticated `userId` | `/employee/dashboard` |
| **Attendance Status** | `/api/v1/employee/attendance` | `GET` | `EMPLOYEE` | `?month=...&year=...` | `{ today: { checkInAt, checkOutAt, isOnBreak }, records: [...] }` | Scoped to authenticated employee records only | `/employee/attendance` |
| **Daily Clock-In** | `/api/v1/employee/attendance/check-in` | `POST` | `EMPLOYEE` | `{ latitude?, longitude?, note? }` | `{ success: true, record: { id, checkInAt, status: "PRESENT" } }` | Enforces one check-in per day per employee | `/employee/attendance` |
| **Daily Clock-Out** | `/api/v1/employee/attendance/check-out` | `POST` | `EMPLOYEE` | `{ note? }` | `{ success: true, record: { id, checkOutAt, totalMinutes } }` | Rejects if check-in is absent or already closed | `/employee/attendance` |
| **Break Toggle** | `/api/v1/employee/attendance/break` | `POST` | `EMPLOYEE` | `{ action: "START" \| "END", type?: "LUNCH" \| "TEA" }` | `{ success: true, breakStatus: "ACTIVE" \| "ENDED" }` | Calculates net working hours deduction | `/employee/attendance` |
| **Assigned Tasks** | `/api/v1/employee/tasks` | `GET` | `EMPLOYEE` | `?status=...&priority=...` | `{ tasks: [{ id, title, description, priority, status, dueDate }] }` | Scoped to `assigneeId === userId` | `/employee/tasks` |
| **Update Task Status** | `/api/v1/employee/tasks/[id]` | `PATCH` | `EMPLOYEE` | `{ status: "TODO" \| "IN_PROGRESS" \| "COMPLETED" }` | `{ success: true, task: { id, status, completedAt } }` | Rejects update if task is not assigned to user | `/employee/tasks` |
| **Work Reports History** | `/api/v1/employee/work-reports` | `GET` | `EMPLOYEE` | `?page=...&limit=...` | `{ reports: [{ id, date, summary, tasksDone, hoursSpent }] }` | Scoped to `employeeId === userId` | `/employee/work-reports` |
| **Submit Work Report** | `/api/v1/employee/work-reports` | `POST` | `EMPLOYEE` | `{ summary, tasksDone: [...], blockers?, hoursSpent? }` | `{ success: true, report: { id, submittedAt } }` | Creates daily report; sends alert to manager | `/employee/work-reports` |
| **Leave Balance & Requests** | `/api/v1/employee/leave` | `GET` | `EMPLOYEE` | None | `{ balance: { casual, sick, annual }, requests: [{ id, startDate, endDate, status }] }` | Scoped to employee's own leave quota | `/employee/leave` |
| **Apply for Leave** | `/api/v1/employee/leave` | `POST` | `EMPLOYEE` | `{ leaveType, startDate, endDate, reason }` | `{ success: true, leaveRequest: { id, status: "PENDING" } }` | Deducts quota provisionally; triggers manager alert | `/employee/leave` |
| **Employee Notifications** | `/api/v1/employee/notifications` | `GET` | `EMPLOYEE` | `?unreadOnly=true` | `{ notifications: [{ id, title, message, read, createdAt }], total }` | Strictly scoped to recipient `userId` | `/employee/notifications` |
| **Employee Profile Dossier** | `/api/v1/employee/profile` | `GET` | `EMPLOYEE` | None | `{ profile: { id, designation, department, joiningDate, emergencyContact } }` | Scoped strictly to employee | `/employee/profile` |

---

## 7. Broker / Business Partner Portal API Matrix

| Feature | Existing API Endpoint | Method | Required Role | Request Payload | Response Structure | Data Ownership & Scoping | Mobile Screen |
|---|---|---|---|---|---|---|---|
| **Broker Dashboard** | `/api/v1/broker/dashboard` | `GET` | `BUSINESS_PARTNER`, `BROKER` | None | `{ stats: { totalLeads, convertedLeads, totalEarnings, pendingPayout }, recentLeads: [...] }` | Scoped strictly to authenticated `brokerProfileId` | `/broker/dashboard` |
| **Register Prospective Lead** | `/api/v1/broker/leads` | `POST` | `BUSINESS_PARTNER`, `BROKER` | `{ clientName, clientEmail, clientPhone, companyName?, projectType?, estimatedBudget?, notes? }` | `{ success: true, lead: { id, leadCode, status: "NEW" } }` | Automatically attributes lead to broker's `referralCode` | `/broker/leads/new` |
| **My Referred Leads** | `/api/v1/broker/leads` | `GET` | `BUSINESS_PARTNER`, `BROKER` | `?status=...&search=...` | `{ leads: [{ id, leadCode, clientName, status, estimatedBudget, createdAt }] }` | Enforces `brokerId === user.brokerProfile.id` | `/broker/leads` |
| **Client Projects** | `/api/v1/broker/projects` | `GET` | `BUSINESS_PARTNER`, `BROKER` | None | `{ projects: [{ id, projectCode, name, status, contractValue, commissionRate }] }` | Shows only converted projects originating from broker | `/broker/projects` |
| **Commissions & Payouts** | `/api/v1/broker/commissions` | `GET` | `BUSINESS_PARTNER`, `BROKER` | None | `{ commissions: [{ id, projectCode, earnedAmount, status, paidAt, slaDueAt }] }` | Financial isolation: strictly broker's earnings | `/broker/commissions` |
| **Request 48h SLA Payout** | `/api/v1/broker/payouts` | `POST` | `BUSINESS_PARTNER`, `BROKER` | `{ commissionId, paymentMethod: "UPI" \| "BANK_TRANSFER", paymentDetails }` | `{ success: true, payout: { id, slaDueAt: "+48h", status: "PROCESSING" } }` | Blocks request on other brokers' commissions (HTTP 403) | `/broker/commissions` |
| **Partnership Contracts** | `/api/v1/broker/contracts` | `GET` | `BUSINESS_PARTNER`, `BROKER` | None | `{ contracts: [{ id, title, signedAt, fileUrl }] }` | Access to digital agreements & NDAs | `/broker/documents` |
| **Partner Profile & Bank KYC** | `/api/v1/broker/profile` | `GET`, `PATCH` | `BUSINESS_PARTNER`, `BROKER` | `{ bankName, accountNumber, ifscCode, upiId, panNumber }` | `{ success: true, profile: { partnerId, referralCode, kycStatus } }` | Validates IFSC and UPI formats before saving | `/broker/profile` |

---

## 8. Department Manager Portal API Matrix

| Feature | Existing API Endpoint | Method | Required Role | Request Payload | Response Structure | Data Ownership & Scoping | Mobile Screen |
|---|---|---|---|---|---|---|---|
| **Manager Dashboard** | `/api/v1/manager/dashboard` | `GET` | `DEPARTMENT_MANAGER`, `MANAGER` | None | `{ department: { name, code }, activeEmployees, pendingTasks, pendingLeaves }` | Department ID resolved server-side from manager user | `/manager/dashboard` |
| **Department Roster** | `/api/v1/manager/employees` | `GET` | `DEPARTMENT_MANAGER`, `MANAGER` | None | `{ employees: [{ id, name, email, designation, activeTasksCount }] }` | Strictly scoped to manager's assigned department | `/manager/employees` |
| **Department Task Delegation** | `/api/v1/manager/tasks` | `GET`, `POST` | `DEPARTMENT_MANAGER`, `MANAGER` | `{ title, description?, assigneeId, priority, dueDate? }` | `{ success: true, task: { id, title, status: "TODO" } }` | Strictly blocks assigning tasks to other departments (403) | `/manager/tasks` |
| **Team Attendance Oversight** | `/api/v1/manager/attendance` | `GET` | `DEPARTMENT_MANAGER`, `MANAGER` | `?date=...` | `{ records: [{ employeeId, name, checkInAt, checkOutAt, status }] }` | Scoped exclusively to department staff | `/manager/attendance` |
| **Pending Leave Queue** | `/api/v1/manager/leave` | `GET` | `DEPARTMENT_MANAGER`, `MANAGER` | `?status=PENDING` | `{ requests: [{ id, employee: { name, email }, leaveType, startDate, endDate, reason }] }` | Shows leave requests of department members only | `/manager/leave` |
| **Approve / Reject Leave** | `/api/v1/manager/leave` | `PATCH` | `DEPARTMENT_MANAGER`, `MANAGER` | `{ leaveId, action: "APPROVE" \| "REJECT", reviewNote? }` | `{ success: true, leave: { id, status, reviewedAt } }` | Verifies employee belongs to manager's department | `/manager/leave` |
| **Team Work Reports** | `/api/v1/manager/work-reports` | `GET` | `DEPARTMENT_MANAGER`, `MANAGER` | `?date=...` | `{ reports: [{ employee: { name }, summary, tasksDone, hoursSpent }] }` | Review daily EOD logs of assigned staff | `/manager/work-reports` |

---

## 9. Client Portal API Matrix

| Feature | Existing API Endpoint | Method | Required Role | Request Payload | Response Structure | Data Ownership & Scoping | Mobile Screen |
|---|---|---|---|---|---|---|---|
| **Client Dashboard** | `/api/v1/client/dashboard` | `GET` | `CLIENT` | None | `{ projectsCount, pendingInvoices, unreadMessages, recentProjects: [...] }` | Strictly scoped to client's company ID | `/client/dashboard` |
| **Client Projects & Deliverables** | `/api/v1/client/projects` | `GET` | `CLIENT` | None | `{ projects: [{ id, projectCode, name, sprintStatus, progressPercent }] }` | Shows only projects where client is assigned | `/client/projects` |
| **Project Documents & Sign-offs** | `/api/v1/client/documents` | `GET` | `CLIENT` | None | `{ documents: [{ id, title, category, fileUrl, uploadedAt }] }` | Protected signed deliverables and specs | `/client/documents` |
| **Billing Invoices & Receipts** | `/api/v1/client/invoices` | `GET` | `CLIENT` | None | `{ invoices: [{ id, invoiceNumber, amount, status, dueDate, pdfUrl }] }` | Financial ledger strictly isolated to client | `/client/invoices` |
| **Helpdesk & Support Tickets** | `/api/v1/client/support` | `GET`, `POST` | `CLIENT` | `{ subject, message, priority, projectId? }` | `{ success: true, ticket: { id, ticketNumber, status: "OPEN" } }` | Direct line to designated project manager | `/client/support` |

---

## 10. Shared Systems & Notifications Matrix

| Feature | Existing API Endpoint | Method | Required Role | Request Payload | Response Structure | Data Ownership & Scoping | Mobile Screen |
|---|---|---|---|---|---|---|---|
| **User Notifications** | `/api/v1/notifications` | `GET` | Authenticated | `?page=...&limit=...` | `{ notifications: [{ id, title, message, read, createdAt }], total, unread }` | Strictly scoped to recipient `userId` | Notification Drawer |
| **Fast Unread Count** | `/api/v1/notifications/unread-count` | `GET` | Authenticated | None | `{ unreadCount: number }` | Micro-payload for top-bar badge polling | Top App Bar Badge |
| **Mark Notification Read** | `/api/v1/notifications/[id]/read` | `PATCH` | Authenticated | None | `{ success: true }` | Verifies `notification.userId === authenticatedUser.id` | Notification Drawer |
| **Mark All Notifications Read** | `/api/v1/notifications/read-all` | `POST` | Authenticated | None | `{ success: true, count: number }` | Updates all unread notifications for current user | Notification Drawer |

---

## 11. Security & Data Scoping Rules

```
                      [ Android Native App / Capacitor ]
                                      │
                        (X-Requested-With: AxivonApp)
                        (axivon_session: HTTP-Only JWT)
                                      ▼
                        [ Next.js Middleware Gate ]
                                      │
                  ┌───────────────────┴───────────────────┐
                  ▼                                       ▼
       [ Valid Session Present? ]               [ Missing / Invalid ]
                  │                                       │
         Yes ─────┴───── No                               ▼
          │              │                     Redirect to /app/login
          ▼              ▼
     [ RBAC Check ]  Redirect /app/login
          │
  ┌───────┼──────────────────────────────┬───────────────────┐
  ▼       ▼                              ▼                   ▼
ADMIN  EXECUTIVE                  DEPARTMENT_MANAGER     EMPLOYEE / BROKER
 (All) (50-50 Partner Governance) (Scoped to Department) (Scoped strictly to UserId)
```

1. **Parameter Tampering Prevention:**
   - Handlers never trust a `userId`, `brokerId`, or `departmentId` provided in the query string or request body to establish authority.
   - The server extracts the authenticated identity exclusively from the cryptographically verified JWT payload (`req.user.id`).
2. **Cross-Tenant & Cross-Role Isolation:**
   - Broker A cannot request payouts or inspect leads belonging to Broker B (verified HTTP 403 in `tests/phase4-broker-direct-financial-safeguards.test.ts`).
   - Manager A cannot assign tasks to or approve leave for employees in Department B (verified HTTP 403 in `tests/department-manager-portal.test.ts`).
3. **Password Security:**
   - Passwords must be 14+ characters, contain uppercase, lowercase, digits, and symbols, and are hashed with Bcrypt (12 salt rounds).
   - Ambiguous characters (`0`, `O`, `o`, `1`, `l`, `I`) are omitted from generated passwords to avoid manual transcription errors.
