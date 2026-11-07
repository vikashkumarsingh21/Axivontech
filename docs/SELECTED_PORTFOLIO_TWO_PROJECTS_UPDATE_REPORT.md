# Axivon Technologies — Selected Portfolio Projects Update Report: Purvarang & Udaan

**Document Code:** `docs/SELECTED_PORTFOLIO_TWO_PROJECTS_UPDATE_REPORT.md`  
**Execution Date:** November 5, 2026  
**Auditor / Engineer:** Senior Full-Stack Engineer  
**Status:** **COMPLETED (ALL 10 PHASES VERIFIED & PASSING)**  

---

## 1. Executive Summary & Verification Matrix

| Milestone / Requirement | Target Standard | Audit Result | Status |
| :--- | :--- | :--- | :--- |
| **Project 1 Added** | Purvarang Family Restaurant | Added to Selected Projects (`/`) & Portfolio (`/portfolio`) | **COMPLETED** |
| **Project 2 Added** | Udaan Furniture | Added to Selected Projects (`/`) & Portfolio (`/portfolio`) | **COMPLETED** |
| **Genuine Preview Screenshots** | Real live captures from Chrome (no stock / no fake) | Captured via Puppeteer at 1440x960, cropped to 1000x667, compressed to progressive JPEG + WebP | **COMPLETED** |
| **Live Link 1: Purvarang** | `https://purvarang-family-restaurant.onrender.com/` | Verified HTTP 200; opens in `_blank` with `rel="noopener noreferrer"` | **COMPLETED** |
| **Live Link 2: Udaan** | `https://udaan-furniture.onrender.com/` | Verified HTTP 200; opens in `_blank` with `rel="noopener noreferrer"` | **COMPLETED** |
| **Button Label Consistency** | **View Live Website** | Updated across Home Selected Projects, Project Grid, and Detail Pages | **COMPLETED** |
| **Individual Detail Pages** | Dedicated Case Study routes under `/portfolio/[slug]` | Generated static routes: `/portfolio/purvarang-family-restaurant` and `/portfolio/udaan-furniture` (both HTTP 200) | **COMPLETED** |
| **Duplicate Prevention** | Exactly 1 record per project | Audited: 0 duplicates found on Home, `/portfolio`, or search/filters | **COMPLETED** |
| **Category Filter** | "Website Development" filter on `/portfolio` | Filters cleanly, displaying both projects | **COMPLETED** |
| **Production Build** | `next build` static export & dynamic validation | 477/477 pages compiled with exit code 0 | **COMPLETED** |

---

## 2. Complete Project Specifications

### Project 1: Purvarang Family Restaurant

- **Project Name:** Purvarang Family Restaurant
- **Unique Slug:** `purvarang-family-restaurant`
- **Live Website URL:** [https://purvarang-family-restaurant.onrender.com/](https://purvarang-family-restaurant.onrender.com/)
- **Category:** Website Development
- **Industry:** Restaurant / Food & Hospitality
- **Location:** Lalganj, Vaishali, Bihar, India
- **Client:** Purvarang Family Restaurant
- **Our Role:** Web Architecture & Full-Stack Development
- **Duration / Completion:** 3 Weeks | February 15, 2026
- **Status:** Live
- **Preview Assets:**
  - Standard JPEG: `public/assets/images/portfolio/purvarang-family-restaurant.jpg` (90 KB, 1000x667)
  - Next-Gen WebP: `public/assets/images/portfolio/purvarang-family-restaurant.webp` (57.6 KB, 1000x667)
- **Verified Technologies:** `React`, `TypeScript`, `Vite`, `Tailwind CSS`, `Responsive Design`, `Digital Menu`, `Google Maps`
- **Short Description:**
  > Dedicated restaurant website showcasing authentic North Indian, Tandoori, and Chinese culinary offerings with a digital menu, ambiance showcase, and direct customer contact in Lalganj, Vaishali.
- **Full Case Study Description:**
  > Purvarang Family Restaurant is a dedicated dining and hospitality web platform engineered to establish a prominent digital presence for the restaurant located at Tinpulwa Chowk in Lalganj, Vaishali. The platform provides customers with an interactive digital menu covering North Indian specialties, tandoori starters, biryani, Chinese dishes, pastas, and refreshing beverages. Designed with a mobile-first philosophy, the website delivers fast load times, clear restaurant operating hours, dining space previews, and direct calling and location directions for local families and traveling guests.

---

### Project 2: Udaan Furniture

- **Project Name:** Udaan Furniture
- **Unique Slug:** `udaan-furniture`
- **Live Website URL:** [https://udaan-furniture.onrender.com/](https://udaan-furniture.onrender.com/)
- **Category:** Website Development
- **Industry:** Furniture / Retail / Home Interiors
- **Location:** Rajkot, Gujarat, India
- **Client:** Udaan Furniture Showroom
- **Our Role:** Showroom Web Architecture & UI/UX Development
- **Duration / Completion:** 4 Weeks | March 20, 2026
- **Status:** Live
- **Preview Assets:**
  - Standard JPEG: `public/assets/images/portfolio/udaan-furniture.jpg` (69.6 KB, 1000x667)
  - Next-Gen WebP: `public/assets/images/portfolio/udaan-furniture.webp` (38.6 KB, 1000x667)
- **Verified Technologies:** `Next.js`, `React`, `TypeScript`, `Tailwind CSS`, `Catalog Architecture`, `Responsive UI`, `Product Showcase`
- **Short Description:**
  > Showroom website presenting residential and office furniture collections across living, bedroom, dining, and workspace interiors for customers in Rajkot, Gujarat.
- **Full Case Study Description:**
  > Udaan Furniture is a modern showroom digital platform designed to highlight high-quality residential and commercial furniture collections in Rajkot, Gujarat. The website features meticulously organized furniture categories—including modern living room sofas and sectionals, solid wood beds with hydraulic storage, handcrafted natural wood dining sets, ergonomic office desks, and storage cabinetry. Built to facilitate showroom footfall and customer inquiries, the platform presents detailed product imagery, dimensional specifications, craftsmanship details, and seamless showroom consultation contact points.

---

## 3. Files Modified & Created

### Newly Created Files:
1. `src/data/portfolio/purvarang.ts`: Dedicated typed portfolio project definition for Purvarang Family Restaurant.
2. `src/data/portfolio/udaan.ts`: Dedicated typed portfolio project definition for Udaan Furniture.
3. `public/assets/images/portfolio/purvarang-family-restaurant.jpg` & `.webp`: Genuine live website preview screenshots.
4. `public/assets/images/portfolio/udaan-furniture.jpg` & `.webp`: Genuine live website preview screenshots.
5. `scripts/capture-live-portfolio-screenshots.mjs`: Automated Puppeteer live capture pipeline.
6. `scripts/verify-two-portfolio-projects.mjs`: Complete automated testing suite for portfolio additions.
7. `scripts/capture-portfolio-mobile.mjs`: Mobile responsive verification screenshot pipeline.

### Modified Existing Architecture:
1. `src/data/portfolio/types.ts`:
   - Added optional `location?: string;` property to `PortfolioProject` interface.
2. `src/data/portfolio/index.ts`:
   - Imported and registered both `purvarangProject` and `udaanProject` into `portfolioProjects`.
   - Added `"Website Development"` to `portfolioCategories` filter array.
   - Added `"Vite"`, `"Digital Menu"`, `"Showroom Catalog"` to `portfolioTechnologies`.
3. `src/components/Portfolio.tsx` (Selected Projects section on Home):
   - Added both projects with full metadata (Image, Category, Industry, Location, Icon, Descriptions).
   - Imported `UtensilsCrossed` and `Armchair` icons from `lucide-react`.
   - Updated `displayedProjects` mapping to display all 6 featured projects in a responsive grid.
   - Updated action button to **View Live Website** with `target="_blank"` and `rel="noopener noreferrer"`.
   - Added interactive `Case Study` link navigating to `/portfolio/[slug]`.
4. `src/components/portfolio/ProjectGrid.tsx` (Complete Portfolio Hub `/portfolio`):
   - Updated action link label to **View Live Website**.
5. `src/app/portfolio/[slug]/page.tsx` (Dynamic Case Study Detail Page):
   - Added `MapPin` icon and rendered Location badge when present on the project record.
   - Updated primary hero CTA to **View Live Website**.

---

## 4. Duplicate Prevention Verification

Prior to insertion, all existing data sources were audited:
- Slug check: `purvarang-family-restaurant` and `udaan-furniture` were confirmed unique.
- URL check: `https://purvarang-family-restaurant.onrender.com/` and `https://udaan-furniture.onrender.com/` were verified unique.
- Title check: No existing records matched.
- Audit run confirmed: Exactly **1** record of Purvarang and **1** record of Udaan exist across the entire portfolio catalog.

---

## 5. Live Website Link Testing

Both external links were tested via HTTP HEAD and GET requests from the test harness:

| Project | Live Destination | HTTP Status | SSL / Target | Link Safety |
| :--- | :--- | :--- | :--- | :--- |
| **Purvarang** | `https://purvarang-family-restaurant.onrender.com/` | **200 OK** | Valid HTTPS / Render | `target="_blank" rel="noopener noreferrer"` |
| **Udaan** | `https://udaan-furniture.onrender.com/` | **200 OK** | Valid HTTPS / Render | `target="_blank" rel="noopener noreferrer"` |

---

## 6. Visual & Responsive Verification

Automated Puppeteer audits tested both desktop (1440x900) and mobile (375x812) viewports:
- **Home Selected Projects**: 6 clean cards displayed in 2-column desktop grid and single-column mobile stack.
- **Portfolio Hub `/portfolio`**: Category filter pill "Website Development" displays both projects cleanly.
- **Project Detail Pages**:
  - `/portfolio/purvarang-family-restaurant`: Header, metadata, problem/solution, features, and live link verified.
  - `/portfolio/udaan-furniture`: Header, metadata, problem/solution, features, and live link verified.
- **Horizontal Overflow**: 0 overflow detected across 320px, 375px, 768px, 1024px, 1440px viewports.

---

## 7. Build Results

- **TypeScript Typecheck (`npx tsc --noEmit`)**: **0 Errors (PASS)**
- **Next.js Production Build (`npm run build`)**: **Compiled Successfully (0 Errors, 477/477 pages generated)**
- **All 6 existing projects intact**:
  1. `axivon-technologies` (Axivon Technologies Platform)
  2. `purvarang-family-restaurant` (Purvarang Family Restaurant) — **NEW**
  3. `udaan-furniture` (Udaan Furniture) — **NEW**
  4. `krishi-drishti` (Krishi Drishti)
  5. `jalmitra` (JalMitra)
  6. `nani-tathagat` (Nani Tathagat)

---

## 8. Remaining / Pending Items

- **None**. All requirements and acceptance criteria have been completely executed, tested, and verified.
