/**
 * PRICING & PACKAGES CONFIGURATION
 * 
 * Strict Rules:
 * - DO NOT invent prices or amounts. When `price === null`, UI displays "Get a quote".
 * - Inclusions and add-ons are marked "[draft — edit in pricing.ts]" for owner confirmation.
 */

export interface PricingPackage {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  popular?: boolean;
  /**
   * Price in INR or custom currency.
   * Set to null while deciding real figures. Renders "Get a quote".
   */
  price: number | null; // TODO: Set real price (e.g., 25000)
  priceNote?: string;
  billingPeriod: string;
  summary: string;
  serviceSlug: string; // for contact preselection
  packageSlug: string;
  inclusions: {
    pages: string;
    responsive: string;
    contactAndLead: string;
    whatsapp: string;
    seo: string;
    performance: string;
    deliveryTime: string;
    revisions: string;
    support: string;
    techStack: string;
  };
  features: string[];
}

export interface PricingAddOn {
  id: string;
  title: string;
  description: string;
  priceEstimate: string; // e.g. "Custom add-on quote"
  category: "Design & Content" | "Functionality" | "Growth & Maintenance";
}

export interface PricingComparisonCategory {
  category: string;
  rows: {
    feature: string;
    starter: string | boolean;
    business: string | boolean;
    growth: string | boolean;
    custom: string | boolean;
    tooltip?: string;
  }[];
}

export interface PricingFAQ {
  question: string;
  answer: string;
  category?: string;
}

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Essential web presence for small businesses & professionals",
    popular: false,
    price: null, // TODO: Set real price
    priceNote: "Transparent one-time project fee",
    billingPeriod: "one-time",
    summary: "A modern, high-speed website to establish online credibility, showcase core services, and capture customer inquiries.",
    serviceSlug: "web-development",
    packageSlug: "starter",
    inclusions: {
      pages: "Up to 5 custom pages (Home, About, Services, Contact, Legal) [draft — edit in pricing.ts]",
      responsive: "100% Mobile, Tablet & Desktop responsive [draft — edit in pricing.ts]",
      contactAndLead: "Secure contact inquiry form with spam protection [draft — edit in pricing.ts]",
      whatsapp: "Direct WhatsApp click-to-chat integration [draft — edit in pricing.ts]",
      seo: "Basic on-page SEO (meta tags, sitemap, OpenGraph) [draft — edit in pricing.ts]",
      performance: "Optimized Core Web Vitals (90+ mobile & desktop) [draft — edit in pricing.ts]",
      deliveryTime: "7 - 10 business days [draft — edit in pricing.ts]",
      revisions: "2 rounds of design & content revisions [draft — edit in pricing.ts]",
      support: "15 days post-launch technical warranty [draft — edit in pricing.ts]",
      techStack: "Next.js / React / Tailwind CSS / Vercel-ready",
    },
    features: [
      "Up to 5 responsive pages",
      "Lead capture inquiry form",
      "Direct WhatsApp button",
      "On-page SEO & XML sitemap",
      "Social media metadata (OpenGraph)",
      "SSL certificate & security headers",
      "2 design revision cycles",
      "15 days post-launch warranty",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Tailored for growing service firms & dynamic companies",
    badge: "Most Popular",
    popular: true,
    price: null, // TODO: Set real price
    priceNote: "Comprehensive turnkey delivery",
    billingPeriod: "one-time",
    summary: "Engineered for businesses needing a high-converting digital storefront, rich case studies, and automated lead capture.",
    serviceSlug: "web-development",
    packageSlug: "business",
    inclusions: {
      pages: "Up to 10-12 pages + dynamic portfolio/case studies [draft — edit in pricing.ts]",
      responsive: "Fluid responsive UX tailored across all viewports [draft — edit in pricing.ts]",
      contactAndLead: "Multi-step inquiry form + email notifications + DPDP consent [draft — edit in pricing.ts]",
      whatsapp: "Floating WhatsApp button with customized routing [draft — edit in pricing.ts]",
      seo: "Comprehensive SEO, Schema.org structured data & sitemap [draft — edit in pricing.ts]",
      performance: "Sub-second load times & Edge CDN optimization [draft — edit in pricing.ts]",
      deliveryTime: "2 - 3 weeks [draft — edit in pricing.ts]",
      revisions: "3 rounds of iterative revisions [draft — edit in pricing.ts]",
      support: "30 days post-launch technical support [draft — edit in pricing.ts]",
      techStack: "Next.js / TypeScript / Tailwind CSS / Content Management",
    },
    features: [
      "Up to 12 responsive pages",
      "Dynamic portfolio / case study showcase",
      "Multi-step lead capture form",
      "Advanced Schema.org structured data",
      "Floating WhatsApp consultation widget",
      "Speed optimized for Google Core Web Vitals",
      "Custom domain & business email configuration",
      "3 design revision cycles",
      "30 days post-launch priority support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Full-scale commerce, catalogs, & lead generation machines",
    badge: "Scalable E-Commerce",
    popular: false,
    price: null, // TODO: Set real price
    priceNote: "End-to-end scalable architecture",
    billingPeriod: "one-time",
    summary: "Complete digital storefront or dynamic commercial catalog with filtering, checkout/inquiry readiness, and marketing tracking.",
    serviceSlug: "web-development",
    packageSlug: "growth",
    inclusions: {
      pages: "Catalog / E-Commerce architecture up to 25 pages [draft — edit in pricing.ts]",
      responsive: "Mobile-first shopping & browsing experience [draft — edit in pricing.ts]",
      contactAndLead: "Lead attribution, analytics consent & CRM webhook readiness [draft — edit in pricing.ts]",
      whatsapp: "WhatsApp order/inquiry alerts & click-to-chat [draft — edit in pricing.ts]",
      seo: "Commercial product/service schema & category hierarchy [draft — edit in pricing.ts]",
      performance: "Image optimization, Edge caching & high concurrency [draft — edit in pricing.ts]",
      deliveryTime: "3 - 5 weeks [draft — edit in pricing.ts]",
      revisions: "Unlimited minor revisions during sprint [draft — edit in pricing.ts]",
      support: "60 days post-launch support & training [draft — edit in pricing.ts]",
      techStack: "Next.js / TypeScript / Tailwind CSS / Prisma & Database / API Integrations",
    },
    features: [
      "Dynamic catalog & product/service showcase",
      "Cart, checkout, or quote calculation flow",
      "Payment gateway readiness (Razorpay/Stripe)",
      "Advanced search & multi-facet filtering",
      "Consent-compliant analytics & event tracking",
      "Automated email notifications to admin & client",
      "Admin CMS training & documentation handover",
      "Unlimited minor revisions within milestone",
      "60 days post-launch warranty & maintenance",
    ],
  },
  {
    id: "custom",
    name: "Custom / App / AI",
    tagline: "Bespoke SaaS platforms, mobile applications, & AI systems",
    badge: "Bespoke Engineering",
    popular: false,
    price: null, // TODO: Set real price
    priceNote: "Milestone-based sprint delivery",
    billingPeriod: "milestone-based",
    summary: "End-to-end engineering for complex web apps, cross-platform iOS & Android mobile apps, automation pipelines, and custom AI tooling.",
    serviceSlug: "custom-software-development",
    packageSlug: "custom",
    inclusions: {
      pages: "Custom functional scope / Unlimited screens & modules [draft — edit in pricing.ts]",
      responsive: "Multi-platform (Web, iOS, Android, Desktop) [draft — edit in pricing.ts]",
      contactAndLead: "Role-based dashboards, authentication, audit logs & RBAC [draft — edit in pricing.ts]",
      whatsapp: "Automated WhatsApp API / Bot integration [draft — edit in pricing.ts]",
      seo: "Dynamic enterprise metadata, SSR & deep-link routing [draft — edit in pricing.ts]",
      performance: "Containerized cloud infrastructure & automated CI/CD [draft — edit in pricing.ts]",
      deliveryTime: "Milestone sprints (4 - 12+ weeks) [draft — edit in pricing.ts]",
      revisions: "Sprint-based iterative agile reviews [draft — edit in pricing.ts]",
      support: "Dedicated SLA & ongoing maintenance plans [draft — edit in pricing.ts]",
      techStack: "Next.js / React Native / Node.js / Python / Docker / Cloud Services",
    },
    features: [
      "Fully bespoke architectural design & functional spec",
      "Mobile apps (React Native / iOS / Android) or web portal",
      "User authentication, sessions, and role-based access",
      "Custom RESTful APIs & database schema design",
      "AI solutions, LLM workflows, or IoT telemetry",
      "Automated CI/CD deployment pipelines",
      "Full intellectual property & source code transfer",
      "Dedicated Technical Project Lead",
      "Custom SLA & quarterly maintenance agreements",
    ],
  },
];

export const PRICING_COMPARISON_MATRIX: PricingComparisonCategory[] = [
  {
    category: "Scope & Design",
    rows: [
      {
        feature: "Custom Page Count",
        starter: "Up to 5 pages",
        business: "Up to 12 pages",
        growth: "Up to 25 pages",
        custom: "Custom / Unlimited",
      },
      {
        feature: "Responsive UI (Mobile/Tablet/Desktop)",
        starter: true,
        business: true,
        growth: true,
        custom: true,
      },
      {
        feature: "Design Customization",
        starter: "Modern curated template architecture",
        business: "Tailored brand design & animations",
        growth: "Custom UX/UI flow & design system",
        custom: "100% Bespoke interface & design system",
      },
      {
        feature: "Dynamic Case Studies / Portfolio",
        starter: false,
        business: true,
        growth: true,
        custom: true,
      },
      {
        feature: "E-Commerce / Product Catalog",
        starter: false,
        business: false,
        growth: true,
        custom: true,
      },
    ],
  },
  {
    category: "Integrations & Lead Generation",
    rows: [
      {
        feature: "Contact Inquiry Form",
        starter: "Standard form with spam protection",
        business: "Multi-step interactive form",
        growth: "Multi-step + CRM lead attribution",
        custom: "Custom multi-tenant intake workflows",
      },
      {
        feature: "Direct WhatsApp Click-to-Chat",
        starter: true,
        business: true,
        growth: true,
        custom: true,
      },
      {
        feature: "Payment Gateway Integration",
        starter: false,
        business: "Optional add-on",
        growth: true,
        custom: true,
      },
      {
        feature: "Automated Email & Notification Alerts",
        starter: "Basic alert",
        business: "Admin + User confirmations",
        growth: "Admin + User + Webhooks",
        custom: "Enterprise event-driven architecture",
      },
      {
        feature: "User Authentication & RBAC",
        starter: false,
        business: false,
        growth: "Optional add-on",
        custom: true,
      },
    ],
  },
  {
    category: "SEO, Performance & Compliance",
    rows: [
      {
        feature: "On-Page Technical SEO & Meta Tags",
        starter: true,
        business: true,
        growth: true,
        custom: true,
      },
      {
        feature: "Schema.org Rich Snippets (Structured Data)",
        starter: "Basic Organization",
        business: "Services, FAQ, Local Business",
        growth: "Product, Breadcrumb & Review schema",
        custom: "Full custom schema architecture",
      },
      {
        feature: "Dynamic XML Sitemap & Robots.txt",
        starter: true,
        business: true,
        growth: true,
        custom: true,
      },
      {
        feature: "Google Core Web Vitals Optimization",
        starter: "90+ Score",
        business: "95+ Score",
        growth: "Sub-second load times",
        custom: "Enterprise global Edge CDN",
      },
      {
        feature: "DPDP Act 2023 Consent & Privacy Policy",
        starter: true,
        business: true,
        growth: true,
        custom: true,
      },
    ],
  },
  {
    category: "Delivery, Support & Ownership",
    rows: [
      {
        feature: "Typical Delivery Timeline",
        starter: "7 - 10 business days",
        business: "2 - 3 weeks",
        growth: "3 - 5 weeks",
        custom: "Milestone sprints (4 - 12+ wks)",
      },
      {
        feature: "Revision Cycles",
        starter: "2 rounds",
        business: "3 rounds",
        growth: "Unlimited minor revisions",
        custom: "Iterative sprint reviews",
      },
      {
        feature: "Post-Launch Technical Warranty",
        starter: "15 days",
        business: "30 days",
        growth: "60 days",
        custom: "Custom SLA agreement",
      },
      {
        feature: "Full Source Code & IP Ownership",
        starter: true,
        business: true,
        growth: true,
        custom: true,
      },
    ],
  },
];

export const PRICING_ADD_ONS: PricingAddOn[] = [
  {
    id: "extra-pages",
    title: "Additional Custom Pages",
    description: "Expand your site with tailored service, landing, or informational pages designed and optimized to match your site system.",
    priceEstimate: "Quote based on page scope [draft — edit in pricing.ts]",
    category: "Design & Content",
  },
  {
    id: "booking-system",
    title: "Online Appointment / Table Booking System",
    description: "Self-service calendar booking with time-slot management, instant WhatsApp confirmation, and Google Calendar synchronization.",
    priceEstimate: "Available as package add-on [draft — edit in pricing.ts]",
    category: "Functionality",
  },
  {
    id: "payment-gateway",
    title: "Payment Gateway Integration",
    description: "Seamless checkout integration supporting UPI, credit/debit cards, NetBanking, and international payments (Razorpay, Stripe, Cashfree).",
    priceEstimate: "Available as package add-on [draft — edit in pricing.ts]",
    category: "Functionality",
  },
  {
    id: "cms-blog",
    title: "Dynamic Blog & Resource CMS",
    description: "Easy-to-use content management system allowing your team to draft, preview, schedule, and publish search-optimized articles.",
    priceEstimate: "Available as package add-on [draft — edit in pricing.ts]",
    category: "Functionality",
  },
  {
    id: "maintenance-plan",
    title: "Annual Maintenance & Security Plan",
    description: "Proactive uptime monitoring, security patching, library updates, weekly cloud backups, and dedicated monthly development hours.",
    priceEstimate: "Monthly or Annual retainer [draft — edit in pricing.ts]",
    category: "Growth & Maintenance",
  },
  {
    id: "copywriting",
    title: "Professional Copywriting & Content Creation",
    description: "Persuasive, SEO-optimized headlines, service descriptions, and value propositions written specifically for your target audience.",
    priceEstimate: "Per page / bulk rate [draft — edit in pricing.ts]",
    category: "Design & Content",
  },
  {
    id: "multilingual",
    title: "Bilingual / Multilingual Version (Gujarati / Hindi)",
    description: "Localized interface and content switching to serve regional audiences across Gujarat and India, boosting trust and conversion.",
    priceEstimate: "Available as package add-on [draft — edit in pricing.ts]",
    category: "Growth & Maintenance",
  },
];

export const PRICING_FAQS: PricingFAQ[] = [
  {
    question: "What is included in your website packages?",
    answer: "Every package includes mobile and desktop responsive design, clean semantic code built on modern frameworks (Next.js/React), on-page SEO setup (sitemaps, meta tags, schema markup), a secure contact inquiry form, direct WhatsApp integration, and post-launch technical warranty.",
  },
  {
    question: "Do I own 100% of the website code and design?",
    answer: "Yes, absolutely. Once final project milestone payments are completed, full intellectual property and source code ownership are transferred to you. We do not lock you into proprietary closed-source website builders.",
  },
  {
    question: "How do project revisions work?",
    answer: "Each package includes dedicated revision cycles. During each cycle, you review the staging preview and provide grouped feedback on design, typography, spacing, or content. We implement the adjustments before moving to the next milestone.",
  },
  {
    question: "Are domain registration and cloud hosting included?",
    answer: "We assist with domain purchasing, DNS configuration, and setting up high-performance cloud hosting (such as Vercel, AWS, or your preferred host) directly under your accounts. Domain registration and third-party hosting fees are paid directly to the registrars to ensure you maintain direct control.",
  },
  {
    question: "What are your payment milestones?",
    answer: "Standard projects follow a transparent milestone schedule: typically a 50% deposit to commence architecture and design, with the remaining 50% due upon staging review approval prior to production domain launch. Custom enterprise builds may be broken into 3 or 4 sprint milestones.",
  },
  {
    question: "How does post-launch maintenance work?",
    answer: "All packages include a post-launch warranty period (15 to 60 days depending on the package) to address any bugs or technical issues at no extra cost. For ongoing updates, security audits, and new feature additions, we offer flexible monthly maintenance retainers.",
  },
  {
    question: "Why are prices displayed as 'Get a quote'?",
    answer: "Every project has unique requirements, functional depth, and timeline constraints. Rather than locking you into arbitrary generic figures, we provide tailored, transparent written estimates based strictly on your project scope.",
  },
];
