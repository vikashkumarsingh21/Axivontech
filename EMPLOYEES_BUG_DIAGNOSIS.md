# Root Cause Diagnosis Report: Empty Employees Bug on `/admin/employees`

**Document:** `EMPLOYEES_BUG_DIAGNOSIS.md`  
**Investigation Date:** November 1, 2026  
**Investigator:** Senior Full-Stack Debugger + QA Lead  
**Branch:** `fix-admin-employees-empty`  
**Target:** Axivon Technologies Platform (`/admin/employees`)  

---

## 1. Executive Summary & Proven Root Cause

### The Symptom
When navigating to `/admin/employees` as an authenticated Administrator (`admin@axivon.dev`):
- Header displays: `"Employees (0 total employees)"`
- Table displays: `"No employees found matching your search."`
- No error banner or notification appears.

### The Proven Root Cause: Suspect (c) — Response Unwrapping Bug
In commit `68dcd55` (*"feat(errors): complete Step 5 platform-wide rollout of central error and notification system"*), the fetch call in `src/app/admin/employees/page.tsx` was refactored from `await res.json()` to `await parseApiResponse(res)` from `@/lib/errors/client.ts`.

1. **Server Response:**  
   `GET /api/v1/admin/employees` returns an object:
   ```json
   {
     "data": [ /* 10 employee objects */ ],
     "meta": { "total": 21, "page": 1, "limit": 10, "pages": 3 }
   }
   ```
2. **Client Helper Behavior (`parseApiResponse` line 289):**  
   `parseApiResponse` automatically unwraps `raw.data` into `parsed.data`:
   ```ts
   const data: T | null = ok ? (raw?.data !== undefined ? raw.data : raw) : null;
   ```
   Because `raw.data` is an Array of employees, `parsed.data` becomes the JavaScript **Array** itself, while `parsed.raw` retains the full response object `{ data: [...], meta: {...} }`.
3. **The Regression in `page.tsx` (lines 91–94):**
   ```tsx
   const data = parsed.data || parsed.raw;
   setEmployees(data?.data || []);
   setTotalPages(data?.meta?.pages || 1);
   setTotalRecords(data?.meta?.total || 0);
   ```
   Because `data` is `parsed.data` (which is already the Array of employees):
   - `data?.data` evaluates to `undefined` → sets `employees = []` (Empty list!).
   - `data?.meta?.total` evaluates to `undefined` → sets `totalRecords = 0` ("0 total employees"!).
   - `data?.meta?.pages` evaluates to `undefined` → sets `totalPages = 1`.

Because `employees.length === 0`, line 360 immediately falls through to render:
```tsx
No employees found matching your search.
```
even though the API successfully returned HTTP 200 with all employee records!

---

## 2. Live Database Truth (Direct Read-Only Audit)

Connected to live Neon DB (`ep-super-king-b3813msu-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb`):
- **Total User Rows in Database:** 23
- **Users with role `EMPLOYEE`:** 8
  1. `mohandeepak4297@gmail.com` ("Mohan Deepak") — `ACTIVE`, Org: `axivon-org-001`
  2. `bhardwajvinay400@gmail.com` ("Vinay Partap Singh") — `ACTIVE`, Org: `axivon-org-001`
  3. `shaiksuhana2424@gmail.com` ("Suhana Shaik") — `ACTIVE`, Org: `axivon-org-001`
  4. `1032251299@tcetmumbai.in` ("Aditya Ajay Singh ") — `ACTIVE`, Org: `axivon-org-001`
  5. `mantrakhandelwaljee@gmail.com` ("Mantra Khandelwal") — `ACTIVE`, Org: `axivon-org-001`
  6. `vk0102103@gmail.com` ("Vikash Kumar") — `ACTIVE`, Org: `axivon-org-001`
  7. `qa.employee@axivon.dev` ("QA Test Employee") — `ACTIVE`, Org: `axivon-org-001`
  8. `suspended.user@axivon.dev` ("Suspended Test User") — `SUSPENDED`, Org: `null`
- **Administrator Record:**
  - `admin@axivon.dev` ("Admin Profile") — `ACTIVE`, Role: `ADMIN`, Org: `axivon-org-001`
- **Soft-Delete Columns:** `User` has `inactiveAt: null` for active employees. No `deletedAt` column exists on `User`.
- **Conclusion:** All workforce records exist intact in Neon PostgreSQL. There was zero data loss.

---

## 3. Suspect Analysis (a through k)

| Suspect | Suspect Description | Verdict | Evidence / Rationale |
|---|---|---|---|
| **a** | DB is a new/empty branch or wrong schema | **NO** | Direct query shows 23 users and 8 employees in Neon. |
| **b** | API returns 401/403/500 swallowed by page | **NO** | API returns HTTP 200 OK with records. |
| **c** | API response shape / client unwrapping mismatch | **YES (ROOT CAUSE)** | `parseApiResponse` sets `parsed.data = formattedEmployees` (Array). `page.tsx` called `data?.data`, which is `undefined` on an Array, wiping the list to `[]` and setting count to `0`. |
| **d** | Soft-delete/archive/status filter excluding rows | **NO** | Default status is empty; records have `inactiveAt: null`. |
| **e** | Organization scoping mismatch | **NO** | API route does not filter by `organizationId`. |
| **f** | Role mapping / filter discrepancy | **PARTIAL** | `route.ts` excluded `["ADMIN", "FOUNDER", "CO_FOUNDER"]` but did not filter for `EMPLOYEE` or exclude `BROKER`/`CLIENT`, allowing non-employees to leak into the list. |
| **g** | Permission change returning empty list | **NO** | Admin role bypasses permission checks and has full `users:read`. |
| **h** | Pagination bug (`page=0`, `limit=0`) | **NO** | Default pagination is `page=1`, `limit=10`. |
| **i** | Invalid default filter values | **NO** | Defaults are `""` (All). |
| **j** | Route / fetch caching returning stale empty | **NO** | Route is dynamic and executed live against the database. |
| **k** | Leftover test/rate-limit/TEST_MODE flag | **NO** | No test bypass flags interfered with the query. |

---

## 4. Other Admin Pages Audit

1. **`/admin/crm/leads`:** Uses `await res.json()` directly (`data.data || []`). Not affected by `parseApiResponse` unwrapping.
2. **`/admin/crm/clients`:** Uses `await res.json()` directly (`data.data || []`). Not affected.
3. **`/admin/crm/brokers`:** Uses `await res.json()` directly (`data.data || []`). Not affected.
4. **`/admin/attendance`:** Uses `await res.json()` directly. Not affected.
5. **`/admin/tasks`:** Uses `await empRes.json()` directly. Not affected.
6. **`/executive/people`:** Uses `await r.json()` directly. Not affected.

However, all of these pages share the same missing-error/empty-state weakness: if a fetch fails, they silently fallback to `[]` with "No items found". In Step 2, we will harden `/admin/employees` and provide robust Loading (skeleton), Error (with Retry), and Empty (distinguishing "No search matches" with Clear Filters vs "No employees yet") states.
