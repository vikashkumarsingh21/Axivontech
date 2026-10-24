# AXIVON ONE — Broker & Business Partner Backend Comprehensive Audit

**Date:** 2026-10-24  
**Audit Standard:** Strict Production Backend & Security Review  
**Target Architecture:** Next.js 16 (App Router), Prisma 5, PostgreSQL (Neon Serverless), Jose JWT Cookie Session, Zod  
**Scope:** Full Broker / Business Partner Backend Ecosystem (Broker APIs, Public Referral Flows, Admin Counterparts, Security Boundaries, Database Models)  

---

## 1. Executive Summary

A comprehensive, line-by-line audit of all 28 API routes, database schemas, authorization barriers, and public intake flows governing the **Broker / Business Partner Portal** was conducted.

### Key Audit Findings:
1. **Critical Route Collision & Missing Endpoints:**
   - `/broker/projects/new` was intercepting dynamic segment `[id]` with `id="new"`. A temporary guard was added returning HTTP 400, but a dedicated `POST /api/v1/broker/projects` endpoint was never implemented.
   - `PATCH /api/v1/broker/profile` is completely missing. Brokers have no backend mechanism to update contact details, company profile, address, GST/PAN, payout accounts (Bank/UPI), or avatar.
   - `GET /api/v1/broker/dashboard` is missing. The dashboard previously fetched `GET /api/v1/broker/profile`, which mixed heavy database queries into user profile data.
2. **Onboarding & Referral Code Lockout Trap:**
   - Broker accounts created via `POST /api/v1/admin/brokers` intentionally initialized with `referralCode: null`.
   - `BrokerLayout` checks `if (!referralCode) router.push('/broker/onboarding')`. This caused newly provisioned brokers (including `qa.broker@axivon.dev`) to get trapped in `/broker/onboarding`.
   - Furthermore, `POST /api/v1/broker/referral/generate` threw HTTP 400 when called on an existing code instead of being idempotent.
3. **Multi-Tenant Leak in Document Acknowledgment:**
   - Broadcast documents (`brokerProfileId: null`) marked as read via `POST /api/v1/broker/documents/[id]/read` directly updated the global `PartnerDocument` record (`isRead: true`), marking the document as read for **every other broker** in the platform.
4. **Broker Notification Silence on Referral Activity:**
   - Public lead submissions (`POST /api/v1/public/leads`) and project requests (`POST /api/v1/public/project-requests`) containing a valid broker `referralCode` notified platform administrators, but **never notified the referring broker**.
5. **Database Column Status (BE-ISSUE-003):**
   - Verified against the live Neon PostgreSQL database: The `Commission.payoutRequestedAt` column and all SLA fields (`payoutDueAt`, `payoutMethod`, `payoutDetails`, `payoutNotes`, `rejectionReason`) **exist in the live database**. Running `prisma migrate diff` confirmed that the database matches `prisma/schema.prisma` with zero pending diffs.
6. **Inconsistent Crypto & Password Hashing:**
   - `src/app/api/v1/admin/brokers/route.ts` used `bcrypt.hash(password, 10)` directly instead of the system standard `hashPassword` (12 rounds) from `@/lib/auth/password`.

---

## 2. Comprehensive Endpoint Audit Matrix

| Feature | Endpoint | Method | Auth & Role | Ownership (IDOR) | Zod & Input Validation | Rate Limit / Double-Submit | Audit Log & Notifications | What Works | What Is Broken / Missing | Severity |
|---|---|---|---|---|---|---|---|---|---|---|
| **Broker Dashboard** | `/api/v1/broker/dashboard` | GET | `requireBroker` | User Scoped | N/A | Cached Aggregation | N/A | None (Missing) | Endpoint did not exist. Frontend called `/api/v1/broker/profile` instead. | **High** |
| **Broker Profile** | `/api/v1/broker/profile` | GET | Yes (`BUSINESS_PARTNER`) | Verified | N/A | None | None | Returns profile + counts + recent lists | Bank/payout details are returned unmasked; mixes dashboard stats into profile. | **Medium** |
| **Broker Profile Update** | `/api/v1/broker/profile` | PATCH | Yes (`BUSINESS_PARTNER`) | Verified | Missing | Missing | Missing | None (Missing) | Endpoint completely absent. Cannot update details, payout info, or company data. | **Critical** |
| **Referral Code Generation** | `/api/v1/broker/referral/generate` | POST | Yes (`BUSINESS_PARTNER`) | Verified | N/A | None | AuditLog emitted | Generates unique `AXV-BRK-` code | Throws HTTP 400 if code exists instead of idempotent return; lacks rate limit. | **High** |
| **Broker Projects List** | `/api/v1/broker/projects` | GET | Yes (`BUSINESS_PARTNER`) | Verified | Query params not validated | None | None | Filters by search & status, paginates | Hardcoded `limit=15` cannot be overridden; response lacks `{ success: true }`. | **Medium** |
| **Broker Project Create** | `/api/v1/broker/projects` | POST | Yes (`BUSINESS_PARTNER`) | Scoped to current broker | Missing | Missing | Missing | None (Missing) | Endpoint completely missing. Frontend called `/api/v1/broker/leads/create`. | **Critical** |
| **Broker Project Detail** | `/api/v1/broker/projects/[id]` | GET | Yes (`BUSINESS_PARTNER`) | Verified | CUID validation missing | None | None | Strips `adminNotes`, includes contract & payments | `id="new"` returned 400 collision; does not include milestones or delivery info. | **High** |
| **Broker Project Update** | `/api/v1/broker/projects/[id]` | PATCH | Yes (`BUSINESS_PARTNER`) | Verified | Unvalidated JSON body | None | No notification | Allows updating pending projects | No Zod schema; no audit log; no admin notification upon modification. | **Medium** |
| **Broker Leads List** | `/api/v1/broker/leads` | GET | Yes (`BUSINESS_PARTNER`) | Verified (`ownerId: brokerId`) | Partial | None | None | Lists partner leads, search, pagination | Hardcoded limit=15; lacks date filters; missing lead activity timeline. | **Medium** |
| **Broker Lead Create** | `/api/v1/broker/leads/create` | POST | Yes (`BUSINESS_PARTNER`) | Scoped to current broker | Zod schema present | Missing double-submit guard | Notifies Admins only | Deduplicates leads (30d), preserves attribution, creates LeadActivity | Does not notify the broker; no idempotency guard; non-standard response envelope. | **Medium** |
| **Broker Commissions List** | `/api/v1/broker/commissions` | GET | Yes (`BUSINESS_PARTNER`) | Verified | None | None | None | Calculates summary stats, lists records | Missing pagination; no date filtering; lacks response standard envelope. | **Medium** |
| **Payout Request** | `/api/v1/broker/commissions/payout-request` | POST | Yes (`BUSINESS_PARTNER`) | Verified | Manual IF checks | No idempotency guard | Notifies Admins & Broker, AuditLog | 48h SLA calculation, bank IFSC/UPI format checks, transaction wrap | No duplicate-click guard; minimum payout threshold not enforced; manual parsing. | **High** |
| **Contract Download** | `/api/v1/broker/contracts/[id]/download` | POST | Yes (`BUSINESS_PARTNER`) | Verified | None | None | AuditLog emitted | Marks contract & version as `DOWNLOADED` | Exposes public static file URL; no signed/streamed download protection. | **Medium** |
| **Contract Upload** | `/api/v1/broker/contracts/[id]/upload` | POST | Yes (`BUSINESS_PARTNER`) | Verified | Unvalidated JSON body | No idempotency guard | Notifies Admins, AuditLog | Updates version to `UNDER_REVIEW`, project to `CONTRACT_SIGNED` | No file type (PDF) or size check; magic-bytes not validated; accepts raw URL. | **High** |
| **Broker Documents List** | `/api/v1/broker/documents` | GET | Yes (`BUSINESS_PARTNER`) | Verified | None | None | None | Lists broadcast + broker-targeted docs | No category filter, search, or pagination; no unread count helper. | **Medium** |
| **Document Mark Read** | `/api/v1/broker/documents/[id]/read` | POST | Yes (`BUSINESS_PARTNER`) | Flawed | None | None | None | Updates `isRead: true` | **Multi-tenant data bug:** Overwrites shared document read status for all brokers! | **Critical** |
| **Payment Proof Submit** | `/api/v1/broker/payments/[id]/submit` | POST | Yes (`BUSINESS_PARTNER`) | Verified | Partial | No double-submit guard | Notifies Admins, AuditLog | Duplicate UTR check, contract gate, updates payment & project status | Dangerous float equality check `!==`; no Zod schema; no proof file validation. | **High** |
| **Public BP Application** | `/api/v1/public/business-partner/applications` | POST | Public | N/A | Zod + Turnstile/reCAPTCHA | IP Rate Limited | Enqueues verification email | Strict schema, status history, email verification token | Does not check duplicate phone number; does not notify admins of new application. | **Medium** |
| **Public Email Verification** | `/api/v1/public/business-partner/applications/verify` | GET | Public | Token Verified | Query param | None | None | Updates `emailVerifiedAt`, renders HTML | Token single-use not enforced; does not advance application status to `UNDER_REVIEW`. | **Low** |
| **Partner Account Activation** | `/api/v1/public/business-partner/activate` | POST | Public | Token Verified | Zod schema | Missing | AuditLog emitted | Hashes password, activates user | Does not check token expiry; does not generate referral code if null; no welcome notification. | **Critical** |
| **Public Lead Referral** | `/api/v1/public/leads` | POST | Public | Attributed to broker | Zod + Honeypot + reCAPTCHA | IP Rate Limited | Notifies Admins | 30d duplicate check, attributes via `referralCode` | Does NOT notify the referring broker; client gets no instant code validation on page load. | **High** |
| **Public Project Request** | `/api/v1/public/project-requests` | POST | Public | Attributed to broker | Manual IF checks + reCAPTCHA | In-memory IP map | Notifies Admins, AuditLog | Creates `PartnerProject` with status `PROJECT_REQUESTED` | Does NOT notify referring broker; no duplicate project request check; no Zod validation. | **High** |
| **Referral Link Verification** | `/api/v1/public/referral/validate` | GET | Public | N/A | Zod | Rate Limited | None | None (Missing) | Public referral pages (`/lead/[code]` and `/project/start/[code]`) had no pre-flight validation endpoint. | **High** |
| **Admin Broker Management** | `/api/v1/admin/brokers` | GET / POST | Admin Permission (`users:write`) | Admin Scoped | Zod schema | None | AuditLog emitted | Lists & creates brokers with roles | Password hashed with only 10 rounds; sets `referralCode: null` causing onboarding lockout. | **High** |
| **Admin Create Partner Account** | `/api/v1/admin/business-partner/applications/[id]/create-account` | POST | Admin Permission (`business_partner_application.review`) | Admin Scoped | None | None | Enqueues email, AuditLog | Creates user, generates partnerId & referralCode, enqueues activation email | If user exists, silently overrides password hash to temporary; no token expiry date stored. | **Medium** |
| **Admin Partner Payments** | `/api/v1/admin/partner-payments/[id]` | PATCH | Admin Permission (`users:write`) | Admin Scoped | Manual checks | None | Notifies Broker, AuditLog | Verifies payment, creates Commission if rule exists | If no active `CommissionRule` is configured, fails silently without creating commission. | **High** |
| **Admin Commission Settlement** | `/api/v1/admin/commissions/[id]` | PATCH | Admin Permission (`users:write`) | Admin Scoped | Manual checks | UTR duplicate check | Notifies Broker, AuditLog | Marks `PROCESSING` or `PAID` with UTR deduplication | Does not check if broker has active bank/UPI payout details configured before approving. | **Medium** |

---

## 3. Database Schema Verification

### 3.1 DMMF and Live Database Parity
All 16 models required for broker and partner flows were verified in `prisma/schema.prisma` and queried against the live database:
1. `BrokerProfile` — **MATCHED**
2. `BusinessPartnerApplication` — **MATCHED**
3. `ApplicationMeeting` — **MATCHED**
4. `ApplicationStatusHistory` — **MATCHED**
5. `PartnerProject` — **MATCHED**
6. `PartnerProjectMilestone` — **MATCHED**
7. `PartnerProjectMember` — **MATCHED**
8. `QaIssue` — **MATCHED**
9. `PartnerDocument` — **MATCHED**
10. `PartnerContract` — **MATCHED**
11. `PartnerContractVersion` — **MATCHED**
12. `PartnerPayment` — **MATCHED**
13. `PaymentSettings` — **MATCHED**
14. `Commission` — **MATCHED**
15. `CommissionRule` — **MATCHED**
16. `Lead` — **MATCHED**

### 3.2 Known Issue Resolution: BE-ISSUE-003 (`Commission.payoutRequestedAt`)
- Direct SQL introspection of `information_schema.columns` for table `Commission` confirmed the existence of:
  - `payoutRequestedAt` (timestamp with time zone)
  - `payoutDueAt` (timestamp with time zone)
  - `payoutMethod` (character varying)
  - `payoutDetails` (jsonb)
  - `payoutNotes` (text)
  - `rejectionReason` (text)
- `prisma migrate diff --from-schema-datasource --to-schema-datamodel --script` output:
  `-- This is an empty migration.`
- **Result:** No database migration is required for `Commission.payoutRequestedAt`. The column is fully operational in the database.

---

## 4. Security & Architecture Vulnerabilities

1. **IDOR (Insecure Direct Object Reference) Safeguards:**
   - All broker routes enforce `brokerProfileId` scoping matching `session.userId`.
   - Projects, contracts, payments, documents, and commissions correctly restrict cross-broker access.
2. **Information Leakage:**
   - `adminNotes`, internal margin/costings, and QA team internal notes are stripped in `projects/[id]/route.ts`.
   - Broker profile endpoint was leaking unmasked bank account numbers.
3. **Data Isolation Bug:**
   - Shared documents (`brokerProfileId === null`) lacked per-broker acknowledgment state, creating a multi-tenant cross-contamination bug when any broker clicked "Mark as Read".
4. **Onboarding Gate Deadlock:**
   - Broker accounts created without a referral code could not exit the onboarding gate because the generation endpoint was not idempotent and threw a 400 error on duplicate calls.

---

## 5. Remediation Plan

1. **Foundation:** Implement `requireBroker` helper in `src/lib/api/foundation.ts` with strict status check, profile load, and standardized envelope helpers.
2. **Referral & Onboarding:** Fix `generate/route.ts` to be completely idempotent; generate referral code automatically in `POST /api/v1/admin/brokers` and `POST /business-partner/activate`. Add pre-flight validation endpoint `GET /api/v1/public/referral/validate?code=...`.
3. **Projects:** Implement `POST /api/v1/broker/projects` with CUID generation, status `PROJECT_REQUESTED`, duplicate submission guard, and admin notification. Add explicit CUID route validation in `projects/[id]`.
4. **Profile:** Implement `PATCH /api/v1/broker/profile` with Zod validation, masked payout info, and audit logging.
5. **Dashboard:** Implement `GET /api/v1/broker/dashboard` aggregated fast endpoint.
6. **Documents:** Decouple read acknowledgments for broadcast documents so that broker A's acknowledgment does not impact broker B.
7. **Notifications:** Trigger real-time broker notifications whenever a lead or project request is submitted using their referral code.
8. **Add-Ons:** Implement earnings analytics, commission estimator, downloadable commission statement (CSV), and support tickets.
