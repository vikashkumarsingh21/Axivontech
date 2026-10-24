# Frontend Issues & UI Defect Report

This document records all user interface bugs, console errors, broken routes, hydration mismatches, and visual glitches observed directly in a real Google Chrome browser.

---

### FE-ISSUE-001: Client Component Server Environment Variable Leak Crash
- **Page URL:** `http://localhost:3000/careers-privacy`
- **Affected Role:** Public / Applicants
- **Steps to Reproduce:**
  1. Open real browser and navigate to `http://localhost:3000/careers-privacy`.
  2. Open DevTools Console.
- **Expected Behavior:** Privacy policy page renders with legal text without console errors.
- **Actual Behavior:** Page logs fatal client errors: `❌ Invalid environment variables` and `Uncaught Error: Invalid environment variables`.
- **Browser Console Stack Trace:**
  ```
  [browser] Uncaught Error: Invalid environment variables
      at module evaluation (src/lib/env.ts:14:9)
      at module evaluation (src/lib/db.ts:2:1)
      at module evaluation (src/lib/legal/legal-db.ts:1:1)
      at module evaluation (src/components/legal/LegalPageLayout.tsx:19:1)
      at CareersPrivacyPage (src/app/careers-privacy/page.tsx:34:7)
  ```
- **Root Cause:** `LegalPageLayout.tsx` or `page.tsx` marked as client component or imported on client directly pulls in `legal-db.ts` -> `db.ts` -> `env.ts`. Since server environment variables are not available on the client window, Zod schema validation fails immediately.
- **Screenshot:** `browser-screenshots/public-careers-privacy.png`

---

### FE-ISSUE-002: Infinite Loading Spinner on API Error in Services Catalog Management
- **Page URL:** `http://localhost:3000/admin/content/services`
- **Affected Role:** Admin
- **Steps to Reproduce:**
  1. Log in as `admin@axivon.dev`.
  2. Navigate to `/admin/content/services`.
- **Expected Behavior:** If the services catalog fails to load or returns an error, the UI displays a clean error banner with a "Retry" button.
- **Actual Behavior:** The page shows a black screen with an infinite red spinning circle. The user has no indication of what happened.
- **Browser Network Status:** `GET /api/v1/admin/content/services` returned HTTP 500.
- **Root Cause:** State `loading` remains `true` or error catch block does not set an error state to display a fallback UI.
- **Screenshot:** `browser-screenshots/admin-content-services.png`

---

### FE-ISSUE-003: Infinite Loading Spinner on New Project Submission
- **Page URL:** `http://localhost:3000/broker/projects/new`
- **Affected Role:** Broker / Business Partner
- **Steps to Reproduce:**
  1. Log in as `qa.broker@axivon.dev`.
  2. Navigate to `/broker/projects/new`.
- **Expected Behavior:** A multi-step or form UI displays allowing the partner to submit a new referral or project.
- **Actual Behavior:** The screen remains stuck indefinitely on a green loading spinner on black background.
- **Browser Network Status:** `GET /api/v1/broker/projects/new` returned HTTP 404 (Not Found).
- **Root Cause:** Next.js route collision causes the page to attempt fetching project data with ID `"new"`, which fails with 404. The client has no 404 recovery state and remains spinning.
- **Screenshot:** `browser-screenshots/broker-projects-new.png`

---

### FE-ISSUE-004: Infinite Loading Spinner on Broker Commissions Page
- **Page URL:** `http://localhost:3000/broker/commissions`
- **Affected Role:** Broker / Business Partner
- **Steps to Reproduce:**
  1. Log in as `qa.broker@axivon.dev`.
  2. Navigate to `/broker/commissions`.
- **Expected Behavior:** Shows commission summary cards, pending payout requests, and transaction history (or empty state).
- **Actual Behavior:** UI hangs on an infinite loading spinner.
- **Browser Network Status:** `GET /api/v1/broker/commissions` returned HTTP 500.
- **Root Cause:** Client component lacks error state fallback when the API returns 500.
- **Screenshot:** `browser-screenshots/broker-commissions.png`

---

### FE-ISSUE-005: React SSR / Client Hydration Mismatch in Work Reports
- **Page URL:** `http://localhost:3000/employee/work-reports`
- **Affected Role:** Employee
- **Steps to Reproduce:**
  1. Log in as `qa.employee@axivon.dev`.
  2. Navigate to `/employee/work-reports`.
  3. Inspect console during initial load.
- **Expected Behavior:** Clean hydration without DOM mismatch warnings.
- **Actual Behavior:** React throws hydration mismatch error overlay in development:
  ```
  [browser] Uncaught Error: Hydration failed because the server rendered text didn't match the client.
    <div>
      <h2>
      <p className="text-xs text-[#7E8997]">
  +     Saturday, Oct 24, 2026
  -     Saturday, 24 Oct 2026
    at ReportsPage (src/app/employee/work-reports/page.tsx:198:15)
  ```
- **Root Cause:** Line 199 executes `new Date().toLocaleDateString(undefined, { weekday: "long", ... })` directly in the JSX. Because the Node.js server locale and client browser locale format differently, the strings differ and React invalidates the SSR DOM tree.
- **Screenshot:** `browser-screenshots/employee-work-reports.png`

---

### FE-ISSUE-006: Broken Sidebar & Navigation Links (404s)
- **Routes Affected:**
  1. `http://localhost:3000/admin/content/portfolio` (Admin Content CMS) -> **HTTP 404**
  2. `http://localhost:3000/executive/analytics` (Executive Analytics) -> **HTTP 404**
- **Steps to Reproduce:**
  1. Click on Content -> Portfolio in Admin sidebar or Executive -> Analytics in Founder sidebar.
- **Expected Behavior:** Dedicated management pages render.
- **Actual Behavior:** Standard 404 "Page Not Found" screen renders.
- **Screenshots:**
  - `browser-screenshots/admin-content-portfolio.png`
  - `browser-screenshots/founder-analytics.png`

---

### FE-ISSUE-007: Cookie Consent Banner Obscures Bottom Actions
- **Routes Affected:** App-wide across all authenticated portals
- **Steps to Reproduce:**
  1. Log in to any portal as a new user.
  2. Notice the large "We Respect Your Privacy" banner fixed to bottom-right with `z-50`.
- **Impact:** Covers bottom dashboard action items, chat copilots, and mobile navigation items until dismissed.
- **Recommendation:** Dismiss banner permanently in local storage upon choice or make it compact on authenticated dashboard routes.
