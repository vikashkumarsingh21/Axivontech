# Axivon Technologies — Android Application & Public Website Separation Report
## Architectural Audit, Route Isolation, Dedicated App Entry & Build Verification

---

### Executive Summary

A comprehensive architectural overhaul has been completed to achieve **strict, permanent separation** between the Axivon Technologies public marketing website and the authenticated Android mobile application.

Previously, the Android mobile application loaded the root public website (`https://axivontech.in/`), rendering the public marketing header, navigation bar, hero sections, and footer inside the mobile shell.

Under the updated architecture:
1. The Android application has its own dedicated entry point (`/app`), isolated layout, and dedicated login screen (`/app/login`).
2. The mobile application container strictly suppresses all public marketing UI elements (Navbar, Footer, WhatsApp floating button, ChatWidget, Cookie Consent Banner, SEO Schemas, and Google Analytics).
3. The main public website continues functioning normally in ordinary web browsers with zero regression or missing assets.
4. The backend, user accounts, database, and authentication mechanisms remain unified and shared.

---

### 1. Original Application Architecture & Problem Analysis

#### How the Android App Was Implemented
The Android application is built as an Android Capacitor WebView shell (`com.axivon.app`) located in `mobile/`. It wraps a native Android `BridgeActivity` that loads a remote Next.js web application.

#### Why the Public Website Appeared Inside the App
1. **Root URL Target**:
   `mobile/capacitor.config.json` previously configured:
   ```json
   "server": {
     "url": "https://axivontech.in",
     "cleartext": false
   }
   ```
   When the Android app launched, the WebView directly opened the public marketing homepage (`/`).
2. **Global Root Layout Leakage**:
   `src/app/layout.tsx` was unconditionally rendering:
   - `<Navbar />` (public header with links to Services, Portfolio, Blog, Careers, etc.)
   - `<Footer />` (public site footer)
   - `<FloatingWhatsAppButton />`
   - `<ChatWidget />`
   - `<CookieConsentBanner />` & `<CookieSettingsButton />`
   - `<OrganizationSchema />`, `<LocalBusinessSchema />`, `<WebSiteSchema />`
3. **No App-Specific Route Hierarchy**:
   There was no dedicated `/app` or `/app/login` endpoint. When unauthenticated users were redirected, they landed on `/login` which included links back to `/` and desktop marketing carousels.

---

### 2. The New Architecture: Dedicated App Environment

#### 2.1 Dedicated Route Hierarchy

```
src/app/app/
├── layout.tsx         # Dedicated isolated layout for App Mode
├── page.tsx           # Entry point: checks session -> redirect to role dashboard or /app/login
└── login/
    └── page.tsx       # Dedicated application login page
```

* **`/app` Entry Point ([`src/app/app/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/app/page.tsx))**:
  * Evaluates session on launch.
  * If authenticated: immediately calls `resolveRoleDashboardUrl(role)` to redirect to the user's role-based portal.
  * If unauthenticated: smoothly redirects to `/app/login`.
  * Displays a branded loading splash with official Axivon logo and emerald indicator while checking.

* **`/app/login` Screen ([`src/app/app/login/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/app/login/page.tsx))**:
  * Clean, mobile-first login interface.
  * Official AxivonTech branding (`/assets/logo/logo-full.png`).
  * Email / User ID and Password fields with show/hide password toggle.
  * Embedded human verification (`GoogleRecaptchaWidget`).
  * Rate-limit cooldown timer and clear error banners.
  * Forgot Password link (`/auth/forgot-password`).
  * Zero marketing content, no desktop hero carousels, and no public links.
  * On mount: verifies if user already has an active session and auto-forwards to dashboard.
  * On successful login: routes to the verified role dashboard.

* **Dedicated Layout ([`src/app/app/layout.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/app/layout.tsx))**:
  * Dark theme matching Axivon portal aesthetics (`#0B0D10`).
  * Safe-area handling: `pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`.
  * Mobile-optimized viewport (`maximumScale: 1, userScalable: false`).
  * Robots metadata set to `index: false, follow: false`.

#### 2.2 Global Layout Guard & Suppression

In [`src/app/layout.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/layout.tsx), requests are evaluated for `isAppOrPortal`:

```tsx
const isAppOrPortal =
  isApp ||
  reqHeaders.get("x-is-app-or-portal") === "1" ||
  reqHeaders.get("x-axivon-pathname")?.startsWith("/app");
```

When `isAppOrPortal` is active:
* `<OrganizationSchema />`, `<LocalBusinessSchema />`, `<WebSiteSchema />` are **suppressed**.
* `<Navbar />` is **suppressed**.
* `<Footer />` is **suppressed**.
* `<GoogleAnalytics />` is **suppressed**.
* `<FloatingWhatsAppButton />` and `<ChatWidget />` are **suppressed**.
* `<CookieConsentBanner />` and `<CookieSettingsButton />` are **suppressed**.
* `<PortalAppPromptWrapper />` (daily app download popup) is **suppressed**.

---

### 3. Strict Application Navigation Policy & Route Isolation

Enforced centrally in [`src/middleware.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/middleware.ts) and [`src/features/app-mode/routing.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/features/app-mode/routing.ts):

| Requested Route Inside App | Session Status | Behavior |
| :--- | :--- | :--- |
| **`/app`** | Unauthenticated | Redirects to `/app/login` |
| **`/app`** | Authenticated | Redirects to `resolveRoleDashboardUrl(role)` |
| **`/app/login`** | Unauthenticated | Renders dedicated App Login screen |
| **`/app/login`** | Authenticated | Redirects to `resolveRoleDashboardUrl(role)` |
| **`/login`** | Any | Automatically redirected to `/app/login` |
| **`/logout`** | Any | Revokes session, returns `redirectTo: "/app/login?logged_out=1"` |
| **`/` (Public Homepage)** | Unauthenticated | Blocked: Redirects to `/app/login` |
| **`/` (Public Homepage)** | Authenticated | Blocked: Redirects to authorized role dashboard |
| **`/about`, `/services`, `/careers`, `/blog`, `/contact`** | Any | Blocked: Never renders public pages. Redirects to `/app/login` or dashboard |

---

### 4. Role-Based Portal Access

Authentication connects to the existing `/api/v1/auth/login` endpoint and resolves the user's role:

| Authenticated Role | Application Destination | Primary Business Functionality |
| :--- | :--- | :--- |
| **ADMIN** | `/admin/dashboard` | Employee, Department, Lead, Project, Commission, App Settings |
| **FOUNDER** | `/executive/dashboard` | Shared Executive Dashboard, Approvals, Business Overview |
| **CO_FOUNDER** | `/executive/dashboard` | Equal 50-50 Partner Governance, Executive Reports |
| **EMPLOYEE** | `/employee/dashboard` | 1-Tap Attendance, Tasks, Work Reports, Leave Management |
| **BUSINESS_PARTNER** / **BROKER** | `/broker/dashboard` | Lead Registration, Referrals, Commission Tracking, Contracts |
| **DEPARTMENT_MANAGER** | `/manager/dashboard` | Department Teams, Task Assignments, Leave Approvals |
| **CLIENT** | `/client/dashboard` | Project Milestones, Invoices, Contracts, Support |

---

### 5. Application Package & Asset Inspection

#### Local APK Contents (`mobile/dist` and `mobile/android/.../assets/public/`)
* Contains only:
  * `index.html` (Local bootloader with immediate redirect to `https://axivontech.in/app`)
  * `assets/logo-full.png` & `assets/logo-icon.png` (Official AxivonTech branding)
  * Capacitor runtime scripts (`cordova.js`, `capacitor.config.json`)
* **Excluded Assets**:
  * No public marketing HTML, CSS, or JS bundles.
  * No marketing image showcases, hero graphics, or testimonial assets.
  * No blog or career assets.

#### Capacitor Configuration
In [`mobile/capacitor.config.json`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/mobile/capacitor.config.json):
```json
{
  "appId": "com.axivon.app",
  "appName": "Axivon",
  "webDir": "dist",
  "server": {
    "url": "https://axivontech.in/app",
    "cleartext": false,
    "allowNavigation": [
      "axivontech.in",
      "*.axivontech.in",
      "*.google.com",
      "*.gstatic.com",
      "challenges.cloudflare.com"
    ]
  },
  "appendUserAgent": "AxivonApp/1.0.0"
}
```

#### Android Native Enhancements (`MainActivity.java`)
* Native `CookieManager` configured with `setAcceptCookie(true)` and `setAcceptThirdPartyCookies(webView, true)` for cross-restart session persistence.
* `flush()` invoked on `onPause()`, `onStop()`, and `onDestroy()`.
* User-Agent defensively guaranteed in native code: `AxivonApp/1.0.0`.

---

### 6. Build & Verification Results

1. **TypeScript Type Safety**:
   * Command: `npx tsc --noEmit`
   * Result: **0 errors** (clean build).

2. **Android APK Compilation**:
   * Command: `assembleDebug`
   * Result: **BUILD SUCCESSFUL** in 25s (`app-debug.apk` ~5.3 MB).
   * Synced to `public/downloads/axivon-app.apk`.

3. **Automated Separation Test Suite**:
   * File: `tests/app-website-separation.test.ts`
   * Result: **15 / 15 tests passed** (100% success rate):
     * Disallows all public marketing routes inside app mode.
     * Allows all dedicated app and portal routes.
     * Validates suppression of public Navbar/Footer on `/app` and portals.
     * Validates preservation of public Navbar/Footer on public routes (`/`, `/about`, `/services`, `/contact`).
     * Validates role resolver across all roles.
     * Validates Capacitor and local asset package isolation.

---

### 7. Public Website Regression Verification

The main website (`https://axivontech.in`) running in ordinary desktop and mobile browsers remains completely untouched and functioning normally:
* Homepage (`/`) renders hero section, services showcase, case studies, and contact CTA.
* Navigation Bar (`<Navbar />`) and Footer (`<Footer />`) render with full functionality.
* SEO metadata, JSON-LD schemas, Google Analytics, and Cookie Consent remain operational.
* Public lead generation, careers application, and contact inquiry forms work seamlessly.
