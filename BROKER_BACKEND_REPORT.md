# Broker / Business Partner Portal Backend Upgrade Report

**Date:** October 25, 2026  
**Branch:** `broker-backend-upgrade`  
**Status:** Complete & Fully Verified (75/75 Automated Tests Passed, 0 TypeScript Errors)

---

## 1. Executive Summary

A comprehensive architectural audit, hardening, and expansion of the **Axivon Broker / Business Partner Portal Backend** was executed. The backend spans public partner intake, activation, onboarding gates, referrals, leads pipeline, projects lifecycle, contracts, milestone payments, commissions ledger with TDS deduction, payout settlement with 48h SLA, multi-tenant broadcast document read tracking, notifications, aggregated dashboard, and six new add-on features.

All known issues (including **BE-ISSUE-003: Commission.payoutRequestedAt column**, **BE-ISSUE-004: /broker/projects/new collision with [id]**, unauthenticated IDOR vulnerabilities, IEEE-754 floating point payment comparison inaccuracies, and multi-tenant broadcast document read leaks) were completely resolved.

---

## 2. Issues Audited & Resolved

### 2.1 BE-ISSUE-003: Commission Payout Requested Timestamp Missing
- **Problem:** When fetching commissions, PostgreSQL threw `P2022: column "payoutRequestedAt" does not exist in the current database`.
- **Fix:** Applied safe non-destructive migration adding `payoutRequestedAt TIMESTAMP(3)` to the `Commission` table.
- **Verification:** `GET /api/v1/broker/commissions` and `POST /api/v1/broker/commissions/payout-request` execute cleanly without database schema errors.

### 2.2 BE-ISSUE-004: /broker/projects/new Route Collision
- **Problem:** Visiting `/broker/projects/new` or issuing requests to `/api/v1/broker/projects/new` conflicted with `/api/v1/broker/projects/[id]`, treating `"new"` as a database CUID.
- **Fix:** 
  1. Implemented a dedicated static route `src/app/api/v1/broker/projects/new/route.ts` returning HTTP 200 with metadata and schema validation.
  2. Hardened `src/app/api/v1/broker/projects/[id]/route.ts` to explicitly check `if (id === "new")` and immediately reject with a clean HTTP 404 `PROJECT_NOT_FOUND`.

### 2.3 Strict IDOR & Multi-Tenant Data Isolation
- **Problem:** Broker A could theoretically probe Broker B's project IDs, payment records, lead records, and document read statuses.
- **Fix:** 
  - Every broker endpoint strictly checks `brokerProfileId` or `ownerId`.
  - Non-owned resources return either HTTP 403 or HTTP 404 (preventing ID enumeration).
  - Safe projections strip internal company data (`internalMargin`, `developerCost`, internal QA notes, private admin notes).
  - Multi-tenant broadcast document reads are stored in per-broker key-value settings (`doc_reads:${brokerProfile.id}` in `OrganizationSetting`), ensuring one broker marking an organization document as read never marks it read for other brokers.

### 2.4 Floating-Point Payment Verification (IEEE-754)
- **Problem:** Direct float equality (`amountPaid === advanceAmount`) could fail due to binary precision inaccuracies.
- **Fix:** Implemented epsilon threshold check: `Math.abs(amountPaid - advanceAmount) < 0.05`.

### 2.5 Idempotent Referral Generation & Auto-Healing
- **Problem:** `POST /api/v1/broker/referral/generate` returned HTTP 400 if a code already existed.
- **Fix:** Made idempotent (returns HTTP 200 with the active referral code and shareable messaging templates). Auto-generates referral codes upon admin creation and account activation.

---

## 3. Endpoints Implemented & Hardened

### Foundation
- `src/lib/api/broker.ts`: `requireBroker`, `getBrokerPagination`, `logBrokerAudit`, `notifyAdmins`, `notifyBroker`, `checkIdempotency`, `checkRateLimit`, `apiSuccess`, `apiError`.

### Core Broker APIs
1. `GET /api/v1/broker/profile`: Profile details, masked PAN/GST, masked bank account (last 4), onboarding checklist completion.
2. `PATCH /api/v1/broker/profile`: Update business details, phone, address, payout details.
3. `POST /api/v1/broker/profile/password`: Password change with current password verification, rate limiting, and audit log.
4. `POST /api/v1/broker/profile/avatar`: 5MB upload with magic-bytes validation.
5. `POST /api/v1/broker/profile/terms`: Records partner terms version, timestamp, and IP address.
6. `POST /api/v1/broker/referral/generate`: Idempotent referral code generator with share templates.
7. `GET /api/v1/public/referral/validate`: Public pre-flight check for referral code validity (HTTP 200 / 404).
8. `POST /api/v1/public/leads`: Lead intake with broker attribution, anti-spam, and duplicate detection.
9. `POST /api/v1/public/project-requests`: Project intake with broker attribution.
10. `GET /api/v1/broker/leads`: Filtered leads list with safe timeline.
11. `GET /api/v1/broker/projects/new`: Static route returning schema.
12. `GET /api/v1/broker/projects`: List broker's projects with status filters and safe projections.
13. `POST /api/v1/broker/projects`: Create project in `PROJECT_REQUESTED` with duplicate protection.
14. `GET /api/v1/broker/projects/[id]`: Project details with milestones, contract, payment, commission; strips internal margins.
15. `DELETE /api/v1/broker/projects/[id]`: Cancel project while still in review.
16. `GET /api/v1/broker/contracts`: List partner contracts.
17. `GET /api/v1/broker/contracts/[id]/download`: Secure contract download; transitions to `DOWNLOADED`.
18. `POST /api/v1/broker/contracts/[id]/upload`: Signed PDF upload with magic-bytes check; transitions to `UNDER_REVIEW`.
19. `GET /api/v1/broker/payments`: List payments.
20. `GET /api/v1/broker/payments/[id]`: Payment details.
21. `POST /api/v1/broker/payments/[id]/submit`: Submit UTR & proof receipt; transitions to `SUBMITTED`.
22. `GET /api/v1/broker/commissions`: Summary (totalEarned, pending, eligible, paid, thisMonth) and list.
23. `GET /api/v1/broker/commissions/[id]`: Detail with 5% Section 194H TDS calculation.
24. `POST /api/v1/broker/commissions/payout-request`: Request payout with ₹500 threshold, duplicate guard, and 48h SLA.
25. `GET /api/v1/broker/documents`: Categorized documents with per-broker read tracking.
26. `POST /api/v1/broker/documents/[id]/read`: Acknowledge document read.
27. `GET /api/v1/notifications`: Paginated notifications with session cookie support.
28. `GET /api/v1/notifications/unread-count`: Unread notification count.
29. `POST /api/v1/notifications/[id]/read` & `POST /api/v1/notifications/read-all`: Mark read.
30. `GET /api/v1/broker/dashboard`: Aggregated dashboard payload.

### Add-On Features
31. `GET /api/v1/broker/analytics/earnings`: 12-month earnings trend, 5-step conversion funnel, top service types.
32. `POST /api/v1/broker/commissions/estimate`: Read-only commission estimator.
33. `GET /api/v1/broker/activity`: Unified activity timeline across leads, projects, payments, commissions.
34. `GET /api/v1/broker/commissions/export`: RFC-4180 CSV commission statement download.
35. `GET` & `POST /api/v1/broker/support`: Support ticket system.
36. `GET` & `POST /api/v1/broker/support/[id]`: Support ticket detail and reply thread.
37. `GET`, `POST`, `DELETE /api/v1/broker/drafts`: Auto-save drafts for leads and projects.

---

## 4. Test Results

Executed automated suite `scripts/test-broker-backend.ts`:
```
================================================================================
           AXIVON BROKER / BUSINESS PARTNER BACKEND COMPREHENSIVE SUITE         
================================================================================
TOTAL TESTS: 75 | PASSED: 75 | FAILED: 0
================================================================================
```

TypeScript compilation:
```bash
npx tsc --noEmit
# 0 errors
```
