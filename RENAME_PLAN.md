# Program Rename Plan: "Business Partner" → "Broker Partner"
**Axivon Technologies — Architecture, Content & Inventory Plan**  
**Branch:** `broker-partner-rename`  
**Status:** Step 1 Inventory Complete (Awaiting User "Go" for Step 2)  
**Date:** October 31, 2026  

---

## 1. Executive Summary

This plan outlines the systematic renaming and rebranding of Axivon's referral program from **"Business Partner"** to **"Broker Partner"** across all visible customer-facing, partner-facing, and administrative interfaces.

### Core Guarantees & Safeguards
1. **Zero Database / Schema Breakages:** Database model names (`BusinessPartnerApplication`, `BrokerProfile`, `PartnerProject`, etc.), internal role keys (`BUSINESS_PARTNER`, `BROKER`), and existing API paths (`/api/v1/admin/business-partner/...`) remain **strictly unchanged**.
2. **Central Label File:** All user-facing titles, labels, button texts, and route constants will flow through a single source of truth: `src/config/brokerProgram.ts`.
3. **URL Backward-Compatibility (301 Redirects):** All legacy URLs (`/business-partner`, `/business-partner-terms`, etc.) will permanently redirect (HTTP 301) to their canonical counterpart, **preserving all query strings** (critical for pending activation tokens like `?token=XYZ`).
4. **No Schema Changes Without Approval:** Schema additions required for the enhanced application form (Step 5) are presented in Section 5 with exact SQL for explicit user approval before execution.

---

## 2. Canonical Route Set & 301 Redirect Mapping

### The Canonical Set (New URLs)
| Canonical Route | Page / Purpose | Indexing Status |
|---|---|---|
| `/broker-partner` | Main Program Landing Page (Server-rendered, redesigned with approved copy) | `index, follow` |
| `/broker-partner/apply` | Broker Partner Application Form (Enhanced 4-step wizard with Zod validation) | `index, follow` |
| `/broker-partner/activate` | Partner Account Activation & Password Setup (`?token=...`) | `noindex, follow` |
| `/broker-partner/terms` | Partner Terms & Conditions v1.1 (Structured legal layout + TOC) | `index, follow` |

> [!NOTE]
> **Audit of `/business-partner/policy`:** Analysis confirmed `/business-partner/policy` previously called `getPublishedPolicyBySlug("business-partner-terms")`, exactly mirroring the terms page. It has **no unique content**. Per guidelines, it is merged into `/broker-partner/terms` via a permanent 301 redirect.

### Legacy URL 301 Redirect Table (next.config.ts)
All redirects will be added to `next.config.ts` with `permanent: true` (HTTP 301). Next.js automatically preserves query strings across custom redirects.

| Legacy Source URL | HTTP Code | Canonical Target URL | Query Strings Preserved? | Reason / Context |
|---|---|---|---|---|
| `/business-partner` | `301` | `/broker-partner` | Yes | Legacy landing page URL |
| `/business-partner/apply` | `301` | `/broker-partner/apply` | Yes | Legacy application form URL |
| `/business-partner/activate` | `301` | `/broker-partner/activate` | **Yes (`?token=...`)** | Outstanding emails with activation links |
| `/business-partner/policy` | `301` | `/broker-partner/terms` | Yes | Redundant policy route merged into terms |
| `/business-partner/dashboard` | `301` | `/broker/dashboard` | Yes | Legacy portal shortcut |
| `/business-partner-terms` | `301` | `/broker-partner/terms` | Yes | Legacy root terms slug |
| `/broker-terms` | `301` | `/broker-partner/terms` | Yes | Legacy broker terms slug |
| `/broker-program/terms` | `301` | `/broker-partner/terms` | Yes | Legacy nested terms route |
| `/partner-program/terms` | `301` | `/broker-partner/terms` | Yes | Legacy partner terms alias |

---

## 3. Comprehensive Codebase Inventory & Action Table

A repository-wide scan discovered **459 occurrences** across **55 application source files**, **42 documentation files**, and **25 test/script files**. Below is the classified action matrix:

### A. Public Pages & SEO
| Location | File Path | Type | Action | Planned Change / Details |
|---|---|---|---|---|
| Landing Page | `src/app/business-partner/page.tsx` | Route / UI text | **REPLACE & REDIRECT** | Move to `/broker-partner/page.tsx`, replace with new approved copy, server-rendered, breadcrumbs, custom SVG visuals. Old URL redirects (301). |
| Application Page | `src/app/business-partner/apply/page.tsx` | Route / UI text | **REPLACE & REDIRECT** | Move to `/broker-partner/apply/page.tsx`, update heading and metadata to "Broker Partner Application". Old URL redirects (301). |
| Activation Page | `src/app/business-partner/activate/page.tsx` | Route / UI text | **REPLACE & REDIRECT** | Move to `/broker-partner/activate/page.tsx`, update labels to "Activate Broker Partner Account", ensure `noindex`. Old URL redirects (301). |
| Terms Page | `src/app/business-partner-terms/page.tsx` | Route / Legal | **REPLACE & REDIRECT** | Move to `/broker-partner/terms/page.tsx`, render Terms v1.1. Old URL redirects (301). |
| Terms Aliases | `src/app/broker-terms/page.tsx`, `src/app/broker-program/terms/page.tsx`, `src/app/partner-program/terms/page.tsx`, `src/app/business-partner/policy/page.tsx` | Route | **REDIRECT** | Replace route handler with permanent redirect or next.config rule to `/broker-partner/terms`. |
| Sitemap | `src/app/sitemap.ts` | Metadata | **RENAME TEXT** | Update sitemap URLs: `/business-partner` → `/broker-partner`, `/business-partner-terms` → `/broker-partner/terms`, add `/broker-partner/apply`. |
| Robots | `src/app/robots.ts` | Metadata | **KEEP / VERIFY** | `/broker/` remains disallowed (authenticated portal). Public `/broker-partner` allowed. `/broker-partner/activate` remains crawlable but with page-level `noindex`. |
| LLMs Discovery | `public/llms.txt`, `public/llms-full.txt` | Metadata / LLM | **CREATE** | Add entry describing the Axivon Broker Partner Program, linking to `/broker-partner`, `/broker-partner/apply`, and `/broker-partner/terms`. |
| Cookie Preferences | `src/app/cookie-preferences/CookiePreferencesPageClient.tsx` | UI text | **RENAME TEXT** | Replace "Business Partner" with "Broker Partner" in portal descriptions. |
| Palette Preview | `src/app/preview-palettes/page.tsx` | Internal UI | **RENAME TEXT** | Update display label in developer preview. |

### B. Navigation & Public Components
| Location | File Path | Type | Action | Planned Change / Details |
|---|---|---|---|---|
| Public Footer | `src/components/Footer.tsx` | Navigation link | **RENAME TEXT** | Change `{ label: "Business Partner", href: "/business-partner" }` → `{ label: "Broker Partner", href: "/broker-partner" }`. |
| Application Form | `src/components/partner-application/PartnerApplicationForm.tsx` | UI Form | **RENAME TEXT & UPGRADE** | Update labels, headers, and success modal to "Broker Partner". Add required fields (Age, Partner Type, Skills, etc.) and terms acceptance checkbox v1.1. |
| Admin Sidebar | `src/components/portal/AdminSidebar.tsx` | Admin Navigation | **RENAME TEXT** | Rename group `"Business Partner Network"` → `"Broker Partner Network"`. Update item `"Partner Applications"` → `"Broker Applications"`, `"Brokers & Partners"` → `"Broker Partners"`. |
| Broker Header | `src/components/broker/BrokerPortalHeader.tsx` | Portal UI | **RENAME TEXT** | Ensure badges and breadcrumbs display "Broker Partner Portal". |

### C. Admin & Executive Portals
| Location | File Path | Type | Action | Planned Change / Details |
|---|---|---|---|---|
| Applications List | `src/app/admin/business-partners/applications/page.tsx` | Admin UI | **RENAME TEXT** | Update page title to "Broker Partner Applications", breadcrumbs, search placeholder, and status badges. |
| Application Detail | `src/app/admin/business-partners/applications/[id]/page.tsx` | Admin UI | **RENAME TEXT** | Update title to "Broker Application Detail", button to "Create Broker Partner Account", display all new Step 5 form fields. |
| Broker Detail | `src/app/admin/crm/brokers/[id]/page.tsx` | Admin UI | **RENAME TEXT** | Update modal titles (e.g. "Reactivate Broker Partner Account"), header text, and breadcrumbs. |
| Admin Dashboard | `src/app/admin/dashboard/page.tsx` | Admin UI | **RENAME TEXT** | Update KPI labels and quick links referencing "Partner Applications" / "Brokers". |
| Reports Center | `src/app/admin/reports/page.tsx`, `src/app/executive/reports/page.tsx` | Admin/Exec UI | **RENAME TEXT** | Update export and report card titles to "Broker Partners & Applications". |
| BI Analytics | `src/app/admin/analytics/page.tsx` | BI UI | **RENAME TEXT** | Update metric descriptions from "Business Partner" to "Broker Partner". |

### D. Export System
| Location | File Path | Type | Action | Planned Change / Details |
|---|---|---|---|---|
| Partners Export Service | `src/lib/export/partners-export-service.ts` | Export Service | **RENAME TEXT** | Sheet/file titles: "Business Partner Applications Register" → "Broker Partner Applications Register", "Confirmed Business Partners" → "Confirmed Broker Partners". |
| Export Definitions | `src/lib/export/export-definitions.ts` | Export Metadata | **RENAME TEXT** | Update column headers to "Broker Partner ID", "Broker Partner Name" where user-facing. |

### E. Email Templates & Notifications
| Location | File Path | Type | Action | Planned Change / Details |
|---|---|---|---|---|
| Account Creation Route | `src/app/api/v1/admin/business-partner/applications/[id]/create-account/route.ts` | Email Trigger | **RENAME TEXT** | Change activationLink to `/broker-partner/activate?token=...`. |
| Email Service | `src/lib/email/service.ts` | Email Template | **RENAME TEXT** | In `PARTNER_ACCOUNT_ACTIVATION` and welcome templates, replace "Business Partner" with "Broker Partner", list Partner ID, referral link, support contact. |
| In-App Notifications | `src/lib/notifications/toast.ts` & notification routes | Notification | **RENAME TEXT** | Update toast messages and system notification texts referencing partner approvals and activations. |

### F. Chatbot & AI Copilot
| Location | File Path | Type | Action | Planned Change / Details |
|---|---|---|---|---|
| Portal AI Assistant | `src/lib/portal-ai/assistant-engine.ts` | AI System Prompt | **RENAME TEXT** | Update prompt: `"Business Partner Assistant"` → `"Broker Partner Assistant"`. Update suggestion prompt to `"What are the Broker Partner commission tiers?"`. |
| Website Chatbot KB | `src/lib/chatbot/knowledge-base.ts` | AI Knowledge Base | **RENAME TEXT** | Update company introduction and partnership FAQ to explain the "Axivon Broker Partner Program" with 15% starting commission. |

### G. Legal Engine & Content DB
| Location | File Path | Type | Action | Planned Change / Details |
|---|---|---|---|---|
| Legal Policies DB | `src/lib/legal/legal-db.ts` | Legal Content | **RENAME TEXT** | Update `policy-business-partner` and `policy-broker-terms` titles and content to "Broker Partner Terms (v1.1)", preserving v1.0 history. Update Privacy Policy references to "Broker Partners". |
| Keyword Mapping | `src/lib/seo/keyword-mapping.ts` | SEO Keywords | **RENAME TEXT** | Replace "business partner program" keywords with "broker partner program", "technology broker partner". |

### H. Internal Identifiers & Database (INTENTIONALLY KEPT)
Per task instructions: *"Do NOT rename database models, enums, Prisma fields, role keys (BUSINESS_PARTNER, BROKER), or API route paths. Display text only, through ONE central label file."*
- **Kept Prisma Models:** `BusinessPartnerApplication`, `BrokerProfile`, `PartnerProject`, `PartnerContract`, `PartnerDocument`, `PartnerPayment`.
- **Kept Role Keys / Enums:** `BUSINESS_PARTNER`, `BROKER` in `UserRole` and `Role`.
- **Kept API Route Paths:** `/api/v1/admin/business-partner/applications/...`, `/api/v1/public/business-partner/...`, `/api/v1/broker/...`.
- **Kept DB Table Columns:** `brokerProfileId`, `partnerId`, `referralCode`.

---

## 4. Central Program Configuration Architecture

In Step 2, we will create `src/config/brokerProgram.ts` to ensure zero hard-coded strings remain in the application:

```ts
// src/config/brokerProgram.ts
export const BROKER_PROGRAM_CONFIG = {
  programName: "Axivon Broker Partner Program",
  partnerLabel: "Broker Partner",
  partnerLabelPlural: "Broker Partners",
  startingCommissionRate: 15, // percent
  performanceCommissionRate: 20, // percent
  performanceThresholdClients: 40,
  payoutSlaHours: 72,
  termsVersion: "1.1",
  termsLastUpdated: "October 31, 2026",
  supportEmail: "info@axivontech.in",
  supportPhone: "+91 9473263768",
  companyFoundedYear: 2026,
  minAge: 18,
  minEducation: "12th Pass",
  routes: {
    landing: "/broker-partner",
    apply: "/broker-partner/apply",
    activate: "/broker-partner/activate",
    terms: "/broker-partner/terms",
    dashboard: "/broker/dashboard",
    adminApplications: "/admin/business-partners/applications",
    adminBrokers: "/admin/crm/brokers",
  },
  partnerTypes: [
    "Student Partner",
    "Referral Partner",
    "Business Development Partner",
    "Sales Partner",
    "Marketing Partner",
    "Freelancer",
    "Agency or Consultant Partner",
    "Broker or Referral Agent",
  ],
} as const;
```

---

## 5. Proposed Database Schema Additions for Step 5

To support the requested enhanced application form (Age, Partner Type, Skills, Re-application cooldown of 1.5 months, Hold status, and Terms v1.1 audit logging), we will add fields to `BusinessPartnerApplication` and `BrokerProfile`.

> [!IMPORTANT]
> **No migrations will be run now.** This SQL is provided strictly for your review and approval prior to Step 5.

```sql
-- Proposed schema additions (Safe non-breaking additions only, no deletions)

-- 1. Add fields to BusinessPartnerApplication
ALTER TABLE "BusinessPartnerApplication"
  ADD COLUMN IF NOT EXISTS "age" INTEGER,
  ADD COLUMN IF NOT EXISTS "partnerType" TEXT,
  ADD COLUMN IF NOT EXISTS "skills" TEXT,
  ADD COLUMN IF NOT EXISTS "salesExperience" TEXT,
  ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "termsVersion" TEXT DEFAULT '1.1',
  ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3) WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS "termsAcceptedIp" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3) WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS "reapplyEligibleAt" TIMESTAMP(3) WITH TIME ZONE;

-- 2. Add status to BrokerProfile if not present
ALTER TABLE "BrokerProfile"
  ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE';
```

---

## 6. Execution Roadmap Following Approval

Once you provide your **"go"**, work will proceed step by step with git commits after each:
1. **Step 2 (Rename):** Create `src/config/brokerProgram.ts`, update UI text, nav/footer, admin labels, 301 redirects in `next.config.ts`, sitemap, and verify zero visible "Business Partner" strings remain.
2. **Step 3 & 4 (Landing Page):** Implement the complete 16-section approved copy on `/broker-partner` with dark theme, sticky mini-nav, animated timeline, calculator widget, and SVG flow diagrams.
3. **Step 5 (Apply Form):** Upgrade `/broker-partner/apply` with the 8 partner types, Age verification (>= 18), Zod sanitization, terms acceptance v1.1, and re-apply date restriction.
4. **Step 6 (Terms Page):** Publish `/broker-partner/terms` v1.1 with sticky TOC.
5. **Step 7 (SEO & JSON-LD):** Generate metadata, `FAQPage` + `BreadcrumbList` schemas, and `public/llms.txt`.
6. **Step 8 (Emails & Admin):** Update notification/email templates and admin application detail views.
7. **Step 9 (Verification & Production Build):** `npx tsc --noEmit`, automated tests, curl 301 check, and Playwright verification.

---

**Step 1 is complete. Please review the plan above and provide your "go" to proceed with Step 2.**
