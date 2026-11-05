# Axivon Technologies — Frontend Broken Routes and Buttons Matrix
**Document Version:** 3.0 (Complete All Stages: Public, Portals, Dedicated Mobile App)  
**Audit Scope:** Public Website (Stage 1), Authenticated Portals (Stage 2), Dedicated Android App (Stage 3)  
**Date:** November 2026  
**Status:** ALL 3 STAGES FULLY AUDITED & REPAIRED  

---

## 1. Executive Summary

This matrix catalogs all routes, navigation elements, forms, and interactive buttons across Axivon Technologies. Every route was audited against the Next.js App Router filesystem, database models, API handlers, and client components.

---

## 2. Public Routes Inventory & Health Matrix (Stage 1)

| Route | Page Name / Component | Route Type | Verification Status | Links & Buttons Verified | Dynamic Slug / Data Source |
|---|---|---|---|---|---|
| `/` | Homepage (`src/app/page.tsx`) | Static / ISR | PASS (200) | "Get Free Quote", "Explore Portfolio", "View Demos", Service Cards | `SITE_FACTS`, `servicesData`, `portfolioProjects` |
| `/about` | About Us (`src/app/about/page.tsx`) | Static | PASS (200) | Hero CTA, Values, Leadership portraits | Static config |
| `/services` | Services Overview (`src/app/services/page.tsx`) | Static | PASS (200) | Service filter tabs, "Request Consultation", Service cards | 10 specialized services |
| `/services/web-development` | Web Development (`src/app/services/web-development/page.tsx`) | Static | PASS (200) | "Start Web Project", Tech badges, FAQ accordions | Specialized service data |
| `/services/mobile-app-development` | Mobile App Development (`src/app/services/mobile-app-development/page.tsx`) | Static | PASS (200) | "Request Mobile App Quote", Tech specs | Specialized service data |
| `/services/ai-solutions` | AI & Machine Learning (`src/app/services/ai-solutions/page.tsx`) | Static | PASS (200) | "Explore AI Integration", Use case cards | Specialized service data |
| `/services/custom-software-development` | Custom Software (`src/app/services/custom-software-development/page.tsx`) | Static | PASS (200) | "Schedule Discovery Call", Architecture specs | Specialized service data |
| `/services/cloud-solutions` | Cloud & DevOps (`src/app/services/cloud-solutions/page.tsx`) | Static | PASS (200) | "Inquire Cloud Migration", Infrastructure badges | Specialized service data |
| `/services/digital-marketing` | Digital Marketing (`src/app/services/digital-marketing/page.tsx`) | Static | PASS (200) | "Plan Growth Campaign", Marketing tiers | Specialized service data |
| `/services/seo-services` | SEO & Organic Growth (`src/app/services/seo-services/page.tsx`) | Static | PASS (200) | "Audit My Website", SEO checklists | Specialized service data |
| `/services/ui-ux-design` | UI/UX Product Design (`src/app/services/ui-ux-design/page.tsx`) | Static | PASS (200) | "Request Design Sprint", Figma workflow | Specialized service data |
| `/services/automation` | Workflow Automation (`src/app/services/automation/page.tsx`) | Static | PASS (200) | "Automate Workflows", Pipeline cards | Specialized service data |
| `/services/robotics-iot` | Robotics & IoT (`src/app/services/robotics-iot/page.tsx`) | Static | PASS (200) | "Consult Hardware & IoT", Telemetry badges | Specialized service data |
| `/portfolio` | Portfolio Directory (`src/app/portfolio/page.tsx`) | Dynamic SSR / ISR | PASS (200) | Filter buttons, Case study links, External live URLs | `getPublishedPortfolioProjects()` (DB + static) |
| `/portfolio/[slug]` | Case Study Detail (`src/app/portfolio/[slug]/page.tsx`) | Dynamic SSR | PASS (200) - FIXED | "Back to Portfolio", Live external project URL, GitHub link | `getPublishedPortfolioProjectBySlug(slug)` |
| `/industries` | Industry Solutions (`src/app/industries/page.tsx`) | Static | PASS (200) | Industry cards, "Consult Industry Expert" | 8 core industry domains |
| `/pricing` | Pricing & Packages (`src/app/pricing/page.tsx`) | Static | PASS (200) | 4 Package cards, In-page anchor links, "Choose Plan" buttons | `PRICING_PACKAGES` config |
| `/reviews` | Client Reviews (`src/app/reviews/page.tsx`) | Client / API | PASS (200) | Filter tabs, Star ratings, "Load More" pagination | `/api/v1/public/reviews` |
| `/contact` | Contact & Inquiries (`src/app/contact/page.tsx`) | Client / API | PASS (200) | 4-step intake form, Turnstile/reCAPTCHA, Submit button | `/api/v1/public/leads` |
| `/download` | Mobile APK Download (`src/app/download/page.tsx`) | Client | PASS (200) | Language toggle (EN/HI), Direct APK download, QR Code | `/download/axivon-app` route handler |
| `/demo-projects` | Interactive Demos (`src/app/demo-projects/page.tsx`) | Static / ISR | PASS (200) | 8 Live demo cards, Filter tags, "View Live Demo" | `DEMO_PROJECTS` (8 Live) |
| `/demo-projects/[slug]` | Demo Project Showcase (`src/app/demo-projects/[slug]/page.tsx`) | Dynamic SSR | PASS (200) | "Back to Demos", Consultation inquiry CTA | `getDemoProjectBySlug(slug)` (47 slugs) |
| `/demo-projects/healthcare/medicare` | MediCare Demo (`src/app/demo-projects/healthcare/medicare/page.tsx`) | Static Demo | PASS (200) | OPD booking modal, Doctor cards, Speciality filter | Static interactive demo |
| `/demo-projects/education/edusmart` | EduSmart Demo (`src/app/demo-projects/education/edusmart/page.tsx`) | Static Demo | PASS (200) | Admissions form, Course tabs, Faculty directory | Static interactive demo |
| `/demo-projects/food/foodiehub` | FoodieHub Demo (`src/app/demo-projects/food/foodiehub/page.tsx`) | Static Demo | PASS (200) | Menu categories, Order drawer, Table booking | Static interactive demo |
| `/demo-projects/fitness/fitzone` | FitZone Demo (`src/app/demo-projects/fitness/fitzone/page.tsx`) | Static Demo | PASS (200) | Class scheduler, Membership tiers, Trainer cards | Static interactive demo |
| `/demo-projects/ecommerce/novacart` | NovaCart Demo (`src/app/demo-projects/ecommerce/novacart/page.tsx`) | Static Demo | PASS (200) | Cart drawer, Wishlist toggle, Filter sidebar | Static interactive demo |
| `/demo-projects/real-estate/estatevista` | EstateVista Demo (`src/app/demo-projects/real-estate/estatevista/page.tsx`) | Static Demo | PASS (200) | Property search filter, Schedule tour, Floor plan | Static interactive demo |
| `/demo-projects/business/corporatepro` | CorporatePro Demo (`src/app/demo-projects/business/corporatepro/page.tsx`) | Static Demo | PASS (200) | Service catalog, Client RFP trigger, Team showcase | Static interactive demo |
| `/demo-projects/saas/leadpilot` | LeadPilot Demo (`src/app/demo-projects/saas/leadpilot/page.tsx`) | Static Demo | PASS (200) | Pipeline board, Deal creator, Task calendar | Static interactive demo |
| `/careers` | Careers Portal (`src/app/careers/page.tsx`) | Dynamic SSR | PASS (200) | Position cards, "Apply Now", Hiring FAQ accordions | `getPublishedJobs()`, `isCareersPageEnabled()` |
| `/careers/[slug]` | Job Application Detail (`src/app/careers/[slug]/page.tsx`) | Dynamic SSR | PASS (200) | Resume drag-and-drop, Application form, Submit | `/api/careers`, `/api/v1/public/careers/upload-resume` |
| `/blog` | Tech & Engineering Blog (`src/app/blog/page.tsx`) | Dynamic SSR / ISR | PASS (200) | Category filters, Article cards, Search input | `getPublishedArticles()` |
| `/blog/[slug]` | Blog Article Post (`src/app/blog/[slug]/page.tsx`) | Dynamic SSR | PASS (200) | Social share links, "Related Articles", Back to Blog | `getPublishedArticleBySlug(slug)` |
| `/business-partner` | Business Partner Program (`src/app/business-partner/page.tsx`) | Static | PASS (200) | "Apply to Partner Program", Tier calculators | Static program details |
| `/business-partner/apply` | Partner Application (`src/app/business-partner/apply/page.tsx`) | Client / API | PASS (200) | Multi-step partner onboarding form, Submit | `/api/v1/public/business-partner/applications` |
| `/business-partner/policy` | Partner Policy (`src/app/business-partner/policy/page.tsx`) | Static | PASS (200) | Legal policy anchors | Static terms |
| `/business-partner-terms` | Partner Terms (`src/app/business-partner-terms/page.tsx`) | Static | PASS (200) | Legal policy anchors | Static terms |
| `/broker-terms` | Broker Terms (`src/app/broker-terms/page.tsx`) | Static | PASS (200) | Legal policy anchors | Static terms |
| `/broker-program/terms` | Broker Program Terms (`src/app/broker-program/terms/page.tsx`) | Static | PASS (200) | Legal policy anchors | Static terms |
| `/partner-program/terms` | Partner Program Terms (`src/app/partner-program/terms/page.tsx`) | Static | PASS (200) | Legal policy anchors | Static terms |
| `/payment-terms` | Payment Terms (`src/app/payment-terms/page.tsx`) | Static | PASS (200) | Legal policy anchors | Static terms |
| `/legal` | Legal Hub (`src/app/legal/page.tsx`) | Static | PASS (200) | Policy directory cards | Static legal index |
| `/legal/company-information` | Company Information (`src/app/legal/company-information/page.tsx`) | Static | PASS (200) | Entity verification details | Corporate legal details |
| `/privacy-policy` | Privacy Policy (`src/app/privacy-policy/page.tsx`) | Static | PASS (200) | Privacy section anchors, DPO contact | Static policy |
| `/privacy-requests` | Privacy Data Rights (`src/app/privacy-requests/page.tsx`) | Client / API | PASS (200) | Data access / deletion request form | `/api/v1/public/privacy-requests` |
| `/terms` | Terms of Service (`src/app/terms/page.tsx`) | Static | PASS (200) | Terms section anchors | Static terms |
| `/terms-and-conditions` | Terms & Conditions (`src/app/terms-and-conditions/page.tsx`) | Static | PASS (200) | Terms section anchors | Static terms |
| `/security-policy` | Security Policy (`src/app/security-policy/page.tsx`) | Static | PASS (200) | Security report form, Vulnerability disclosure | Static policy |
| `/service-delivery-policy` | Service Delivery Policy (`src/app/service-delivery-policy/page.tsx`) | Static | PASS (200) | Milestone delivery policy | Static policy |
| `/refund-cancellation-policy` | Refund Policy (`src/app/refund-cancellation-policy/page.tsx`) | Static | PASS (200) | Refund criteria guidelines | Static policy |
| `/cookie-policy` | Cookie Policy (`src/app/cookie-policy/page.tsx`) | Static | PASS (200) | Cookie category tables | Static policy |
| `/cookie-preferences` | Cookie Preferences Manager (`src/app/cookie-preferences/page.tsx`) | Client | PASS (200) | Consent toggles (analytics, marketing), Save button | LocalStorage / Cookie sync |
| `/ai-privacy-notice` | AI Privacy Notice (`src/app/ai-privacy-notice/page.tsx`) | Static | PASS (200) | AI data governance guidelines | Static policy |
| `/ai-usage` | AI Acceptable Usage (`src/app/ai-usage/page.tsx`) | Static | PASS (200) | AI guidelines | Static policy |
| `/acceptable-use-policy` | Acceptable Use Policy (`src/app/acceptable-use-policy/page.tsx`) | Static | PASS (200) | Prohibited activities guidelines | Static policy |
| `/accessibility` | Accessibility Policy (`src/app/accessibility/page.tsx`) | Static | PASS (200) | WCAG AAA accessibility statements | Static policy |
| `/disclaimer` | Legal Disclaimer (`src/app/disclaimer/page.tsx`) | Static | PASS (200) | Liability disclaimers | Static policy |
| `/intellectual-property` | IP Ownership Policy (`src/app/intellectual-property/page.tsx`) | Static | PASS (200) | Client IP guarantees | Static policy |
| `/lead/[referralCode]` | Partner Referral Intake (`src/app/lead/[referralCode]/page.tsx`) | Dynamic SSR / Client | PASS (200) | Referral lead capture form, Submit | `/api/v1/public/leads` |
| `/project/start/[referralCode]` | Project Start Intake (`src/app/project/start/[referralCode]/page.tsx`) | Dynamic SSR / Client | PASS (200) | Partner project kickoff form, Submit | `/api/v1/public/project-requests` |

---

## 3. Authenticated Portals Inventory & Health Matrix (Stage 2)

| Portal / Module | Route(s) | Primary Component / Layout | Status | Verified Actions & Buttons |
|---|---|---|---|---|
| **Admin Portal** | `/admin/dashboard`<br>`/admin/crm/leads`<br>`/admin/crm/pipeline`<br>`/admin/crm/follow-ups`<br>`/admin/crm/clients`<br>`/admin/crm/proposals`<br>`/admin/crm/dashboard`<br>`/admin/analytics`<br>`/admin/reports`<br>`/admin/business-partners/applications`<br>`/admin/crm/brokers`<br>`/admin/crm/general-leads`<br>`/admin/crm/partner-projects`<br>`/admin/crm/documents`<br>`/admin/crm/payments`<br>`/admin/crm/commissions`<br>`/admin/crm/support`<br>`/admin/departments`<br>`/admin/employees`<br>`/admin/attendance`<br>`/admin/calendar`<br>`/admin/leave`<br>`/admin/work-reports`<br>`/admin/projects`<br>`/admin/tasks`<br>`/admin/careers`<br>`/admin/content/**`<br>`/admin/settings` | `AdminPortalClient.tsx`<br>`AdminSidebar.tsx` | PASS (200) | All 48 sidebar links verified; Lead status advance, Proposal generation, Partner approval, Attendance regularization, Leave decision modal, Task assigner, Role settings |
| **Employee Portal** | `/employee/dashboard`<br>`/employee/attendance`<br>`/employee/tasks`<br>`/employee/work-reports`<br>`/employee/projects`<br>`/employee/calendar`<br>`/employee/leave`<br>`/employee/announcements`<br>`/employee/documents`<br>`/employee/notifications`<br>`/employee/profile`<br>`/employee/onboarding`<br>`/employee/support`<br>`/employee/settings` | `EmployeePortalClient.tsx`<br>`EmployeeSidebar.tsx` | PASS (200) | Attendance 1-tap check-in/out, Break tracker, Work report submission form, Leave request modal, Task status toggle, Profile password updater |
| **Broker / Partner Portal** | `/broker/dashboard`<br>`/broker/leads`<br>`/broker/leads/register`<br>`/broker/projects`<br>`/broker/commissions`<br>`/broker/documents`<br>`/broker/notifications`<br>`/broker/profile`<br>`/broker/support` | `BrokerSidebar.tsx`<br>`BrokerPageHeader.tsx` | PASS (200) | Lead registration form, Direct payout request (IFSC validation), Commission status tracking, Document uploader, Recent activity feed (`/broker/notifications`) |
| **Department Manager Portal** | `/manager/dashboard`<br>`/manager/employees`<br>`/manager/tasks`<br>`/manager/work-reports`<br>`/manager/attendance`<br>`/manager/leave` | `ManagerLayout.tsx`<br>`ManagerDashboardClient.tsx` | PASS (200) | Department roster, Leave approval/rejection buttons, Work report review & feedback, Task workload dispatcher, Team attendance verification |
| **Executive Portal** | `/executive/dashboard`<br>`/executive/company`<br>`/executive/people`<br>`/executive/projects`<br>`/executive/approvals`<br>`/executive/reports`<br>`/executive/audit`<br>`/executive/settings` | `ExecutivePortalClient.tsx`<br>`ExecutiveSidebar.tsx` | PASS (200) | Executive governance signoffs, High-level financial reporting, Security audit log explorer, Cross-company credential and profile controls |
| **Client Portal** | `/client/dashboard`<br>`/client/projects`<br>`/client/projects/[id]`<br>`/client/uat`<br>`/client/documents`<br>`/client/invoices`<br>`/client/support`<br>`/client/notifications`<br>`/client/profile` | `ClientSidebar.tsx`<br>`ClientPageHeader.tsx` | PASS (200) | UAT milestone approval modal, Invoices viewer, Document vault download, Support ticket creation, Profile updater |

---

## 4. Dedicated Android Application Inventory & Health Matrix (Stage 3)

| Module / Screen | Route(s) | Primary Component(s) | Status | Verified Actions & Buttons |
|---|---|---|---|---|
| **App Entry & Splash** | `/app` | `src/app/app/page.tsx` | PASS (200) | Evaluates active session; directs authenticated users to role dashboard or `/app/login` |
| **App Sign In** | `/app/login` | `src/app/app/login/page.tsx` | PASS (200) | Sign in with email & password; `"x-axivon-app": "1"` reCAPTCHA bypass; Biometric login hook; rate-limit timer; link to `/app/forgot-password` |
| **App Forgot Password** | `/app/forgot-password` | `src/app/app/forgot-password/page.tsx` | PASS (200) | Back to Sign In button; Email submit with validation; Dispatches secure reset link |
| **App Profile & Settings** | `/app/profile` | `src/app/app/profile/page.tsx`<br>`MobileProfileSettings.tsx` | PASS (200) | User credential update; Notifications toggle; Biometric enrollment; Theme toggle; Sign out |
| **Role Dashboard (Admin)** | `/admin/dashboard` (app mode) | `MobileAdminHome.tsx`<br>`MobileShell.tsx` | PASS (200) - FIXED | Fixed links to `/admin/crm/leads`, `/admin/business-partners/applications`, `/admin/leave`, `/admin/reports` |
| **Role Dashboard (Employee)** | `/employee/dashboard` (app mode) | `MobileEmployeeHome.tsx`<br>`MobileShell.tsx` | PASS (200) | Clock In/Out 1-tap button; Break timer; Quick task status toggle; Today's work report form trigger |
| **Role Dashboard (Broker)** | `/broker/dashboard` (app mode) | `MobileBrokerHome.tsx`<br>`MobileShell.tsx` | PASS (200) | Register Lead button; View Commissions; Quick stats; Notification drawer |
| **Role Dashboard (Manager)** | `/manager/dashboard` (app mode) | `MobileManagerHome.tsx`<br>`MobileShell.tsx` | PASS (200) | Review Department Roster; Approve/Reject Leave; Work report reviews |
| **Role Dashboard (Executive)** | `/executive/dashboard` (app mode) | `MobileExecutiveHome.tsx`<br>`MobileShell.tsx` | PASS (200) | Governance approvals; KPI summary; Department statistics |
| **Role Dashboard (Client)** | `/client/dashboard` (app mode) | `MobileClientHome.tsx`<br>`MobileShell.tsx` | PASS (200) | Active projects list; Milestone UAT signoff button; Support ticket dispatcher |
| **Mobile Navigation System** | App-wide (App Mode) | `MobileTabBar.tsx`<br>`MobileTopBar.tsx`<br>`MobileMoreSheet.tsx`<br>`roleConfig.ts` | PASS (200) - FIXED | Fixed 4 tabs per role; "More" bottom sheet drawer; Offline network detection; Zero marketing navbar/footer contamination |

---

## 5. Comprehensive Defect & Repair Summary (Stages 1, 2, 3)

1. **Portfolio Detail Dynamic Route 404 Bug (`/portfolio/[slug]`):**
   - *Problem:* `src/app/portfolio/[slug]/page.tsx` was importing static projects from `@/data/portfolio` instead of using the database accessor `getPublishedPortfolioProjectBySlug` and `getPublishedPortfolioProjects`. Any project added or updated in the database by administrators rendered a 404 (notFound()) error.
   - *Fix:* Refactored `generateStaticParams`, `generateMetadata`, and `PortfolioDetailPage` to use `getPublishedPortfolioProjectBySlug` and `getPublishedPortfolioProjects`. Both database projects and static fallback projects now resolve seamlessly.

2. **CaseStudies Invalid ID Reference (`ai-business-assistant`):**
   - *Problem:* `src/components/portfolio/CaseStudies.tsx` referenced `id: "ai-business-assistant"`, which did not exist in portfolio projects, leading to a potential 404 link when clicked.
   - *Fix:* Cataloged and ensured canonical slugs (`axivon-technologies`, `krishi-drishti`, `jalmitra`, `nani-tathagat`) are used throughout portfolio components.

3. **Broker Dashboard Broken Activity Feed Link (`/broker/activity`):**
   - *Problem:* `src/app/broker/dashboard/page.tsx` had `<Link href="/broker/activity">` which triggered a 404 error because the activity feed is served at `/broker/notifications`.
   - *Fix:* Updated link target to `/broker/notifications`.

4. **Mobile Admin Dashboard Broken Navigation Links (`MobileAdminHome.tsx`):**
   - *Problem:* `src/components/mobile/admin/MobileAdminHome.tsx` contained broken links:
     - `/admin/leads` (pointed to non-existent route instead of `/admin/crm/leads`)
     - `/admin/approvals` (pointed to non-existent route instead of `/admin/business-partners/applications` and `/admin/leave`)
     - `/admin/export` (pointed to non-existent route instead of `/admin/reports`).
   - *Fix:* Updated all links in `MobileAdminHome.tsx` to canonical routes.

5. **Mobile Role Navigation Config Broken Links (`roleConfig.ts`):**
   - *Problem:* `src/components/mobile/roleConfig.ts` had:
     - In ADMIN: `href: "/admin/approvals"` (broken), `href: "/admin/leads"` (broken), `href: "/admin/export"` (broken).
     - In EXECUTIVE: `href: "/executive/profile"` (broken).
     - In DEPARTMENT_MANAGER: `href: "/admin/notifications"` (unauthorized/mismatched).
   - *Fix:* Updated `roleConfig.ts` to link to `/admin/leave`, `/admin/crm/leads`, `/admin/reports`, `/executive/settings`, and `/manager/dashboard`.

6. **Legacy Admin Sidebar Incompatible Links (`src/components/admin/sidebar/Sidebar.tsx`):**
   - *Problem:* An unlinked legacy sidebar file contained references to `/admin/portfolio`, `/admin/services`, `/admin/contacts`, `/admin/blogs`, `/admin/media`, `/admin/testimonials`, `/admin/team`, `/admin/profile`.
   - *Fix:* Replaced all 8 links with their canonical equivalents: `/admin/content/portfolio`, `/admin/content/services`, `/admin/crm/leads`, `/admin/content/blog`, `/admin/content/media`, `/admin/reviews`, `/admin/employees`, `/admin/settings`.

7. **Permissions Engine Unhandled TypeError (`src/lib/auth/permissions.ts`):**
   - *Problem:* `TypeError: user.userRoles is not iterable` occurred when `user.userRoles` was null or missing from test mocks or custom queries.
   - *Fix:* Added defensive array checking `const userRoles = Array.isArray(user.userRoles) ? user.userRoles : [];` and safe navigation `ur?.role?.name`.

8. **Client Projects API Unauthenticated Status Code (`src/app/api/v1/client/projects/route.ts`):**
   - *Problem:* Unauthenticated requests returned HTTP 403 Forbidden instead of HTTP 401 Unauthorized.
   - *Fix:* Differentiated missing authentication (401) from unauthorized role (403).

9. **SEO Keyword Mapping Target Paths:**
   - *Problem:* `src/lib/seo/keyword-mapping.ts` mapped `/services/mobile-apps` and `/services/custom-software`, while real Next.js route folders are `/services/mobile-app-development` and `/services/custom-software-development`.
   - *Fix:* Audited and verified `PATH_ALIASES` normalizer to ensure no invalid URLs are generated in SEO metadata or schemas.
