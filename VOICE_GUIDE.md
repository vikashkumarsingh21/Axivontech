# Voice & Content Style Guide — Axivon Technologies

**Document Version:** 1.0  
**Effective Date:** November 2026  
**Audience:** Website Copywriters, Content Strategists, and Engineers  

---

## 1. Brand Mission & Core Identity

Axivon Technologies is a remote-first software development and digital engineering company founded in 2026 by Vikash Kumar and P. Rokhiya Khanam. We design and build modern websites, mobile apps, AI solutions, and custom software for small and growing businesses, startups, schools, clinics, and institutions across India and internationally.

Our brand character is:
- **Grounded & Honest:** We state what we actually do, how we do it, and what it costs in time and effort. We never fabricate numbers, clients, awards, or SLAs.
- **Approachable & Clear:** We speak to business owners in plain, everyday language first. Technical decisions are explained by the practical value they deliver.
- **Founder-Led & Accountable:** Clients collaborate directly with the founders and the engineers writing their software—no middlemen, no sales puffery.

---

## 2. Target Audience & Reader Persona

Our primary reader is a **non-technical business owner, manager, founder, or institutional director** in India or abroad:
- **Who they are:** Managing a clinic, coaching academy, manufacturing unit, retail store, professional consultancy, or early-stage startup.
- **What they care about:** Will this website bring me genuine inquiries? Will this software make my daily operations easier? Will it work reliably on mobile phones? How much will it cost, and when will it go live?
- **What repels them:** Silicon Valley buzzwords, vague corporate promises ("unlock synergies"), unreadable engineering jargon, and confusing pricing schemes.

**Hierarchy Rule:**
1. **Top of the page:** The customer’s operational outcome in plain Indian-English.
2. **Middle of the page:** Concrete deliverables, step-by-step process, timelines, and examples of what we build.
3. **Bottom of the page:** Technical stack explained in one simple sentence, honest FAQs, and a direct call to action.

---

## 3. Writing Rules & Sentence Mechanics

1. **Short, Punchy Sentences:**
   - Keep average sentence length between **15 and 18 words**.
   - Maximum paragraph length: **4 sentences** or **75 words**. If a paragraph exceeds 80 words, break it up.
2. **Active Voice Always:**
   - *Weak:* "Modern web platforms are engineered by our team to maximize conversions."
   - *Strong:* "We build fast websites that help you turn visitors into paying customers."
3. **Benefit First, Method Second:**
   - State the business advantage before naming the technology.
   - *Example:* "Your pages load quickly on 4G mobile networks because we optimize images and code using Next.js."
4. **Specific Nouns & Verified Facts Only:**
   - Never say "hundreds of satisfied clients" or "proven track record" when we have 4 demo projects built.
   - Say: "Projects we have built," "4 live full-stack projects," "10 core services."
5. **No AI-Sounding Triplets or Formulaic Rhetoric:**
   - Ban: "not just X, but Y", "from X to Y and everything in between", "X, Y, and Z" stacked consecutively in every paragraph.
   - Vary sentence openings. Do not start three consecutive paragraphs with "Whether you are..." or "In today's digital landscape...".

---

## 4. Banned Filler Words & Direct Replacements

| Banned Hype / Filler | Why It Fails | Approved Honest Replacement |
| :--- | :--- | :--- |
| **"blazing-fast"** / **"lightning-fast"** | Overused tech cliché with zero empirical meaning. | "loads in under 2 seconds", "optimized for mobile networks" |
| **"robust"** | Vague filler word used when specifics are lacking. | "stable", "thoroughly tested", "reliable" |
| **"seamless"** | Cliché. Software integration takes work. | "smooth", "connected", "without manual re-entry" |
| **"cutting-edge"** / **"state-of-the-art"** | Meaningless agency bravado. | "modern", "built with current web standards" |
| **"engineered with precision"** | Self-congratulatory jargon. | "built cleanly", "carefully planned and tested" |
| **"world-class"** / **"best-in-class"** | Unverifiable claim. | "built to modern software standards" |
| **"leverage"** / **"synergy"** | Corporate buzzwords that confuse small business owners. | "use", "combine", "connect" |
| **"unlock"** / **"elevate"** / **"supercharge"** | Generic marketing fluff. | "improve", "increase", "speed up" |
| **"holistic"** / **"bespoke"** (when overused) | Pretentious. | "complete", "custom-built" |
| **"game-changing"** / **"revolutionary"** | Unprovable hyperbole. | "practical", "high-impact", "effective" |
| **"In today's digital world..."** | Empty introductory filler. | Delete completely. Start directly with the core message. |
| **"99.9% Reliability"** | SLA claim without 24/7 dedicated NOC monitoring. | "Reliable hosting setup on proven cloud providers." |
| **"24-Hour Response SLA"** / **"Guaranteed Quotes"** | Unrealistic legal SLA. | "We usually reply within one business day." |
| **"100% Code Ownership"** | Too informal / legally sloppy. | "Ownership of the final code and design is written into every project agreement." |
| **"GDPR-compliant"** / **"OWASP audited"** | Regulatory audit claims that have not been externally certified. | "Secure data handling, HTTPS encryption, and input validation on every form." |
| **"Our team of architects and designers"** | Suggests a large enterprise corporate campus. | "You work directly with the founders and the engineers building your project." |

---

## 5. Standardized Calls to Action (CTAs)

All buttons and conversion points across public pages must use strictly standardized CTAs defined in `src/config/cta.ts`:

1. **Primary CTA:**
   - **Label:** `"Start a Project"`
   - **Destination:** `/contact#contact-form`
   - **Context:** Hero sections, page closing strips, package selection buttons.
2. **Secondary CTA:**
   - **Label:** `"See Our Work"`
   - **Destination:** `/portfolio`
   - **Context:** Hero secondary buttons, overview cards.
3. **Tertiary CTA:**
   - **Label:** `"Chat on WhatsApp"`
   - **Destination:** `https://wa.me/919473263768` (via `getWhatsAppUrl()`)
   - **Context:** Contact options, floating action buttons, quick inquiry prompts.

*Banned CTA Variations:* "Get Free Quote", "Get Quote Now", "Book Free Strategy Consultation", "Schedule Call", "Claim Your Free Audit".

---

## 6. Page Heading & Section Architecture

Every public page must adhere to clean semantic structure:
- **Exactly one `<h1>` per page:** Must describe the customer outcome or page purpose clearly.
- **Answer-First Intro (40–60 words):** Immediately follow the H1 with a concise summary answering what this page offers and why it matters.
- **Descriptive `<h2>` Headings:** Use action-oriented subheadings (e.g., "What We Build for Retailers" instead of "Solutions").
- **Real Server-Rendered FAQ Answers:** Every FAQ must be informative, factually accurate, and rendered directly in the HTML without hiding content from crawlers.
- **Unique SEO Titles & Descriptions:**
  - Format: `<Page Subject> | Axivon Technologies` (Brand once at the end; title $\le 60$ characters).
  - Description: 140–160 characters, natural language, zero geographic keyword stuffing.
