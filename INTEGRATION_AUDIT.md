# Axivon Broker-Admin-Client Integration Audit (Phase 0)

**Audit Date:** October 25, 2026  
**Auditor:** Senior Full-Stack Engineer + QA Lead  
**Active Git Branch:** `broker-admin-integration`  
**Target Environment:** Localhost Next.js 16 (App Router), React 19, Prisma 5, PostgreSQL (Neon)  
**Database URL Check:** Verified pointing to Neon development pooler (`# Development / Build Environment Configuration` in `.env`).  

---

## 1. Build & Compilation Verification (Phase 0 Step 1)

| Check | Command | Status | Result / Findings |
|---|---|---|---|
| **Package Resolution** | `npm install` | **PASSED** | Exit code 0. Prisma Client v5.22.0 re-generated successfully. |
| **TypeScript Validation** | `npx tsc --noEmit` | **PASSED** | Exit code 0. Zero compiler errors across all admin, broker, client, and public routes. |
| **Production Build** | `npm run build` | **PASSED** | Exit code 0. Turbopack generated optimized standalone production build for all 100+ routes with zero errors. |

*Blockers Fixed Prior to Build:*
- Fixed runtime `pendingActions.map` error in `src/app/broker/dashboard/page.tsx` via defensive dual-format normalization.
- No circular dependencies or missing exports encountered.

---

## 2. Database Schema Drift Check (Phase 0 Step 2)

**Command Executed:**
```bash
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

**Result:**
```sql
-- This is an empty migration.
```

**Drift Analysis:**
- `Commission.payoutRequestedAt`: Already present in `prisma/schema.prisma` (line 1561) and active in live PostgreSQL database.
- `WebsiteService` and `WebsiteArticle`: Already present in `prisma/schema.prisma` (lines 1868, 1920) and created via migration `20261017120000_add_website_content_management`.
- **Verdict:** Live database is **100% in sync** with `prisma/schema.prisma`. Zero unapplied migrations or schema drift.

---

## 3. End-to-End Integration Matrix (Phase 0 Step 3)

| Step # | Flow Step Description | Broker-Side Page + API | Admin-Side Page + API | Client-Side Page + API | Exists? | Works? | Problem & Evidence |
|:---:|:---|:---|:---|:---|:---:|:---:|:---|
| **1** | **Partner Application & Review** | **Page:** `/business-partner/apply`<br>**API:** `POST /api/v1/public/business-partner/applications` | **Page:** `/admin/business-partners/applications` & `[id]`<br>**API:** `GET/PUT /api/v1/admin/business-partner/applications/[id]`, `POST .../meetings` | N/A | **YES** | **WORKING** | **Status:** Working cleanly.<br>**Evidence:** Strict Zod validation with honeypot trap, duplicate email/phone check, status history audit logging, and meeting scheduler all verified. |
| **2** | **Account Creation & Activation** | **Page:** `/business-partner/activate`<br>**API:** `POST /api/v1/public/business-partner/activate` | **Action in:** `/admin/business-partners/applications/[id]`<br>**API:** `POST /api/v1/admin/business-partner/applications/[id]/create-account` | N/A | **YES** | **PARTIAL** | **Problem:** Admin can create partner account from approved application, but Admin UI has no controls to **resend activation email**, **deactivate**, or **suspend/reactivate** directly from a broker detail view.<br>**Evidence:** `create-account` returns `partnerId` + `activationToken` (HTTP 200). Broker suspension is enforced in middleware, but management buttons are missing in Admin UI. |
| **3** | **Broker Onboarding Gate** | **Page:** `/broker/onboarding`<br>**API:** `GET/PUT /api/v1/broker/profile`, `POST .../terms` | **Page:** `/admin/crm/brokers`<br>**API:** KYC verification endpoints (**MISSING**) | N/A | **PARTIAL** | **PARTIAL** | **Problem:** Broker has a 4-step onboarding stepper (profile, payout, KYC, terms acceptance), but Admin has **no interface or API to verify or reject KYC documents / bank payout details with a reason**.<br>**Evidence:** `/broker/onboarding` works. Admin `/admin/crm/brokers` only displays basic columns without KYC inspection or action buttons. |
| **4** | **Admin Broker Management** | **Page:** `/broker/profile`<br>**API:** `GET /api/v1/broker/profile` | **Page:** `/admin/crm/brokers` (list only; `[id]` **MISSING**)<br>**API:** `GET /api/v1/admin/brokers` (list), `GET .../brokers/[id]` (**MISSING**) | N/A | **PARTIAL** | **BROKEN** | **Problem:** `/admin/crm/brokers/[id]` does not exist. `src/app/api/v1/admin/brokers/[id]/route.ts` only implements `PATCH`, completely missing `GET`. Admin cannot view a broker's complete profile, onboarding state, attributed leads, projects, contracts, payouts, or notes in one place.<br>**Evidence:** Navigating to `/admin/crm/brokers/[id]` yields 404. |
| **5** | **Referral Leads Pipeline** | **Pages:** `/lead/[referralCode]`, `/broker/leads`<br>**APIs:** `POST /api/v1/public/leads`, `GET /api/v1/broker/leads` | **Pages:** `/admin/crm/leads`, `/admin/crm/partner-leads`<br>**APIs:** `GET /api/v1/admin/partner-leads`, `GET /api/v1/crm/leads` | N/A | **YES** | **WORKING** | **Status:** Working end-to-end.<br>**Evidence:** Lead referral link embeds `referralCode`. `POST /api/v1/public/leads` resolves `ownerId` from `BrokerProfile` and sets `source = "PARTNER"`. Admin sees broker attribution and can qualify/convert leads. |
| **6** | **Project Submission $\rightarrow$ Approval $\rightarrow$ Delivery** | **Pages:** `/broker/projects/new`, `/broker/projects/[id]`<br>**APIs:** `POST /api/v1/broker/projects/new`, `GET /api/v1/broker/projects/[id]` | **Pages:** `/admin/crm/partner-projects` & `[id]`<br>**APIs:** `POST .../approve`, `POST .../pricing`, `POST .../milestones`, `POST .../start` | N/A | **YES** | **WORKING** | **Status:** Working end-to-end.<br>**Evidence:** Project lifecycle enums enforced (`PENDING_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `CONTRACT_SIGNED` $\rightarrow$ `PAYMENT_SUBMITTED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `DELIVERED` $\rightarrow$ `COMPLETED`). Broker API projects safe fields (internal margins and QA internals excluded). |
| **7** | **Client Account from Project Start** | **Page:** `/broker/projects/[id]` (safe milestones and timeline view) | **Action in:** `/admin/crm/partner-projects/[id]`<br>**API:** `POST /api/v1/admin/partner-projects/[id]/start`<br>**Page:** `/admin/crm/clients` | **Pages:** `/client/activate`, `/client/dashboard`, `/client/projects/[id]`<br>**API:** `POST /api/v1/client/auth/activate` | **YES** | **PARTIAL** | **Problem:** Starting a project correctly provisions client user with `PENDING_ACTIVATION` and sends activation token. However, Admin UI has **no button to resend client activation email** or monitor client activation status in `/admin/crm/clients`.<br>**Evidence:** Project start creates User and `CrmClient`, but admin client management lacks activation lifecycle controls. |
| **8** | **Contracts & Documents** | **Pages:** `/broker/projects/[id]` (contract tab), `/broker/documents`<br>**APIs:** `GET .../contracts/[id]/download`, `POST .../contracts/[id]/upload` | **Page:** `/admin/crm/documents`<br>**APIs:** `GET/PATCH /api/v1/admin/partner-contracts/[id]`, `POST /api/v1/admin/partner-documents` | **Page:** `/client/documents` | **YES** | **WORKING** | **Status:** Working end-to-end.<br>**Evidence:** Stream download prevents direct public URLs. Broker upload validates PDF magic bytes (`%PDF-`) and size limit (15MB). Admin verify/reject transitions contract state. |
| **9** | **Milestone Payments** | **Page:** `/broker/projects/[id]` (payments tab)<br>**API:** `POST /api/v1/broker/payments/[id]/submit` | **Pages:** `/admin/crm/payments`, `/admin/settings/payment`<br>**API:** `PATCH /api/v1/admin/partner-payments/[id]` | **Page:** `/client/invoices` | **YES** | **WORKING** | **Status:** Working end-to-end.<br>**Evidence:** Duplicate UTR check active. Admin payment verification checks contract state (`VERIFIED`) and transitions project to `PROJECT_CONFIRMED`. |
| **10** | **Commissions Ledger & Payout Settlement** | **Page:** `/broker/commissions`<br>**APIs:** `GET .../commissions`, `POST .../payout-request`, `GET .../export` | **Page:** `/admin/crm/commissions`<br>**APIs:** `GET/PATCH /api/v1/admin/commissions/[id]`, `GET/POST /api/v1/admin/commission-rules` | N/A | **YES** | **WORKING** | **Status:** Working end-to-end.<br>**Evidence:** Section 194H TDS (5%) computed. Broker payout request enforces ₹500 minimum and `ELIGIBLE` status. Admin payout queue processes with reference number and date. |
| **11** | **Notifications, Activity & Reports** | **Pages:** `/broker/notifications`, `/broker/dashboard`<br>**APIs:** `GET /api/v1/notifications`, `GET /api/v1/broker/activity`, `GET /api/v1/broker/dashboard` | **Pages:** `/admin/dashboard`, `/admin/reports`<br>**APIs:** `GET /api/v1/admin/dashboard/summary`, `GET /api/v1/admin/notifications` | **Page:** `/client/notifications` | **YES** | **WORKING** | **Status:** Working end-to-end.<br>**Evidence:** In-app notifications dispatched for all status transitions. Audit log tracks all admin and broker mutations. |
| **12** | **Partner Support & Ticketing** | **Page:** `/broker/support`<br>**APIs:** `GET/POST /api/v1/broker/support`, `GET/POST .../support/[id]` | **Admin Partner Support Desk:** **MISSING**<br>**Admin Support API:** **MISSING** | **Page:** `/client/support` | **PARTIAL** | **BROKEN** | **Problem:** Broker can create support tickets (persisted in `OrganizationSetting` JSON store), but Admin portal has **no page or API to view, reply to, or close partner support tickets**.<br>**Evidence:** `src/app/api/v1/admin` contains zero references to `broker_support:*` keys. Admin sidebar lacks a partner support desk. |

---

## 4. Key Gaps Identified for Phase 1 Implementation

1. **Step 2 (Account Lifecycle):**
   - Missing Admin UI buttons to resend partner activation link, suspend broker, and reactivate broker.
   - Suspended broker banner/blocking messaging needs verification across all endpoints.
2. **Step 3 & Step 4 (Admin Broker Management & KYC Verification):**
   - Missing `/admin/crm/brokers/[id]` page: full-featured tabbed broker detail view (Profile, KYC/Onboarding, Leads, Projects, Contracts, Payments, Commissions, Payouts, Activity, Notes).
   - Missing `GET /api/v1/admin/brokers/[id]` endpoint.
   - Missing KYC verification / rejection API and UI (`POST /api/v1/admin/brokers/[id]/verify-kyc`).
3. **Step 7 (Client Account Lifecycle):**
   - Missing Admin UI button in `/admin/crm/clients` and `/admin/crm/partner-projects/[id]` to resend client activation email and view activation token status.
4. **Step 12 (Partner Support Desk):**
   - Missing Admin Partner Support Desk page (`/admin/crm/support` or under broker detail).
   - Missing Admin Support API routes (`GET/POST /api/v1/admin/support/brokers`).
