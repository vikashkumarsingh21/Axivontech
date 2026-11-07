# Axivon Technologies — Media & Licence Audit Report

**Date of Audit:** November 5, 2026  
**Auditor:** QA & Release Engineering Lead  
**Audit Status:** PASSED (100% Verified, Clean & Licensed)  
**Media Compliance Command:** `npm run media:check` -> Exit Code 0  

---

## 1. Compliance Executive Summary

| Audit Item | Standard Required | Audit Result | Status |
| :--- | :--- | :--- | :--- |
| **Unlicensed Media** | 0 unlicensed or unverified assets | 0 detected | **PASS** |
| **Google Images Scraping** | 0 scraped assets | 0 detected | **PASS** |
| **Stock Person Misrepresentation** | 0 stock people as team or clients | 0 detected; real founder portraits only | **PASS** |
| **Asset Reuse Across Pages** | Each asset used exactly once | Every asset assigned to exactly 1 slot | **PASS** |
| **File Budget Compliance** | Max 200 KB per asset (hero <= 200 KB) | Max image size: 166.1 KB (AVIF/WebP: 38–71 KB) | **PASS** |
| **Sibling Formats** | Modern WebP and AVIF optimized | 100% paired with `.webp` & `.avif` | **PASS** |

---

## 2. Complete Asset & Licence Register Table

| ID | File Path | Source Site & URL | Author & Copyright Holder | Licence Name & Terms URL | Verified Date | Used On (Page & Slot) | SHA-256 Digest |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `hero-krishi-shot` | `public/media/portfolio/krishi-drishti.jpg` | Axivon Platform (`https://axivontech.in`) | Axivon Technologies | Proprietary / Own Product (`https://axivontech.in/terms`) | 2026-11-05 | `/` (`#hero-krishi`) | `c5da92d4cf...` |
| `work-jalmitra-shot` | `public/media/portfolio/jalmitra.jpg` | Axivon Platform (`https://axivontech.in`) | Axivon Technologies | Proprietary / Own Product (`https://axivontech.in/terms`) | 2026-11-05 | `/` (`#work-jalmitra`) | `63a814e7d1...` |
| `work-nani-shot` | `public/media/portfolio/nani-tathagat.jpg` | Axivon Platform (`https://axivontech.in`) | Axivon Technologies | Proprietary / Own Product (`https://axivontech.in/terms`) | 2026-11-05 | `/` (`#work-nani`) | `1d501aa693...` |
| `work-axivon-shot` | `public/media/portfolio/axivon-studio.jpg` | Axivon Platform (`https://axivontech.in`) | Axivon Technologies | Proprietary / Own Product (`https://axivontech.in/terms`) | 2026-11-05 | `/` (`#work-axivon`) | `04e2b48c9d...` |
| `founder-vikash-home` | `public/media/team/vikash-kumar.jpg` | Axivon Internal Archive (`https://axivontech.in`) | Axivon Technologies | Proprietary / Own Founder Portrait (`https://axivontech.in/terms`) | 2026-11-05 | `/` (`#why-axivon-vikash`) | `2add39e7a4...` |
| `founder-rokhiya-home` | `public/media/team/rokhiya-khanam.jpg` | Axivon Internal Archive (`https://axivontech.in`) | Axivon Technologies | Proprietary / Own Founder Portrait (`https://axivontech.in/terms`) | 2026-11-05 | `/` (`#why-axivon-rokhiya`) | `9032f178f8...` |

---

## 3. Storage & Delivery Verification

1. **Format Optimization**: Every asset is delivered through Next.js `next/image` with auto-negotiated WebP and AVIF headers (`image/webp`, `image/avif`).
2. **Preloading**: Only the hero LCP asset (`/media/portfolio/krishi-drishti.webp`) is preloaded with `priority`.
3. **Lazy Loading**: All secondary and showcase assets use default lazy loading (`loading="lazy"`).
