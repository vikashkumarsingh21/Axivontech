# Axivon Mobile App Mode Specification

**Version:** 1.0.0  
**Target Environment:** Next.js 16 App Router, React 19, Capacitor Android WebView Shell  
**Production Host:** `https://axivontech.in`  
**Status:** Approved & Implemented  

---

## 1. Overview & Architecture

Axivon Technologies provides a unified web and mobile experience. The Android mobile application is a high-performance, low-data Capacitor WebView shell that serves exclusively the authenticated portals (Founder, Co-Founder, Admin, Employee, Broker Partner, and Client).

To maintain absolute zero regressions on the existing web application, the system uses an isolated **App Mode** subsystem residing entirely in `src/features/app-mode/`.

```mermaid
flowchart TD
    ClientReq[Incoming Client Request] --> EdgeMW[Next.js Middleware (Edge)]
    EdgeMW --> KillSwitch{APP_MODE_ENABLED<br/>& app.enabled?}
    KillSwitch -- "OFF (Default)" --> WebPass[Standard Web Pipeline<br/>Zero overhead, normal routes]
    KillSwitch -- "ON" --> CheckToken{User-Agent contains<br/>'AxivonApp/version'<br/>or Dev Override?}
    CheckToken -- "No" --> WebPass
    CheckToken -- "Yes" --> SetHeader[Set Header: x-axivon-app: 1<br/>Set Header: x-axivon-app-version: v]
    SetHeader --> CheckRoute{Is Allowed<br/>App Route?}
    CheckRoute -- "Yes" --> RenderApp[Serve Portal / Login / Legal<br/>Apply data-app='true']
    CheckRoute -- "No (Public page)" --> SessionCheck{Has Session Cookie?}
    SessionCheck -- "Yes" --> RedirectDash[307 Redirect to<br/>User Role Dashboard]
    SessionCheck -- "No" --> RedirectLogin[307 Redirect to<br/>/login]
```

---

## 2. Detection & Identification Contract

### 2.1 User-Agent Token
The Android application appends the unique token to its `navigator.userAgent`:
```
Mozilla/5.0 (Linux; Android 14; Pixel 7) ... Chrome/120.0.0.0 Mobile Safari/537.36 AxivonApp/<semver>
```
* Example: `AxivonApp/1.0.0`

### 2.2 Server-Side Identification & Request Headers
Next.js Edge middleware evaluates every non-static incoming request:
1. **Kill Switch Guard:** If `process.env.APP_MODE_ENABLED !== "true"`, middleware immediately skips all mobile logic with zero database lookups and zero added latency.
2. **App Mode Request Headers:**
   * `x-axivon-app`: Set to `"1"` when the token is present or dev override is active.
   * `x-axivon-app-version`: Set to the extracted version string (e.g. `"1.0.0"`).

### 2.3 Server & Client Helpers
* **Server Helper:** `isAppMode(headers)` & `getAppModeVersion(headers)` (`src/features/app-mode/flags.ts`).
* **Client Hook:** `useAppMode()` (`src/features/app-mode/useAppMode.ts`):
  * Synchronously inspects `document.documentElement.getAttribute("data-app") === "true"` or `navigator.userAgent`.
  * Returns `{ isAppMode, version, isLoading }`.

### 2.4 Developer Testing Override
To test App Mode in desktop Google Chrome without an emulator:
* Query parameter: `?app=1`
* Cookie: `axivon_app_dev=1`
* Request header: `x-app-dev: 1`
* **Security Guardrail:** This dev override is strictly disabled when `NODE_ENV === "production"`.

---

## 3. App-Mode Routing & Access Matrix

When App Mode is detected (`x-axivon-app: 1`), public marketing pages are inaccessible to ensure mobile data savings and application focus.

### 3.1 Allowed Routes in App Mode
The following routes and their subpaths render directly inside the app:
* **Authentication:** `/login`, `/logout`
* **Role Portals:** `/admin/**`, `/executive/**`, `/employee/**`, `/broker/**`, `/client/**`, `/manager/**`
* **Account Activation:** `/client/activate`, `/business-partner/activate`, `/broker-partner/activate`
* **User Management & Legal:** `/verify-email-change`, `/preferences`, `/cookie-preferences`, `/privacy-policy`, `/terms`, `/terms-and-conditions`, `/privacy-requests`, `/legal/**`
* **Internal APIs:** All `/api/**` endpoints.

### 3.2 Intercepted Public Routes
Any navigation inside App Mode to public marketing pages (such as `/`, `/about`, `/services/**`, `/blog/**`, `/pricing`, `/portfolio/**`, `/contact`, `/careers/**`, `/reviews`, `/demo-projects/**`):
* **With valid session:** Automatically redirects with HTTP 307 to the user's role dashboard (`resolveRoleDashboardUrl()`).
* **Without session:** Automatically redirects with HTTP 307 to `/login`.
* **Loop Prevention:** Direct access to `/login` is always permitted without redirection.

---

## 4. UI & Visual Adaptations

### 4.1 DOM Scoping
When App Mode is active, `AppModeInit` sets `data-app="true"` on the root `<html>` element. All mobile-specific CSS overrides are scoped strictly under `[data-app="true"]` in `src/features/app-mode/app-mode.css`.

### 4.2 Compact App Login Layout
In a normal browser, `/login` features an interactive promotional carousel, marketing navigation, and floating widgets. In App Mode:
* Promotional carousel and poster media are completely hidden (`display: none !important`).
* Navigation bar and marketing footer are removed.
* Centered, distraction-free authentication card with company logo.
* Minimalist footer with links strictly to `Privacy Policy` and `Terms & Conditions`.
* Full-screen cookie banners are suppressed in favor of compact inline consent handling.

---

## 5. Daily Download Popup (Normal Browsers Only)

To encourage mobile adoption among portal users, a non-intrusive popup appears once per calendar day.

### 5.1 Trigger Rules
* **Target Audience:** Logged-in users across all 6 portals (`/admin`, `/executive`, `/employee`, `/broker`, `/client`, `/manager`).
* **Timing:** Appears ~1.5 seconds after page load without blocking critical rendering paths.
* **Exclusions:**
  * NEVER shown on `/login` or public pages.
  * NEVER shown when running inside App Mode (`AxivonApp` token present).
  * NEVER shown if master kill-switch `APP_MODE_ENABLED` or admin toggle `app.downloadPrompt.enabled` is `false`.
  * NEVER shown if APK URL is not configured.
* **Frequency:** Maximum once per calendar day in the `Asia/Kolkata` timezone. Persisted in `localStorage` under key `axivon_app_prompt_last_date`.

### 5.2 Platform-Adaptive Presentation
* **Android Browser:** Displays primary "Download App" CTA linking directly to `/download/axivon-app`, accompanied by an expandable "How to install" step-by-step guide (Allow install from this source, open file, tap Install).
* **iOS Safari:** Displays instructions for adding the portal to the Home Screen ("Tap Share icon > Add to Home Screen > Add").
* **Desktop Browser:** Renders a crisp inline SVG QR code with a "Copy Link" button for seamless transfer to an Android phone.
* **Bilingual Support:** Instant switch between English and Hindi (`"Axivon app se apni attendance lagayein aur sab kuch apne phone se manage karein"`).
* **Accessibility:** Full focus trapping, ESC key dismissal, backdrop click dismissal, and minimum 44px touch targets. Wrapped in `DownloadPopupErrorBoundary` to ensure zero portal disruption.

---

## 6. APK Delivery & Update Enforcement

### 6.1 Download Endpoint (`/download/axivon-app`)
* Rate-limited endpoint (maximum 30 requests per minute per IP).
* Issues an HTTP 307 Temporary Redirect to the GitHub Releases release asset URL.
* Sets headers:
  * `Content-Type: application/vnd.android.package-archive`
  * `Content-Disposition: attachment; filename="axivon-app.apk"`
* Records an entry in Prisma model `AuditLog` with action `"APP_DOWNLOAD"`, capturing timestamp, client IP, and User-Agent.

### 6.2 Version API (`/api/v1/app/version`)
Public endpoint cached for 5 minutes with stale-while-revalidate for 10 minutes:
```json
{
  "latestVersion": "1.0.0",
  "minVersion": "1.0.0",
  "apkUrl": "https://github.com/axivon/axivon-mobile/releases/download/v1.0.0/axivon-app.apk",
  "sha256": "4a35f212...",
  "sizeMb": 5.8,
  "notes": "Official Axivon Portal Android Application",
  "updatedAt": "2026-11-03T12:00:00.000Z",
  "popupEnabled": false
}
```

### 6.3 Update Gate (`UpdateGate.tsx`)
Runs inside the Android WebView and compares the installed version against the server API:
* **Blocking Dialog (`version < minVersion`):** Uncloseable screen preventing portal usage until the user downloads the mandatory security/feature update.
* **Dismissible Banner (`minVersion <= version < latestVersion`):** Informational banner notifying the user that a new release is available, dismissible for the session.

---

## 7. Low-Data & Performance Safeguards

1. **Third-Party Script Suppression:** In App Mode, Google Analytics (`gtag`), floating WhatsApp buttons, and live chat widgets are not mounted.
2. **Optimized Notification Polling:** Implemented `useSharedPoller` across portal headers with an interval >= 60 seconds. Polling automatically pauses when `document.visibilityState === "hidden"` and uses exponential backoff on network errors.
3. **Bandwidth Zero-Impact Delivery:** APK files are hosted exclusively on GitHub Releases. Website CDN bandwidth and Vercel serverless function limits remain completely unaffected by mobile downloads.
