# Backend & API Issues Report

This document records all server-side API failures, HTTP 500 errors, database schema discrepancies, Prisma exceptions, and route collisions captured during live testing.

---

### BE-ISSUE-001: Missing Database Table `WebsiteService` (Prisma P2021)
- **API Endpoint:** `GET /api/v1/admin/content/services`
- **HTTP Method:** `GET`
- **HTTP Status:** `500 Internal Server Error`
- **Controller File:** `src/app/api/v1/admin/content/services/route.ts:17`
- **Prisma Error Code:** `P2021`
- **Exact Terminal Error Log:**
  ```
  API Error: Error [PrismaClientKnownRequestError]: 
  Invalid `db.websiteService.findMany()` invocation in
  src\app\api\v1\admin\content\services\route.ts:17:44

  The table `public.WebsiteService` does not exist in the current database.
    code: 'P2021',
    clientVersion: '5.22.0',
    meta: { modelName: 'WebsiteService', table: 'public.WebsiteService' }
  ```
- **Root Cause:** Prisma model `WebsiteService` was defined or generated in `@prisma/client`, but the PostgreSQL Neon migration was never applied to create the table `public.WebsiteService`.
- **Impact:** Admin cannot view, edit, or configure public services catalog from the admin panel.

---

### BE-ISSUE-002: Missing Database Table `WebsiteArticle` (Prisma P2021)
- **API Endpoint:** `GET /api/v1/admin/content/blog`
- **HTTP Method:** `GET`
- **HTTP Status:** `500 Internal Server Error`
- **Controller File:** `src/app/api/v1/admin/content/blog/route.ts:18`
- **Prisma Error Code:** `P2021`
- **Exact Terminal Error Log:**
  ```
  API Error: Error [PrismaClientKnownRequestError]: 
  Invalid `db.websiteArticle.findMany()` invocation in
  src\app\api\v1\admin\content\blog\route.ts:18:44

  The table `public.WebsiteArticle` does not exist in the current database.
    code: 'P2021',
    clientVersion: '5.22.0',
    meta: { modelName: 'WebsiteArticle', table: 'public.WebsiteArticle' }
  ```
- **Root Cause:** Prisma model `WebsiteArticle` does not exist in the live PostgreSQL database.
- **Impact:** Admin cannot view or publish articles or manage blog posts.

---

### BE-ISSUE-003: Missing Database Column `Commission.payoutRequestedAt` (Prisma P2022)
- **API Endpoint:** `GET /api/v1/broker/commissions`
- **HTTP Method:** `GET`
- **HTTP Status:** `500 Internal Server Error`
- **Controller File:** `src/app/api/v1/broker/commissions/route.ts:17`
- **Prisma Error Code:** `P2022`
- **Exact Terminal Error Log:**
  ```
  API Error: Error [PrismaClientKnownRequestError]: 
  Invalid `db.commission.findMany()` invocation in
  src\app\api\v1\broker\commissions\route.ts:17:45

  The column `Commission.payoutRequestedAt` does not exist in the current database.
    code: 'P2022',
    clientVersion: '5.22.0',
    meta: { modelName: 'Commission', column: 'Commission.payoutRequestedAt' }
  ```
- **Root Cause:** The database migration adding the payout request timestamp column (`payoutRequestedAt`) to the `Commission` table was omitted in Neon production DB.
- **Impact:** Entire Broker Commissions dashboard breaks upon loading.

---

### BE-ISSUE-004: Next.js App Router Dynamic Parameter Collision on `/api/v1/broker/projects/new`
- **API Endpoint:** `GET /api/v1/broker/projects/new`
- **HTTP Method:** `GET`
- **HTTP Status:** `404 Not Found`
- **Controller File:** `src/app/api/v1/broker/projects/[id]/route.ts:42`
- **Exact Terminal Error Log:**
  ```
  API Error: Error [ApiError]: Project not found or access denied.
      at GET (src\app\api\v1\broker\projects\[id]\route.ts:42:25)
    40 |     });
    41 |
  > 42 |     if (!project) throw new ApiError(404, "Project not found or access denied.");
    statusCode: 404
  ```
- **Root Cause:** Next.js dynamic routing convention matches literal `"new"` against `[id]` unless a specific static route folder `new/` takes precedence or client requests the wrong endpoint. When the frontend page `/broker/projects/new` executed a fetch, it evaluated against `projects/[id]` with `id = "new"`. Prisma attempted to find a project where `id == "new"`, found null, and returned 404.
- **Impact:** Broken route, client hangs on infinite loading spinner.

---

### BE-ISSUE-005: Auth Rate Limiter Window Blocks Legitimate Rapid Navigation / Testing
- **API Endpoint:** `POST /api/v1/auth/login`
- **HTTP Method:** `POST`
- **HTTP Status:** `429 Too Many Requests`
- **Controller File:** In-memory sliding window rate limiter (`auth_login:127.0.0.1`)
- **Observed Behavior:** More than 5 requests within 60 seconds from the same IP address triggers HTTP 429.
- **Recommendation:** Provide an internal or test environment bypass flag (`NODE_ENV === 'test'` or header) so automated integration and QA test suites can verify multiple roles without being throttled.
