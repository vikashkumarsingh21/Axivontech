# Axivon Technologies — Comprehensive Defect Catalog (BUGS.md)

**Generated Date:** 2026-10-24  
**Audit Standard:** Strict Reproducible Evidence-Based Defects  

---

### BUG-001
- **Severity:** Critical
- **Category:** Logic / Runtime
- **Role & Page/URL:** All Roles & All Pages (`/*`, `/admin/*`, `/executive/*`, `/employee/*`, `/broker/*`, `/client/*`)
- **Steps to reproduce:**
  1. Start the Next.js development server: `npm run dev`.
  2. In a browser or HTTP client, request any application page (e.g., `GET http://localhost:3000/admin/dashboard` or `GET http://localhost:3000/`).
  3. Inspect the server terminal output and HTTP response.
- **Expected result:** The page renders the RootLayout and delivers HTTP 200 with HTML content.
- **Actual result:** The server crashes with HTTP 500 Internal Server Error: `ReferenceError: Cannot access 'DEFAULT_INDUSTRIES' before initialization`.
- **Evidence:**
  ```
  ⨯ ReferenceError: Cannot access 'DEFAULT_INDUSTRIES' before initialization
      at DEFAULT_HOMEPAGE_CONTENT.hero.eyebrow [as DEFAULT_INDUSTRIES] (src/config/siteFacts.ts:26:33)
      at module evaluation (src/data/company-stats.ts:10:1)
      at module evaluation (src/lib/content/content-db.ts:2:1)
      at module evaluation (src/app/layout.tsx:43:1)
  ```
- **Suspected root cause:** `src/config/siteFacts.ts` line 26: Circular module dependency. `src/app/layout.tsx` imports `content-db.ts`, which imports `company-stats.ts`, which imports `siteFacts.ts`, which imports `DEFAULT_INDUSTRIES` from `content-db.ts`. Because `content-db.ts` has not finished evaluating, `DEFAULT_INDUSTRIES` is in the temporal dead zone (TDZ) when `siteFacts.ts:26` evaluates `DEFAULT_INDUSTRIES.length`.
- **Suggested fix:** Decouple the circular import in `src/config/siteFacts.ts`. Avoid importing `DEFAULT_INDUSTRIES` from `content-db.ts`. Define a standalone constant or read from a pure data file (e.g. `src/data/industries.ts`).
- **How to verify the fix:** Run `curl -I http://localhost:3000/admin/dashboard` and confirm HTTP 200 OK (or redirect 307 if unauthenticated) without `ReferenceError` in terminal.

---

### BUG-002
- **Severity:** Critical
- **Category:** Functional / Build
- **Role & Page/URL:** Build System / Entire Application
- **Steps to reproduce:**
  1. Run TypeScript check: `npx tsc --noEmit`.
  2. Observe compiler diagnostics.
- **Expected result:** TypeScript compiles with zero errors.
- **Actual result:** Compilation fails: `src/config/siteFacts.ts(6,10): error TS2305: Module '"@/data/services"' has no exported member 'services'.`
- **Evidence:** Terminal output from `npx tsc --noEmit`:
  ```
  src/config/siteFacts.ts(6,10): error TS2305: Module '"@/data/services"' has no exported member 'services'.
  ```
- **Suspected root cause:** `src/config/siteFacts.ts` line 6 imports `{ services }` from `@/data/services`, but `src/data/services.ts` exports `servicesData` (not `services`).
- **Suggested fix:** Change `src/config/siteFacts.ts` line 6 to:
  ```typescript
  import { servicesData as services } from "@/data/services";
  ```
  or export `export const services = servicesData;` in `src/data/services.ts`.
- **How to verify the fix:** Run `npx tsc --noEmit` and verify error TS2305 no longer appears.

---

### BUG-003
- **Severity:** Critical
- **Category:** Security
- **Role & Page/URL:** Background Automations / `/api/v1/jobs` and `/api/v1/jobs/process`
- **Steps to reproduce:**
  1. Send an unauthenticated HTTP GET or POST request to `http://localhost:3000/api/v1/jobs` without cookies or Authorization headers:
     `curl -X GET http://localhost:3000/api/v1/jobs`
  2. Observe that middleware does not intercept or return 401.
- **Expected result:** Next.js middleware rejects the unauthenticated request with 401 Unauthorized before reaching application handlers.
- **Actual result:** The request bypasses `isProtectedApiRoute` in `src/middleware.ts` because `/api/v1/jobs` is omitted from the protection list.
- **Evidence:** `src/middleware.ts` lines 57–65:
  ```typescript
  const isProtectedApiRoute =
    isEmployeeApiRoute ||
    isAdminApiRoute ||
    isExecutiveApiRoute ||
    isBrokerApiRoute ||
    isClientApiRoute ||
    isCrmApiRoute ||
    isAnalyticsApiRoute ||
    isGeneralAuthApiRoute;
  ```
  `isJobsApiRoute` is completely absent.
- **Suspected root cause:** Incomplete route protection list in `src/middleware.ts:57-65`.
- **Suggested fix:** Define `const isJobsApiRoute = pathname.startsWith("/api/v1/jobs");` and include it in `isProtectedApiRoute`.
- **How to verify the fix:** Send `curl -I http://localhost:3000/api/v1/jobs` without headers and verify it returns HTTP 401 Unauthorized.

---

### BUG-004
- **Severity:** High
- **Category:** Security
- **Role & Page/URL:** Employee Portal / `/employee/*` and `/api/v1/employee/*`
- **Steps to reproduce:**
  1. Create a user account with role `USER` or an unassigned/custom role.
  2. Log in and acquire a session cookie.
  3. Navigate to `http://localhost:3000/employee/dashboard`.
- **Expected result:** The middleware blocks non-employee users with 403 Forbidden or redirects to an authorized dashboard.
- **Actual result:** The user is granted access to the employee portal because the middleware only excludes `BUSINESS_PARTNER` and `CLIENT`.
- **Evidence:** `src/middleware.ts` lines 117–122:
  ```typescript
  if ((isEmployeeRoute || isEmployeeApiRoute) && (role === "BUSINESS_PARTNER" || role === "CLIENT")) {
    if (isEmployeeApiRoute) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(getRoleRedirectUrl(role));
  }
  ```
- **Suspected root cause:** Blacklist filtering logic instead of strict whitelist validation.
- **Suggested fix:** Change the authorization check to an explicit allowlist:
  ```typescript
  const allowedEmployeeRoles = ["EMPLOYEE", "ADMIN", "FOUNDER", "CO_FOUNDER"];
  if ((isEmployeeRoute || isEmployeeApiRoute) && !allowedEmployeeRoles.includes(role)) {
    if (isEmployeeApiRoute) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(getRoleRedirectUrl(role));
  }
  ```
- **How to verify the fix:** Issue request with role `USER` to `/employee/dashboard` and verify redirection away from employee portal.

---

### BUG-005
- **Severity:** Critical
- **Category:** Functional / Logic
- **Role & Page/URL:** Executive Portal / `/api/v1/executive/approvals/[id]/approve`
- **Steps to reproduce:**
  1. Submit a high-privilege role change approval request (e.g. promoting an Employee to Admin).
  2. Log in as Founder (`founder@axivon.dev`).
  3. Call `POST /api/v1/executive/approvals/[id]/approve`.
  4. Query the `UserRole` table for the target user in database.
- **Expected result:** The user's role in `UserRole` table is updated to the approved role.
- **Actual result:** `ApprovalRequest.status` is updated to `"APPROVED"`, but `UserRole` is never modified. The target user remains in their old role.
- **Evidence:** `src/app/api/v1/executive/approvals/[id]/approve/route.ts` lines 22–37:
  ```typescript
  const updated = await db.approvalRequest.update({
    where: { id },
    data: {
      status: "APPROVED",
      decidedById: adminId,
      decidedAt: new Date(),
    },
  });
  // No database operation updating UserRole or OrganizationSetting!
  ```
- **Suspected root cause:** Missing business logic execution handler upon approval.
- **Suggested fix:** Add a handler inside a transaction:
  ```typescript
  if (approval.requestType === "HIGH_PRIVILEGE_ROLE_ASSIGNMENT") {
    const details = approval.details as any;
    if (details?.targetUserId && details?.newRoleId) {
      await tx.userRole.deleteMany({ where: { userId: details.targetUserId } });
      await tx.userRole.create({ data: { userId: details.targetUserId, roleId: details.newRoleId } });
    }
  }
  ```
- **How to verify the fix:** Approve a role change and verify `UserRole` in DB reflects the new role.

---

### BUG-006
- **Severity:** High
- **Category:** Security / Privacy
- **Role & Page/URL:** Public Careers / `/api/v1/public/careers/upload-resume`
- **Steps to reproduce:**
  1. Upload a file with MIME type `application/octet-stream` and extension `.pdf`.
  2. Inspect the response URL returned (e.g. `/uploads/resumes/resume-1729753000-abc.pdf`).
  3. Open an incognito browser window without login and access `http://localhost:3000/uploads/resumes/resume-1729753000-abc.pdf`.
- **Expected result:** Resumes are stored privately in non-public storage; unauthenticated users cannot access them.
- **Actual result:** Resumes are saved in `public/uploads/resumes/` and served statically to anyone on the public Internet without authentication.
- **Evidence:** `src/app/api/v1/public/careers/upload-resume/route.ts` lines 42 and 67–73.
- **Suspected root cause:** Storage in public static directory and overly broad MIME check (`application/octet-stream`).
- **Suggested fix:** Remove `application/octet-stream` from valid MIMEs. Store uploaded resumes in a protected directory outside `public/` and stream them only to authenticated administrators with `careers:view` permission.
- **How to verify the fix:** Access the uploaded resume URL anonymously and verify HTTP 403 or 404.

---

### BUG-007
- **Severity:** High
- **Category:** Security
- **Role & Page/URL:** Public Blog / `/blog/[slug]` and `src/components/blog/ArticleDetailView.tsx`
- **Steps to reproduce:**
  1. Create or edit a blog article with content containing: `<img src="x" onerror="alert('XSS')">`.
  2. View the article on `/blog/<slug>`.
- **Expected result:** HTML is sanitized before rendering; JavaScript event handlers are stripped.
- **Actual result:** `dangerouslySetInnerHTML={{ __html: post.contentHtml }}` renders raw HTML without sanitization, triggering XSS.
- **Evidence:** `src/components/blog/ArticleDetailView.tsx` line 192:
  ```tsx
  <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
  ```
- **Suspected root cause:** Lack of DOMPurify sanitization step.
- **Suggested fix:** Use DOMPurify:
  ```tsx
  import DOMPurify from "isomorphic-dompurify";
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.contentHtml) }} />
  ```
- **How to verify the fix:** Inject a test `onerror` attribute and confirm it is stripped from DOM output.

---

### BUG-008
- **Severity:** High
- **Category:** Logic / Attendance
- **Role & Page/URL:** Employee Portal / `/api/v1/employee/attendance`
- **Steps to reproduce:**
  1. Employee checks in at 09:00 and checks out at 17:00 (8 hours worked).
  2. At 21:00 on the same day, employee clicks "check-in" again.
  3. Inspect the updated record in `Attendance` table.
- **Expected result:** Either a second attendance session is created, or an automatic unpaid break is inserted between 17:00 and 21:00.
- **Actual result:** `checkInAt` remains 09:00, `checkOutAt` is set to `null`, and the 4-hour idle period between 17:00 and 21:00 is counted as active worked hours when the employee eventually checks out.
- **Evidence:** `src/app/api/v1/employee/attendance/route.ts` lines 251–264.
- **Suspected root cause:** Resetting `checkOutAt` to `null` on existing record without inserting an offline break period.
- **Suggested fix:** If `todayRecord.checkOutAt` exists when checking in, insert an `AttendanceBreak` record from `todayRecord.checkOutAt` to `now` before clearing `checkOutAt`.
- **How to verify the fix:** Check out, wait 10 seconds, check in, check out again; verify net worked minutes equals active session minutes rather than continuous span.

---

### BUG-009
- **Severity:** Medium
- **Category:** Logic / Validation
- **Role & Page/URL:** Employee Portal / `/api/v1/employee/leave`
- **Steps to reproduce:**
  1. Call `POST /api/v1/employee/leave` with `leaveType: "INVALID_RANDOM_TYPE"` and `startDate` set to two years ago.
- **Expected result:** Validation error rejecting invalid leave type and prohibiting retroactive leave without special approval.
- **Actual result:** Request succeeds and creates a leave request record in the database.
- **Evidence:** `src/app/api/v1/employee/leave/route.ts` lines 19–37.
- **Suspected root cause:** Missing Zod schema validation and missing date sanity check.
- **Suggested fix:** Introduce Zod schema:
  ```typescript
  const leaveSchema = z.object({
    leaveType: z.enum(["CASUAL", "SICK", "PAID", "REMOTE", "UNPAID"]),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    reason: z.string().min(5).max(500),
  });
  ```
- **How to verify the fix:** Submit invalid `leaveType` and confirm HTTP 400 Bad Request.

---

### BUG-010
- **Severity:** Medium
- **Category:** Functional / Permissions
- **Role & Page/URL:** Client Portal API / `/api/v1/client/projects`
- **Steps to reproduce:**
  1. Log in as Admin (`admin@axivon.dev`).
  2. Request `GET /api/v1/client/projects`.
- **Expected result:** Middleware allows Admin access, and API returns client projects or administrative view.
- **Actual result:** API returns HTTP 401 Unauthorized with `Unauthorized` message.
- **Evidence:** `src/app/api/v1/client/projects/route.ts` lines 11–13:
  ```typescript
  if (!userId || role !== "CLIENT") {
    throw new ApiError(401, "Unauthorized");
  }
  ```
- **Suspected root cause:** Route handler hardcodes `role !== "CLIENT"` check, conflicting with `src/middleware.ts:131` which grants ADMIN and FOUNDER access.
- **Suggested fix:** Update check to:
  ```typescript
  if (!userId || !["CLIENT", "ADMIN", "FOUNDER", "CO_FOUNDER"].includes(role)) {
    throw new ApiError(403, "Access denied.");
  }
  ```
- **How to verify the fix:** Query `/api/v1/client/projects` with Admin cookie and confirm HTTP 200 response.

---

### BUG-011
- **Severity:** Medium
- **Category:** Security
- **Role & Page/URL:** Middleware / Authentication Token Verification
- **Steps to reproduce:**
  1. Remove or comment out `SESSION_SECRET` in non-production environment.
  2. Generate a JWT signed with key `fallback-dev-session-secret-at-least-32-chars-long`.
  3. Send request to protected route with that JWT cookie.
- **Expected result:** The server refuses to verify sessions without an explicitly configured secret.
- **Actual result:** Token passes verification.
- **Evidence:** `src/middleware.ts` line 12.
- **Suspected root cause:** Insecure fallback string in secret decoding.
- **Suggested fix:** Throw a critical exception if `SESSION_SECRET` is missing or shorter than 32 characters.
- **How to verify the fix:** Ensure undefined secret triggers immediate rejection.

---

### BUG-012
- **Severity:** Low
- **Category:** Data / Security
- **Role & Page/URL:** Database Seed / `prisma/seed.ts`
- **Steps to reproduce:**
  1. Run `npx prisma db seed` without `ADMIN_SEED_PASSWORD` configured.
  2. Inspect seeded password hash.
- **Expected result:** Production seed requires explicit environment password or throws an error.
- **Actual result:** Well-known static default password `AxivonAdmin@2024` is seeded.
- **Evidence:** `prisma/seed.ts` lines 337, 365, 399.
- **Suspected root cause:** Fail-open static defaults for convenience in dev.
- **Suggested fix:** Fail closed in production mode if seed passwords are not provided.

---

### BUG-013
- **Severity:** High
- **Category:** Backend / Database
- **Role & Page/URL:** Admin / `/admin/content/services` -> `GET /api/v1/admin/content/services`
- **Steps to reproduce:**
  1. Log in as Admin (`admin@axivon.dev`).
  2. Navigate to `http://localhost:3000/admin/content/services`.
  3. Inspect server log and network tab.
- **Expected result:** Services catalog table renders with existing services or empty state (HTTP 200).
- **Actual result:** API returns HTTP 500 Internal Server Error: `The table public.WebsiteService does not exist in the current database` (Prisma error P2021). The frontend hangs indefinitely on a red loading spinner.
- **Evidence:** Terminal output from Next.js server:
  ```
  API Error: Error [PrismaClientKnownRequestError]: 
  Invalid `db.websiteService.findMany()` invocation in
  src/app/api/v1/admin/content/services/route.ts:17:44
  The table `public.WebsiteService` does not exist in the current database.
    code: 'P2021',
    meta: { modelName: 'WebsiteService', table: 'public.WebsiteService' }
  ```
  Screenshot: `browser-screenshots/admin-content-services.png`
- **Suspected root cause:** PostgreSQL migration was never run to create table `public.WebsiteService`.
- **Suggested fix:** Run `npx prisma db push` or create a migration for model `WebsiteService`, or fall back to static services data if DB table is absent.
- **How to verify the fix:** Navigate to `/admin/content/services` and verify HTTP 200 response.

---

### BUG-014
- **Severity:** High
- **Category:** Backend / Database
- **Role & Page/URL:** Admin / `/admin/content/blog` -> `GET /api/v1/admin/content/blog`
- **Steps to reproduce:**
  1. Log in as Admin (`admin@axivon.dev`).
  2. Navigate to `http://localhost:3000/admin/content/blog`.
- **Expected result:** Blog article CMS interface displays existing articles (HTTP 200).
- **Actual result:** API returns HTTP 500: `The table public.WebsiteArticle does not exist in the current database` (Prisma error P2021).
- **Evidence:** Terminal output:
  ```
  API Error: Error [PrismaClientKnownRequestError]: 
  Invalid `db.websiteArticle.findMany()` invocation in
  src/app/api/v1/admin/content/blog/route.ts:18:44
  The table `public.WebsiteArticle` does not exist in the current database.
    code: 'P2021',
    meta: { modelName: 'WebsiteArticle', table: 'public.WebsiteArticle' }
  ```
  Screenshot: `browser-screenshots/admin-content-blog.png`
- **Suspected root cause:** PostgreSQL table `public.WebsiteArticle` has not been pushed to the database.
- **Suggested fix:** Synchronize database schema with `npx prisma db push`.
- **How to verify the fix:** Query `/api/v1/admin/content/blog` and confirm HTTP 200 response.

---

### BUG-015
- **Severity:** High
- **Category:** Backend / Database
- **Role & Page/URL:** Broker / `/broker/commissions` -> `GET /api/v1/broker/commissions`
- **Steps to reproduce:**
  1. Log in as Broker (`qa.broker@axivon.dev`).
  2. Navigate to `http://localhost:3000/broker/commissions`.
- **Expected result:** Broker commissions table and payout request interface load (HTTP 200).
- **Actual result:** API returns HTTP 500: `The column Commission.payoutRequestedAt does not exist in the current database` (Prisma error P2022). The page hangs in an infinite spinner.
- **Evidence:** Terminal output:
  ```
  API Error: Error [PrismaClientKnownRequestError]: 
  Invalid `db.commission.findMany()` invocation in
  src/app/api/v1/broker/commissions/route.ts:17:45
  The column `Commission.payoutRequestedAt` does not exist in the current database.
    code: 'P2022',
    meta: { modelName: 'Commission', column: 'Commission.payoutRequestedAt' }
  ```
  Screenshot: `browser-screenshots/broker-commissions.png`
- **Suspected root cause:** Prisma schema includes field `payoutRequestedAt DateTime?`, but the Neon database column is missing.
- **Suggested fix:** Run `npx prisma db push` to add column `payoutRequestedAt` to table `Commission`.
- **How to verify the fix:** Query `/api/v1/broker/commissions` and confirm HTTP 200 response.

---

### BUG-016
- **Severity:** High
- **Category:** Routing / UX
- **Role & Page/URL:** Broker / `/broker/projects/new` -> `GET /api/v1/broker/projects/new`
- **Steps to reproduce:**
  1. Log in as Broker (`qa.broker@axivon.dev`).
  2. Navigate to `http://localhost:3000/broker/projects/new`.
- **Expected result:** New project referral creation form renders.
- **Actual result:** Route collision occurs. The request hits `src/app/api/v1/broker/projects/[id]/route.ts` where `id = "new"`. Prisma throws `404: Project not found or access denied`. The frontend hangs on an infinite loading spinner.
- **Evidence:** Terminal output:
  ```
  API Error: Error [ApiError]: Project not found or access denied.
      at GET (src/app/api/v1/broker/projects/[id]/route.ts:42:25)
  GET /api/v1/broker/projects/new 404 in 11.6s
  ```
  Screenshot: `browser-screenshots/broker-projects-new.png`
- **Suspected root cause:** Next.js dynamic segment `[id]` intercepts requests to `/new`. Either create a dedicated `src/app/api/v1/broker/projects/new/route.ts` or avoid making a GET request to `/new` on a creation form page.
- **Suggested fix:** In `src/app/broker/projects/new/page.tsx`, do not fetch `/api/v1/broker/projects/new` as a project detail route.
- **How to verify the fix:** Open `/broker/projects/new` and ensure form renders with submit button.

---

### BUG-017
- **Severity:** High
- **Category:** Architecture / Security / Frontend
- **Role & Page/URL:** Public / `/careers-privacy`
- **Steps to reproduce:**
  1. In a real browser, navigate to `http://localhost:3000/careers-privacy`.
  2. Open DevTools Console.
- **Expected result:** Privacy policy renders cleanly without client-side exceptions.
- **Actual result:** Client-side Zod validation fails, logging `❌ Invalid environment variables` and throwing `Uncaught Error: Invalid environment variables`.
- **Evidence:** Browser console error:
  ```
  [browser] Uncaught Error: Invalid environment variables
      at module evaluation (src/lib/env.ts:14:9)
      at module evaluation (src/lib/db.ts:2:1)
      at module evaluation (src/lib/legal/legal-db.ts:1:1)
      at module evaluation (src/components/legal/LegalPageLayout.tsx:19:1)
      at CareersPrivacyPage (src/app/careers-privacy/page.tsx:34:7)
  ```
  Screenshot: `browser-screenshots/public-careers-privacy.png`
- **Suspected root cause:** A client component in `LegalPageLayout.tsx` or `careers-privacy/page.tsx` directly or transitively imports server-only database utilities (`src/lib/db.ts` -> `src/lib/env.ts`). Server environment variables (`DATABASE_URL`, `SESSION_SECRET`) are undefined in the browser window, causing `env.ts` Zod validation to fail.
- **Suggested fix:** Move database and environment logic to a React Server Component (RSC) and pass only sanitized legal text props to `LegalPageLayout`.
- **How to verify the fix:** Open `/careers-privacy` and verify zero console errors.

---

### BUG-018
- **Severity:** Medium
- **Category:** Frontend / SSR
- **Role & Page/URL:** Employee / `/employee/work-reports`
- **Steps to reproduce:**
  1. Log in as Employee (`qa.employee@axivon.dev`).
  2. Navigate to `http://localhost:3000/employee/work-reports`.
  3. Inspect DevTools console during initial hydration.
- **Expected result:** Clean hydration without DOM mismatch warnings.
- **Actual result:** React throws hydration mismatch error overlay:
  ```
  Uncaught Error: Hydration failed because the server rendered text didn't match the client.
  + Saturday, Oct 24, 2026
  - Saturday, 24 Oct 2026
    at ReportsPage (src/app/employee/work-reports/page.tsx:198:15)
  ```
  Screenshot: `browser-screenshots/employee-work-reports.png`
- **Suspected root cause:** `new Date().toLocaleDateString(undefined, ...)` in line 199 evaluates differently on the Node.js server locale than the client browser locale.
- **Suggested fix:** Use a deterministic date formatter (e.g., standard format string or `date-fns`) or render the date client-side inside a `useEffect` / `suppressHydrationWarning`.
- **How to verify the fix:** Reload `/employee/work-reports` and confirm no hydration error appears in console.
