# AxivonTech Performance Baseline Report

**Project:** Axivon Technologies (AxivonTech)  
**Date:** November 4, 2026  
**Environment:** Next.js 16.2.9 (Turbopack), React 19.2.4, Prisma 5.22.0, Neon PostgreSQL (AWS `ap-southeast-1`), Node.js v22.17.1  
**Audit Scope:** Complete Application-Wide Authenticated Portals & API Layer

---

## 1. Executive Summary

A comprehensive, empirical performance audit was conducted across the entire authenticated AxivonTech platform. Real database query timings, API execution profiles, and frontend architectural bottlenecks were measured under live connection to the Neon PostgreSQL database.

The audit revealed three primary root causes responsible for slow page loads and sluggish portal navigation:
1. **Uncached, Deeply Nested RBAC Permission Queries:** Every protected API call invokes `requirePermission()` or `hasPermission()`, executing a 4-level relational join (`user -> userRoles -> role -> rolePermissions -> permission`) over Neon network latency, taking **~999 ms** per request.
2. **Dashboard Query Explosions:** Dashboards fire dozens of simultaneous or sequential database queries. For example, `GET /api/v1/admin/dashboard/summary` triggers **28 concurrent queries**, taking **~1,806 ms**. The Manager dashboard runs 6 sequential queries instead of parallelized execution.
3. **Frontend Duplicate & Eager Fetching Cascades:** On initial load, pages fire 3 to 4 simultaneous requests (e.g. `me` + `dashboard` + `notifications/unread-count` + `portal-ai/config`). The AI assistant eagerly fetches its configuration even when completely closed.

---

## 2. Portal-by-Portal Performance Audit

### 1. Admin Portal (`/admin/*`)
* **Primary Page:** `/admin/dashboard`
* **API Endpoint:** `GET /api/v1/admin/dashboard/summary`
* **Queries Executed:** **28 database queries** per page visit
* **Measured Backend Duration:** **1,806.43 ms** (API queries) + **999.04 ms** (RBAC permission validation) = **~2.80 seconds**
* **Identified Bottlenecks:**
  - 5 separate count queries executed on `Lead` (`NEW`, `NEW` without contact, `QUALIFIED`, `CONVERTED`, total) instead of a single `groupBy`.
  - 4 separate count queries on `PartnerProject` and `PartnerContract`.
  - Server Component `AdminLayout` calls `db.user.findUnique` on every page route transition.
  - Eagerly mounted `PortalAIAssistant` calls `/api/v1/portal-ai/config` even when minimized.

### 2. Founder & Co-Founder Executive Portal (`/executive/*`)
* **Primary Page:** `/executive/dashboard`
* **API Endpoint:** `GET /api/v1/executive/dashboard/summary`
* **Queries Executed:** **7 database count queries** + permission query + scope query
* **Measured Backend Duration:** **381.42 ms** (KPI counts) + **~999 ms** (RBAC) = **~1.38 seconds**
* **Identified Bottlenecks:**
  - `getExecutiveScope(userId)` executes a redundant query for profile settings.
  - Multi-department filter is evaluated dynamically on every request without indexing on `department`.

### 3. Employee Portal (`/employee/*`)
* **Primary Page:** `/employee/dashboard`
* **API Endpoints:** `GET /api/v1/employee/dashboard` & `GET /api/v1/employee/me`
* **Queries Executed:** **10 queries** in dashboard + **1 query** in `me` + lazy `closeStaleAttendance`
* **Measured Backend Duration:** **387.53 ms** (Dashboard data) + `getSessionUser` (~250 ms) = **~637 ms**
* **Identified Bottlenecks:**
  - Duplicate API call: Frontend requests both `/api/v1/employee/me` and `/api/v1/employee/dashboard` in parallel. Both verify the session and query the user.
  - `closeStaleAttendance` runs synchronously on every dashboard hit before loading statistics.

### 4. Broker / Business Partner Portal (`/broker/*`)
* **Primary Page:** `/broker/dashboard`
* **API Endpoints:** `GET /api/v1/broker/dashboard`, `GET /api/v1/broker/profile`, `GET /api/v1/broker/analytics/earnings`
* **Queries Executed:** **11 queries** in dashboard + 4 in profile + 3 in analytics = **18 queries** total
* **Measured Backend Duration:** **449.05 ms** (Dashboard) + ~300 ms (Profile) + ~350 ms (Analytics) = **~1.10 seconds**
* **Identified Bottlenecks:**
  - `qualificationNotes: { contains: ... }` executes an unindexed full table scan with `LIKE '%[Referral: ...]%'` on the `Lead` table.
  - `useBrokerFetch` re-evaluates and can cause duplicate fetches when options objects change reference.
  - `BrokerLayout` calls `/api/v1/broker/profile` on every sub-route transition.

### 5. Department Manager Portal (`/manager/*`)
* **Primary Page:** `/manager/dashboard`
* **API Endpoint:** `GET /api/v1/manager/dashboard`
* **Queries Executed:** **6 sequential queries** (await chaining)
* **Measured Backend Duration:** **~480 ms** due to sequential network round trips
* **Identified Bottlenecks:**
  - Department employees, tasks, attendance, leaves, and work reports are loaded with sequential `await` statements instead of `Promise.all`.
  - Case-insensitive filter on unindexed `department` column (`mode: "insensitive"`).

### 6. Client Portal (`/client/*`)
* **Primary Page:** `/client/dashboard`
* **API Endpoint:** `GET /api/v1/client/projects`
* **Queries Executed:** 1 query + `validateActiveUser`
* **Measured Backend Duration:** **407.46 ms** (Projects query) + **~200 ms** (Active user check) = **~607 ms**

---

## 3. Real Baseline Performance Measurements

Empirical measurements gathered via `scripts/benchmark-baseline.ts` under live Neon PostgreSQL connection:

| Operation / Metric | Category | Real Duration (ms) | Database Queries | Severity |
| :--- | :--- | :--- | :--- | :--- |
| `requirePermission()` (4-level joined RBAC query) | DATABASE / AUTH | **999.04 ms** | 1 (Heavy Join) | 🔴 CRITICAL |
| `Admin Dashboard Summary` (28 concurrent queries) | API_QUERY | **1,806.43 ms** | 28 | 🔴 CRITICAL |
| `Broker Dashboard` (includes `LIKE` scan on `Lead`) | API_QUERY | **449.05 ms** | 6 | 🟠 HIGH |
| `Employee Dashboard Data Fetch` | API_QUERY | **387.53 ms** | 7 | 🟠 HIGH |
| `Executive Dashboard KPI Counts` | API_QUERY | **381.42 ms** | 7 | 🟡 MEDIUM |
| `Client Portal Projects Query` | API_QUERY | **407.46 ms** | 1 | 🟡 MEDIUM |
| `JWT Sign Session (HS256)` | AUTH | **7.55 ms** | 0 | 🟢 FAST |
| `JWT Verify Session in Middleware` | AUTH | **2.39 ms** | 0 | 🟢 FAST |

### JavaScript Chunk Analysis (Largest Bundles in Production Build):
- `256u-0mc9xz70.js`: **462.8 KB** (Vendors / UI core)
- `2h_g1un6d75kc.js`: **348.6 KB** (Portal client runtime)
- `1_-1oba9ialfz.js`: **348.6 KB** (Recharts & SVG visualization engines)
- `329j824l1odqw.js`: **226.5 KB** (Lucide icons and icons index)
- `2sos1bzjsdfob.js`: **149.9 KB** (Framer motion animation runtime)

---

## 4. Key Performance Bottlenecks & Optimization Plan

### Priority 1: RBAC & Permission Query Caching
- **Problem:** `requirePermission()` runs a 4-table join on every single API request, consuming ~1 second per hit.
- **Solution:** Implement a high-performance in-memory LRU/TTL cache (60 seconds) keyed by `userId:permission`. For administrative roles (`ADMIN`, `FOUNDER`, `CO_FOUNDER`), bypass the deep join immediately once the role is established. Target reduction: **999 ms → < 1 ms** on warm cache.

### Priority 2: Admin Dashboard Query Consolidation
- **Problem:** 28 separate queries are fired simultaneously, saturating connection poolers.
- **Solution:**
  - Consolidate 5 `Lead` status count queries into a single `groupBy({ by: ['status'] })`.
  - Cache the aggregated summary metrics in memory with a short 30-second TTL with stale-while-revalidate.
  - Target reduction: **1,806 ms → < 50 ms** on cached reads.

### Priority 3: Eliminate Redundant & Eager Frontend Network Requests
- **Problem:**
  - `PortalAIAssistant` fetches `/api/v1/portal-ai/config` on every layout load even when closed.
  - `EmployeeDashboard` requests both `/api/v1/employee/me` and `/api/v1/employee/dashboard`.
  - `BrokerLayout` calls `/api/v1/broker/profile` on every navigation.
- **Solution:**
  - Make `PortalAIAssistant` lazy: only fetch config when opened.
  - Return `user` summary in `/api/v1/employee/dashboard` and cache `/employee/me`.
  - Cache broker profile and session state in client context to avoid re-fetching on navigation.

### Priority 4: Database Index & Connection Optimization
- **Problem:**
  - In `src/lib/db.ts`, `globalThis.prismaGlobal` is only set in non-production, causing connection churn in Vercel serverless.
  - Missing indexes on `User.status`, `User.department`, `AuditLog.action`, `AuditLog.createdAt`.
- **Solution:**
  - Ensure `db.ts` reuses the singleton `PrismaClient` across warm serverless lambdas.
  - Parallelize Manager dashboard queries using `Promise.all`.
  - Add targeted indexes in `schema.prisma`.

### Priority 5: Middleware Static Asset Skipping
- **Problem:** Middleware matcher runs on all public images, logos, and APK downloads.
- **Solution:** Update `middleware.ts` matcher to explicitly skip `.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|apk|css|js|woff|woff2)$`.
