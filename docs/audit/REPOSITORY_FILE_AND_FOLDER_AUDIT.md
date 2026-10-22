# AXIVON ONE — REPOSITORY FILE AND FOLDER AUDIT

**Document ID:** `AXIVON-AUDIT-REPO-2026-10`  
**Platform Version:** AXIVON ONE v0.1.0 (`axivontech.in`)  
**Audit Executed:** October 22, 2026  
**Auditing Entity:** Senior Technical Architecture & Quality Assurance Audit Team  

---

## 5.1 Project Overview

* **Project Name:** `axivon-technologies` (Commercial name: **AXIVON ONE**)
* **Repository Root:** `c:\Users\vk010\Downloads\startup\axivon-technologies\axivon-technologies`
* **Architecture Paradigm:** Monolithic Enterprise Application built on Next.js App Router (Turbopack), containing unified Public Website, Client Experience Portal, Broker Partner Portal, Employee Workspace, Executive Cockpit, and Organization Administration Portal.
* **Core Frameworks & Runtimes:**
  - Runtime: Node.js (v20+ recommended)
  - Full-Stack Framework: Next.js 16.2.9 with React 19.2.4
  - Compiler / Bundler: Next.js Turbopack (`next/font/google`, CSS modules, PostCSS Tailwind v4)
  - Database Client: Prisma ORM 5.22.0 targeting PostgreSQL
  - Authentication Engine: JWT sessions managed via `jose` v6.2.10, encrypted HTTP-only cookies (`axivon_session`), and `bcryptjs` password hashing
  - Bot Defense: Dual CAPTCHA integration (Cloudflare Turnstile & Google reCAPTCHA v2/v3 fallback)
  - UI Animation & Visuals: Framer Motion v12.40.0, GSAP v3.15.0, Lucide React icons, Recharts v3.9.2
* **Build & Verification Commands:**
  - Production Build: `npm run build` (`prisma generate && next build`)
  - Test Suite: `npm run test` (`vitest run`)
  - Static Type Gating: `npx tsc --noEmit`
  - Linting: `npm run lint` (`eslint`)
  - Database Seeding: `npm run prisma:seed` (`tsx prisma/seed.ts`)

---

## 5.2 Complete Directory Tree & Layout

```
axivon-technologies/
├── .env.example                               # Template for system environment variables
├── eslint.config.mjs                          # ESLint 9 configuration with Next.js rules
├── next.config.ts                             # Next.js 16 compiler, Turbopack, and security headers config
├── package.json                               # Dependencies manifest, scripts, and engine specifications
├── postcss.config.mjs                         # PostCSS Tailwind CSS v4 processor config
├── tsconfig.json                              # TypeScript strict configuration and @/* path aliases
├── vitest.config.mjs                          # Vitest 4 runner config, alias resolution, and setup
├── docs/                                      # Enterprise system documentation
│   ├── architecture/                          # Technical architecture decision records (ADRs)
│   ├── attendance/                            # Attendance and work-hours calculation specs
│   ├── audit/                                 # Official audit reports and master findings
│   ├── deployment/                            # Production runbooks and deployment guides
│   ├── responsive/                            # Mobile/tablet responsiveness QA records
│   └── ui-ux/                                 # Design system and portal redesign specifications
├── prisma/                                    # Database schema, migrations, and seeds
│   ├── schema.prisma                          # 81 Database models and relations
│   ├── seed.ts                                # System seeding script (roles, admin, sample data)
│   └── migrations/                            # PostgreSQL migration history files
├── public/                                    # Static browser assets (images, icons, manifest)
│   ├── images/                                # Service visuals, hero media, client logos
│   ├── favicon.ico                            # Browser icon
│   └── manifest.webmanifest                   # PWA web manifest
├── src/                                       # Application source code root
│   ├── middleware.ts                          # Edge security middleware: RBAC & anti-spoofing
│   ├── app/                                   # App Router: Pages, Layouts, and API Route Handlers
│   │   ├── layout.tsx                         # Root HTML layout: fonts, schemas, top-loader
│   │   ├── page.tsx                           # Axivon Technologies public homepage
│   │   ├── globals.css                        # Tailwind v4 theme, CSS variables, typography
│   │   ├── (public pages)/                    # About, Services, Portfolio, Careers, Contact, Legal
│   │   ├── admin/                             # Admin Portal (Dashboard, Attendance, CRM, Settings)
│   │   ├── broker/                            # Broker Partner Portal (Leads, Commissions, Payouts)
│   │   ├── business-partner/                  # Business Partner program hub and activation
│   │   ├── client/                            # Client Portal (Projects, Documents, Invoices, UAT)
│   │   ├── employee/                          # Employee Portal (Punch clock, Tasks, Reports, Leave)
│   │   ├── executive/                         # Executive Portal (KPIs, Approvals, People, Audit)
│   │   ├── demo-projects/                     # 8 Interactive demo applications (47 sub-routes)
│   │   └── api/                               # 249 REST API route handlers
│   ├── components/                            # Modular React UI components
│   │   ├── admin/                             # Admin tables, filters, modals
│   │   ├── auth/                              # Login widgets, session indicators
│   │   ├── chatbot/                           # AI Lead capture and support widget
│   │   ├── demo-projects/                     # Demo project UI interfaces
│   │   ├── employee/                          # Attendance punch clocks, task lists
│   │   ├── legal/                             # Cookie consent banner, policy acknowledgements
│   │   ├── portal/                            # Shared portal sidebars, headers, breadcrumbs
│   │   ├── portal-ai/                         # Portal AI Assistant modal and chat interface
│   │   ├── ui/                                # Reusable primitive widgets (Buttons, Inputs, Cards)
│   │   └── Navbar.tsx, Footer.tsx, Hero.tsx   # Core layout components
│   └── lib/                                   # Domain services, utilities, and integrations
│       ├── auth/                              # JWT tokens, RBAC permissions, password hashing
│       ├── captcha/                           # Cloudflare Turnstile & Google reCAPTCHA engines
│       ├── careers/                           # Careers DB access and recruitment toggling
│       ├── chatbot/                           # AI Chatbot tool registry and prompt engine
│       ├── content/                           # CMS content queries and settings
│       ├── email/                             # Email dispatch templates and logging
│       ├── portal-ai/                         # Portal AI context retriever and agent tools
│       ├── reports/                           # Project delivery report generators
│       ├── services/                          # AttendanceService and core business workflows
│       ├── api-error.ts                       # Standardized ApiError class and handler
│       ├── date-utils.ts                      # Timezone-safe UTC date calculation utilities
│       ├── db.ts                              # Singleton Prisma client instance
│       └── env.ts                             # Environment variable schema and validation
└── tests/                                     # Vitest automated test suites (53 suites, 674 tests)
```

### Excluded Directories (Justification)
* `node_modules/`: Contains 3rd-party vendor dependencies managed via npm. Excluded from repository source tracking.
* `.next/`: Output directory containing compiled Turbopack chunks, static HTML, and serverless route lambdas. Generated during `npm run build`.
* `.git/`: Internal Git object database and version history.
* `coverage/`: Temporary test coverage outputs generated during test runs.

---

## 5.3 Folder-by-Folder Structural Responsibilities

| Directory Path | Primary Responsibility | File Types Contained | Key Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- |
| `src/app/api/v1/admin/` | Admin back-office API operations (workforce, CRM, payouts, CMS) | Next.js Route Handlers (`route.ts`) | `src/lib/db.ts`, `src/lib/auth/permissions.ts` | Active |
| `src/app/api/v1/employee/` | Employee self-service API (attendance punch, tasks, reports, leave) | Next.js Route Handlers (`route.ts`) | `src/lib/services/attendance.service.ts` | Active |
| `src/app/api/v1/broker/` | Broker lead submission, commission ledger, and payout requests | Next.js Route Handlers (`route.ts`) | `src/lib/finance.ts`, `src/lib/db.ts` | Active |
| `src/app/api/v1/client/` | Client project progress, document vault, and UAT approval | Next.js Route Handlers (`route.ts`) | `src/lib/db.ts`, `src/lib/auth/permissions.ts` | Active |
| `src/app/api/v1/executive/` | Executive KPI aggregation, approvals, workforce audits | Next.js Route Handlers (`route.ts`) | `src/lib/db.ts` | Active |
| `src/app/api/v1/public/` | Unauthenticated public endpoints (inquiry, application, reviews) | Next.js Route Handlers (`route.ts`) | `src/lib/captcha/**`, `src/lib/db.ts` | Active |
| `src/components/portal/` | Shared enterprise portal shell (Sidebar, Header, UserMenu) | React Client Components (`.tsx`) | `lucide-react`, `next/link`, `next/navigation` | Active |
| `src/components/legal/` | Compliance components (Cookie consent, Terms acknowledgement) | React Client Components (`.tsx`) | `src/lib/db.ts` | Active |
| `src/lib/auth/` | Session verification, RBAC permissions, password crypto | TypeScript modules (`.ts`) | `jose`, `bcryptjs`, `src/lib/db.ts` | Active |
| `src/lib/services/` | Core business logic engine (`AttendanceService`) | TypeScript modules (`.ts`) | `src/lib/db.ts`, `src/lib/date-utils.ts` | Active |
| `src/lib/captcha/` | Dual bot-defense validation (Turnstile + reCAPTCHA) | TypeScript modules (`.ts`) | `fetch`, `src/lib/api-error.ts` | Active |
| `tests/` | Automated unit, API, integration, and security suites | Vitest test files (`.test.ts`) | `vitest`, `src/lib/**`, NextRequest mock | Active |

---

## 5.4 File-by-File Inventory (Core Architecture)

| File Path | Type | Responsibility | Key Exports / Symbols | Data Access | Role / Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/middleware.ts` | Edge Middleware | Strips spoofed headers, validates `axivon_session` JWT, enforces edge route guards | `middleware`, `config` | None (Edge JWT verify) | Edge Gateway | Active |
| `src/lib/db.ts` | Database Client | Global singleton PrismaClient instance preventing pool exhaustion | `db` | PostgreSQL via Prisma | Internal | Active |
| `src/lib/api-error.ts` | Error Utility | Standardized API exception handling with HTTP status codes | `ApiError`, `handleApiError` | None | Internal | Active |
| `src/lib/services/attendance.service.ts` | Domain Service | Work hours calculation, lateness, early exit, break deductions, and cutoff | `AttendanceService`, `DEFAULT_ATTENDANCE_POLICY` | `db.attendance`, `db.attendancePolicy` | Internal | Active |
| `src/lib/auth/permissions.ts` | Auth Utility | Database-backed permission checks and active user validation | `validateActiveUser`, `hasPermission` | `db.user`, `db.userRole` | Internal | Active |
| `src/lib/captcha/verify-request.ts` | Bot Defense | Multi-provider CAPTCHA validator with test bypass support | `verifyCaptchaRequest` | None (External verify) | Public / All | Active |
| `src/app/api/v1/auth/login/route.ts` | API Handler | Authenticates users, checks active status, verifies CAPTCHA, sets cookie | `POST` | `db.user`, `db.session` | Public | Active |
| `src/app/api/v1/employee/attendance/route.ts` | API Handler | Handles check-in, check-out, break start, and break end | `GET`, `POST` | `db.attendance`, `db.attendanceBreak` | `EMPLOYEE` | Active |
| `src/app/api/v1/admin/commissions/[id]/route.ts` | API Handler | Payout settlement recording with mandatory unique Bank UTR check | `PATCH` | `db.commission` | `ADMIN`, `FINANCE` | Active |
| `src/app/api/v1/admin/partner-payments/[id]/route.ts` | API Handler | Payment verification and idempotent commission creation | `PATCH` | `db.partnerPayment`, `db.commission` | `ADMIN`, `FINANCE` | Active |
| `src/app/api/v1/broker/commissions/payout-request/route.ts` | API Handler | Payout request registration with 48h SLA and Admin notifications | `POST` | `db.commission`, `db.notification` | `BROKER` | Active |
| `src/app/api/v1/client/projects/[id]/documents/[docId]/download/route.ts` | API Handler | Secure project document download with cross-client IDOR defense | `GET` | `db.partnerDocument`, `db.project` | `CLIENT` (Scoped) | Active |

---

## 5.5 Dependency and Import Relationships

A standard request executes through a strictly controlled vertical flow:

```
[Browser Interaction]
       │
       ▼
[Page / Component (src/app/**/page.tsx)]
       │ (Calls fetch or Server Action)
       ▼
[Edge Middleware (src/middleware.ts)]
       │ (Validates JWT cookie, strips spoofed headers, sets x-user-id)
       ▼
[API Route Handler (src/app/api/**/route.ts)]
       │ (Zod body parsing, validateActiveUser(x-user-id), hasPermission())
       ▼
[Domain Service (src/lib/services/**)]
       │ (Executes calculations, validates business invariants)
       ▼
[Prisma Client (src/lib/db.ts)]
       │ (Atomic db.$transaction queries)
       ▼
[PostgreSQL Database]
```

### Module Cross-Dependencies:
* **Common Core:** Almost all API routes depend on `src/lib/db.ts`, `src/lib/api-error.ts`, and `src/lib/auth/permissions.ts`.
* **Portal Isolation:** Employee pages do not import Admin components or CRM models; Broker pages interact with broker-scoped APIs only.

---

## 5.6 Route-to-File Mapping

| Public URL Pattern | Route File Location | Layout Controller | Main Page Component | Auth Requirement |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | `src/app/layout.tsx` | `HomePage` | Public |
| `/about` | `src/app/about/page.tsx` | `src/app/layout.tsx` | `AboutPage` | Public |
| `/services` | `src/app/services/page.tsx` | `src/app/layout.tsx` | `ServicesPage` | Public |
| `/portfolio` | `src/app/portfolio/page.tsx` | `src/app/layout.tsx` | `PortfolioPage` | Public |
| `/careers` | `src/app/careers/page.tsx` | `src/app/layout.tsx` | `CareersPage` | Public |
| `/contact` | `src/app/contact/page.tsx` | `src/app/layout.tsx` | `ContactPage` | Public |
| `/login` | `src/app/login/page.tsx` | `src/app/layout.tsx` | `LoginPage` | Public |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | `src/app/admin/layout.tsx` | `AdminDashboard` | `ADMIN`, `FOUNDER` |
| `/admin/attendance` | `src/app/admin/attendance/page.tsx` | `src/app/admin/layout.tsx` | `AdminAttendance` | `ADMIN`, `FOUNDER` |
| `/admin/crm/commissions` | `src/app/admin/crm/commissions/page.tsx` | `src/app/admin/layout.tsx` | `CommissionsPage` | `ADMIN`, `FINANCE` |
| `/employee/dashboard` | `src/app/employee/dashboard/page.tsx` | `src/app/employee/layout.tsx` | `EmployeeDashboard` | `EMPLOYEE` |
| `/employee/attendance` | `src/app/employee/attendance/page.tsx` | `src/app/employee/layout.tsx` | `EmployeeAttendance` | `EMPLOYEE` |
| `/broker/dashboard` | `src/app/broker/dashboard/page.tsx` | `src/app/broker/layout.tsx` | `BrokerDashboard` | `BROKER` |
| `/broker/commissions` | `src/app/broker/commissions/page.tsx` | `src/app/broker/layout.tsx` | `BrokerCommissions` | `BROKER` |
| `/client/dashboard` | `src/app/client/dashboard/page.tsx` | `src/app/client/layout.tsx` | `ClientDashboard` | `CLIENT` |
| `/client/projects/[id]` | `src/app/client/projects/[id]/page.tsx` | `src/app/client/layout.tsx` | `ClientProjectDetail` | `CLIENT` (Assigned) |
| `/executive/dashboard` | `src/app/executive/dashboard/page.tsx` | `src/app/executive/layout.tsx` | `ExecutiveDashboard` | `FOUNDER`, `CO_FOUNDER` |

---

## 5.7 Configuration Inventory

| Config Key | Intended Purpose | Security Classification | Required In Prod |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string with credentials | Critical Secret | Yes |
| `NODE_ENV` | Runtime mode (`development`, `test`, `production`) | Public Flag | Yes |
| `SESSION_SECRET` | 256-bit secret for signing JWT `axivon_session` cookies | Critical Secret | Yes |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public Cloudflare Turnstile client key | Public Identifier | Optional in Dev |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server-side verification token | Secret | Optional in Dev |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Public Google reCAPTCHA v2/v3 client site key | Public Identifier | Optional in Dev |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA secret key for server API calls | Secret | Optional in Dev |
| `RESEND_API_KEY` | Transactional email provider token | Secret | Optional |
| `GEMINI_API_KEY` | Google Generative AI API token for portal assistant | Secret | Optional |

---

## 5.8 Generated, Duplicated, and Potentially Unused Files

* **0-byte Stub Files in `src/lib/` (`AX-AUD-002`):**
  - `src/lib/embeddings.ts` (0 bytes)
  - `src/lib/openai.ts` (0 bytes)
  - `src/lib/pinecone.ts` (0 bytes)
  - `src/lib/rag.ts` (0 bytes)
  - `src/lib/sheets.ts` (0 bytes)
  *Observation:* These files were created during initial repository initialization in June 2026. The platform currently uses `@google/generative-ai` rather than OpenAI/Pinecone. They do not cause build errors, but should be deleted during scheduled housekeeping.
* **Duplicate Route Segment:**
  - `src/app/admin/content/login-posters/` and `src/app/admin/content/login_posters/`
  *Observation:* Both kebab-case and snake_case directories exist. The active navigation links point to `login-posters`. `login_posters` contains historical references.

---

## 5.9 Documentation Limitations

* **External Production Services:** Live SMS OTP gateways, Cloudflare Turnstile production endpoints, and Google reCAPTCHA production APIs were not invoked with live paid secrets to avoid incurring external billing or rate limits. All verification was executed using project-supported mock mechanisms and development test tokens.
