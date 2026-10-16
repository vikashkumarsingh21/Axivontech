# Initial Project Audit Report
**Project:** Axivon Technologies Web Platform & Enterprise CRM  
**Target Domain:** `https://axivontech.in`  
**Audit Date:** October 2026  
**Auditor:** Senior Full-Stack Engineer, Security Architect & Systems Auditor  

---

## 1. Executive Summary

Axivon Technologies is a modern multi-tenant enterprise portal and corporate web platform designed to support high-growth technology consulting, custom software development, partner ecosystems, client project tracking, and internal enterprise operations.

The application combines a high-conversion public corporate website, multiple interactive product demos (NovaCart, LeadPilot, CorporatePro, MediCare, FoodieHub, EduSmart), a role-governed multi-portal management system (Admin, Executive/Founder, Employee, Broker/Partner, and Client portals), and an integrated CRM pipeline.

This initial audit establishes the architectural baseline, technology stack, directory organization, database schema, security posture, API surfaces, and baseline operational health of the codebase.

---

## 2. Technology Stack & Dependencies

| Layer | Technology | Version | Purpose / Architecture Role |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.2.9` | Hybrid SSR, Edge Middleware, Server Actions & Route Handlers |
| **Runtime / UI** | React | `19.2.4` | Component lifecycle, concurrent rendering, client hooks |
| **Language** | TypeScript | `5.x` | Strict typing, domain modeling, compile-time safety |
| **Styling** | Tailwind CSS | `v4` | Design tokens, responsive utility layout, dark/light theme systems |
| **Database ORM** | Prisma ORM | `5.22.0` | Declarative schema, typed client queries, migration tracking |
| **Database Engine** | PostgreSQL / Neon | Serverless | Relational persistence, connection pooling, SSL-enforced |
| **Auth / Cryptography** | `jose`, `bcryptjs` | Modern | JWT session creation/verification in Edge/Node runtime, 12-round salt |
| **Validation** | Zod | `3.23.8` | Schema validation on API inputs and form bodies |
| **Testing** | Vitest | `4.1.11` | In-memory unit, integration, and security assertion suite |
| **Icons & Motion** | `lucide-react`, `framer-motion` | Latest | Premium iconography and fluid UI animations |

---

## 3. Directory Structure & Architecture Overview

The repository follows standard Next.js App Router conventions with strong modular encapsulation:

```
axivon-technologies/
├── docs/                               # Architectural and audit documentation
│   └── audit/                          # Mandatory technical audit reports
├── prisma/                             # Database definition and migration tracking
│   ├── schema.prisma                   # Core Prisma data schema (30+ relational models)
│   └── migrations/                     # Version-controlled SQL migration history
├── public/                             # Static public assets (logos, images, manifests)
│   ├── assets/                         # Brand logos, corporate diagrams, icons
│   └── images/                         # Project demo illustrations and media
├── src/                                # Source application root
│   ├── app/                            # Next.js App Router pages and API routes
│   │   ├── (auth)/                     # Auth groupings
│   │   ├── admin/                      # Central Administrator Portal & CRM dashboards
│   │   ├── api/                        # REST API Route Handlers (/api/v1/...)
│   │   ├── broker/                     # Partner / Broker Portal
│   │   ├── client/                     # Client Portal & Deliverable acceptance
│   │   ├── demo-projects/              # Interactive industry application demos
│   │   ├── employee/                   # Employee Self-Service, Attendance & Tasks
│   │   ├── executive/                  # Founder / Co-Founder Executive Oversight Portal
│   │   ├── login/                      # AXIVON ONE Unified Dynamic Animated Login Page
│   │   └── page.tsx                    # Public corporate homepage
│   ├── components/                     # Reusable UI component modules
│   │   ├── admin/                      # Admin-specific data tables, filters, modals
│   │   ├── demo-projects/              # Modular demo showcases (NovaCart, FoodieHub, etc.)
│   │   ├── portal/                     # Shared portal sidebars, topbars, headers
│   │   └── ui/                         # Base design primitives
│   ├── context/                        # React Context providers (state synchronization)
│   ├── lib/                            # Business logic, database client, utilities
│   │   ├── auth/                       # Password hashing, JWT signing, RBAC engine
│   │   ├── db.ts                       # Singleton Prisma client instance
│   │   ├── email/                      # Nodemailer transport and HTML email templates
│   │   ├── rate-limit.ts               # In-memory sliding-window rate limiter
│   │   └── logger.ts                   # Structured event logger
│   └── middleware.ts                   # Edge runtime routing, session auth & header protection
└── tests/                              # Automated Vitest test specifications
```

---

## 4. Portal Ecosystem & Role-Based Access Control

The application enforces a 5-tier role hierarchy with discrete portal dashboards:

1. **Executive Portal (`/executive/*`):**
   - **Allowed Roles:** `FOUNDER`, `CO_FOUNDER`.
   - **Capabilities:** Comprehensive organizational analytics, executive company overview, financial reports, employee attendance oversight, high-level approvals, security audit event monitoring, and enterprise settings.
2. **Admin Portal (`/admin/*`):**
   - **Allowed Roles:** `ADMIN`, `FOUNDER`, `CO_FOUNDER`.
   - **Capabilities:** User identity management, employee onboarding/offboarding, role assignment, CRM pipeline administration, lead distribution, broker management, business partner applications, and dynamic login poster carousel management (`/admin/content/login-posters`).
3. **Employee Portal (`/employee/*`):**
   - **Allowed Roles:** `EMPLOYEE`, `ADMIN`, `FOUNDER`, `CO_FOUNDER`.
   - **Capabilities:** Daily punch-in/out attendance logging, regularizations, leave applications, task management, personal work reports, profile settings, and internal announcements.
4. **Broker / Partner Portal (`/broker/*`):**
   - **Allowed Roles:** `BROKER`, `ADMIN`, `FOUNDER`, `CO_FOUNDER`.
   - **Capabilities:** Referral tracking, partner lead submissions, project commission calculation, payout tracking, and partnership agreements.
5. **Client Portal (`/client/*`):**
   - **Allowed Roles:** `CLIENT`.
   - **Capabilities:** Active project tracking, milestone verification, document download, user acceptance testing (UAT) sign-offs, and invoice views.

---

## 5. Database Schema & Data Architecture

The application database schema is defined in `prisma/schema.prisma` targeting PostgreSQL. Key domain groupings include:

- **Identity & Access Management:** `User`, `Role`, `UserRole`, `Session`, `AuditLog`.
- **HR & Workforce Management:** `EmployeeProfile`, `Attendance`, `LeaveRequest`, `WorkReport`, `Task`, `Notification`, `NotificationPreference`.
- **CRM & Business Development:** `Lead`, `LeadNote`, `LeadMeeting`, `BrokerLead`, `PartnerApplication`, `Opportunity`, `Proposal`, `Client`.
- **Finance & Delivery:** `ClientProject`, `Milestone`, `Invoice`, `Commission`, `Document`, `DocumentVersion`.
- **Dynamic Content & Content Management:** `LoginPagePoster` (dynamic animated carousel on `/login`).

---

## 6. Baseline Verification & Discoveries

Before making any changes, the codebase was audited for compilation and testing health:

- **TypeScript Compilation (`tsc --noEmit`):** Passing with 0 errors across all production files.
- **Automated Test Baseline:** 17 test files and 158 tests passed cleanly.
- **Security & Authorization Review Discoveries:**
  1. *Omission in Middleware Matcher:* Protected endpoints like `/api/v1/me/*`, `/api/v1/notifications/*`, `/api/v1/reminders/*`, `/api/v1/documents/*`, `/api/v1/activity/*`, `/api/v1/preferences/*`, `/api/v1/automations/*`, `/api/v1/announcements/*`, and `/api/v1/search/*` were not enumerated in `src/middleware.ts`, exposing them to header stripping anomalies and potential spoofing.
  2. *Authentication Rate Limiting:* `/api/v1/auth/login` lacked brute-force throttling despite existing rate-limiting utilities in `src/lib/rate-limit.ts`.
  3. *Logout Cookie Invalidation:* `/api/v1/auth/logout` invoked `.delete()` without explicit `path: "/"`, `maxAge: 0`, and `expires: new Date(0)`.
  4. *Environment Variable Versioning:* `.gitignore` had `.env*` which blocked `.env.example` from being version controlled.
  5. *Content Security Policy:* `next.config.ts` included `X-Frame-Options` and `HSTS` but lacked an explicit `Content-Security-Policy`.

These findings were prioritized for immediate remediation in Phase 2.
