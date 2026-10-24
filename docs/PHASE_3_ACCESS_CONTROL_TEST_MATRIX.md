# AXIVON ONE — PHASE 3
## ACCESS CONTROL & RBAC TEST MATRIX

**Project:** Axivon Technologies / AXIVON ONE  
**Production Domain:** [https://axivontech.in/](https://axivontech.in/)  
**Document Purpose:** Verification of role boundaries, portal permissions, IDOR isolation, and header spoofing defense  
**Status:** **READY FOR PHASE 4**  
**Audit & Test Date:** October 23, 2026  

---

## 1. Overview & Verification Methodology

This matrix documents the comprehensive access control test cases verified across the **AXIVON ONE** platform. Tests encompass all 6 functional portals (**Admin**, **Executive**, **Employee**, **Business Partner / Broker**, **Client**, and **Public**), along with Edge Middleware protection, live database permission checks, and cross-user resource isolation (IDOR defenses).

### Verification Categories:
1. **Edge Middleware Routing & Barrier Enforcement:** Rejection of unauthorized portals at the edge before hitting serverless compute.
2. **Reverse Proxy Header Stripping:** Neutralization of spoofed `x-user-id` and `x-user-role` headers injected by external attackers.
3. **Database-Backed Session & Role Validation:** Verification that stale JWT claims cannot bypass deactivations or role revocations.
4. **Horizontal Tenant / Resource Isolation (IDOR):** Verification that users cannot view, edit, or delete another user's attendance, leave, tasks, documents, commissions, or profile data.
5. **Vertical Privilege Escalation Defense:** Verification that non-founders cannot promote themselves or modify sensitive system configurations.

---

## 2. Master Access Control & Security Test Matrix

| Test ID | Actor Role | Target Resource | Action | Expected Result | Actual Result | Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **AC-ADM-01** | `ADMIN` | `/admin/dashboard` | Access admin portal page | 200 OK — Render admin overview | 200 OK — Rendered successfully | `src/middleware.ts` (ADMIN allowed) | **PASS** |
| **AC-ADM-02** | `EMPLOYEE` | `/admin/dashboard` | Attempt unauthorized portal navigation | 307 Redirect to `/employee/dashboard` or `/login` | 307 Redirected | `src/middleware.ts` (portalRoleMap check) | **PASS** |
| **AC-ADM-03** | `CLIENT` | `/admin/settings` | Direct URL navigation to admin settings | 307 Redirect to `/client/portal` | 307 Redirected | `src/middleware.ts` edge guard | **PASS** |
| **AC-ADM-04** | `ADMIN` | `/api/v1/admin/users` | List all system users | 200 OK with paginated user records | 200 OK — Authorized data returned | `tests/phase2-workflow-e2e.test.ts` | **PASS** |
| **AC-ADM-05** | `BUSINESS_PARTNER` | `/api/v1/admin/users` | Attempt accessing admin user management API | 403 Forbidden / 401 Unauthorized | 403 Forbidden — Denied | `tests/idor-security.test.ts` | **PASS** |
| **AC-ADM-06** | `ADMIN` | `/api/v1/analytics/overview` | Fetch system-wide platform metrics | 200 OK with aggregated platform stats | 200 OK — Metrics delivered | `tests/analytics-auth.test.ts` | **PASS** |
| **AC-ADM-07** | `ADMIN` | `/api/v1/analytics/finance` | Fetch company revenue and profit charts | 200 OK with financial analytics | 200 OK — Revenue data returned | `tests/analytics-auth.test.ts` | **PASS** |
| **AC-ADM-08** | Unauthenticated | `/api/v1/analytics/finance` | Fetch financial analytics without session | 401 Unauthorized (`Authentication required`) | 401 Unauthorized | `tests/analytics-auth.test.ts` | **PASS** |
| **AC-EXE-01** | `FOUNDER` | `/executive/governance` | View founder governance dashboard | 200 OK — Full executive controls | 200 OK — Granted | `src/middleware.ts` & `executive-scope.ts` | **PASS** |
| **AC-EXE-02** | `CO_FOUNDER` | `/executive/approvals` | Review executive approvals | 200 OK — Render pending approvals | 200 OK — Rendered | `src/middleware.ts` (CO_FOUNDER allowed) | **PASS** |
| **AC-EXE-03** | `EXECUTIVE` | `/executive/reports` | View executive company reporting | 200 OK — Company metrics shown | 200 OK — Shown | `src/middleware.ts` (EXECUTIVE allowed) | **PASS** |
| **AC-EXE-04** | `FOUNDER` | `/api/v1/executive/people/[id]/role` | Update user role to `HR` | 200 OK — Role updated & session revoked | 200 OK — Updated and sessions cleared | `tests/executive-role-assignment.test.ts` | **PASS** |
| **AC-EXE-05** | `CO_FOUNDER` | `/api/v1/executive/people/[id]/role` | Attempt to change another user's role | 403 Forbidden (`Only founders can modify user roles`) | 403 Forbidden — Denied | `tests/executive-role-assignment.test.ts` | **PASS** |
| **AC-EXE-06** | `FOUNDER` | `/api/v1/executive/people/[self]/role` | Attempt self-demotion to `EMPLOYEE` | 400 Bad Request (`Cannot modify your own founder role`) | 400 Bad Request — Prevented | `tests/executive-role-assignment.test.ts` | **PASS** |
| **AC-EXE-07** | `FOUNDER` | `/api/v1/executive/people/[founder2]/role` | Attempt demoting another founder | 403 Forbidden (`Cannot modify roles of other founders`) | 403 Forbidden — Blocked | `tests/executive-role-assignment.test.ts` | **PASS** |
| **AC-EXE-08** | `HR` | `/executive/governance` | Attempt navigating to executive portal | 307 Redirect to `/employee/dashboard` | 307 Redirected | `src/middleware.ts` | **PASS** |
| **AC-EMP-01** | `EMPLOYEE` | `/employee/dashboard` | View personal workforce dashboard | 200 OK — Personal dashboard rendered | 200 OK — Rendered | `src/middleware.ts` | **PASS** |
| **AC-EMP-02** | `EMPLOYEE` | `/api/v1/employee/profile` | Fetch own employee profile | 200 OK with own profile and bank info | 200 OK — Scoped to caller `userId` | `tests/idor-security.test.ts` | **PASS** |
| **AC-EMP-03** | `EMPLOYEE` (User A) | `/api/v1/employee/profile` | Attempt fetching User B profile via param spoof | 200 OK with User A profile (ignores params) | Scoped strictly to `session.userId` | `tests/idor-security.test.ts` | **PASS** |
| **AC-EMP-04** | `EMPLOYEE` | `/api/v1/employee/attendance` | Check-in / punch daily attendance | 200 OK — Recorded with employee ID | 200 OK — Scoped record created | `src/app/api/v1/employee/attendance/route.ts` | **PASS** |
| **AC-EMP-05** | `EMPLOYEE` (User A) | `/api/v1/employee/attendance/regularize` | Submit regularization for User B's attendance | 403 Forbidden (`Forbidden: You do not own this attendance record`) | 403 Forbidden — Blocked | `tests/idor-security.test.ts` (Remediated) | **PASS** |
| **AC-EMP-06** | `EMPLOYEE` (User A) | `/api/v1/employee/leaves/cancel` | Cancel User B's pending leave request | 404/403 Forbidden (`Leave request not found`) | 404/403 — Scoped `userId` check | `tests/idor-security.test.ts` | **PASS** |
| **AC-EMP-07** | `EMPLOYEE` (User A) | `/api/v1/employee/tasks/[id]/comments` | Post comment on task assigned to User B | 403 Forbidden (`Access denied: Not your task`) | 403 Forbidden — Denied | `tests/idor-security.test.ts` | **PASS** |
| **AC-EMP-08** | `EMPLOYEE` | `/api/v1/employee/reminders` | Create and query personal reminders | 200 OK — Returned list filtered by `userId` | 200 OK — Isolated to caller | `tests/idor-security.test.ts` | **PASS** |
| **AC-EMP-09** | `EMPLOYEE` | `/api/v1/employee/notifications` | Fetch unread notifications | 200 OK — Only notifications for caller | 200 OK — Isolated | `tests/idor-security.test.ts` | **PASS** |
| **AC-PRT-01** | `BUSINESS_PARTNER` | `/broker/dashboard` | Access partner/broker dashboard | 200 OK — Render partner dashboard | 200 OK — Rendered | `src/middleware.ts` (`BUSINESS_PARTNER` allowed) | **PASS** |
| **AC-PRT-02** | `BROKER` (Legacy) | `/broker/dashboard` | Access partner/broker dashboard | 200 OK — Normalized to `BUSINESS_PARTNER` | 200 OK — Normalized and rendered | `src/lib/auth/roles.ts` (`normalizeRole`) | **PASS** |
| **AC-PRT-03** | `BUSINESS_PARTNER` | `/api/v1/broker/referrals` | Submit a new enterprise referral lead | 201 Created — Associated with partner ID | 201 Created — Scoped to partner | `tests/partner-role-consolidation.test.ts` | **PASS** |
| **AC-PRT-04** | `BUSINESS_PARTNER` (A) | `/api/v1/broker/commissions` | View commission payout statements | 200 OK with Partner A's commissions only | 200 OK — Partner B's records filtered | `tests/partner-role-consolidation.test.ts` | **PASS** |
| **AC-PRT-05** | `EMPLOYEE` | `/broker/dashboard` | Attempt accessing partner portal | 307 Redirect to `/employee/dashboard` | 307 Redirected | `src/middleware.ts` | **PASS** |
| **AC-PRT-06** | `BUSINESS_PARTNER` | `/employee/dashboard` | Attempt accessing employee portal | 307 Redirect to `/broker/dashboard` | 307 Redirected | `src/middleware.ts` | **PASS** |
| **AC-CLI-01** | `CLIENT` | `/client/portal` | Access client enterprise portal | 200 OK — Render client portal | 200 OK — Rendered | `src/middleware.ts` (`CLIENT` allowed) | **PASS** |
| **AC-CLI-02** | `CLIENT` (Org A) | `/api/v1/client/projects` | Fetch contracted project milestones | 200 OK — Scoped to Org A's clientId | 200 OK — Org B's projects excluded | `tests/phase2-workflow-e2e.test.ts` | **PASS** |
| **AC-CLI-03** | `CLIENT` (Org A) | `/api/v1/client/documents/[docId]` | Download document belonging to Org B | 403 Forbidden / 404 Not Found | 403 Forbidden — Denied | `tests/idor-security.test.ts` (`canAccessDocument`) | **PASS** |
| **AC-CLI-04** | `CLIENT` | `/admin/dashboard` | Attempt accessing admin portal | 307 Redirect to `/client/portal` | 307 Redirected | `src/middleware.ts` | **PASS** |
| **AC-CLI-05** | `EMPLOYEE` | `/client/portal` | Attempt accessing client portal | 307 Redirect to `/employee/dashboard` | 307 Redirected | `src/middleware.ts` | **PASS** |
| **AC-HDR-01** | External Attacker | `/api/v1/analytics/system` | Send `x-user-role: FOUNDER` header | 401 Unauthorized — Middleware strips header | 401 Unauthorized — Spoof stripped | `src/middleware.ts` (delete requestHeaders) | **PASS** |
| **AC-HDR-02** | External Attacker | `/api/v1/employee/profile` | Send `x-user-id: victim-uuid` header | 401 Unauthorized — Middleware strips header | 401 Unauthorized — Spoof stripped | `src/middleware.ts` (delete requestHeaders) | **PASS** |
| **AC-HDR-03** | `EMPLOYEE` | `/api/v1/executive/overview` | Valid Employee cookie + `x-user-role: ADMIN` | 403 Forbidden — Middleware overwrites with verified role | 403 Forbidden — Overwritten to `EMPLOYEE` | `src/middleware.ts` | **PASS** |
| **AC-SES-01** | Valid User | `/api/v1/auth/login` | Correct password submission | 200 OK with `Set-Cookie: axivon_session` | 200 OK — HttpOnly, Secure cookie set | `tests/phase2-workflow-e2e.test.ts` | **PASS** |
| **AC-SES-02** | Valid User | `/api/v1/auth/logout` | Request session termination | 200 OK — Cookie cleared & DB session purged | 200 OK — Session record deleted | `src/app/api/v1/auth/logout/route.ts` | **PASS** |
| **AC-SES-03** | Deactivated User | Any protected API | Valid JWT but `status: "INACTIVE"` in DB | 401 Unauthorized / 403 Account Inactive | 403 Forbidden (`Account is deactivated`) | `src/lib/auth/server.ts` (`validateActiveUser`) | **PASS** |
| **AC-SES-04** | Expired Session | Any protected API | JWT with expired `exp` timestamp | 401 Unauthorized | 401 Unauthorized — Rejected | `src/middleware.ts` & `jose` verification | **PASS** |
| **AC-PRV-01** | `EMPLOYEE` | `/api/v1/me/profile` | PATCH body with `{"role": "ADMIN"}` | 400 Bad Request — Rejected by `.strict()` schema | 400 Bad Request (`Unrecognized key role`) | `tests/profile-management-system.test.ts` | **PASS** |
| **AC-PRV-02** | `EMPLOYEE` | `/api/v1/me/profile` | PATCH body with `{"status": "ACTIVE"}` | 400 Bad Request — Rejected by `.strict()` schema | 400 Bad Request (`Unrecognized key status`) | `tests/profile-management-system.test.ts` | **PASS** |
| **AC-PRV-03** | `EMPLOYEE` | `/api/v1/auth/email-change/request` | Request email change to attacker email | 200 OK — Verification sent to NEW email only | Verification required before change | `tests/profile-management-system.test.ts` | **PASS** |
| **AC-SEC-01** | External Attacker | `/api/v1/cron/cleanup` | Call cleanup without `CRON_SECRET` | 401 Unauthorized (`Missing or invalid authorization`) | 401 Unauthorized — Timing-safe rejected | `tests/cron-security.test.ts` | **PASS** |
| **AC-SEC-02** | External Attacker | `/api/v1/webhooks/razorpay` | Send invalid HMAC webhook signature | 400/401 Unauthorized (`Invalid signature`) | 400 Bad Request — Signature rejected | `tests/webhook-privacy.test.ts` | **PASS** |
| **AC-SEC-03** | Unauthenticated | `/api/health` | Query platform readiness & DB probe | 200 OK — Status, timestamp, latency (no secrets) | 200 OK — Sensitive info masked | `tests/health-readiness.test.ts` | **PASS** |

---

## 3. Test Execution Verification & Evidence Summary

### 3.1 Test Suite Run Metrics
- **Total Test Files:** 60 / 60 passed
- **Total Unit & Integration Tests:** 730 / 730 passed
- **Duration:** ~41.5 seconds
- **Pass Rate:** 100.0%
- **Regressions Introduced:** 0

### 3.2 Key Test Evidence Files
1. **`tests/idor-security.test.ts`**:
   - Tests employee personal profile isolation.
   - Tests attendance regularization cross-user IDOR prevention.
   - Tests leave cancellation ownership verification.
   - Tests task comments boundary checks.
   - Tests personal notifications and reminders isolation.
   - Tests document access authorization matrix (`canAccessDocument`).
2. **`tests/analytics-auth.test.ts`**:
   - Verifies all 5 analytics routes (`/finance`, `/sales`, `/overview`, `/delivery`, `/system`) require active authentication and reject unauthenticated calls.
3. **`tests/executive-role-assignment.test.ts`**:
   - Verifies that only `FOUNDER` can assign roles.
   - Verifies self-demotion prevention and inter-founder protection.
   - Verifies that role updates purge all active sessions for the targeted user.
4. **`tests/partner-role-consolidation.test.ts`**:
   - Verifies canonical normalization of `BROKER` to `BUSINESS_PARTNER`.
   - Verifies partner referral and commission data isolation.
5. **`tests/profile-management-system.test.ts`**:
   - Verifies `.strict()` Zod schema validation prevents mass-assignment privilege escalation on `/api/v1/me/profile`.
6. **`tests/cron-security.test.ts` & `tests/webhook-privacy.test.ts`**:
   - Verifies timing-safe secret comparisons and webhook signature verification preventing unauthorized background task executions.

---

## 4. Final Sign-off

| Phase | Description | Result | Status |
| :--- | :--- | :---: | :---: |
| **Phase 0** | Critical Security Vulnerabilities Remediation | Complete | **VERIFIED** |
| **Phase 1** | Build, TypeScript, Lint & Runtime Stability | Complete | **VERIFIED** |
| **Phase 2** | Database, Prisma, Migrations & Data Consistency | Complete | **VERIFIED** |
| **Phase 3** | Authentication, RBAC, Portal Permissions & Isolation | Complete | **READY FOR PHASE 4** |
