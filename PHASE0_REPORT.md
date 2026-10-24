# Phase 0: Read-Only Audit & Baseline Report

**Project:** `axivontech.in` (Axivon Technologies)  
**Date:** October 24, 2026  
**Git Branch:** `phase-0-baseline`  
**Phase Status:** Complete (Awaiting User Approval to Proceed to Phase 1)  

---

## 1. Executive Summary & Git Verification

A complete, non-destructive, read-only audit of `axivontech.in` has been performed. No existing files have been modified, renamed, moved, or deleted. No database mutations, migrations, seedings, or pushes were executed. No `.env` secrets or raw values were output or edited.

- **Git Status:** Git was verified as available on `main`.
- **Branch Created:** `phase-0-baseline` was created and checked out (`git checkout -b phase-0-baseline`).
- **Baseline Health:**
  - `npm install`: Exited code 0 (Prisma Client v5.22.0 generated).
  - `npm run lint`: Exited code 0 (0 errors, 2,263 non-blocking warnings).
  - `npx tsc --noEmit`: Exited code 0 (0 TypeScript errors).
  - `npm run build`: Exited code 0 (all 130+ static, SSG, and dynamic routes compiled successfully).
  - **Local Runtime:** Tested in browser across 13 core public routes with **0 application-level console errors** (1 missing asset path noted for EstateVista hero image).

---

## 2. Project Map

### 2.1 Technology Stack & Core Versions
- **Framework:** Next.js `16.2.9` (App Router architecture)
- **UI Library:** React `19.2.4`, React DOM `19.2.4`
- **Language:** TypeScript `^5`
- **Styling:** Tailwind CSS `^4` with `@tailwindcss/postcss ^4`
- **Database ORM:** Prisma Client & CLI `^5.22.0` (Targeting Managed PostgreSQL / Neon)
- **Animation & Visuals:** Framer Motion `^12.40.0`, GSAP `^3.15.0`
- **Icons & Data Viz:** Lucide React `^1.21.0`, React Icons `^5.6.0`, Recharts `^3.9.2`
- **AI / LLM Integration:** `@google/generative-ai ^0.24.1` (Gemini API)
- **Auth & Security:** Jose `^6.2.10` (JWT tokenization), Bcryptjs `^3.0.3` (credential hashing)
- **Validation & Dates:** Zod `^4.5.4`, Date-fns `^4.4.0`
- **Testing:** Vitest `^4.1.11`

### 2.2 Root Folder Structure
```text
axivon-technologies/
├── prisma/
│   ├── schema.prisma               # Prisma relational schema (PostgreSQL)
│   ├── migrations/                 # Historical migration records
│   └── seed.ts                     # Database seed definitions
├── public/
│   ├── assets/                     # Brand logos, service imagery, team media
│   ├── images/                     # Demo project showcase screenshots & SVGs
│   ├── portfolio/                  # Client case study imagery
│   └── favicon.ico, next.svg, etc.
├── src/
│   ├── app/                        # Next.js App Router (pages & API routes)
│   ├── components/                 # Reusable UI, SEO, portal, and section components
│   ├── context/                    # React Context providers (Auth, Theme, etc.)
│   ├── data/                       # Content repositories (services, blog, demos, stats)
│   ├── lib/                        # Backend utilities, DB, auth, email, AI engine
│   └── middleware.ts               # Edge auth, RBAC & security headers
├── tests/                          # Test suites (Vitest)
├── next.config.ts                  # Next.js configuration & CSP security headers
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Scripts & dependencies
└── PHASE0_REPORT.md                # Phase 0 Audit Document
```

### 2.3 Route Inventory

#### Public Website & Marketing Pages
- `/` — Homepage (Hero, Services, Why Us, Industries, Portfolio, Process, Reviews, FAQ, CTA)
- `/about` — About Us, Company Story, Leadership, Milestones, FAQ
- `/services` — Services Master Page & Explorer
- `/services/[slug]` — 10 dedicated service landing pages:
  - `/services/web-development`
  - `/services/mobile-app-development`
  - `/services/ai-solutions`
  - `/services/cloud-solutions`
  - `/services/seo-services`
  - `/services/digital-marketing`
  - `/services/ui-ux-design`
  - `/services/custom-software-development`
  - `/services/automation`
  - `/services/robotics-iot`
- `/industries` — Industries overview catalog
- `/portfolio` — Master portfolio page
- `/portfolio/[slug]` — Case study pages (`axivon-technologies`, `krishi-drishti`, `jalmitra`, `nani-tathagat`)
- `/demo-projects` — Interactive software showcase catalog (47 total demos)
- `/demo-projects/[slug]` — 47 demo specification detail pages
- `/demo-projects/business/corporatepro` — Live interactive CorporatePro demo
- `/demo-projects/healthcare/medicare` — Live interactive MediCare demo
- `/demo-projects/food/foodiehub` — Live interactive FoodieHub demo
- `/demo-projects/education/edusmart` — Live interactive EduSmart demo
- `/demo-projects/ecommerce/novacart/*` — Live interactive NovaCart full-stack e-commerce demo (Storefront, Cart, Checkout, Product pages, Admin portal)
- `/demo-projects/fitness/fitzone` — Live interactive FitZone demo
- `/demo-projects/real-estate/estatevista` — Live interactive EstateVista demo
- `/demo-projects/saas/leadpilot/*` — Live interactive LeadPilot SaaS demo (CRM pipeline, Contacts, Reports, Settings)
- `/blog` — Articles master list
- `/blog/[slug]` — 3 editorial deep-dive articles
- `/contact` — Contact & inquiry page
- `/reviews` — Client reviews & review submission form
- `/careers` & `/careers/[slug]` — Careers portal and job listing pages
- `/business-partner` & `/business-partner/apply` — Partner affiliate program overview and registration

#### Legal & Governance Pages
- `/legal`, `/legal/company-information`, `/privacy-policy`, `/terms`, `/terms-and-conditions`, `/cookie-policy`, `/disclaimer`, `/refund-cancellation-policy`, `/service-delivery-policy`, `/payment-terms`, `/intellectual-property`, `/acceptable-use-policy`, `/security-policy`, `/privacy-requests`, `/ai-usage`, `/ai-privacy-notice`, `/careers-privacy`, `/business-partner-terms`, `/broker-terms`, `/accessibility`, `/cookie-preferences`

#### Authenticated Operations Portals
- `/login`, `/logout`, `/verify-email-change`, `/account-inactive`
- `/admin/*` — Full administration portal (CRM, CMS Content, AI Knowledge, Users, Automations, Analytics, Settings)
- `/employee/*` — Employee workspace (Attendance, Timesheets, Work Reports, Leave Requests, Profile)
- `/executive/*` — Executive portal (Financial overview, Company KPIs, Approvals, People Management)
- `/broker/*` — Broker/Partner dashboard (Leads, Commissions, Contracts, Marketing assets)
- `/client/*` — Client project tracking portal (Invoices, Documents, UAT signoff, Support)

#### Dynamic System & SEO Routes
- `/sitemap.xml` (via `src/app/sitemap.ts`)
- `/robots.txt` (via `src/app/robots.ts`)
- `/manifest.webmanifest` (via `src/app/manifest.ts`)

### 2.4 Content & Data File Mapping
- **Company Verified Stats:** `src/data/company-stats.ts`
- **Services Catalog (10 services):** `src/data/services.ts`
- **Industry Catalog:** `src/lib/content/content-db.ts` (`DEFAULT_INDUSTRIES`)
- **Portfolio Projects (4 projects):** `src/data/portfolio/index.ts`, `src/data/projects.ts`, `src/data/portfolio/*.ts`
- **Interactive Demos (47 demos):** `src/data/demo-projects.ts`
- **Blog Articles (3 articles):** `src/data/blog-posts.ts`
- **Careers & Open Positions:** `src/data/careers.ts`
- **CMS Database Fallbacks & Providers:** `src/lib/content/content-db.ts`

### 2.5 Site-Wide Numbers & Claims Audit
The following table documents where site-wide metrics and claims are defined across codebase files:

| Claim / Metric | File Location | Line Number(s) | Notes / Observations |
| :--- | :--- | :--- | :--- |
| **"10+ Projects Delivered"** | `src/data/company-stats.ts` | Lines 21–28 | Defined as `COMPANY_STATS.projectsDelivered` (`numericValue: 10`, `suffix: "+"`). Rendered on `Hero.tsx` (L204), `WhyChooseUs.tsx` (L73), and `IndustriesWeServe.tsx` ("10+ Projects Done", L208). However, only 4 projects are listed in `portfolioProjects`. |
| **"10 Core Services"** | `src/data/company-stats.ts`<br>`src/components/about/OurStory.tsx`<br>`src/components/portfolio/PortfolioStats.tsx` | Lines 29–36<br>Line 91<br>Line 85 | Defined as `COMPANY_STATS.coreServices` (`value: "10"`). Displayed on Hero & Why Choose Us. In conflict with `Services.tsx` L292 which hardcodes "View All 8 Services →". |
| **"12+ Industries"** | `src/components/IndustriesWeServe.tsx` | Lines 196, 207 | Text hardcodes "12+ Industry Verticals" and `{ value: "12+", label: "Industries" }`. However, `DEFAULT_INDUSTRIES` in `src/lib/content/content-db.ts` only contains 8 items. |
| **"24/7 Dedicated Support"** | `src/data/company-stats.ts` | Lines 37–44 | Defined as `COMPANY_STATS.support` (`value: "24/7"`). Displayed in Hero (L208), Why Choose Us (L88), and Industries (L209). |
| **"100% Code Quality Focus"** | `src/data/company-stats.ts` | Lines 45–52 | Defined as `COMPANY_STATS.codeQuality` (`value: "100%"`). Displayed in Hero (L210) and Why Choose Us (L94). |
| **"100% Production-Grade Architecture"** | `src/components/demo-projects/DemoProjectsCatalogue.tsx` | Line 234 | Hardcoded stat strip item alongside "8 Live Interactive Demos" and "22 Industry Domains Covered". |

---

## 3. Integration Inventory

All environment variable references list **NAMES ONLY**. No secrets or values are inspected or disclosed.

| Integration | File Locations | Environment Variable Names | Writes Data? | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Contact Form** | `src/components/contact/ContactForm.tsx`<br>`src/app/api/contact/route.ts` | `DATABASE_URL`<br>`GOOGLE_SHEETS_LEAD_WEBHOOK_URL`<br>`TURNSTILE_SECRET_KEY`<br>`RECAPTCHA_SECRET_KEY` | **YES** | Validates Captcha/Turnstile; writes lead record to PostgreSQL `Lead` table; dispatches webhook payload to external Google Sheets webhook. |
| **Reviews System** | `src/components/ReviewForm.tsx`<br>`src/components/ClientReviews.tsx`<br>`src/app/api/v1/public/reviews/route.ts` | `DATABASE_URL` | **YES** | Public submission writes new review with `status: "PENDING"` into PostgreSQL `Review` table. Public GET reads approved reviews. |
| **Partner Applications** | `src/components/partner-application/PartnerApplicationForm.tsx`<br>`src/app/api/v1/public/business-partner/applications/route.ts` | `DATABASE_URL`<br>`RESEND_API_KEY`<br>`NEXT_PUBLIC_APP_URL` | **YES** | Writes partner applicant record to `PartnerApplication` table; triggers confirmation email with activation token. |
| **Careers Application** | `src/components/careers/JobApplicationModal.tsx`<br>`src/app/api/careers/route.ts` | `DATABASE_URL`<br>`GOOGLE_SHEETS_CAREERS_WEBHOOK_URL`<br>`STORAGE_PROVIDER`<br>`STORAGE_BUCKET`<br>`STORAGE_REGION`<br>`STORAGE_ACCESS_KEY_ID`<br>`STORAGE_SECRET_ACCESS_KEY` | **YES** | Stores applicant PII in `JobApplication` table, saves resume object to S3/Local storage, dispatches application data to Google Sheets webhook. |
| **Google Apps Script / Google Sheets** | `src/app/api/contact/route.ts`<br>`src/app/api/careers/route.ts`<br>`src/app/api/v1/public/leads/route.ts` | `GOOGLE_SHEETS_LEAD_WEBHOOK_URL`<br>`GOOGLE_SHEETS_CAREERS_WEBHOOK_URL` | **YES** | Outbound HTTP POST sending lead and job application payloads to Google Apps Script webhook endpoints. |
| **Firebase** | `src/data/portfolio/jalmitra.ts`<br>`src/data/portfolio/krishi.ts`<br>`src/data/projects.ts` | None | **NO** | Referenced strictly as portfolio showcase tags for client past work. Firebase SDK is not a backend dependency. |
| **Database & ORM (Prisma)** | `src/lib/db.ts`<br>`prisma/schema.prisma` | `DATABASE_URL`<br>`DIRECT_URL` | **YES** | Connects to Neon PostgreSQL pooler. Persists and queries all core data models (Users, Accounts, Leads, Projects, Reviews, CMS settings, Audit logs). |
| **Authentication & RBAC** | `src/lib/auth/session.ts`<br>`src/lib/auth/roles.ts`<br>`src/app/api/v1/auth/login/route.ts`<br>`src/middleware.ts` | `SESSION_SECRET`<br>`NEXT_PUBLIC_APP_URL` | **YES** | Verifies credentials with bcrypt; issues signed JWT cookies; writes audit logs, failed login throttling events, and session states. |
| **Axivon AI Chatbot & Assistant** | `src/lib/chatbot/ai-engine.ts`<br>`src/lib/portal-ai/assistant-engine.ts`<br>`src/app/api/v1/chatbot/query/route.ts` | `GEMINI_API_KEY` | **YES** | Connects to `@google/generative-ai` SDK. Answers visitor queries; writes chat transcripts and telemetry logs to PostgreSQL. |
| **Analytics (GA4 & Telemetry)** | `src/components/GoogleAnalytics.tsx`<br>`src/components/analytics/AnalyticsRouteTracker.tsx`<br>`src/lib/analytics.ts` | `NEXT_PUBLIC_ANALYTICS_ID`<br>`NEXT_PUBLIC_GA_MEASUREMENT_ID` | **NO** | Client-side tracking script injection for Google Analytics (Measurement ID `G-QCHH8ELS1K`); captures page views. |
| **Transactional Email** | `src/lib/email/service.ts`<br>`src/app/api/v1/auth/forgot-password/route.ts` | `RESEND_API_KEY`<br>`RESEND_FROM`<br>`EMAIL_WEBHOOK_URL`<br>`EMAIL_WEBHOOK_SECRET` | **YES** | Dispatches emails via Resend API or custom HTTP webhook for password resets, email verification, and system notices. |
| **Hosting & Infrastructure** | `next.config.ts`<br>`src/middleware.ts` | `PORT`<br>`NODE_ENV`<br>`ALLOWED_ORIGINS` | **NO** | Next.js Node/Vercel hosting runtime with CSP, X-Frame-Options, and HSTS security headers configured in `next.config.ts`. |

---

## 4. Baseline Results

### 4.1 Dependency Installation (`npm install`)
- **Status:** Succeeded (Exit code 0)
- **Duration:** 40s
- **Prisma Client:** Auto-generated via `postinstall` script (`prisma generate`, v5.22.0)
- **Vulnerabilities Reported:** 13 vulnerabilities (4 moderate, 8 high, 1 critical in legacy transitive dev tools; no blocking errors).

### 4.2 Linter Audit (`npm run lint`)
- **Command:** `eslint` via `eslint.config.mjs`
- **Status:** Succeeded (Exit code 0)
- **Summary:** `✖ 2263 problems (0 errors, 2263 warnings)`
- **Warning Categories:**
  - `@typescript-eslint/no-explicit-any`: ~1,900 instances across backend handlers and test mocks.
  - `@typescript-eslint/no-unused-vars`: ~360 instances across test assertions and component props.
  - Zero fatal ESLint syntax errors.

### 4.3 TypeScript Static Type Check (`npx tsc --noEmit`)
- **Status:** Succeeded (Exit code 0)
- **Output:** Clean (0 compiler errors, 0 type mismatch errors).

### 4.4 Production Build (`npm run build`)
- **Command:** `prisma generate && next build`
- **Status:** Succeeded (Exit code 0)
- **Duration:** 3m 27s
- **Routes Generated:**
  - Dynamic API routes: 78 endpoints
  - Static Pages (`○`): 46 routes
  - SSG Pages (`●`): 78 routes (including 47 demo project slug variants, 24 product routes, 3 blog posts, 4 portfolio case studies)
  - Dynamic Server Rendered (`ƒ`): 38 routes

### 4.5 Local Runtime & Browser Console Audit
The built site was executed locally (`next start` on port 3000) and evaluated using an autonomous browser subagent across 13 core pages:

| Route Tested | HTTP Status | Console / Runtime Status |
| :--- | :--- | :--- |
| `http://localhost:3000/` | 200 OK | **Clean** (0 application console errors; renders Hero, Services, Stats) |
| `http://localhost:3000/about` | 200 OK | **Clean** (0 application console errors; video poster & accordion functional) |
| `http://localhost:3000/services` | 200 OK | **Clean** (0 application console errors; services catalog interactive) |
| `http://localhost:3000/services/web-development` | 200 OK | **Clean** (0 application console errors; schema & process steps render) |
| `http://localhost:3000/industries` | 200 OK | **Clean** (0 application console errors; grid loaded) |
| `http://localhost:3000/portfolio` | 200 OK | **Clean** (0 application console errors; project cards render) |
| `http://localhost:3000/portfolio/axivon-technologies` | 200 OK | **Clean** (0 application console errors; case study rendered) |
| `http://localhost:3000/demo-projects` | 200 OK | **Clean** (0 JS errors; 1 server-side image 404 warning: `estatevista-hero.jpg`) |
| `http://localhost:3000/blog` | 200 OK | **Clean** (0 application console errors; 3 articles listed) |
| `http://localhost:3000/contact` | 200 OK | **Clean** (0 application console errors; contact form interactive) |
| `http://localhost:3000/reviews` | 200 OK | **Clean** (0 application console errors; review form rendered) |
| `http://localhost:3000/careers` | 200 OK | **Clean** (0 application console errors; job openings rendered) |
| `http://localhost:3000/login` | 200 OK | **Clean** (0 application console errors; credential inputs rendered) |

---

## 5. Top 10 High-Risk Files & Areas

The following 10 files/areas are classified as high-risk and must **never** be modified casually:

1. **`src/middleware.ts`**  
   *Risk:* Edge-level security gatekeeper. Governs JWT verification, role-based route guard matching (`/admin`, `/employee`, `/executive`, `/broker`, `/client`), API rate limiting, and global HTTP response headers. A single misconfiguration will immediately lock out authenticated users or expose confidential portals.
2. **`src/lib/auth/session.ts` & `src/lib/auth/roles.ts`**  
   *Risk:* Token minting, cookie session storage, Jose JWT decryption, and permission bitmask resolution. Any syntax regression breaks login across the entire ecosystem.
3. **`prisma/schema.prisma` & `src/lib/db.ts`**  
   *Risk:* Production database relational definitions and singleton Neon connection pooling. Modifying schema fields without strict migrations will cause runtime database crashes or data loss.
4. **`src/app/api/contact/route.ts` & `src/app/api/v1/public/leads/route.ts`**  
   *Risk:* Primary customer inbound acquisition pipeline. Manages bot challenge verification (Turnstile/reCAPTCHA), sanitization, database insertions, and external Google Sheets synchronizations.
5. **`src/app/api/v1/auth/login/route.ts`**  
   *Risk:* Authentication gate. Performs password verification (Bcrypt), brute-force attempt rate-limiting, audit log entries, and session cookie issuance.
6. **`src/lib/email/service.ts`**  
   *Risk:* Transactional email pipeline via Resend API and webhooks. Powers password resets, partner onboarding tokens, and customer confirmations. Failure here disrupts user identity recovery.
7. **`src/app/layout.tsx`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`**  
   *Risk:* Universal application shell. Renders global metadata, top loaders, cookie consent banners, and primary navigation across desktop and mobile. Changes affect 100% of routes.
8. **`src/lib/content/content-db.ts`**  
   *Risk:* CMS and Fallback single-source-of-truth. Every public page (Homepage, Services, Industries, FAQs, SEO) relies on this file to merge database state with hardcoded defaults. A breakdown causes blank pages across the public site.
9. **`src/app/api/careers/route.ts` & `src/lib/careers/careers-db.ts`**  
   *Risk:* Handles candidate file upload streams (multipart resumes), S3/local file storage, PII storage, and webhook streaming. High risk of memory leaks or storage errors if touched without care.
10. **`src/app/api/v1/automations/scheduler/tick/route.ts` & `src/lib/jobs/`**  
    *Risk:* Server-side background cron worker protected by `CRON_SECRET`. Performs inactive user purges, attendance regularizations, and business intelligence metric aggregations.

---

## 6. Known Issues — Exact File Mapping

| Issue Description | Exact File Location(s) | Line Number(s) | Root Cause Details |
| :--- | :--- | :--- | :--- |
| **Homepage says "10 Core Services" but "View All 8 Services"; "12+ Industries" vs 22 demo sectors vs 8 shown** | `src/components/Services.tsx`<br>`src/data/company-stats.ts`<br>`src/components/IndustriesWeServe.tsx`<br>`src/lib/content/content-db.ts`<br>`src/data/demo-projects.ts` | `Services.tsx:292`<br>`company-stats.ts:29-36`<br>`IndustriesWeServe.tsx:196, 207`<br>`content-db.ts:399-488`<br>`demo-projects.ts:24-48` | • `Services.tsx` hardcodes `"View All 8 Services →"` while `company-stats.ts` and `services.ts` define 10 core services.<br>• `IndustriesWeServe.tsx` displays `"12+ Industry Verticals"`, but `DEFAULT_INDUSTRIES` in `content-db.ts` only contains 8 industries.<br>• `demo-projects.ts` defines 22 specific industry categories (`DEMO_CATEGORIES`). |
| **"10+ Projects Delivered" but only 4 projects listed** | `src/data/company-stats.ts`<br>`src/data/portfolio/index.ts`<br>`src/data/projects.ts` | `company-stats.ts:21-28`<br>`portfolio/index.ts:17-22`<br>`projects.ts:14-127` | `company-stats.ts` advertises `"10+ Projects Delivered"`, but `portfolioProjects` and `projects.ts` only define 4 projects (`axivon-technologies`, `krishi-drishti`, `jalmitra`, `nani-tathagat`). |
| **Header nav item "Portfolio" is not a link** | `src/components/Navbar.tsx` | Lines 215–234 (Desktop)<br>Lines 470–486 (Mobile) | In both desktop and mobile navigation, when `link.hasDropdown` is true, the "Portfolio" label is rendered as a `<button>` that solely toggles dropdown state (`setPortfolioOpen`), rather than an anchor tag (`<Link href="/portfolio">`). Users clicking "Portfolio" cannot navigate directly to the portfolio page. |
| **Portfolio "Related Insights" links all go to /blog and titles don't match real posts** | `src/components/portfolio/RelatedInsights.tsx` | Lines 8–24 | The `INSIGHTS` array hardcodes 3 placeholder insight items whose `link` values are all generic `"/blog"`, and whose titles ("Building Smart Agriculture Platforms with IoT", "How We Approach Product Development at Axivon", "The Role of AI in Environmental Technology") do not match any actual slugs in `src/data/blog-posts.ts`. |
| **Homepage "What Our Clients Say" is empty; /reviews only has a form** | `src/components/ClientReviews.tsx`<br>`src/components/ReviewsPageContent.tsx`<br>`src/app/reviews/page.tsx` | `ClientReviews.tsx:130-147`<br>`ReviewsPageContent.tsx:266-275` | The database table `Review` currently contains 0 published reviews. When `reviews.length === 0`, `ClientReviews.tsx` renders a fallback "Be among the first to share your experience" banner with no reviews, and `/reviews` renders "No reviews found" with only the submission form `<ReviewForm />`. |
| **/demo-projects shows 47 demos but only 8 are Live** | `src/data/demo-projects.ts`<br>`src/components/demo-projects/DemoProjectsCatalogue.tsx` | `demo-projects.ts:52-820`<br>`DemoProjectsCatalogue.tsx:224-236` | `DEMO_PROJECTS` has 47 projects total. Exactly 8 are Priority P1 (`status: "Live Demo"`); the other 39 are marked `status: "Coming Soon"`. `DemoProjectsCatalogue.tsx` displays "8 Live Interactive Demos" in its header statistics strip while listing all 47 items below. |
| **All blog posts have the same date** | `src/data/blog-posts.ts` | Lines 70, 251, 404 | All three blog articles (`how-to-choose-development-company-gujarat`, `ai-iot-custom-software-growth-gujarat`, `robotics-projects-guide-school-college-iot-drones`) have identical hardcoded dates: `publishedDate: "September 10, 2026"`. |
| **No pricing; no phone/address block on contact page** | `src/app/contact/page.tsx`<br>`src/components/contact/ContactPresence.tsx`<br>`src/components/contact/ContactHero.tsx` | `contact/page.tsx:43-65`<br>`ContactPresence.tsx:50-78` | • No public `/pricing` route or pricing component exists.<br>• `ContactPresence.tsx` mentions "Pan-India Delivery" and "Remote & Digital", but no physical office address, registered business address, or direct telephone/phone block is rendered anywhere on `/contact`. |
| **Portfolio image alt text says "representative industry imagery"** | `src/components/portfolio/FeaturedWork.tsx`<br>`src/components/portfolio/ProjectGrid.tsx` | `FeaturedWork.tsx:86`<br>`ProjectGrid.tsx:50` | In both components, the image alt tag is hardcoded as: `alt={`${project.title} - representative industry imagery`}`. |
| **Images requested at w=3840** | `next.config.ts`<br>`src/components/contact/ContactHero.tsx`<br>`src/components/about/AboutHero.tsx`<br>`src/components/IndustriesWeServe.tsx` | `next.config.ts:12-14`<br>`ContactHero.tsx:36`<br>`AboutHero.tsx:206`<br>`IndustriesWeServe.tsx:189` | `next.config.ts` does not configure custom `images.deviceSizes`. Next.js defaults to `[640, 750, 828, 1080, 1200, 1920, 2048, 3840]`. Components using `sizes="100vw"` on high-DPI/Retina screens prompt browsers to request images at `w=3840`. |
| **Some FAQ answers look empty** | `src/app/contact/page.tsx`<br>`src/app/services/page.tsx`<br>`src/lib/content/content-db.ts`<br>`src/app/admin/careers/settings/page.tsx`<br>`src/app/admin/content/faqs/page.tsx` | `content-db.ts:324-397, 604-610`<br>`contact/page.tsx:32`<br>`services/page.tsx:37`<br>`admin/content/faqs/page.tsx:28` | In `content-db.ts`, all 8 `DEFAULT_FAQS` have `page: "HOME"`. When `getPublishedFaqs("ALL", "CONTACT")` or `getPublishedFaqs("SERVICES", "SERVICES")` executes against a fresh DB, the page filter matches 0 items and returns `[]`. Furthermore, admin FAQ management initializes empty FAQ templates with `answer: ""`. |
| **Check whether sitemap.xml, robots.txt and JSON-LD exist** | `src/app/sitemap.ts`<br>`src/app/robots.ts`<br>`src/components/seo/*.tsx` | `sitemap.ts:1-108`<br>`robots.ts:1-43`<br>`WebSiteSchema.tsx`<br>`OrganizationSchema.tsx`<br>`ServiceSchema.tsx`<br>`HomeFAQSchema.tsx`<br>`BreadcrumbSchema.tsx` | **All exist and are operational:**<br>• `/sitemap.xml` is dynamically generated via `src/app/sitemap.ts`.<br>• `/robots.txt` is dynamically generated via `src/app/robots.ts`.<br>• JSON-LD schemas (`application/ld+json`) exist in `src/components/seo/` and are embedded across homepage, services, blog, demo projects, and portfolio pages. |

---

## 7. Next Steps & Phase Gate

This concludes **Phase 0: Read-Only Audit & Baseline**.

As mandated by the execution rules:
- No application code has been modified.
- No files were created other than the dedicated git branch `phase-0-baseline` and this report `PHASE0_REPORT.md`.
- No database mutations were performed.
- All baseline tests have passed.

**I will now STOP and await your response. Please reply "APPROVED" when you are ready to proceed to Phase 1.**
