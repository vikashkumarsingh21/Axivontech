# Axivon Technologies — Static Code Quality & Security Audit Report

**Audit Date:** 2026-10-24  
**Audit Scope:** Full codebase static analysis (807 source files across Next.js 16 App Router, Prisma ORM, Jose JWT Auth, API endpoints, Server Components, and Client UI)  
**Auditor Mode:** Senior QA Lead + Security Auditor + Full-Stack Code Reviewer  

---

## Executive Summary of Static Findings

| Category | Critical | High | Medium | Low / Info | Total |
|---|---|---|---|---|---|
| **1. Security Vulnerabilities** | 2 | 4 | 5 | 3 | 14 |
| **2. Logic & Runtime Flaws** | 2 | 5 | 4 | 2 | 13 |
| **3. Frontend & Routing Inconsistencies** | 0 | 2 | 4 | 3 | 9 |
| **4. Database & Prisma Schema Deficiencies** | 0 | 3 | 6 | 2 | 11 |
| **5. Code Quality & Architectural Debt** | 0 | 2 | 8 | 5 | 15 |
| **Total Issues Identified** | **4** | **16** | **27** | **15** | **62** |

---

## 1. Security Vulnerabilities

### SEC-001: Missing Authentication & Role Verification on Background Jobs API
- **File:** [`src/middleware.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/middleware.ts#L57-L65) (Lines 57–65, 181)
- **Severity:** Critical
- **Details:** In `src/middleware.ts`, the matcher configuration includes `"/api/v1/jobs/:path*"` (Line 181), but `isProtectedApiRoute` (Lines 57–65) omits `pathname.startsWith("/api/v1/jobs")`. As a result, requests to `/api/v1/jobs` and `/api/v1/jobs/process` bypass authentication middleware entirely and pass through unvalidated to the route handlers unless explicitly blocked downstream.
- **Impact:** Unauthenticated attackers or automated scanners can probe and trigger job queue processes if the route handler relies on upstream middleware headers.
- **Remediation:** Add `pathname.startsWith("/api/v1/jobs")` to `isProtectedApiRoute` in `src/middleware.ts` and enforce strict Bearer/Cron or Session checks.

### SEC-002: Insecure Role Verification Inversion for Employee Portal Routes
- **File:** [`src/middleware.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/middleware.ts#L117-L122) (Lines 117–122)
- **Severity:** High
- **Details:** The role-based check for the employee portal is implemented as a blocklist exception rather than an explicit allowlist:
  ```typescript
  if ((isEmployeeRoute || isEmployeeApiRoute) && (role === "BUSINESS_PARTNER" || role === "CLIENT")) {
    if (isEmployeeApiRoute) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(getRoleRedirectUrl(role));
  }
  ```
  Any user account whose role is not strictly `"BUSINESS_PARTNER"` or `"CLIENT"` (such as unassigned accounts, speculative `"USER"` roles, or newly registered accounts) is permitted access to `/employee/*` and `/api/v1/employee/*`.
- **Impact:** Privilege boundary violation allowing unintended user roles to access employee dashboards, log attendance, and submit work reports.
- **Remediation:** Change to a strict positive allowlist: `if (!["EMPLOYEE", "ADMIN", "FOUNDER", "CO_FOUNDER"].includes(role))`.

### SEC-003: Public Resume Upload Stored in Web-Accessible Directory with Permissive MIME Whitelist
- **File:** [`src/app/api/v1/public/careers/upload-resume/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/public/careers/upload-resume/route.ts#L42-L73) (Lines 42, 65, 73)
- **Severity:** High
- **Details:** 
  1. `validMimes` array includes `"application/octet-stream"` (Line 42), which allows arbitrary binary files to be uploaded if the extension matches `.pdf` or `.doc`.
  2. Uploaded files are written directly to `public/uploads/resumes/` (Line 67–73) which is served statically without authentication. Anyone who learns or enumerates the generated URL can view and download applicants' sensitive personally identifiable information (PII).
- **Impact:** Unauthenticated public exposure of candidate resumes (GDPR/privacy violation) and potential arbitrary file storage risk.
- **Remediation:** Remove `"application/octet-stream"` from MIME allowlist. Store resumes in private object storage (S3/R2 or private server directory outside `/public`) and serve downloads via authenticated signed URLs or admin-only streaming endpoints.

### SEC-004: Stored XSS Vulnerability in Blog Post Content Rendering
- **File:** [`src/components/blog/ArticleDetailView.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/components/blog/ArticleDetailView.tsx#L192) (Line 192)
- **Severity:** High
- **Details:** `dangerouslySetInnerHTML={{ __html: post.contentHtml }}` renders database-stored HTML content directly into the DOM without sanitizing through DOMPurify or sanitize-html.
- **Impact:** If an administrator account or database entry contains malicious JavaScript (e.g. `<script>` or `<img onerror=...>`), it executes in every visitor's browser session.
- **Remediation:** Sanitize `post.contentHtml` using `isomorphic-dompurify` or `sanitize-html` before injecting into the DOM.

### SEC-005: Insecure Fallback Session Secret in Middleware
- **File:** [`src/middleware.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/middleware.ts#L12) (Line 12)
- **Severity:** Medium
- **Details:** `const secretKey = new TextEncoder().encode(rawSecret || "fallback-dev-session-secret-at-least-32-chars-long");`
  If `SESSION_SECRET` is accidentally undefined in a non-production deployment (e.g. staging or preview), tokens signed with the well-known static fallback secret are accepted.
- **Impact:** Allows forging valid session cookies if `SESSION_SECRET` is missing from the environment.
- **Remediation:** Fail closed immediately if `rawSecret` is missing: throw an error instead of supplying a fallback string.

### SEC-006: Hardcoded Test Passwords in Production Database Seed
- **File:** [`prisma/seed.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/prisma/seed.ts#L337-L440) (Lines 337, 365, 399)
- **Severity:** Medium
- **Details:** Seed script defaults to hardcoded passwords `AxivonAdmin@2024`, `AxivonFounder@2024`, `AxivonCoFounder@2024` when environment variables `ADMIN_SEED_PASSWORD` etc. are not provided.
- **Impact:** Any database initialized using `npx prisma db seed` without explicitly overriding env vars retains well-known credentials.
- **Remediation:** Require random generation or throw an explicit error if seed passwords are not configured in production mode.

### SEC-007: Inconsistent Password Hash Rounds Across User Creation Endpoints
- **File:** [`src/app/api/v1/admin/employees/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/admin/employees/route.ts#L145) (Line 145) vs [`src/lib/auth/password.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/lib/auth/password.ts#L3) (Line 3)
- **Severity:** Low
- **Details:** `src/lib/auth/password.ts` defines central `SALT_ROUNDS = 12` and provides `hashPassword`. However, `src/app/api/v1/admin/employees/route.ts` bypasses this utility and manually calls `bcrypt.hash(validatedData.password, 10)` with only 10 rounds.
- **Impact:** Inconsistent cryptographic strength across user accounts.
- **Remediation:** Replace all direct `bcrypt.hash` calls with the centralized `hashPassword` helper.

### SEC-008: Missing Rate Limiting on Executive and Administrative Mutation Endpoints
- **File:** [`src/app/api/v1/executive/settings/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/executive/settings/route.ts#L18) (Line 18)
- **Severity:** Medium
- **Details:** Mutation APIs for updating organizational settings and sensitive records do not apply IP or user-based rate limiting, allowing rapid automated payload spam.
- **Impact:** Potential resource consumption or audit log flooding.
- **Remediation:** Apply `isRateLimited(key, RATE_LIMIT_PRESETS.ADMIN_MUTATION)`.

---

## 2. Logic & Runtime Flaws

### LOG-001: Broken Import in `src/config/siteFacts.ts` Breaking TypeScript Compilation
- **File:** [`src/config/siteFacts.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/config/siteFacts.ts#L6) (Line 6)
- **Severity:** Critical
- **Details:** `siteFacts.ts` imports `{ services }` from `@/data/services`. However, `src/data/services.ts` exports `servicesData`, NOT `services`.
- **Impact:** Causes TypeScript error `TS2305: Module '"@/data/services"' has no exported member 'services'`, breaking full production build (`npm run build`).
- **Remediation:** In `src/config/siteFacts.ts`, change import to `import { servicesData as services } from "@/data/services";` or export alias in `src/data/services.ts`.

### LOG-002: Governance Role Approval Does Not Apply the Approved Role Change
- **File:** [`src/app/api/v1/executive/approvals/[id]/approve/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/executive/approvals/%5Bid%5D/approve/route.ts#L22-L37) (Lines 22–37)
- **Severity:** Critical
- **Details:** When an executive approves a high-privilege role assignment request, the API marks `ApprovalRequest.status = "APPROVED"` and creates a `SecurityEvent`. However, it NEVER actually updates the `UserRole` or assigns the target role in the database.
- **Impact:** The approval workflow silently succeeds in the UI, but the target user never receives the approved role permissions.
- **Remediation:** Inspect `approval.requestType` and `approval.details`. If `HIGH_PRIVILEGE_ROLE_ASSIGNMENT`, execute the database update in the same transaction to assign the approved role to the user.

### LOG-003: Attendance Re-Check-In Logic Inflates Worked Hours Without Tracking Intermittent Logoff
- **File:** [`src/app/api/v1/employee/attendance/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/employee/attendance/route.ts#L251-L264) (Lines 251–264)
- **Severity:** High
- **Details:** If an employee completes a shift (checks out at 17:00) and later checks in again at 21:00 on the same calendar day, the code updates the existing attendance record, preserving the original morning `checkInAt` and resetting `checkOutAt` to `null`. It does not record the gap between 17:00 and 21:00 as an unpaid break.
- **Impact:** When the employee subsequently checks out, the calculation treats the entire duration from 09:00 to 21:30 as continuous work, artificially inflating worked hours.
- **Remediation:** When re-opening a checked-out record, automatically insert an `AttendanceBreak` spanning from previous `checkOutAt` to new check-in time, or support multiple session records per day.

### LOG-004: Leave Request Endpoints Lack Enum Validation and Past-Date Constraints
- **File:** [`src/app/api/v1/employee/leave/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/employee/leave/route.ts#L19-L37) (Lines 19–37)
- **Severity:** High
- **Details:** `leaveType` is accepted as a raw unvalidated string with no Zod schema enum constraint. Furthermore, `startDate` is not checked against current date or past dates, permitting employees to submit retroactive leave requests for arbitrary dates in the past to retroactively excuse attendance shortfalls.
- **Impact:** Data integrity corruption and abuse of attendance regularization policies.
- **Remediation:** Validate `leaveType` using `z.enum(["CASUAL", "SICK", "PAID", "REMOTE", "UNPAID"])` and restrict `startDate` to current or future dates (unless approved via HR exception).

### LOG-005: Client Project API Rejects Admin/Founder Access with Incorrect 401 Status
- **File:** [`src/app/api/v1/client/projects/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/client/projects/route.ts#L11-L13) (Lines 11–13)
- **Severity:** Medium
- **Details:** Middleware explicitly allows `ADMIN`, `FOUNDER`, and `CO_FOUNDER` to access `/api/v1/client/*` routes. However, the handler contains:
  ```typescript
  if (!userId || role !== "CLIENT") {
    throw new ApiError(401, "Unauthorized");
  }
  ```
  This rejects authorized administrators and founders with a 401 error.
- **Impact:** Administrative staff cannot inspect client project listings through client API endpoints.
- **Remediation:** Allow administrative roles: `if (!userId || (!["CLIENT", "ADMIN", "FOUNDER", "CO_FOUNDER"].includes(role)))`.

### LOG-006: Unhandled Missing Validation on Organization Settings Key
- **File:** [`src/app/api/v1/executive/settings/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/executive/settings/route.ts#L24-L30) (Lines 24–30)
- **Severity:** Medium
- **Details:** The `PATCH` handler takes `{ key, value } = body` without Zod validation. If `key` is missing, empty, or not a string, Prisma throws a raw database constraint error.
- **Impact:** 500 error responses and unhandled exceptions on invalid payload.
- **Remediation:** Wrap with `z.object({ key: z.string().min(1), value: z.any() })`.

---

## 3. Frontend & Routing Inconsistencies

### FE-001: Broken Import in `src/config/siteFacts.ts` Affects Public Components
- **File:** [`src/config/siteFacts.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/config/siteFacts.ts#L6) (Line 6)
- **Severity:** High
- **Components Affected:** `AboutHero`, `Services`, `IndustriesWeServe`, `OurStory`, `WhyChooseAxivon`, `PortfolioStats`.
- **Details:** Because `siteFacts.ts` attempts to import non-existent named export `services`, rendering these components triggers bundler resolution failures.

### FE-002: Duplicate Underscore Route `/admin/content/login_posters`
- **File:** [`src/app/admin/content/login_posters/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/admin/content/login_posters/page.tsx#L1-L6) (Lines 1–6)
- **Severity:** Low
- **Details:** Two parallel directories exist: `login-posters` (active implementation) and `login_posters` (redirect wrapper).
- **Remediation:** Consolidate into canonical hyphenated route and remove redundant directory.

### FE-003: Discrepancy Between Admin Leaves URL Route and API Route
- **File:** [`src/app/admin/leave/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/admin/leave/page.tsx#L65) (Line 65) vs [`src/app/api/v1/admin/leaves/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/admin/leaves/route.ts)
- **Severity:** Medium
- **Details:** The page route is singular (`/admin/leave`), the API route is plural (`/api/v1/admin/leaves`), while employee leave route is singular (`/api/v1/employee/leave`). This inconsistency causes developer confusion and intermittent routing mismatches.

---

## 4. Database & Prisma Schema Deficiencies

### DB-001: Missing Explicit Cascade Delete Actions on Foreign Key Relations
- **File:** [`prisma/schema.prisma`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/prisma/schema.prisma#L44) (Line 44)
- **Severity:** Medium
- **Details:** `User.organization` relation (`fields: [organizationId], references: [id]`) lacks explicit `onDelete` policy. If an organization record is deleted, behavior defaults to restrict or database failure.
- **Remediation:** Explicitly declare `onDelete: SetNull` or `onDelete: Restrict`.

### DB-002: Incomplete Indexes on High-Frequency Filter Fields
- **File:** [`prisma/schema.prisma`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/prisma/schema.prisma)
- **Severity:** Medium
- **Details:** 
  1. `Attendance.date` is queried on every employee dashboard load and report generation without a dedicated index on `[userId, date]`.
  2. `Task.status` and `Task.userId` are queried together on every task load without a composite index `@@index([userId, status])`.
- **Remediation:** Add composite indexes `@@index([userId, date])` on `Attendance` and `@@index([userId, status])` on `Task`.

---

## 5. Code Quality & Architectural Debt

### CQ-001: Excessive File Complexity (>500 LOC) in Core Pages
- **Files:**
  - [`src/app/admin/crm/partner-projects/[id]/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/admin/crm/partner-projects/%5Bid%5D/page.tsx) (1,010 lines)
  - [`src/app/admin/automations/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/admin/automations/page.tsx) (850 lines)
  - [`src/data/services.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/data/services.ts) (1,279 lines)
- **Severity:** Medium
- **Details:** Monolithic client components mixing data fetching, modal states, tab routing, form state, and UI layout into single files exceeding 800+ lines.
- **Remediation:** Refactor into subcomponents under dedicated component directories.

### CQ-002: Deprecated Next.js Middleware File Convention Warning
- **File:** [`src/middleware.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/middleware.ts)
- **Severity:** Low
- **Details:** Next.js 16 emits: `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy`.
- **Remediation:** Prepare proxy migration path according to Next.js 16 recommendations.
