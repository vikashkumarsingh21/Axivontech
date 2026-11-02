# Axivon Technologies — Baseline Snapshot (Pre-Mobile Foundation)

**Branch:** `mobile-foundation` (branched clean from `main` @ `0f2d433`)  
**Timestamp:** 2026-11-02  
**Platform:** Next.js 16.2.9 (Turbopack), React 19.2.4, Prisma 5.22.0, Tailwind v4  
**Production Origin:** `https://axivontech.in` (Vercel)  
**Local Test Origin:** `http://localhost:3000`  

---

## 1. Route List & First Load JS Bundle Sizes

Compiled cleanly with Turbopack across 445 application routes (static pages, SSG paths, and server-rendered dynamic routes). Below are the exact transferred JS metrics for key routes measured on cold initial page load with real browser execution:

| Route | Script Count | Uncompressed JS (Bytes) | First Load JS (Gzip Bytes) | First Load JS (Gzip KB) | Route Category |
|---|---|---|---|---|---|
| `/` (Homepage) | 27 | 1,711,371 B | 446,407 B | **435.94 KB** | Public Static (○) |
| `/login` | 24 | 2,346,264 B | 742,256 B | **724.86 KB** | Public Static (○) |
| `/services` | 27 | 1,711,371 B | 446,407 B | **435.94 KB** | Public Static (○) |
| `/blog` | 28 | 1,786,759 B | 467,260 B | **456.31 KB** | Public Static (○) |
| `/admin/dashboard` | 18 | 1,286,736 B | 318,336 B | **310.88 KB** | Authenticated Dynamic (ƒ) |
| `/employee/dashboard` | 18 | 1,272,162 B | 315,464 B | **308.07 KB** | Authenticated Dynamic (ƒ) |
| `/broker/dashboard` | 18 | 1,281,189 B | 318,639 B | **311.17 KB** | Authenticated Dynamic (ƒ) |
| `/client/dashboard` | 18 | 1,265,799 B | 314,513 B | **307.14 KB** | Authenticated Dynamic (ƒ) |
| `/executive/dashboard` | 20 | 1,312,765 B | 328,576 B | **320.88 KB** | Authenticated Dynamic (ƒ) |

*Key finding:* The shared base chunk footprint across all routes is ~307 KB gzip. `/login` carries additional weight (~724 KB) due to the Turnstile / CAPTCHA client libraries and auth UI modules.

---

## 2. Lighthouse Mobile Audit

Audits performed using Chrome Headless with Mobile Device emulation (Moto G / throttling):

| Page | Performance | Accessibility | SEO | Notes |
|---|---|---|---|---|
| **`/` (Homepage)** | **54** | **98** | **100** | High accessibility and perfect SEO; performance throttled by initial animation/framer-motion and hero script bundles. |
| **`/login`** | **55** | **95** | **54** | SEO is intentionally 54 due to `noindex` and disallow headers for auth security. |

---

## 3. Raw HTML Snapshots (10 Public Pages)

Captured raw server HTML (no client-side JS hydration) including all head tags, meta properties, and JSON-LD schemas. Stored in `docs/mobile/baseline/html/` for regression diffing:

1. `home.html` (`/`): **296,938 bytes**
2. `login.html` (`/login`): **33,451 bytes**
3. `services.html` (`/services`): **176,008 bytes**
4. `services-web-dev.html` (`/services/web-development`): **255,961 bytes**
5. `about.html` (`/about`): **99,304 bytes**
6. `pricing.html` (`/pricing`): **154,169 bytes**
7. `contact.html` (`/contact`): **77,302 bytes**
8. `careers.html` (`/careers`): **128,039 bytes**
9. `privacy-policy.html` (`/privacy-policy`): **82,536 bytes**
10. `terms-and-conditions.html` (`/terms-and-conditions`): **73,667 bytes**

---

## 4. Role Screenshots (1440px Desktop)

Logged into each verified account from `TEST_CREDENTIALS.md` with dev rate-limit bypass (`x-test-mode: true`, `TEST_MODE=true`). Screenshots captured at 1440x900 viewport resolution and saved in `docs/mobile/baseline/screenshots/`:

| Role | Test User Email | Target Page | Screenshot File | Size |
|---|---|---|---|---|
| **ADMIN** | `admin@axivon.dev` | `/admin/dashboard` | `admin-dashboard-1440px.png` | 151 KB |
| **EMPLOYEE** | `qa.employee@axivon.dev` | `/employee/dashboard` | `employee-dashboard-1440px.png` | 157 KB |
| **BROKER** | `qa.broker@axivon.dev` | `/broker/dashboard` | `broker-dashboard-1440px.png` | 9 KB |
| **CLIENT** | `qa.client@axivon.dev` | `/client/dashboard` | `client-dashboard-1440px.png` | 9 KB |
| **FOUNDER** | `founder@axivon.dev` | `/executive/dashboard` | `founder-dashboard-1440px.png` | 93 KB |

---

## 5. Existing Tests & API Smoke Verification

### Vitest Test Suite Baseline
- **Total Test Files:** 63 (45 passed, 18 failed pre-existing in `main`)
- **Total Tests:** 764 (696 passed, 68 failed pre-existing in `main`)
- *Note:* Pre-existing failures are related to recent mock fixtures in CRM integration and specific copy expectation differences in `website-reliability-step1`. All core system unit tests pass.

### Authentication Smoke Tests (5 Roles)
| Role | Test Email | Status Code | Session Cookie Generated | Result |
|---|---|---|---|---|
| `ADMIN` | `admin@axivon.dev` | `200 OK` | `axivon_session` issued | **PASS** |
| `FOUNDER` | `founder@axivon.dev` | `200 OK` | `axivon_session` issued | **PASS** |
| `EMPLOYEE` | `qa.employee@axivon.dev` | `200 OK` | `axivon_session` issued | **PASS** |
| `BROKER` | `qa.broker@axivon.dev` | `200 OK` | `axivon_session` issued | **PASS** |
| `CLIENT` | `qa.client@axivon.dev` | `200 OK` | `axivon_session` issued | **PASS** |

### Authenticated Read API Smoke Tests
| Role | Target Read API Endpoint | Status Code | Result |
|---|---|---|---|
| `ADMIN` | `GET /api/v1/admin/employees` | `200 OK` | **PASS** |
| `FOUNDER` | `GET /api/v1/executive/approvals` | `200 OK` | **PASS** |
| `EMPLOYEE` | `GET /api/v1/employee/attendance` | `200 OK` | **PASS** |
| `BROKER` | `GET /api/v1/broker/profile` | `200 OK` | **PASS** |
| `CLIENT` | `GET /api/v1/client/me` | `200 OK` | **PASS** |

---

## 6. Response Headers (Caching & Compression)

Recorded directly from live Vercel production deployment (`https://axivontech.in`) and confirmed locally:

| Resource Type | Example URL | `Cache-Control` | `Content-Encoding` | Status |
|---|---|---|---|---|
| **Static JS Bundles** | `/_next/static/chunks/*.js` | `public, max-age=31536000, immutable` | `br` (Brotli) | 200 OK |
| **Optimized Images** | `/_next/image?url=...` | `public, max-age=31536000, immutable` | `br` / gzip (AVIF/WebP) | 200 OK |
| **Fonts** | `https://fonts.googleapis.com/...` | `public, max-age=86400` | gzip | 200 OK |
| **HTML Pages** | `/`, `/login` | `public, max-age=0, must-revalidate` | `br` (Brotli) | 200 OK |
| **Authenticated APIs** | `/api/v1/admin/employees` | `no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0` | None (Direct JSON) | 200 OK |
| **Broker/Partner APIs** | `/api/v1/broker/profile` | `no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0` | None (Direct JSON) | 200 OK |

**Caching Integrity Rule Verified:** Authenticated APIs strictly enforce `no-store, no-cache, max-age=0`. Under no circumstances will dynamic financial, attendance, or approval data be cached.
