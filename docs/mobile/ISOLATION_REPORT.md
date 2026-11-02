# Axivon Mobile Foundation — Isolation & Safety Report

**Date:** 2026-11-02  
**Branch:** `mobile-foundation`  
**Status:** COMPLETE & VERIFIED  

---

## 1. Executive Summary

This report establishes the isolation architecture and safety guardrails for the upcoming Axivon Technologies Android mobile app (Capacitor WebView). The foundational isolation guarantees that:
- **Zero Web Regressions:** The existing public website, client portal, employee portal, broker portal, executive dashboard, and administrative console continue functioning exactly as before.
- **Zero Build / Deployment Bloat:** The Next.js production build and Vercel deployments ignore all mobile shell artifacts.
- **Master Kill Switch:** The mobile system is completely inert by default (`APP_MODE_ENABLED=false`).
- **Binary Hygiene:** Keystores, credentials, APKs, and AABs are permanently prevented from entering version control.

---

## 2. Directory Isolation Matrix

The mobile shell is housed in a top-level `mobile/` folder completely isolated from the web application:

| Tooling Layer | Configuration Location | Rule Applied | Verification |
|---|---|---|---|
| **TypeScript** | `tsconfig.json` | `"exclude": [..., "mobile"]` | `tsc` skips `mobile/` completely |
| **ESLint** | `eslint.config.mjs` | `globalIgnores(["mobile/**"])` | `eslint` never scans mobile files |
| **Prettier** | `.prettierignore` | `mobile/` | Formatter skips mobile source trees |
| **Vercel Build** | `.vercelignore` | `mobile/` | Vercel deployment ignores mobile directory |
| **Git Tracking** | `.gitignore` & `mobile/.gitignore` | Excludes `node_modules`, `build/`, `.gradle`, `local.properties`, `*.jks`, `*.keystore`, `*.apk`, `*.aab` | Git status ignores all mobile build artifacts |
| **Next.js Bundler** | `next.config.ts` | No references to `mobile/`; entry points strictly within `src/app` | Turbopack root compilation untouched |

---

## 3. Web Feature Boundary (`src/features/app-mode/`)

All web-side code supporting the mobile app is strictly confined to `src/features/app-mode/`:

1. **`flags.ts`**:
   - `isAppModeEnvEnabled()`: Reads `process.env.APP_MODE_ENABLED === "true"`. Defaults to `false`.
   - `isAppUserAgent(userAgent)`: Checks for the presence of the `AxivonApp` token.
   - `isAppModeEnabled(settings)`: Requires BOTH the environment kill-switch to be `true` AND organization setting `app.enabled` to be `true`.
   - `isAppModeActive(userAgent, settings)`: Returns `true` ONLY if both the master flag and the `AxivonApp` user-agent token match.

2. **`app-mode.css`**:
   - Strictly scoped to `[data-app="true"]`.
   - Contains safe-area viewport insets, overscroll suppression, and reduced motion overrides.
   - Because all rules require `[data-app="true"]`, zero styles bleed into normal desktop or mobile web browsers.

3. **Thin Route Wrappers (`src/app`)**:
   - `src/app/download/page.tsx`: Thin wrapper importing `isAppModeEnabled()`. When the flag is `false`, it immediately invokes Next.js `notFound()` (HTTP 404).
   - `src/app/api/v1/app/version/route.ts`: Thin wrapper importing `isAppModeEnabled()`. When the flag is `false`, it returns HTTP 404 JSON.

---

## 4. Middleware Footprint & Early Return

`src/middleware.ts` received a minimal, zero-latency update:
- **No Database Calls:** Middleware does not query PostgreSQL / Neon.
- **Spoof Protection:** Explicitly removes incoming client-supplied `x-app-mode` headers.
- **Early Return:** If `process.env.APP_MODE_ENABLED !== "true"`, the block is bypassed with zero overhead.
- **Header Injection:** Sets `x-app-mode: true` on downstream request headers ONLY when `APP_MODE_ENABLED === "true"` AND `req.headers.get("user-agent")` contains `AxivonApp`.
- **Matcher Preserved:** The Next.js middleware matcher is unchanged.

---

## 5. Delivery & Deployment Rules

1. **GitHub Releases Hosting:** The Android APK is NEVER stored in `public/` or in the git repository. It is hosted on GitHub Releases assets to ensure website bandwidth remains minimal and deployments stay lightweight.
2. **Preview Environments First:** Every mobile-related change must be verified on a Vercel Preview deployment before merging into `main`.
3. **Production Rollout Order:**
   1. Deploy preview deployment.
   2. Install and test APK on physical Android test devices.
   3. Merge to `main`.
   4. Set `APP_MODE_ENABLED=true` in Vercel environment variables only after production verification.
