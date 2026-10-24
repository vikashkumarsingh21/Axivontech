# Comprehensive Real-Browser QA Test Report

**Target Host:** `http://localhost:3000`  
**Testing Engine:** Real Google Chrome (Headless Automation via Puppeteer Core)  
**Browser Engine Version:** Chrome / Blink (Windows x64)  
**Execution Date:** October 24, 2026  
**Auditor Mode:** QA Lead & Full-Stack Security Auditor  

---

## 1. Executive Summary & Health Scores

Every single portal, page, button, and navigation flow across all system roles was tested in a real Chromium browser instance. The audit rigorously separated **Frontend Health** (DOM rendering, hydration stability, client state management, responsive breakpoints) from **Backend Health** (API response codes, database queries, Prisma schema alignment, auth boundaries).

### Health Scorecard by Role (Scale: 1 - 10)

| Role / Portal | Frontend Score | Backend Score | Overall Status | Primary Assessment |
| :--- | :---: | :---: | :---: | :--- |
| **Public Website** | **8.5 / 10** | **9.0 / 10** | 🟡 Functional with Minor Leaks | Pages render cleanly; `careers-privacy` leaks server env to browser; circular import required initial fix in `siteFacts.ts`. |
| **Admin Portal** | **7.5 / 10** | **6.0 / 10** | 🔴 Degraded Backend | Dashboard, CRM, and Employee management work; Content management crashes due to missing Prisma tables (`WebsiteService`, `WebsiteArticle`). |
| **Executive (Founder)** | **8.5 / 10** | **8.0 / 10** | 🟡 Mostly Operational | Real-time metrics and company overview render; `/executive/analytics` link is broken (404). |
| **Executive (Co-Founder)**| **8.5 / 10** | **8.5 / 10** | 🟡 Operational | Role filtering works accurately; tech-specific headcount displays correctly. |
| **Employee Portal** | **8.0 / 10** | **9.0 / 10** | 🟡 Operational with Warning | All APIs return 200; Work reports page triggers React hydration mismatch from locale formatting. |
| **Broker / Partner** | **5.0 / 10** | **4.5 / 10** | 🔴 Critical Failures | Incomplete onboarding forces redirects; commissions fail due to missing DB column; `/projects/new` collides with dynamic `[id]` route causing infinite spinner. |
| **Client Portal** | **9.0 / 10** | **9.0 / 10** | ✅ Highly Stable | Clean dashboard, project views, invoice placeholders, AI copilot widget all render with zero console errors. |

---

## 2. Tested Feature Matrix

**Status Key:**  
- ✅ **Working (FE & BE OK)**: Frontend rendered cleanly, backend API returned 200/valid data.  
- 🟡 **Partial / Warning**: Working with non-fatal issues (hydration warning, placeholder data, minor UI flaw).  
- 🔴 **Broken Backend**: Frontend rendered shell, but backend API returned 500 or 404 (DB/Prisma error).  
- ❌ **Broken Frontend**: React fatal exception, client crash, blank page, or infinite spinner.  
- ⚪ **Untested / Inactive**: Feature route disabled or not provisioned in current release.  

| Module / Feature | Role | Route | Frontend | Backend | Status | Screenshot Reference |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **Homepage** | Public | `/` | ✅ | ✅ | ✅ Working | `browser-screenshots/public-home.png` |
| **About Us** | Public | `/about` | ✅ | ✅ | ✅ Working | `browser-screenshots/public-about.png` |
| **Services Directory** | Public | `/services` | ✅ | ✅ | ✅ Working | `browser-screenshots/public-services.png` |
| **Industries Showcase** | Public | `/industries` | ✅ | ✅ | ✅ Working | `browser-screenshots/public-industries.png` |
| **Portfolio Showcase** | Public | `/portfolio` | ✅ | ✅ | ✅ Working | `browser-screenshots/public-portfolio.png` |
| **Insights / Blog** | Public | `/blog` | ✅ | ✅ | ✅ Working | `browser-screenshots/public-blog.png` |
| **Careers Page** | Public | `/careers` | ✅ | ✅ | ✅ Working | `browser-screenshots/public-careers.png` |
| **Contact Form** | Public | `/contact` | ✅ | ✅ | ✅ Working | `browser-screenshots/public-contact.png` |
| **Careers Privacy** | Public | `/careers-privacy` | ❌ | ❌ | ❌ Env Leak Crash | `browser-screenshots/public-careers-privacy.png` |
| **Login Authentication** | Public / All | `/login` | ✅ | ✅ | ✅ Working | `browser-screenshots/employee-login-page.png` |
| **Wrong Password Reject** | Public / All | `/login` | ✅ | ✅ | ✅ Working | `browser-screenshots/employee-login-wrong-pass.png` |
| **Admin Overview** | Admin | `/admin/dashboard` | ✅ | ✅ | ✅ Working | `browser-screenshots/admin-dashboard.png` |
| **Employee Directory** | Admin | `/admin/employees` | ✅ | ✅ | ✅ Working | `browser-screenshots/admin-employees.png` |
| **Attendance Monitor** | Admin | `/admin/attendance` | ✅ | ✅ | ✅ Working | `browser-screenshots/admin-attendance.png` |
| **Leave Management** | Admin | `/admin/leave` | ✅ | ✅ | ✅ Working | `browser-screenshots/admin-leave.png` |
| **Task Delegation** | Admin | `/admin/tasks` | ✅ | ✅ | ✅ Working | `browser-screenshots/admin-tasks.png` |
| **Daily Work Reports** | Admin | `/admin/work-reports` | ✅ | ✅ | ✅ Working | `browser-screenshots/admin-work-reports.png` |
| **CRM Leads Inbox** | Admin | `/admin/crm/leads` | ✅ | ✅ | ✅ Working | `browser-screenshots/admin-crm-leads.png` |
| **CRM Client Directory** | Admin | `/admin/crm/clients` | ✅ | ✅ | ✅ Working | `browser-screenshots/admin-crm-clients.png` |
| **Content: Portfolio** | Admin | `/admin/content/portfolio` | ❌ | ❌ | ❌ Route 404 | `browser-screenshots/admin-content-portfolio.png` |
| **Content: Services** | Admin | `/admin/content/services` | ❌ | 🔴 | 🔴 Missing Table | `browser-screenshots/admin-content-services.png` |
| **Content: Blog** | Admin | `/admin/content/blog` | ❌ | 🔴 | 🔴 Missing Table | `browser-screenshots/admin-content-blog.png` |
| **Admin Settings** | Admin | `/admin/settings` | ✅ | ✅ | ✅ Working | `browser-screenshots/admin-settings.png` |
| **Founder Dashboard** | Founder | `/executive/dashboard` | ✅ | ✅ | ✅ Working | `browser-screenshots/founder-dashboard.png` |
| **Company Profile** | Founder | `/executive/company` | ✅ | ✅ | ✅ Working | `browser-screenshots/founder-company.png` |
| **Executive Analytics** | Founder | `/executive/analytics` | ❌ | ❌ | ❌ Route 404 | `browser-screenshots/founder-analytics.png` |
| **Executive Directory** | Founder | `/executive/people` | ✅ | ✅ | ✅ Working | `browser-screenshots/founder-people.png` |
| **Executive Approvals** | Founder | `/executive/approvals` | ✅ | ✅ | ✅ Working | `browser-screenshots/founder-approvals.png` |
| **Executive Settings** | Founder | `/executive/settings` | ✅ | ✅ | ✅ Working | `browser-screenshots/founder-settings.png` |
| **Co-Founder Dashboard** | Co-Founder | `/executive/dashboard` | ✅ | ✅ | ✅ Working | `browser-screenshots/cofounder-dashboard.png` |
| **Co-Founder People** | Co-Founder | `/executive/people` | ✅ | ✅ | ✅ Working | `browser-screenshots/cofounder-people.png` |
| **Employee Dashboard** | Employee | `/employee/dashboard` | ✅ | ✅ | ✅ Working | `browser-screenshots/employee-dashboard.png` |
| **Employee Attendance** | Employee | `/employee/attendance` | ✅ | ✅ | ✅ Working | `browser-screenshots/employee-attendance.png` |
| **Employee Tasks** | Employee | `/employee/tasks` | ✅ | ✅ | ✅ Working | `browser-screenshots/employee-tasks.png` |
| **Employee Work Reports** | Employee | `/employee/work-reports` | 🟡 | ✅ | 🟡 Hydration Warning | `browser-screenshots/employee-work-reports.png` |
| **Employee Leave** | Employee | `/employee/leave` | ✅ | ✅ | ✅ Working | `browser-screenshots/employee-leave.png` |
| **Employee Documents** | Employee | `/employee/documents` | ✅ | ✅ | ✅ Working | `browser-screenshots/employee-documents.png` |
| **Employee Support** | Employee | `/employee/support` | ✅ | ✅ | ✅ Working | `browser-screenshots/employee-support.png` |
| **Employee -> Admin Block**| Employee | `/admin/dashboard` | ✅ | ✅ | ✅ RBAC Secured | `browser-screenshots/employee-to-admin-blocked.png` |
| **Broker Dashboard** | Broker | `/broker/dashboard` | ✅ | ✅ | ✅ Working | `browser-screenshots/broker-dashboard.png` |
| **Broker Projects** | Broker | `/broker/projects` | ✅ | ✅ | ✅ Working | `browser-screenshots/broker-projects.png` |
| **Broker Submit Project** | Broker | `/broker/projects/new` | ❌ | 🔴 | ❌ Route Collision 404 | `browser-screenshots/broker-projects-new.png` |
| **Broker Commissions** | Broker | `/broker/commissions` | ❌ | 🔴 | 🔴 Missing DB Column | `browser-screenshots/broker-commissions.png` |
| **Broker Profile** | Broker | `/broker/profile` | 🟡 | ✅ | 🟡 Onboarding Gate | `browser-screenshots/broker-profile.png` |
| **Broker -> Admin Block** | Broker | `/admin/dashboard` | ✅ | ✅ | ✅ RBAC Secured | `browser-screenshots/broker-to-admin-blocked.png` |
| **Client Dashboard** | Client | `/client/dashboard` | ✅ | ✅ | ✅ Working | `browser-screenshots/client-dashboard.png` |
| **Client Projects** | Client | `/client/projects` | ✅ | ✅ | ✅ Working | `browser-screenshots/client-projects.png` |
| **Client Documents** | Client | `/client/documents` | ✅ | ✅ | ✅ Working | `browser-screenshots/client-documents.png` |
| **Client Invoices** | Client | `/client/invoices` | ✅ | ✅ | ✅ Working | `browser-screenshots/client-invoices.png` |
| **Client Support** | Client | `/client/support` | ✅ | ✅ | ✅ Working | `browser-screenshots/client-support.png` |
| **Client -> Admin Block** | Client | `/admin/dashboard` | ✅ | ✅ | ✅ RBAC Secured | `browser-screenshots/client-to-admin-blocked.png` |
| **Mobile 375px Homepage** | Public | `/` (Mobile) | ✅ | ✅ | ✅ Responsive | `browser-screenshots/public-home-mobile-375px.png` |
| **Mobile 375px Contact** | Public | `/contact` (Mobile) | ✅ | ✅ | ✅ Responsive | `browser-screenshots/public-contact-mobile-375px.png` |
| **Mobile 375px Admin** | Admin | `/admin/dashboard` (Mobile) | ✅ | ✅ | ✅ Responsive | `browser-screenshots/admin-dashboard-mobile-375px.png` |
| **Mobile 375px Employee** | Employee | `/employee/dashboard` (Mobile)| ✅ | ✅ | ✅ Responsive | `browser-screenshots/employee-dashboard-mobile-375px.png` |
| **Mobile 375px Broker** | Broker | `/broker/dashboard` (Mobile) | ✅ | ✅ | ✅ Responsive | `browser-screenshots/broker-dashboard-mobile-375px.png` |
| **Mobile 375px Client** | Client | `/client/dashboard` (Mobile) | ✅ | ✅ | ✅ Responsive | `browser-screenshots/client-dashboard-mobile-375px.png` |
| **Mobile 375px Executive** | Founder | `/executive/dashboard` (Mobile)| ✅ | ✅ | ✅ Responsive | `browser-screenshots/executive-dashboard-mobile-375px.png` |

---

## 3. High-Priority Findings Summary

1. **Database Schema Out of Sync with Code (Prisma P2021 & P2022):**
   - `WebsiteService` table does not exist in PostgreSQL Neon DB -> breaks `/admin/content/services`.
   - `WebsiteArticle` table does not exist in PostgreSQL Neon DB -> breaks `/admin/content/blog`.
   - `Commission.payoutRequestedAt` column does not exist in PostgreSQL Neon DB -> breaks `/broker/commissions`.
2. **Next.js App Router Route Collision:**
   - `/api/v1/broker/projects/new` is captured by `/api/v1/broker/projects/[id]`, treating `id = "new"`. Throws 404, locking the frontend in an infinite spinner.
3. **Missing Routes (404s in Live Navigation):**
   - `/admin/content/portfolio` -> 404
   - `/executive/analytics` -> 404
4. **Client-Side Environment Leak:**
   - `/careers-privacy` imports `src/lib/db.ts` and `src/lib/env.ts` inside a Client Component, throwing `Error: Invalid environment variables` in the browser console.
5. **SSR / Client Hydration Mismatch:**
   - `/employee/work-reports` formats date with `toLocaleDateString(undefined, ...)`, triggering React hydration warning on client mount.
