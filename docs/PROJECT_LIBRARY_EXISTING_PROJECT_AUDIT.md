# AxivonTech Project Library — Existing System & Completed Projects Audit

**Date:** November 7, 2026  
**System:** Axivon Technologies Authenticated Business Application  
**Module:** Project Library (Completed Projects Archive & Management System)  
**Author:** Axivon Technologies Engineering Team  

---

## 1. Executive Summary & Audit Scope

This document records the exhaustive audit of all project-related data sources, authentication mechanisms, database models, and role-based permissions in the Axivon Technologies application. The goal of this audit is to establish a single, centralized **Project Library** storing genuine completed projects delivered by AxivonTech, while preventing duplicate entries, preserving data integrity, and enforcing rigorous server-side role-based access control (RBAC).

---

## 2. Existing System Architecture Audit

### 2.1 Authenticated Portals
The application features several authenticated portal shells, each serving specific user roles:
1. **Admin Portal (`/admin/*`)**: High-level platform administration, CRM management, employee management, system settings, activity logs, content controls.
2. **Founder & Co-Founder Executive Portal (`/executive/*`)**: Strategic oversight, company profile, governance approvals, executive BI reports, security audits. Shared equal 50-50 partnership permissions (`FOUNDER` and `CO_FOUNDER`).
3. **Department Manager Portal (`/manager/*`)**: Department-scoped team management, task tracking, employee work reports, attendance, leave approvals. Role identifiers: `DEPARTMENT_MANAGER` and `MANAGER`.
4. **Broker / Business Partner Portal (`/broker/*`)**: Partner referral management, commissions, onboarding, partner project status tracking. Roles: `BUSINESS_PARTNER` (canonical) and `BROKER` (legacy alias).
5. **Employee Portal (`/employee/*`)**: Personal attendance check-in, task assignments, daily work reports, leave requests, document center. Role: `EMPLOYEE`.
6. **Client Portal (`/client/*`)**: Client project tracking, support tickets, invoices.

### 2.2 Database & Data Persistence (Neon PostgreSQL + Prisma ORM)
- **Database Engine:** PostgreSQL hosted on Neon (`ep-super-king-b3813msu-pooler.c-4.ap-southeast-1.aws.neon.tech:5432/neondb`).
- **ORM:** Prisma Client v5.22.0.
- **Audited Models:**
  - `Project`: Used primarily for internal employee task assignments (`Task.projectId`, `ProjectMember`). Contains 1 active project (`Axivon One`).
  - `PortfolioProject`: Schema model for public website portfolio items. Currently contains 0 database records.
  - `PartnerProject`: Onboarding submissions initiated by brokers/partners. Contains 7 test/QA records.
  - `CrmClient` / `Opportunity` / `Proposal`: CRM sales pipeline records. Contains 1 test client (`Jane Doe Client`).
  - `User`, `Role`, `UserRole`, `Permission`, `RolePermission`: Dynamic RBAC system with cryptographic JWT session management (`jose`).
  - `AuditLog`: System-wide audit logging entity.

### 2.3 Existing File Sources & Hardcoded Project Data
Inspection revealed verified completed company projects stored across structured TypeScript modules:
- `src/data/portfolio/purvarang.ts`: Comprehensive case study for Purvarang Family Restaurant.
- `src/data/portfolio/udaan.ts`: Comprehensive case study for Udaan Furniture Showroom.
- `src/data/portfolio/axivon.ts`: Flagship Axivon Technologies enterprise corporate platform.
- `src/data/portfolio/jalmitra.ts`: JalMitra autonomous solar water cleaning & IoT monitoring platform.
- `src/data/portfolio/krishi.ts`: Krishi Drishti smart agriculture and IoT analytics platform.
- `src/data/portfolio/nani.ts`: Nani Tathagat business automation and lead generation platform.
- `src/components/Portfolio.tsx`: Public portfolio components referencing Purvarang and Udaan.
- `src/data/demo-projects.ts`: 47 interactive template concepts created for sales demos.

---

## 3. Completed Projects Inventory & Import Decisions

In accordance with system policy, only genuine completed client and company projects with verified completion dates, actual deliverables, and confirmed deployments are imported into the centralized Project Library. In-progress development tasks and QA test seeds are excluded.

| Project Name | Existing Source | Verification / Live URL | Actual Status | Duplicate Found | Import Decision |
|---|---|---|---|---|---|
| **Purvarang Family Restaurant** | `src/data/portfolio/purvarang.ts` | https://purvarang-family-restaurant.onrender.com/ | Completed (Delivered 2026-02-15) | None | **IMPORT** (Verified Live Client Delivery) |
| **Udaan Furniture** | `src/data/portfolio/udaan.ts` | https://udaan-furniture.onrender.com/ | Completed (Delivered 2026-03-20) | None | **IMPORT** (Verified Live Client Delivery) |
| **Axivon Technologies** | `src/data/portfolio/axivon.ts` | https://axivontech.in | Completed (Live Platform 2026-06-22) | None | **IMPORT** (Flagship Production Platform) |
| **JalMitra** | `src/data/portfolio/jalmitra.ts` | https://jal-mitraafrontend.onrender.com/ | Completed (Delivered 2026-06-15) | None | **IMPORT** (Verified Autonomous IoT Platform) |
| **Krishi Drishti** | `src/data/portfolio/krishi.ts` | https://krishi-drishti.onrender.com/ | Completed (Delivered 2025-09-04) | None | **IMPORT** (Verified AgriTech Platform) |
| **Nani Tathagat** | `src/data/portfolio/nani.ts` | https://nanitathagat.in/ | Completed (Delivered 2026-06-06) | None | **IMPORT** (Verified Automation System) |
| **Axivon One** | `Project` DB table (`cmtuc4ais000ghczse6cmp0u3`) | Internal platform | ACTIVE (In-Progress) | N/A | **EXCLUDE** (Active development project, not historical archive) |
| **Apex Logistics Cloud Platform** | `PartnerProject` DB table (`PRJ-20261024-0001` - `0005`, `0001`) | None (QA placeholder) | Test Broker Submission | 6 duplicate test runs | **EXCLUDE** (Synthetic test lead, no delivery) |
| **Jane Doe Client — Project** | `PartnerProject` DB table (`PRJ-20261025-0006`) | None (QA placeholder) | Test Opportunity | None | **EXCLUDE** (Synthetic test record) |
| **Demo Projects (Medicare, Oakfield, etc.)** | `src/data/demo-projects.ts` | Internal mock routes | Interactive Sales Concepts | N/A | **EXCLUDE** (Demo templates, not delivered company client projects) |

---

## 4. Duplicate Prevention Strategy

To ensure zero duplicate records during historical migration and future manual entries:
1. **Normalized Slug & ID Verification:**
   - Every project record enforces a unique `slug` (e.g., `purvarang-family-restaurant`, `udaan-furniture`).
   - Prior to insertion, the system performs a case-insensitive check against `slug`, `name`, and normalized `liveUrl`.
2. **Idempotent Migration Script:**
   - The migration script searches for existing records by `slug` before inserting. If found, it updates verified fields rather than creating a duplicate.
3. **Data Preservation:**
   - Original creation timestamps, actual completion dates (`completionDate`), verified URLs, technology stacks, feature lists, and verified client attributions are strictly preserved without fabricating data.

---

## 5. Security & Access Boundary Constraints

- The Project Library will **never** be exposed via public routes or unauthenticated endpoints.
- All requests require a valid cryptographic JWT session cookie (`axivon_session`).
- Server-side response sanitization strictly limits read-only roles (`BROKER`, `BUSINESS_PARTNER`, `EMPLOYEE`, `USER`, `CLIENT`) to exactly 4 permitted fields:
  1. `name` (Project Name)
  2. `industry` (Field / Industry)
  3. `liveUrl` (Verified Live Website URL)
  4. `completionDate` (Project Completion Date)
- Administrative and Write roles (`ADMIN`, `FOUNDER`, `CO_FOUNDER`, `MANAGER`, `DEPARTMENT_MANAGER`) receive complete project metadata, management actions, Excel workbook generation, and client presentation view.
