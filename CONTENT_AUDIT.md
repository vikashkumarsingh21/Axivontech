# Complete Public Website Content Audit — Axivon Technologies

**Document Version:** 1.0  
**Audit Date:** November 2026  
**Auditor:** Senior Website Copywriter & Content Strategist  
**Scope:** All visible public marketing routes, data sources, CMS database fallbacks, and microcopy.  

---

## 1. Summary of Systemic Issues Across Public Pages

1. **Unrealistic SLA & Guarantee Claims:** Multiple pages claim `"24-Hour Guaranteed Response"`, `"Dedicated SLA"`, and `"Guaranteed Quotes"` which are legally hazardous for an early-stage company.
2. **Fabricated Percentages & Vanity Metrics:** Stats like `"100% Type-Safe Focus"`, `"99.9% Reliability"`, and `"Direct"` formatted as numbers in count-up animations confuse users and damage credibility.
3. **Double Brand Titles in Metadata:** Because `src/app/layout.tsx` applies `template: "%s | Axivon Technologies"`, subpages exporting titles like `"About Us | Axivon Technologies"` render as `"About Us | Axivon Technologies | Axivon Technologies"`.
4. **Duplicate Process & Stats Sections in Server HTML:** 
   - `src/components/Process.tsx` and `src/components/service-pages/ServiceProcess.tsx` render separate desktop and mobile DOM trees using Tailwind's `hidden lg:block` and `lg:hidden`, causing crawlers to see the entire process twice.
   - The Home page renders the stats row twice (once in `Hero.tsx` and once in `WhyChooseUs.tsx`) and duplicates the `"Founder-Led Engineering"` message across `HomeTrustStrip.tsx` and `WhyChooseUs.tsx`.
5. **Accordion FAQ Answers Absent from Server HTML:** FAQ components across Home, Services, Pricing, Careers, and Contact conditionally mount answers with `<AnimatePresence>{isOpen && ...}</AnimatePresence>`. Because only item 0 (or none) starts open, search bots and non-JS clients see empty or missing answers for 80%+ of the FAQs.
6. **Outdated Geographic Stuffing & False History:** References to `"Rajkot, Gujarat"`, `"Ahmedabad"`, and founded in `"2024"` contradict the verified facts that Axivon is a remote-first company founded in 2026 with no physical city HQ.
7. **Placeholder Strings in UI:** The Pricing page renders `"[draft — edit in pricing.ts]"` on every inclusion item.
8. **Reviews Disconnect:** The Reviews page claims to feature `"genuine reviews from businesses who have worked with Axivon"`, while the site has 0 published public reviews.

---

## 2. Page-by-Page Inventory & Content Audit

### 1. Home Page (`/`)
- **Route / URL:** `/`
- **Component File:** `src/app/page.tsx`
- **Data Sources / DB Tables:** 
  - `src/lib/content/content-db.ts` (`getHomepageContent()`, `WebsiteSetting["homepage"]`, `DEFAULT_HOMEPAGE_CONTENT`)
  - `src/data/company-stats.ts`, `src/config/siteFacts.ts`
  - Components: `src/components/Hero.tsx`, `HomeTrustStrip.tsx`, `Services.tsx`, `WhyChooseUs.tsx`, `IndustriesWeServe.tsx`, `Portfolio.tsx`, `Process.tsx`, `ClientReviews.tsx`, `FAQ.tsx`, `CTA.tsx`
- **Approx. Word Count:** ~1,850 words
- **Problems Found:**
  - H1 is generic: *"We build digital products that move businesses forward"* (does not clearly state the customer benefit).
  - Stats row rendered twice in SSR: once in `Hero.tsx` and once in `WhyChooseUs.tsx`.
  - `"Founder-Led Engineering"` message duplicated in both `HomeTrustStrip.tsx` and `WhyChooseUs.tsx`.
  - `HomeTrustStrip.tsx` claims `"24-Hour Guaranteed Response"` with `"Response SLA"` badge.
  - `Process.tsx` duplicates 6 step cards across mobile and desktop DOM containers.
  - `FAQ.tsx` only server-renders 1 answer out of 8 in the HTML due to `isOpen &&` condition.
  - Mentions `"Client Reviews"` section when no public reviews exist.
- **Flagged Claims:** `"24-Hour Guaranteed Response"`, `"100% Type-Safe Focus"`, `"99.9% Reliability"`, `"Enterprise-grade"`.

---

### 2. About Page (`/about`)
- **Route / URL:** `/about`
- **Component File:** `src/app/about/page.tsx`
- **Data Sources / DB Tables:**
  - `src/lib/content/content-db.ts` (`getAboutPageContent()`, `WebsiteSetting["about"]`, `DEFAULT_ABOUT_CONTENT`)
  - `src/lib/seo/config.ts`
- **Approx. Word Count:** ~1,420 words
- **Problems Found:**
  - Double brand title: `"About Axivon Technologies | Website & Software Development Company | Axivon Technologies"`.
  - Milestones section in `content-db.ts` claims company was founded in 2024 in Rajkot, Gujarat, launched `"AXIVON ONE enterprise portal in 2025"`, and delivered custom platforms across education and real estate.
  - Fallback milestones in `about/page.tsx` claim `"First Client Project — delivered our first major enterprise software project"`.
  - Lists tools like Docker, Python, Redis, GraphQL, and Firebase as core stack when they are not in `package.json`.
  - Lacks a structured, plain-HTML "Facts" block (founded 2026, remote-first, founders, services, contact).
- **Flagged Claims:** Founded 2024, Rajkot/Gujarat founding, fake 2025 milestone, unverified client project delivery in 2026.

---

### 3. Services Hub (`/services`)
- **Route / URL:** `/services`
- **Component File:** `src/app/services/page.tsx`
- **Data Sources / DB Tables:**
  - `src/data/services.ts`, `src/lib/content/content-db.ts` (`WebsiteService` table fallback to `servicesData`)
- **Approx. Word Count:** ~1,200 words
- **Problems Found:**
  - Contains buzzwords: *"blazing-fast"*, *"robust architectures"*, *"cutting-edge"*.
  - FAQ answers partially omitted in SSR HTML due to accordion mount behavior.
  - Links to 10 services need consistent, outcome-focused one-line summaries.
- **Flagged Claims:** `"Guaranteed turnaround"`, `"SLA-backed uptime"`.

---

### 4. 10 Individual Service Pages (`/services/[slug]`)
1. **Web Development:** `src/app/services/web-development/page.tsx`
2. **Mobile App Development:** `src/app/services/mobile-app-development/page.tsx`
3. **AI Solutions:** `src/app/services/ai-solutions/page.tsx`
4. **Custom Software Development:** `src/app/services/custom-software-development/page.tsx`
5. **UI/UX Design:** `src/app/services/ui-ux-design/page.tsx`
6. **Automation:** `src/app/services/automation/page.tsx`
7. **Cloud Solutions:** `src/app/services/cloud-solutions/page.tsx`
8. **Robotics & IoT:** `src/app/services/robotics-iot/page.tsx`
9. **SEO Services:** `src/app/services/seo-services/page.tsx`
10. **Digital Marketing:** `src/app/services/digital-marketing/page.tsx`
- **Components Shared:** `ServiceHero.tsx`, `ServiceBenefits.tsx`, `ServiceProcess.tsx`, `ServiceTechStack.tsx`, `ServiceFAQ.tsx`
- **Data Source:** `src/data/services.ts` (`servicesData` array)
- **Approx. Word Count:** ~1,100 – 1,500 words per page (~13,500 words total across 10 pages)
- **Problems Found:**
  - **Severe SSR Duplicate:** In `ServiceProcess.tsx`, `DesktopTimeline` and `MobileTimeline` both map `steps` into the DOM, duplicating 5 to 6 complete step cards in server-rendered HTML.
  - **Empty FAQ HTML:** In `ServiceFAQ.tsx`, only the active accordion row renders its `<p>{item.answer}</p>` tag. The remaining 4 to 5 answers are missing from raw HTML.
  - **Double Brand Titles:** `metaTitle` strings like `"Website Development Company | Axivon Technologies"` become `"... | Axivon Technologies | Axivon Technologies"`.
  - **Filler & Jargon:** Benefits frequently use *"Blazing-Fast"*, *"OWASP best practices"*, *"GDPR-compliant data handling"*, *"Mission-critical"*.
  - **Tech Version Discrepancies:** Mentions *"Next.js 15"* while codebase is Next.js 16. Mentions tools like Contentful, Stripe, Sentry, Pinecone without project verification.
- **Flagged Claims:** GDPR compliance, OWASP certification, 99.9% uptime, 24/7 dedicated support.

---

### 5. Pricing & Packages (`/pricing`)
- **Route / URL:** `/pricing`
- **Component File:** `src/app/pricing/page.tsx`
- **Data Sources / DB Tables:**
  - `src/config/pricing.ts` (`PRICING_PACKAGES`, `PRICING_ADDONS`, `PRICING_FAQS`, `PRICING_COMPARISON_CATEGORIES`)
  - Components: `PricingCards.tsx`, `PricingComparison.tsx`, `PricingAddOns.tsx`, `PricingFAQSection.tsx`
- **Approx. Word Count:** ~2,100 words
- **Problems Found:**
  - **Placeholder Text:** Multiple strings literally read `"[draft — edit in pricing.ts]"` across inclusions, support duration, and performance specs.
  - **Double Brand Title:** `"Website Development & Software Pricing Packages | Axivon Technologies | Axivon Technologies"`.
  - **Metadata Claims & Geo-stuffing:** Description contains `"guaranteed quotes"`; keywords include `"Web Design Pricing Gujarat"`.
  - **Empty FAQ HTML:** `PricingFAQSection.tsx` hides unopened answers from server HTML.
  - **Add-On Wording:** Lists `"Gujarati / Hindi version add-on"`.
- **Flagged Claims:** `"Guaranteed quotes"`, `"99.9% uptime SLA"`, `[draft — edit in pricing.ts]` tags.

---

### 6. Industries We Serve (`/industries`)
- **Route / URL:** `/industries`
- **Component File:** `src/app/industries/page.tsx`
- **Data Sources / DB Tables:**
  - `src/lib/content/content-db.ts` (`DEFAULT_INDUSTRIES`, `WebsiteIndustry` table)
  - Components: `IndustriesHero.tsx`, `IndustriesGrid.tsx`, `CTA.tsx`
- **Approx. Word Count:** ~950 words
- **Problems Found:**
  - Double brand title in metadata.
  - Claims delivery across sectors without clarifying that projects are demonstrations or capabilities rather than confirmed commercial enterprise case studies.
  - Need realistic Indian small business & institutional problem-to-solution mappings (Clinics, Schools, Retailers, Local Services, Startups).
- **Flagged Claims:** Unverified past enterprise client deployments.

---

### 7. Portfolio Hub & Project Pages (`/portfolio`, `/portfolio/[slug]`)
- **Route / URL:** `/portfolio`, `/portfolio/axivon-technologies`, `/portfolio/krishi-drishti`, `/portfolio/jalmitra`, `/portfolio/nani-tathagat`
- **Component Files:** `src/app/portfolio/page.tsx`, `src/app/portfolio/[slug]/page.tsx`
- **Data Sources / DB Tables:**
  - `src/data/portfolio/` (`axivonProject`, `krishiProject`, `jalmitraProject`, `naniProject`, `portfolioProjects`)
  - `src/lib/content/content-db.ts` (`PortfolioProject` table fallback)
- **Approx. Word Count:** ~2,400 words total across 5 pages
- **Problems Found:**
  - Pages use terms like `"Case Study"`, `"Client Results"`, and `"Enterprise Deployment"`.
  - The projects are genuine systems built by the founders (Axivon site, Krishi Drishti IoT agriculture prototype, JalMitra solar lake cleaner, Nani Tathagat workflow tool), but should be accurately phrased as `"Projects we have built"`.
  - Avoid claiming commercial ROI numbers or external client quotes unless verified.
- **Flagged Claims:** Labeling internal or prototype builds as commercial client case studies.

---

### 8. Blog Hub & 3 Articles (`/blog`, `/blog/[slug]`)
- **Route / URL:** `/blog`, `/blog/how-to-choose-development-company-gujarat`, `/blog/ai-iot-custom-software-growth-gujarat`, `/blog/robotics-projects-guide-school-college-iot-drones`
- **Component Files:** `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`
- **Data Sources / DB Tables:**
  - `src/data/blog-posts.ts` (`BLOG_POSTS`)
  - `src/lib/content/content-db.ts` (`WebsiteArticle` table fallback)
- **Approx. Word Count:** ~8,500 words total across hub and 3 comprehensive articles
- **Problems Found:**
  - **All three articles share the identical date:** `"September 10, 2026"`.
  - **Fictitious Authors:** Blog 1 & 2 list `"Axivon Solutions Team"`; Blog 3 lists `"Axivon Robotics & Embedded Lab"`.
  - **Extreme Geo-Stuffing:** Blog 1 and 2 heavily stuff `"Rajkot"`, `"Ahmedabad"`, and `"Gujarat businesses"`, making the guides artificially localized rather than useful for any Indian business owner.
  - **Missing TL;DR:** No executive summary at top of long articles (12–25 min read).
  - **Double Brand Title:** Metadata creates duplicate brand strings.
- **Flagged Claims:** Invented lab research divisions, identical fake publish dates, geo-stuffed claims.

---

### 9. Careers Page (`/careers`, `/careers/[slug]`)
- **Route / URL:** `/careers`, `/careers/[slug]`
- **Component Files:** `src/app/careers/page.tsx`, `src/app/careers/[slug]/page.tsx`
- **Data Sources / DB Tables:**
  - `src/data/careers.ts` (`JOB_POSITIONS`)
  - `src/lib/careers/careers-db.ts`, `db.careersPageSetting`
  - Components: `CareersHero.tsx`, `CareersWhyWork.tsx`, `CareersPositions.tsx`, `CareersHiringProcess.tsx`, `CareersFAQ.tsx`
- **Approx. Word Count:** ~1,600 words
- **Problems Found:**
  - **Missing Card Description:** The `"Mentorship & Code Reviews"` pillar card has an empty or missing description in the UI.
  - **Missing Metadata:** Careers page lacks canonical URL and explicit meta description in certain fallbacks.
  - **Crawlable Loading Strings:** Server HTML outputs raw `"Loading open positions..."` and `"Loading application form..."`.
  - **Unverifiable Promises:** Promises of fast-track full-time conversion, structured daily mentorship, and client project assignments for interns.
  - **Job Count Mismatch:** `src/data/careers.ts` lists 3 positions with `status: "Open"` while verified truth is **0 open positions** currently.
- **Flagged Claims:** Guaranteed mentorship, full-time conversion promises, open job counts.

---

### 10. Contact Page (`/contact`)
- **Route / URL:** `/contact`
- **Component Files:** `src/app/contact/page.tsx`, `src/components/contact/ContactHero.tsx`, `ContactPresence.tsx`, `ContactTrust.tsx`, `ContactFAQ.tsx`, `ContactForm.tsx`
- **Data Sources / DB Tables:**
  - `src/config/contact.ts`, `src/lib/content/content-db.ts` (`getPublishedFaqs("ALL", "CONTACT")`)
- **Approx. Word Count:** ~1,100 words
- **Problems Found:**
  - `ContactPresence.tsx` shows an office photo with caption `"Modern office workspace"` when Axivon is remote-first with no physical office.
  - `ContactTrust.tsx` repeats `"24-Hour Guaranteed Response"` and `"Dedicated Technical Project Lead"`.
  - `ContactFAQ.tsx` has 4 of 5 answers missing from server HTML due to accordion `isOpen &&` condition.
  - Lacks clear guidance on what information a client should include in their message to get an accurate quote.
- **Flagged Claims:** Office building images, 24-hr guarantee, dedicated project leads.

---

### 11. Client Reviews Page (`/reviews`)
- **Route / URL:** `/reviews`
- **Component Files:** `src/app/reviews/page.tsx`, `src/components/ReviewsPageContent.tsx`
- **Data Sources / DB Tables:**
  - `db.clientReview`
- **Approx. Word Count:** ~450 words
- **Problems Found:**
  - Metadata claims: `"Read genuine reviews from businesses and individuals who have worked with Axivon Technologies."`
  - Lacks an `<h1>` heading on the page container.
  - Lacks an honest intro stating Axivon is a new company with no public reviews published yet.
  - Needs a clean empty state while keeping the submission form intact.
- **Flagged Claims:** Claiming existing public client reviews when none are published.

---

### 12. Global Shared UI, Nav & Microcopy
- **Components:**
  - `src/components/Navbar.tsx`: Need unified header navigation across all public routes. Ensure Portfolio is a clickable link everywhere, and Careers is included consistently.
  - `src/components/Footer.tsx`: Update tagline, social links, and contact channels. Remove physical address references.
  - `src/components/auth/LoginPosterCarousel.tsx`: Fallback slide claims `"Unified enterprise workspace, mission-critical operations"`. Change to grounded truth.
  - `src/lib/chatbot/knowledge-base.ts`: Update chatbot system prompts and seed entries so the AI assistant does not repeat removed claims (no 24h SLA, no Kubernetes, no Rajkot HQ).
  - `src/app/not-found.tsx`: 404 page microcopy update.
  - `src/components/legal/CookieConsentBanner.tsx`: Clear, polite consent text.
