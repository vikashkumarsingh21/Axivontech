# Axivon Mobile App — Architecture & Governance Rules (Rulebook)

> **Status:** ACTIVE & MANDATORY  
> **Applies To:** All mobile-related tasks, prompts, PRs, and team members working on the Axivon Android App and Web App-Mode integration.  
> **Hard Rule:** These rules override any conflicting instruction. Zero regressions to the existing web application.

---

## 1. Isolation Rules & File Placement

1. **Native Mobile Code Location:**
   - All Capacitor / Android shell code lives exclusively in the root `mobile/` directory.
   - `mobile/` is strictly excluded from all web tooling: `tsconfig.json`, `eslint.config.mjs`, `.prettierignore`, `.vercelignore`, Tailwind scans, and root `.gitignore`.
   - Vercel builds and `next build` must NEVER inspect or compile files in `mobile/`.
   - Native build artifacts (`*.apk`, `*.aab`, `*.keystore`, `local.properties`, `.gradle/`, `build/`) must NEVER be committed to Git.
2. **Web-Side App-Mode Code Location:**
   - All web-side mobile logic lives strictly inside `src/features/app-mode/`.
   - Route files required by Next.js App Router (e.g., `/download/route.ts`, `/api/v1/app/version/route.ts`, `/admin/settings/app/page.tsx`) must be thin wrappers that import logic from `src/features/app-mode/`.
   - Scoped styling lives in `src/features/app-mode/app-mode.css` and targets ONLY `[data-app="true"]`.
3. **No Unnecessary Root Dependencies:**
   - Never add dependencies to the root `package.json` unless unavoidable. If required, document name, bundle size impact, and justification.

---

## 2. Kill-Switch System (Default Strictly OFF)

1. **Dual-Key Kill Switch:**
   - Master Environment Variable: `APP_MODE_ENABLED` (Default: `false` / unset).
   - Organization Setting: `app.enabled` in database/settings (Default: `false`).
   - App Mode is considered active ONLY when BOTH the master environment flag is `"true"` AND the request carries the `AxivonApp/<version>` User-Agent header (or verified dev override).
2. **Behavior When Kill Switch is OFF:**
   - Edge Middleware does zero work, performs zero database queries, and returns early with zero added latency.
   - `/download` returns HTTP 404.
   - `/api/v1/app/version` returns HTTP 404 JSON.
   - No mobile popups, no download banners, and zero app-mode CSS/JS reaches any public page or portal.
3. **Behavior When Kill Switch is ON but User is in Normal Browser:**
   - Public pages and portals behave 100% identically to standard web desktop/mobile browsers.
   - The only allowed difference is the Daily Download Popup, which itself is behind an independent admin toggle `app.downloadPrompt.enabled` (default `false`).

---

## 3. Mandatory Web Regression Gate

Before merging ANY mobile branch into `main`, the regression gate suite MUST be executed and pass 100%:
- **Execution Command (Windows PowerShell):** `powershell -File scripts/mobile/web-regression-check.ps1`
- **Execution Command (Bash):** `./scripts/mobile/web-regression-check.sh`
- **What it Verifies (Two-Pass Runner: Flag OFF and Flag ON):**
  1. `check:errors` guardrails pass (0 unhandled errors, 0 raw `alert()` calls).
  2. First Load JS budget: No existing route may grow by more than 1 KB gzip.
  3. Raw HTML & SEO equality: 10 public pages (Home, Login, Services, Pricing, About, etc.) must match baseline SEO title, description, and JSON-LD schemas.
  4. Authentication & Read API smoke tests for all 5 roles (ADMIN, FOUNDER, EMPLOYEE, BROKER, CLIENT) must return HTTP 200.
  5. Puppeteer page loads: Zero browser console errors, zero failed network requests.
  6. 1440px desktop role screenshot verification.

---

## 4. Mobile Data & Storage Budgets

Every app-mode feature must operate strictly within the measured performance budgets:
1. **Repeat Dashboard Load:** <= **250 KB** transferred (Measured baseline: 5 KB – 46 KB).
2. **Login First Load:** <= **600 KB** transferred (Next.js bundle <= 300 KB, Captcha isolated).
3. **Background Idle Polling:**
   - Single shared poller for notifications and badges.
   - Polling interval >= 60 seconds (never more frequent).
   - Paused immediately when the page is hidden or app is backgrounded (`document.visibilityState === "hidden"`).
   - Background network requests while hidden: strictly **0 requests**.
   - Zero polling on `/login`.
4. **Strict HTTP Caching Policy:**
   - Static chunks (`/_next/static/*`) and fonts: immutable long cache (1 year).
   - **Authenticated APIs (`/api/v1/*`): NEVER cached.** Real-time correctness for attendance, payroll, approvals, and security tokens is non-negotiable.
5. **APK Distribution & Storage:**
   - Native shell APK size: <= **6 MB**.
   - APK is NEVER stored in `public/` or the Git repository; it is hosted via GitHub Releases.
   - Complete WebView cache and session clearing on logout.

---

## 5. Deployment & Rollback Protocol

1. **Vercel Preview Deployment:**
   - Every mobile-related change must be deployed to a Vercel Preview environment first.
   - Production environment variables maintain `APP_MODE_ENABLED=false` until the native APK has been physically validated on real Android hardware.
2. **Zero-DB Rollback Capability:**
   - In case of any production anomaly, setting `APP_MODE_ENABLED=false` in the Vercel dashboard instantly kills all mobile routing, download endpoints, and popups with ZERO deployment delay and ZERO database migrations to revert.
   - If a code revert is necessary, `git revert <merge-commit>` returns the repo cleanly to the pre-mobile state.

---

## 6. Matrix: Allowed vs. Forbidden Touches for Later Tasks

| Area / File | Allowed? | Rules / Restrictions |
|---|---|---|
| `mobile/` directory | ✅ ALLOWED | Keep completely excluded from web builds. Never commit APKs/keystores. |
| `src/features/app-mode/*` | ✅ ALLOWED | Primary home for all mobile logic, detection hooks, popups, and scoped CSS. |
| `src/middleware.ts` | ⚠️ RESTRICTED | Matcher UNCHANGED. Zero DB calls. Early return when flag is OFF or UA lacks token. |
| `src/app/download/route.ts` | ✅ ALLOWED | Thin wrapper importing from `src/features/app-mode`. Returns 404 when flag is OFF. |
| `src/app/api/v1/app/*` | ✅ ALLOWED | Thin wrapper importing from `src/features/app-mode`. Returns 404 when flag is OFF. |
| `src/app/admin/settings/app/` | ✅ ALLOWED | Thin wrapper for App Mode admin management. Protected by Admin role. |
| Prisma Schema (`prisma/schema.prisma`) | ❌ FORBIDDEN | Zero schema changes, zero migrations, never run `prisma db push`. Use existing key-value `OrganizationSetting` / `UserPreference`. |
| Existing Public Marketing UI | ❌ FORBIDDEN | Must remain 100% identical in normal browsers. SEO and HTML unchanged. |
| Employee Portal Visuals | ❌ FORBIDDEN | Paused per project guidelines. Do not alter employee dashboard visual layout. |
| Root `package.json` | ❌ FORBIDDEN | Do not add dependencies unless explicitly approved with size & justification. |
| Existing Business Logic | ❌ FORBIDDEN | Authentication, attendance calculation, payroll, and CRM business logic untouched. |
