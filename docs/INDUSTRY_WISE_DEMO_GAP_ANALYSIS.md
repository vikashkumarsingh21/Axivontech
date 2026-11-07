# Axivon Technologies — Industry-Wise Demo Gap Analysis

**Document Code:** `docs/INDUSTRY_WISE_DEMO_GAP_ANALYSIS.md`  
**Execution Date:** November 5, 2026  
**Author:** Senior Front-End Architect & Systems Auditor  
**Audit Scope:** Live Website (`https://axivontech.in/`), Local Repository (`src/app/demo-projects`, `src/data/demo-projects.ts`, `src/components/demo-projects`), Client Websites (`https://purvarang-family-restaurant.onrender.com/`, `https://udaan-furniture.onrender.com/`)  
**Status:** **AUDITED & COMPILED**

---

## 1. Executive Summary

Axivon Technologies provides end-to-end digital engineering and custom software development across diverse industry sectors. Potential clients visiting the website—ranging from educational institution trustees and hospital directors to property developers, hoteliers, and retail showroom owners—require realistic, industry-tailored demonstrations to evaluate AxivonTech's capabilities for their specific domains.

Following a comprehensive audit of the live website (`https://axivontech.in/`) and the full source repository:
1. **Existing Demo Infrastructure:** AxivonTech maintains an established interactive demo ecosystem rooted at `/demo-projects`, backed by `src/data/demo-projects.ts` (defining 47 demo concepts) and modular components in `src/components/demo-projects/`.
2. **Currently Live Demos (8 Active):**
   - `medicare` (Healthcare / Hospital & Clinic)
   - `edusmart` (Higher Education / College & Academy)
   - `foodiehub` (Food & Restaurant Showcase)
   - `fitzone` (Fitness & Athletic Club 3D Experience)
   - `novacart` (E-commerce Multi-Page Store)
   - `estatevista` (Real Estate & Architectural Prop-Tech)
   - `corporate-pro` (Enterprise Consulting & Corporate)
   - `leadpilot` (B2B SaaS CRM & Deal Pipeline)
3. **Existing Client Websites Requiring Demo Integration (2 Verified Live):**
   - **Purvarang Family Restaurant** (`https://purvarang-family-restaurant.onrender.com/`) — Live restaurant website with digital menu and location navigation in Lalganj, Vaishali.
   - **Udaan Furniture** (`https://udaan-furniture.onrender.com/`) — Live furniture showroom website showcasing residential and office interiors in Rajkot, Gujarat.
4. **Primary Gaps Identified:**
   - **K-12 School Education:** `edusmart` currently represents a university-level academy ("Aurevia Academy"). School owners (CBSE/ICSE/K-12 schools) lack a realistic school website demonstration with Principal's Message, Classes I–XII, school admissions, board affiliation, and campus life.
   - **Hotels & Hospitality / Resorts:** Currently 0 live demos (`staysphere` is marked "Coming Soon" with no routes or assets). Hoteliers and resort owners have no interactive showcase.
   - **Client Live Website Integration:** Purvarang Family Restaurant and Udaan Furniture exist in `/portfolio` but are absent from the `/demo-projects` catalogue.

---

## 2. Complete Existing Demo Inventory

| Demo Name | Industry | Internal Route | Live Status | External URL | Design Standard | Multi-Page / Functional Scope | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MediCare** | Healthcare | `/demo-projects/healthcare/medicare` | Live Demo | Local Route | Medical Clean (Soft Teal / White) | Departments, Doctors, OPD, Appointment Modal, FAQ, Patient Info | **ALREADY AVAILABLE** |
| **EduSmart (Aurevia)** | Education (Higher Ed) | `/demo-projects/education/edusmart` | Live Demo | Local Route | Academic Editorial (Aubergine / Ivory) | Degree Programs, Curriculum Modal, Faculty, Campus Life, Admissions | **ALREADY AVAILABLE** |
| **FoodieHub** | Restaurants & Food | `/demo-projects/food/foodiehub` | Live Demo | Local Route | Culinary Dark (Terracotta / Charcoal) | Digital Menu, Chef Specials, Table Reservation Modal, Reviews | **ALREADY AVAILABLE** |
| **FitZone** | Fitness & Wellness | `/demo-projects/fitness/fitzone` | Live Demo | Local Route | Kinetic 3D (Coral / Graphite) | 3D Hero, 7-Day Timetable, Trainer Bios, Split Planner, VIP Trial Form | **ALREADY AVAILABLE** |
| **NovaCart** | E-commerce | `/demo-projects/ecommerce/novacart` | Live Demo | Local Route | Minimal Lifestyle (Lime / Slate) | Full Multi-Route Shop, Dynamic Cart, Wishlist, Checkout Flow, Search | **ALREADY AVAILABLE** |
| **EstateVista** | Real Estate | `/demo-projects/real-estate/estatevista` | Live Demo | Local Route | Architectural Luxury (Deep Emerald / Ivory) | CAD Floor Plans, Multi-Facet Filters, Property Modal, Mortgage Tool | **ALREADY AVAILABLE** |
| **CorporatePro** | Business & Corporate | `/demo-projects/business/corporatepro` | Live Demo | Local Route | Executive Enterprise (Forest / Slate) | Pillars, Leadership Dossiers, Case Studies, Contact Inquiries | **ALREADY AVAILABLE** |
| **LeadPilot** | Dashboards & Portals (SaaS) | `/demo-projects/saas/leadpilot` | Live Demo | Local Route | Tech Cockpit (Mint / Charcoal) | Full Multi-Route CRM: Kanban Deals, Leads, Contacts, Tasks, Reports | **ALREADY AVAILABLE** |
| **Purvarang Family Restaurant** | Restaurants & Food | `/portfolio/purvarang-family-restaurant` | Live Client | `https://purvarang-family-restaurant.onrender.com/` | Hospitality / Clean | Digital Menu, One-Tap Calling, Maps, Ambiance, North Indian/Tandoor | **NEEDS DEMO CATALOGUE INTEGRATION** |
| **Udaan Furniture** | Furniture & Interiors | `/portfolio/udaan-furniture` | Live Client | `https://udaan-furniture.onrender.com/` | Modern Showroom / Retail | Living, Bedroom, Dining, Office Collections, Showroom Location | **NEEDS DEMO CATALOGUE INTEGRATION** |
| **StaySphere** | Hotels & Travel | None | Coming Soon | None | Placeholder | Concept entry only in `DEMO_PROJECTS` (no routes or code) | **MISSING** |
| **ConsultEdge** | Professional Services | None | Coming Soon | None | Placeholder | Concept entry only in `DEMO_PROJECTS` (no routes or code) | **MISSING** |
| **AutoCare Pro** | Automotive | None | Coming Soon | None | Placeholder | Concept entry only in `DEMO_PROJECTS` (no routes or code) | **MISSING** |
| **GlowStudio** | Beauty & Salon | None | Coming Soon | None | Placeholder | Concept entry only in `DEMO_PROJECTS` (no routes or code) | **MISSING** |
| **TripTrail** | Travel & Tourism | None | Coming Soon | None | Placeholder | Concept entry only in `DEMO_PROJECTS` (no routes or code) | **MISSING** |

---

## 3. Evaluation of 15 Key Industry Categories

| # | Industry Category | Audit Assessment | Live Evidence & Existing Asset Analysis | Recommendation |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Education & K-12 Schools** | **MISSING** | `edusmart` serves university degrees (B.Sc., M.Sc.). Indian school trustees need CBSE/ICSE K-12 structure, Principal's message, Class I-XII curriculum, house system, academic calendar, and admission inquiry. | **BUILD NEW:** "Oakfield International School" |
| **2** | **Colleges & Universities** | **ALREADY AVAILABLE** | Covered by `edusmart` (Aurevia Academy) with curriculum pathways, accreditation details, and faculty rosters. | Preserve existing implementation. |
| **3** | **Healthcare & Hospitals** | **ALREADY AVAILABLE** | Covered by `medicare` with multidisciplinary departments, OPD consultation timetables, doctor profiles, and appointment request flow. | Preserve existing implementation. |
| **4** | **Doctor & Clinic Websites** | **ALREADY AVAILABLE** | Covered under `medicare` clinical division and doctor booking interface. | Preserve existing implementation. |
| **5** | **Real Estate & Property** | **ALREADY AVAILABLE** | Covered by `estatevista` with vector CAD floor plans, mortgage modeling, luxury listing cards, and private tour booking. | Preserve existing implementation. |
| **6** | **Furniture & Interior Design** | **NEEDS INTEGRATION** | **Udaan Furniture** is a verified live client website (`https://udaan-furniture.onrender.com/`) with showroom furniture collections. Currently omitted from demo catalogue. | **INTEGRATE:** Add Udaan Furniture to `DEMO_PROJECTS` with live link. |
| **7** | **E-Commerce & Retail** | **ALREADY AVAILABLE** | Covered by `novacart` with full 10-route e-commerce shop, cart persistence, wishlist, product details, and simulated checkout. | Preserve existing implementation. |
| **8** | **Restaurant & Food Businesses** | **PARTIALLY AVAILABLE** | `foodiehub` provides a fine-dining showcase, while **Purvarang Family Restaurant** (`https://purvarang-family-restaurant.onrender.com/`) is a live client website. Purvarang is missing from demo catalogue. | **INTEGRATE:** Add Purvarang to `DEMO_PROJECTS` alongside FoodieHub. |
| **9** | **Hotels & Hospitality / Resorts** | **MISSING** | `staysphere` is merely a "Coming Soon" placeholder without routes, pages, or components. Hoteliers and retreat owners have no demo. | **BUILD NEW:** "Solara Retreat & Resort" |
| **10** | **Fitness & Wellness** | **ALREADY AVAILABLE** | Covered by `fitzone` with 3D perspective hero, weekly timetable, trainer bio modals, AI workout split planner, and VIP trial pass booking. | Preserve existing implementation. |
| **11** | **Business & Corporate** | **ALREADY AVAILABLE** | Covered by `corporate-pro` (Northline Advisory) with service pillars, leadership dossiers, and investor governance. | Preserve existing implementation. |
| **12** | **B2B SaaS & Business Software** | **ALREADY AVAILABLE** | Covered by `leadpilot` with 9 full sub-routes (Kanban deals, leads, contacts, tasks, analytics). | Preserve existing implementation. |
| **13** | **Professional Services** | **PARTIALLY AVAILABLE** | Corporate consulting is partially covered by `corporate-pro`. Accounting/Legal can be scheduled as secondary priority. | Secondary Priority. |
| **14** | **Travel & Tourism** | **PARTIALLY AVAILABLE** | Eco-tourism and leisure travel are directly served by luxury resort/retreat demonstrations. | Addressed through Solara Retreat. |
| **15** | **Dashboards & Portals** | **ALREADY AVAILABLE** | Covered by `leadpilot` and portal administration modules. | Preserve existing implementation. |

---

## 4. Gap Closure Strategy & Roadmap

To establish a comprehensive industry-wise demo ecosystem:
1. **Develop Demo A (Priority 1): Oakfield International School**
   - Brand: Oakfield International School
   - Industry: Education (K-12 School & CBSE/ICSE Institution)
   - Visual Direction: Forest Green (`#143d30`), Warm Ivory (`#faf8f4`), Muted Royal Gold (`#c8a24d`), Natural Campus Photography.
   - Route: `/demo-projects/education/oakfield`
   - Complete multi-section/multi-tab website: Principal's Message, Academics (Nursery to Class XII), Admissions with validated enquiry form, Faculty profiles, Campus facilities, Achievements, News/Notices, and Contact.
2. **Develop Demo E (Priority 1): Solara Retreat & Resort**
   - Brand: Solara Retreat & Resort
   - Industry: Hotels & Hospitality (Luxury Eco-Resort & Wellness Retreat)
   - Visual Direction: Sand Beige (`#f6f2ec`), Deep Forest Green (`#1f2e23`), Terracotta/Bronze (`#b57a42`), Editorial Hospitality Photography.
   - Route: `/demo-projects/hospitality/solara`
   - Complete multi-section/multi-tab website: Rooms & Suites showcase with amenities, Farm-to-Table Dining, Spa & Wellness, Curated Experiences, Interactive Reservation Request with date/guest picker.
3. **Integrate Verified Client Websites into Demo Catalogue:**
   - **Purvarang Family Restaurant** (`Restaurants & Food`) -> Live Demo pointing to `https://purvarang-family-restaurant.onrender.com/`.
   - **Udaan Furniture** (`Furniture & Interiors`) -> Live Demo pointing to `https://udaan-furniture.onrender.com/`.
4. **Upgrade Main Demo Collection Page (`/demo-projects`):**
   - Update Hero copy to exact user specifications ("Explore Website Demos for Your Business").
   - Filter pills show active domains with accurate counts.
   - Dual CTAs ("View Demo" and "Request Similar Website").
   - External demo links open in new tabs safely.
