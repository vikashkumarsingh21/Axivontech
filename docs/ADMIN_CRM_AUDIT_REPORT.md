# AXIVON TECHNOLOGIES — SYSTEM AUDIT REPORT
## Admin Portal, CRM & Lead Management Pipeline Audit

**Date:** 2026-10-15  
**Version:** 1.0.0 — Production Verification Audit  
**Auditor:** Senior Full-Stack Engineer, SaaS Product Architect & Security Engineer  
**Scope:** AXIVON Technologies Website, Public Forms, Lead Ingestion Pipeline, External Integrations, RBAC & Permissions, Admin Dashboard, CRM Subsystem, Business Partner Applications, Database Models.

---

### EXECUTIVE SUMMARY

A rigorous technical audit was conducted across the Axivon Technologies codebase (`https://axivontech.in`) to trace the end-to-end lifecycle of leads, understand admin portal data presentation, and identify the root cause of why leads received via website contact forms appear in external spreadsheets/emails but fail to appear in the Admin Portal and CRM dashboard.

The audit confirmed that the database models (`Lead`, `LeadActivity`, `FollowUp`, `CrmClient`, `BusinessPartnerApplication`, etc.) are well-designed in Prisma. However, architectural discrepancies, split ingestion routes, missing RBAC permissions for the `ADMIN` role, and an unintegrated Admin Dashboard overview caused leads to be invisible to administrators.

---

### 1. ROOT CAUSE ANALYSIS: WHY LEADS APPEAR IN EXCEL/EMAIL BUT NOT THE ADMIN DASHBOARD

Our inspection identified five specific technical causes operating simultaneously:

#### Cause 1: Split Lead Submission Endpoints
- **Endpoint A (`src/app/api/contact/route.ts`)**: Forwards payload asynchronously to a Google Apps Script webhook (`https://script.google.com/macros/s/AKfycbwXF63WF4xQAMDJbv2yLiJSXamBxC47Ndu3M921vKteL3WsHYPnaEih-otyWSf6Xdg6/exec`), which inserts rows into the Google Sheet/Excel and triggers company notification emails. It also attempted to save to `db.lead` with `source: "WEBSITE_CONTACT"`.
- **Endpoint B (`src/app/api/v1/public/leads/route.ts`)**: The newer API used by `ContactForm.tsx`, `LeadCapture.tsx`, and referral links (`/lead/[referralCode]`). This endpoint saves to `db.lead` and triggers transactional emails via `EmailService`, but **completely lacked the Google Apps Script webhook synchronization**.
- **Impact**: Inconsistent ingestion across different website entry points.

#### Cause 2: Admin Dashboard (`/admin/dashboard`) Has Zero Lead Queries
- The default landing page for administrators (`src/app/admin/dashboard/page.tsx`) only fetches `/api/v1/admin/dashboard/summary`.
- `/api/v1/admin/dashboard/summary` **only counts** `User` (employees), `Attendance`, `Project`, and `Task`. It **never queries the `Lead` model**, contains zero lead statistics cards, and renders no lead table.
- A component named `src/components/admin/dashboard/LatestContactLeads.tsx` existed in the codebase, but it contained **hardcoded mock data** (`Ritika Sharma`, `Arjun Mehta`, etc.) and was **not even mounted** on the dashboard.

#### Cause 3: RBAC Permission Blockers (403 Forbidden) for the `ADMIN` Role
- In `prisma/seed.ts` (lines 208–230), the `ADMIN` role was granted general employee permissions, attendance management, and document management, but **was never granted any CRM permissions** (`crm.dashboard.view`, `crm.lead.view`, `crm.lead.create`, `crm.lead.update`, etc.). Only `FOUNDER` and `CO_FOUNDER` were assigned those permissions.
- In `src/lib/auth/permissions.ts`, `hasPermission()` strictly verifies permissions via `RolePermission` join table entries. Because `crm.lead.view` was never assigned to `ADMIN`, calls to `/api/v1/crm/leads` and `/api/v1/crm/dashboard/summary` throw `403 Forbidden: Requires crm.lead.view permission`.
- Furthermore, `hasPermission()` did not have a superuser check for `ADMIN` or `FOUNDER` roles, blocking administrators from seeing lead records when accessing `/admin/crm/leads`.

#### Cause 4: Sidebar Filter Misconfigurations
- In `src/components/portal/AdminSidebar.tsx`, the menu item labeled "Partner Leads" links to `/admin/crm/general-leads`.
- `/admin/crm/general-leads/page.tsx` line 25 hardcodes `params.set("source", "PARTNER")`. Consequently, all standard website inquiries with `source: "WEBSITE_CONTACT"` or `"CONSULTATION"` are automatically filtered out and hidden from view.
- "Lead Inbox" (`/admin/crm/leads`) was nested inside an unexpanded accordion group, obscuring the primary intake view.

#### Cause 5: Public Form Payload Key Mismatches
- In `src/components/contact/ContactForm.tsx`, the client submitted `{ company: formData.company }` instead of `{ companyName }`, and combined service, timeline, and budget into a freeform string inside `message`, leaving the structured database columns `serviceInterest`, `budget`, and `timeline` null in `db.lead`.

---

### 2. ARCHITECTURE & COMPONENT INVENTORY

| Subsystem | File / Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Public Contact Form** | `src/components/contact/ContactForm.tsx` | Needs Enhancement | POSTs to `/api/v1/public/leads`. Needs normalized payload. |
| **Public Leads Intake API** | `src/app/api/v1/public/leads/route.ts` | Operational / Needs Sync | Validates, detects duplicates, stores in `db.lead`, sends email. Must add Google Sheet sync. |
| **Legacy Contact API** | `src/app/api/contact/route.ts` | Redundant / Divergent | Holds working Google Apps Script webhook. Should unify into centralized pipeline. |
| **Admin Shell Layout** | `src/app/admin/layout.tsx` | Operational | Uses `AdminSidebar`. Needs responsive drawer, global breadcrumb & profile header. |
| **Admin Sidebar** | `src/components/portal/AdminSidebar.tsx` | Needs Upgrade | Reorganize groups: Lead Inbox & CRM at top, accessible navigation. |
| **Admin Main Dashboard** | `src/app/admin/dashboard/page.tsx` | Incomplete | Needs real CRM lead KPI cards, lead stream, conversion metrics, recent activity. |
| **CRM Dashboard** | `src/app/admin/crm/dashboard/page.tsx` | Functional | Displays pipeline metrics, stage breakdown. Needs real data linkage and permissions fix. |
| **CRM Lead Inbox** | `src/app/admin/crm/leads/page.tsx` | Functional | Full table with search, status filters, add modal. Needs RBAC resolution. |
| **CRM Lead Details** | `src/app/admin/crm/leads/[id]/page.tsx` | Functional | Qualification form, timeline, assignment, follow-up scheduling, client conversion. |
| **Partner Applications** | `src/app/admin/business-partners/applications/page.tsx` | Functional | Lists partner applicants with status filter and search. |
| **Partner Application Detail**| `src/app/admin/business-partners/applications/[id]/page.tsx` | Functional | Complete education/experience view, meeting scheduler, approve/reject workflow. |

---

### 3. DATABASE MODELS AUDITED

- `Lead`: Primary lead intake entity with `leadCode`, `name`, `email`, `phone`, `companyName`, `serviceInterest`, `budget`, `timeline`, `status`, `qualificationStatus`, `isDuplicate`, `ownerId`.
- `LeadActivity`: Audit timeline for all interactions, status updates, emails sent, and notes.
- `LeadNote`: Private internal administrator notes on leads.
- `FollowUp`: Task/reminder scheduling for lead calls, demos, and emails.
- `Opportunity`: Pipeline deal progression linked to qualified leads.
- `CrmClient`: Account created upon successful lead conversion.
- `BusinessPartnerApplication`: Multi-step partner application with review states (`SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `ON_HOLD`).
- `BrokerProfile`: Activated partner profile with referral code tracking.

---

### 4. ACTIONABLE REMEDIATION PLAN

1. **RBAC & Authorization Fix (P0)**:
   - Update `src/lib/auth/permissions.ts` so `hasPermission()` recognizes `ADMIN`, `FOUNDER`, and `CO_FOUNDER` as authorized superusers for all administrative and CRM resources.
   - Update `prisma/seed.ts` to grant all `crm.*`, `partner.*`, and `business_partner.*` permissions to the `ADMIN` role.

2. **Centralized Lead Submission Pipeline (P0)**:
   - Enhance `/api/v1/public/leads` to act as the single canonical intake engine:
     - Full data normalization (supporting both `company` and `companyName`, structured `serviceInterest`, `budget`, `timeline`).
     - Anti-spam & rate limiting.
     - Robust duplicate detection (30-day window on normalized email and phone).
     - Database persistence in `db.lead` + `db.leadActivity`.
     - Google Sheet webhook synchronization with error resilience.
     - Email notifications to company inbox with error resilience.
     - Never fail database persistence if external sheet or email delivery errors.

3. **Admin Dashboard Redesign & Real Data Integration (P1)**:
   - Redesign `/admin/dashboard` to be an executive SaaS command center:
     - Key metrics: Total Leads, New Uncontacted Leads, Qualified Leads, Active Projects, Partner Applications, Open Follow-Ups.
     - Live Recent Leads table with quick status badges and direct navigation to lead details.
     - Lead acquisition trends chart and lead source distribution.
     - Operational status and recent audit activity.
   - Upgrade `/api/v1/admin/dashboard/summary` to return comprehensive lead and partner application aggregations alongside workforce metrics.

4. **CRM Lead Management Upgrades (P1)**:
   - Ensure `/admin/crm/leads` has seamless search, multi-factor filtering (status, source, service, owner, date range), server-side pagination, export capabilities, and quick lead creation.
   - Ensure `/admin/crm/leads/[id]` allows frictionless status transitions, assignment to team members, scheduling follow-ups, and 1-click conversion to Client/Project.

5. **Business Partner Application Review Integration (P1)**:
   - Verify and enhance `/admin/business-partners/applications` and `/admin/business-partners/applications/[id]`.
   - Ensure full applicant details (personal, employment, education, network, motivation) are cleanly rendered.
   - Streamline approval/rejection actions and partner account creation without duplicate account creation risks.

6. **Navigation & Layout Polish (P2)**:
   - Refactor `AdminSidebar.tsx` to elevate Lead Inbox, Partner Applications, and CRM into prominent top-level items with active route highlighting, collapsible sections, and mobile responsiveness.
