# AXIVON ONE — MASTER AUDIT FINDINGS REGISTER

**Document ID:** `AXIVON-AUDIT-REGISTER-2026-10`  
**Platform Version:** AXIVON ONE v0.1.0 (`axivontech.in`)  
**Audit Executed:** October 22, 2026  
**Auditing Entity:** Senior Technical Architecture & Quality Assurance Audit Team  

---

## 1. Register Overview & Severity Scale

Every significant architectural, functional, security, financial, and code finding is assigned a persistent unique identifier (`AX-AUD-XXX`):

* **CRITICAL:** High risk of immediate data loss, financial loss, or critical unauthenticated security compromise.
* **HIGH:** Major functional defect, business rule violation, cross-tenant data leak, or CI pipeline blocker.
* **MEDIUM:** Secondary functional issue, offline build limitation, or operational configuration gap.
* **LOW:** Minor code quality issue, dead-code stub, or non-blocking cosmetic warning.
* **INFORMATIONAL:** Architectural observation, metric tally, or planned enhancement advice.

---

## 2. Master Findings Register

### AX-AUD-001: Brittle Test Date Hardcoding in Admin Attendance API Suite
* **Finding ID:** `AX-AUD-001`
* **Title:** Time-Drift Failure in Admin Attendance Live Monitor Test Suite
* **Portal / Module:** Workforce & Shift Management / Test Suite
* **Affected File / Route:** [`tests/attendance-complete-system.test.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/tests/attendance-complete-system.test.ts#L608-L635) & `/api/v1/admin/attendance`
* **Severity:** **HIGH**
* **Category:** Automated Test & CI Reliability
* **Evidence:** Test failed on October 22, 2026 with `AssertionError: expected +0 to be 1`.
* **Root Cause:** Hardcoded test timestamp `2026-10-20T23:00:00Z` aged beyond 24 hours relative to real system clock `new Date()`, causing `AttendanceService.calculateDay` to treat the unclosed session as abandoned (`isHistoricalUnclosed = true`).
* **Business / Security Impact:** Test suite failed in automated CI/CD gating, blocking deployments even though underlying production business logic is sound.
* **Recommended Action:** Virtualize test clock via `vi.useFakeTimers()` to pin time to `2026-10-21T08:00:00Z`.
* **Dependencies:** None.
* **Verification Required:** Full Vitest test suite execution.
* **Status:** **REPAIRED & VERIFIED PASSING** (Test passed in 35ms; 674/674 tests green).

---

### AX-AUD-002: 0-Byte Placeholder Stub Files in Core Library
* **Finding ID:** `AX-AUD-002`
* **Title:** 0-Byte Placeholder Stub Files in `src/lib/`
* **Portal / Module:** Shared Core Library
* **Affected Files:**
  - `src/lib/embeddings.ts`
  - `src/lib/openai.ts`
  - `src/lib/pinecone.ts`
  - `src/lib/rag.ts`
  - `src/lib/sheets.ts`
* **Severity:** **LOW**
* **Category:** Code Quality & Repository Hygiene
* **Evidence:** File sizes are exactly 0 bytes; files have 0 exports and no active imports.
* **Root Cause:** Abandoned boilerplate files created during initial setup in June 2026 before shifting to `@google/generative-ai`.
* **Business / Security Impact:** None. Zero impact on build or runtime.
* **Recommended Action:** Safely delete the 5 files during routine housekeeping.
* **Dependencies:** None.
* **Verification Required:** Run `npx tsc --noEmit` after deletion to ensure no references exist.
* **Status:** **IDENTIFIED (Scheduled for Deletion)**

---

### AX-AUD-003: Next.js Turbopack Google Font Prerender Dependency on External CDN
* **Finding ID:** `AX-AUD-003`
* **Title:** Build Failure in Air-Gapped Environments During Google Font Prerender
* **Portal / Module:** Core Layout & Build System
* **Affected Files:** [`src/app/layout.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/layout.tsx#L18-L40), `next.config.ts`
* **Severity:** **MEDIUM**
* **Category:** Build & DevOps Reliability
* **Evidence:** `npm run build` inside sandbox without network threw `Failed to fetch Inter from Google Fonts`.
* **Root Cause:** `next/font/google` attempts to query `fonts.googleapis.com` during static optimization.
* **Business / Security Impact:** Prevents building in strictly offline or isolated container build pipelines.
* **Recommended Action:** Download font WOFF2 files into `public/fonts/` and configure `next/font/local`.
* **Dependencies:** None.
* **Verification Required:** Verified `npm run build` succeeds when outbound network is available (412 routes generated).
* **Status:** **WORKAROUND VERIFIED (Long-term local font refactor recommended)**

---

### AX-AUD-004: ESLint Unused Symbol and Type Warnings
* **Finding ID:** `AX-AUD-004`
* **Title:** Non-Blocking ESLint Warnings Across Application Files
* **Portal / Module:** Repository-Wide
* **Affected Files:** Various files across `src/app/` and `src/components/`
* **Severity:** **INFORMATIONAL**
* **Category:** Code Hygiene
* **Evidence:** `npm run lint` reported 0 errors and 2,207 warnings (mostly `@typescript-eslint/no-unused-vars` and `any`).
* **Root Cause:** Unused component imports (e.g. icon sets) and test fixture mocks using `any`.
* **Business / Security Impact:** None. Does not break compilation or runtime.
* **Recommended Action:** Run automated lint auto-fix (`npm run lint -- --fix`) and type test fixtures properly.
* **Dependencies:** None.
* **Status:** **AUDITED (Non-blocking)**

---

### AX-AUD-005: Production Environment Variable Provisioning Requirements
* **Finding ID:** `AX-AUD-005`
* **Title:** Mandatory Injection of Production Secrets Prior to Live Launch
* **Portal / Module:** Deployment & Environment Configuration
* **Affected Files:** `.env.example`, [`src/middleware.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/middleware.ts#L8-L11), `src/lib/env.ts`
* **Severity:** **MEDIUM**
* **Category:** Operations & Security
* **Evidence:** `SESSION_SECRET` currently falls back to a development secret if unset in non-production environments.
* **Root Cause:** Standard security configuration requirement for production deployment.
* **Business / Security Impact:** If deployed to production without a dedicated high-entropy `SESSION_SECRET`, sessions could be forged if the fallback string is known.
* **Recommended Action:** Ensure deployment pipeline injects cryptographically random `SESSION_SECRET` ($\ge 32$ chars) and valid keys for `TURNSTILE_SECRET_KEY` and `RECAPTCHA_SECRET_KEY`.
* **Dependencies:** Production hosting provider (e.g. Vercel, AWS, Cloudflare).
* **Status:** **DOCUMENTED (Pre-production checklist item)**

---

### AX-AUD-006: Dynamic Sitemap Fallback Resilience
* **Finding ID:** `AX-AUD-006`
* **Title:** Sitemap Generation Resiliently Degrades on Database Disconnect
* **Portal / Module:** SEO & Public Sitemap Engine
* **Affected Files:** [`src/app/sitemap.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/sitemap.ts)
* **Severity:** **LOW**
* **Category:** SEO & Availability
* **Evidence:** Test runner console logs `[isCareersPageEnabled Error]` when database mock is omitted; sitemap returns core pages safely.
* **Root Cause:** Database query inside sitemap is safely wrapped with try/catch to guarantee robots can always fetch indexable URLs.
* **Business / Security Impact:** Positive impact. Prevents crawler 500 errors during database maintenance.
* **Recommended Action:** Maintain existing try/catch fallback pattern.
* **Status:** **VERIFIED WORKING**

---

### AX-AUD-007: Mandatory Bank Transaction Reference (UTR) Duplicate Prevention
* **Finding ID:** `AX-AUD-007`
* **Title:** Verified Duplicate Bank UTR Settlement Safeguard
* **Portal / Module:** Admin Finance & Commission Engine
* **Affected Files:** [`src/app/api/v1/admin/commissions/[id]/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/admin/commissions/[id]/route.ts#L43-L57)
* **Severity:** **HIGH**
* **Category:** Financial Integrity Safeguard
* **Evidence:** Rejects payout settlement if `payoutReference` is empty or previously recorded on another commission.
* **Root Cause:** Implemented to prevent fraudulent double-settlement of broker commission requests.
* **Business / Security Impact:** Protects company bank accounts against duplicate payouts and accounting fraud.
* **Recommended Action:** Retain mandatory UTR verification.
* **Status:** **VERIFIED WORKING (Covered in `tests/phase4-broker-direct-financial-safeguards.test.ts`)**

---

### AX-AUD-008: Idempotent Client Payment Verification Guard
* **Finding ID:** `AX-AUD-008`
* **Title:** Verified Idempotent Partner Payment Verification
* **Portal / Module:** Admin CRM & Billing Engine
* **Affected Files:** [`src/app/api/v1/admin/partner-payments/[id]/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/admin/partner-payments/[id]/route.ts#L61-L73)
* **Severity:** **HIGH**
* **Category:** Financial Integrity Safeguard
* **Evidence:** Route queries `db.commission.findUnique({ partnerProjectId })` prior to creating commissions; ignores duplicate creation on payment retries.
* **Root Cause:** Implemented to safeguard against network retries or accidental double-clicks by finance administrators.
* **Business / Security Impact:** Prevents over-allocation of broker commission obligations.
* **Recommended Action:** Retain idempotency query.
* **Status:** **VERIFIED WORKING (Covered in `tests/phase4-broker-direct-financial-safeguards.test.ts`)**

---

### AX-AUD-009: Cross-Tenant Insecure Direct Object Reference (IDOR) Defense
* **Finding ID:** `AX-AUD-009`
* **Title:** Verified Cross-Tenant Data Isolation in Documents and Payouts
* **Portal / Module:** Broker and Client Subsystems
* **Affected Files:**
  - [`src/app/api/v1/broker/commissions/payout-request/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/broker/commissions/payout-request/route.ts)
  - [`src/app/api/v1/client/projects/[id]/documents/[docId]/download/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/client/projects/[id]/documents/[docId]/download/route.ts)
* **Severity:** **HIGH**
* **Category:** Application Security & Data Privacy
* **Evidence:** Broker A attempting to claim Broker B's commission returns HTTP 403; Client B attempting to download Client A's delivery document returns HTTP 404/403.
* **Root Cause:** Explicit tenant ownership verification checks implemented in route handlers.
* **Business / Security Impact:** Protects sensitive client project intellectual property and broker bank account payouts from unauthorized cross-user access.
* **Recommended Action:** Retain strict object ownership checks across all future endpoints.
* **Status:** **VERIFIED WORKING (Covered in `tests/idor-security.test.ts`)**

---

### AX-AUD-010: Direct Client vs. Broker Attribution Segregation Invariant
* **Finding ID:** `AX-AUD-010`
* **Title:** Verified Direct Inquiries Strictly Set `brokerProfileId: null`
* **Portal / Module:** Public Intake & CRM
* **Affected Files:** [`src/app/api/contact/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/contact/route.ts), `src/app/api/v1/crm/leads/[id]/convert/route.ts`
* **Severity:** **HIGH**
* **Category:** Core Business Rule Invariant
* **Evidence:** Leads created via the public website contact form have `brokerProfileId: null`; payment verification generates 0 broker commission.
* **Root Cause:** Hard business requirement to separate organic corporate revenue from broker-referred deals.
* **Business / Security Impact:** Guarantees company retains 100% margin on direct organic deals without unearned commission payouts.
* **Recommended Action:** Preserve invariant in all CRM lead conversion flows.
* **Status:** **VERIFIED WORKING (Covered in `tests/phase4-broker-direct-financial-safeguards.test.ts`)**

---

### AX-AUD-011: Dynamic Employee Work Targets & Midnight Shift Crossing
* **Finding ID:** `AX-AUD-011`
* **Title:** Flexible Working Hours and Cross-Midnight Shift Calculations
* **Portal / Module:** Workforce & Attendance Engine
* **Affected Files:** [`src/lib/services/attendance.service.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/lib/services/attendance.service.ts), `src/app/api/v1/employee/attendance/route.ts`
* **Severity:** **MEDIUM**
* **Category:** Business Logic Flexibility
* **Evidence:** Tested with 240m (part-time/intern), 360m, 480m (full-time), and 540m targets; check-in yesterday evening allows check-out next morning without session collision.
* **Root Cause:** Configurable employee targets on `User.requiredDailyMinutes` dynamically passed into calculation engine.
* **Business / Security Impact:** Accurately evaluates compliance for diverse employee contractual obligations.
* **Recommended Action:** Preserve dynamic target evaluation.
* **Status:** **VERIFIED WORKING (Covered in `tests/attendance-complete-system.test.ts`)**

---

### AX-AUD-012: Single-Use Client Activation Token Lifecycle
* **Finding ID:** `AX-AUD-012`
* **Title:** Single-Use Client Activation Token Security & Session Invalidation
* **Portal / Module:** Client Onboarding & Authentication
* **Affected Files:** [`src/app/client/activate/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/client/activate/page.tsx), `src/app/api/v1/auth/login/route.ts`
* **Severity:** **MEDIUM**
* **Category:** Authentication Security
* **Evidence:** Activation token is cleared immediately upon first password creation; reused tokens fail; unactivated accounts cannot bypass setup.
* **Root Cause:** Database transaction nullifies `User.activationToken` and clears `mustChangePassword`.
* **Business / Security Impact:** Prevents link sniffing or account hijack if an invitation link is intercepted after activation.
* **Recommended Action:** Retain atomic token invalidation.
* **Status:** **VERIFIED WORKING (Covered in `tests/phase3-platform-integration-audit.test.ts`)**
