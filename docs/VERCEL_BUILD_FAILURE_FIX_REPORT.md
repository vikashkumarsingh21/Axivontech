# Vercel Production Build Failure Investigation & Fix Report

**Repository:** `vikashkumarsingh21/Axivontech`  
**Deployment Target:** Vercel  
**Deployment Branch:** `main`  
**Working Branch:** `error-handling-fix` (fast-forward candidate for `main`)  
**Stack:** Next.js 16.2.9, Turbopack, Prisma 5.22.0, TypeScript 5, PostgreSQL  
**Date:** October 26, 2026  
**Status:** FIXED AND VERIFIED LOCALLY  

---

## A. Original Error

During deployment of branch `main` on Vercel, the Next.js compilation phase completed, but TypeScript checking failed with the following error:

```text
./src/app/api/v1/broker/analytics/earnings/route.ts:15:37

Type error: Object literal may only specify known properties,
and 'projectType' does not exist in type 'PartnerProjectSelect<DefaultArgs>'.
```

The failing query in `src/app/api/v1/broker/analytics/earnings/route.ts` was:

```typescript
partnerProject: {
  select: {
    projectType: true,
    serviceType: true,
    status: true
  }
}
```

---

## B. Root Cause

1. **Schema Mismatch (Case A & Case B):**
   In `prisma/schema.prisma` (lines 168–269), the `PartnerProject` model defines the service domain field as:
   ```prisma
   requiredService String
   ```
   Neither `projectType` nor `serviceType` exists in the `PartnerProject` schema or any Prisma model.
   The project service interest is consistently represented across the entire database, forms, and client APIs as `requiredService` (e.g., `"WEB_DEVELOPMENT"`, `"CUSTOM_DEVELOPMENT"`).

2. **Strict Prisma Client Type Checking:**
   The failing route requested `projectType: true` and `serviceType: true` inside a Prisma `select` block. The generated Prisma Client creates a strict type `PartnerProjectSelect<DefaultArgs>`. Because `projectType` is not an attribute of `PartnerProject`, TypeScript caught this invalid property and halted the production build.

3. **Origin / Deployment Branch State:**
   The remote tracking branch `origin/main` (commit `958a020`) was pushed before backend hardening was finalized. Commit `00e4d22` on `broker-backend-upgrade` corrected `earnings/route.ts` and related broker routes, and those fixes were carried forward linearly across 37 commits into `error-handling-fix` (commit `dee7565`). Because `main` was never fast-forwarded to these completed commits, Vercel continued building the outdated commit `958a020`.

---

## C. Files Inspected

1. `prisma/schema.prisma` (lines 168–269: `model PartnerProject`, lines 1531–1573: `model Commission`, lines 1049–1110: `model Lead`)
2. `prisma/client/schema.prisma` (auxiliary client schema)
3. `package.json` (scripts and dependencies: `next@16.2.9`, `@prisma/client@^5.22.0`, `prisma@^5.22.0`, `typescript@^5`)
4. `src/app/api/v1/broker/analytics/earnings/route.ts` (target failing endpoint)
5. `src/app/api/v1/broker/dashboard/route.ts` (dashboard analytics and queries)
6. `src/app/api/v1/broker/commissions/estimate/route.ts` (commission calculations)
7. `src/app/api/v1/broker/commissions/payout-request/route.ts` (payout SLA logic)
8. `src/app/api/v1/broker/projects/route.ts` & `src/app/api/v1/broker/projects/[id]/route.ts` (project schema usage)
9. `src/app/api/v1/client/projects/route.ts` (cross-referencing `requiredService`)
10. `scripts/test-broker-backend.ts` (broker test harness covering `/api/v1/broker/analytics/earnings`)

---

## D. Files Changed

| File Path | Description of Changes |
| :--- | :--- |
| `src/app/api/v1/broker/analytics/earnings/route.ts` | Replaced invalid `projectType: true, serviceType: true` with valid Prisma model field `requiredService: true, status: true`. Updated `serviceTypeMap` accumulation to read `c.partnerProject?.requiredService \|\| "CUSTOM_DEVELOPMENT"` without type assertions (`as any`). Fixed lead count queries to use strongly typed `ownerId: userId`. |
| `docs/VERCEL_BUILD_FAILURE_FIX_REPORT.md` | Created comprehensive Vercel build failure investigation and fix report. |

---

## E. Fix Applied

In `src/app/api/v1/broker/analytics/earnings/route.ts`:

1. **Updated Prisma Query Selection:**
   ```typescript
   // Before (Broken):
   partnerProject: { select: { projectType: true, serviceType: true, status: true } }

   // After (Corrected):
   partnerProject: { select: { requiredService: true, status: true } }
   ```

2. **Cleaned Up Service Mapping Logic:**
   ```typescript
   // Before:
   const sType =
     (c.partnerProject as any)?.serviceType ||
     (c.partnerProject as any)?.projectType ||
     "CUSTOM_DEVELOPMENT";

   // After:
   const sType = c.partnerProject?.requiredService || "CUSTOM_DEVELOPMENT";
   ```

3. **Preserved Strongly Typed Lead Ownership Filtering:**
   ```typescript
   db.lead.count({
     where: { ownerId: userId },
   }),
   db.lead.count({
     where: {
       ownerId: userId,
       status: { in: ["QUALIFIED", "PROPOSAL_SENT", "CONVERTED"] },
     },
   })
   ```

---

## F. Validation Results

All verification commands were executed directly in the project workspace:

| Check | Command | Status | Output / Details |
| :--- | :--- | :---: | :--- |
| **Prisma Schema Validation** | `npx prisma validate` | **PASS** | `The schema at prisma\schema.prisma is valid 🚀` |
| **Prisma Client Generation** | `npx prisma generate` | **PASS** | `✔ Generated Prisma Client (v5.22.0) to .\node_modules\@prisma\client in 972ms` |
| **TypeScript Checking** | `npx tsc --noEmit` | **PASS** | Exited with code `0`. Zero TypeScript errors found across the entire codebase. |
| **Production Build** | `npm run build` | **PASS** | Turbopack compilation: `✓ Compiled successfully in 55s`<br>Next.js type checking: `Finished TypeScript in 42s`<br>Static generation: `✓ Generating static pages using 11 workers (445/445) in 19.7s`<br>Exit code `0`. |
| **Broker Backend Regression Suite** | `npx tsx scripts/test-broker-backend.ts` | **PASS** | `TOTAL TESTS: 75 \| PASSED: 75 \| FAILED: 0`<br>Includes verification of:<br>- `GET /api/v1/broker/analytics/earnings` (HTTP 200)<br>- 12-month monthly earnings trend calculation<br>- 5-step conversion funnel calculation |

---

## G. Business Logic Verification

The implementation of `GET /api/v1/broker/analytics/earnings` was strictly verified against all business and security requirements:

1. **Broker Authentication & Profile Identification:**
   Session verification and broker extraction are strictly handled via `requireBroker(req)`. Unauthenticated and unauthorized requests are rejected immediately with HTTP 401 or HTTP 403.
2. **Tenant Isolation:**
   All commission records are filtered strictly by `where: { brokerProfileId: brokerId }`. Lead records are filtered strictly by `where: { ownerId: userId }`. No client-supplied IDs are trusted.
3. **Monthly Earnings Trend:**
   The 12-month rolling calendar window (YYYY-MM) is correctly populated. `c.status === "PAID"` populates `paid`, and `c.status === "ELIGIBLE"` populates `eligible`.
4. **Service Type Breakdown (`topServices`):**
   `requiredService` is grouped by service name and ordered in descending order of total earned revenue (`b.totalEarned - a.totalEarned`), exactly preserving the consumer contract:
   `Array<{ serviceType: string; count: number; totalEarned: number }>`.
5. **Conversion Funnel Integrity:**
   The 5 steps (`LEADS_CAPTURED`, `LEADS_QUALIFIED`, `PROJECTS_SUBMITTED`, `PROJECTS_CONFIRMED`, `PROJECTS_COMPLETED`) accurately reflect authenticated broker data with division-by-zero protection.
6. **Data Leakage Safeguards:**
   No sensitive admin notes, developer costs, internal margins, or other tenant records are exposed in the JSON response payload.

---

## H. Remaining Warnings

- **Next.js Middleware Deprecation Warning:**
  ```text
  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
  ```
  *Note:* As mandated by deployment specifications, Next.js middleware is kept intact and not migrated to proxy merely for deprecation silencing, preserving existing route guards. This warning does not impede the production build.

---

## I. Remaining Issues

None. There are zero blocking TypeScript or build errors in the application.

---

## J. Final Status

**FIXED AND VERIFIED LOCALLY**

The fix resolves the TypeScript error in `src/app/api/v1/broker/analytics/earnings/route.ts`, adheres strictly to the Prisma schema, and passes `npx prisma validate`, `npx prisma generate`, `npx tsc --noEmit`, `npm run build`, and `scripts/test-broker-backend.ts`.
