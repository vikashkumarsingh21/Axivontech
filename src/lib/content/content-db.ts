import { db } from "@/lib/db";
import { COMPANY_STATS } from "@/data/company-stats";
import { servicesData, getServiceBySlug as getStaticServiceBySlug, ServiceData } from "@/data/services";
import { BLOG_POSTS, BlogPost } from "@/data/blog-posts";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface HomepageContent {
  hero: {
    eyebrow: string;
    headline: string;
    highlight: string;
    subcopy: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    capabilityBadges: string[];
  };
  sectionsVisibility: {
    hero: boolean;
    services: boolean;
    whyChooseUs: boolean;
    industries: boolean;
    portfolio: boolean;
    process: boolean;
    reviews: boolean;
    faq: boolean;
    cta: boolean;
  };
  stats: {
    projectsCompleted: string;
    livePrototypes: string;
    supportedSectors: string;
    productionQuality: string;
  };
  closingCta: {
    heading: string;
    subheading: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface AboutPageContent {
  hero: {
    eyebrow: string;
    headline: string;
    subcopy: string;
  };
  mission: string;
  vision: string;
  values: {
    title: string;
    description: string;
    icon: string;
  }[];
  founder: {
    name: string;
    role: string;
    bio: string;
    quote: string;
    image: string;
  };
  milestones: {
    year: string;
    title: string;
    description: string;
  }[];
  contactInfo: {
    companyName: string;
    registeredAddress: string;
    city: string;
    state: string;
    country: string;
    email: string;
    phone: string;
    businessHours: string;
    socialLinks: {
      linkedin: string;
      github: string;
      twitter: string;
    };
  };
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  websiteUrl: string;
  socialLinks: {
    linkedin: string;
    github: string;
    twitter: string;
  };
}

export interface SeoSettings {
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  canonicalBase: string;
  defaultOgImage: string;
  keywords: string[];
  allowIndexing: boolean;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  gaMeasurementId?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  page: string;
  displayOrder: number;
  status: string;
}

export interface IndustryItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
  displayOrder: number;
  status: string;
  relatedService?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

// ─────────────────────────────────────────────────────────────
// Default Fallbacks
// ─────────────────────────────────────────────────────────────

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  hero: {
    eyebrow: "Technology & Digital Agency — India",
    headline: "We build digital products that",
    highlight: "move businesses forward.",
    subcopy:
      "Axivon Technologies designs and engineers high-performance websites, mobile apps, AI systems, and custom software for startups, healthcare teams, educational platforms, and ambitious businesses.",
    primaryCtaText: "Start a Project",
    primaryCtaLink: "/contact#contact-form",
    secondaryCtaText: "View Selected Work",
    secondaryCtaLink: "/portfolio",
    capabilityBadges: [
      "Web Architecture",
      "Mobile Systems",
      "AI Automation",
      "UI/UX Design",
      "Technical SEO",
    ],
  },
  sectionsVisibility: {
    hero: true,
    services: true,
    whyChooseUs: true,
    industries: true,
    portfolio: true,
    process: true,
    reviews: true,
    faq: true,
    cta: true,
  },
  stats: {
    projectsCompleted: COMPANY_STATS.projectsDelivered.value,
    livePrototypes: "8 Live Demos",
    supportedSectors: "22 Sectors",
    productionQuality: "100% Production",
  },
  closingCta: {
    heading: "Ready to Build Something Remarkable?",
    subheading:
      "Schedule a consultation with our core engineering team. We translate business objectives into reliable digital software.",
    primaryButtonText: "Schedule Consultation",
    primaryButtonLink: "/contact",
    secondaryButtonText: "Explore Demos",
    secondaryButtonLink: "/demo-projects",
  },
  seo: {
    title: "Axivon Technologies — We Build Digital Products That Move Businesses Forward",
    description:
      "Axivon Technologies designs and engineers websites, mobile apps, AI systems, and custom software for startups, schools, healthcare teams, and growing businesses.",
    keywords: [
      "Software Development Agency",
      "Web Development India",
      "App Developers India",
      "Custom AI Integration",
      "Full-Stack Development",
    ],
  },
};

export const DEFAULT_ABOUT_CONTENT: AboutPageContent = {
  hero: {
    eyebrow: "Who We Are & What We Believe",
    headline: "Engineering Digital Infrastructure for Tomorrow's Leaders",
    subcopy:
      "Axivon Technologies is an engineering-first technology agency founded in Gujarat, India. We partner with founders, executives, and organizations to design, engineer, and scale modern web, mobile, and AI solutions.",
  },
  mission:
    "To deliver high-impact, uncompromising software solutions that empower organizations to automate complex processes, engage users, and outcompete in a digital-first economy.",
  vision:
    "To be the premier digital product engineering partner in Western India, recognized globally for technical excellence, engineering integrity, and sustainable software architecture.",
  values: [
    {
      title: "Engineering Excellence",
      description: "We write clean, typed, modular code built for maintainability, security, and sustained scalability.",
      icon: "Code",
    },
    {
      title: "Radical Transparency",
      description: "No hidden costs, no fabricated results. Clear sprints, direct engineer access, and authentic deliverables.",
      icon: "Shield",
    },
    {
      title: "Business-Centric Impact",
      description: "We measure success not by lines of code, but by real operational efficiencies and customer acquisition.",
      icon: "Target",
    },
    {
      title: "Long-Term Partnership",
      description: "From MVP to enterprise scale, we support our clients with proactive maintenance and iterative feature velocity.",
      icon: "Cpu",
    },
  ],
  founder: {
    name: "Vikash Kumar",
    role: "Founder & Lead Architect",
    bio: "Full-stack software architect specializing in Next.js, distributed TypeScript architectures, and AI systems. Leads design and technical delivery across all Axivon client engagements.",
    quote: "We don't build digital brochures. We build software that drives real commerce and operational velocity.",
    image: "/assets/images/team/vikas-kumar-founder.jpg",
  },
  milestones: [
    {
      year: "2024",
      title: "Founding & Incorporation",
      description: "Axivon Technologies founded in Rajkot, Gujarat, focusing on high-performance web development and automation.",
    },
    {
      year: "2025",
      title: "Product Ecosystem Expansion",
      description: "Launched AXIVON ONE enterprise portal and delivered custom platforms across education, retail, and real estate.",
    },
    {
      year: "2026",
      title: "National Client Roster & Demos",
      description: "Built 8 live full-stack demo platforms and expanded business partner network across tier-1 and tier-2 Indian cities.",
    },
  ],
  contactInfo: {
    companyName: "Axivon Technologies",
    registeredAddress: "Rajkot, Gujarat",
    city: "Rajkot",
    state: "Gujarat",
    country: "India",
    email: "contact@axivontech.in",
    phone: "+91 91572 26367",
    businessHours: "Monday – Saturday: 09:00 AM – 06:00 PM IST",
    socialLinks: {
      linkedin: "https://linkedin.com/company/axivon-technologies",
      github: "https://github.com/axivon-technologies",
      twitter: "https://twitter.com/axivontech",
    },
  },
};

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: "Axivon Technologies",
  tagline: "Engineering Tomorrow's Infrastructure",
  email: "contact@axivontech.in",
  phone: "+91 91572 26367",
  address: "Rajkot, Gujarat, India",
  websiteUrl: "https://axivontech.in",
  socialLinks: {
    linkedin: "https://linkedin.com/company/axivon-technologies",
    github: "https://github.com/axivon-technologies",
    twitter: "https://twitter.com/axivontech",
  },
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  defaultTitle: "Axivon Technologies — We Build Digital Products That Move Businesses Forward",
  titleTemplate: "%s | Axivon Technologies",
  defaultDescription:
    "Axivon Technologies designs and engineers high-performance websites, mobile apps, AI systems, and custom software for startups, healthcare teams, educational platforms, and ambitious businesses.",
  canonicalBase: "https://axivontech.in",
  defaultOgImage: "/assets/logo/logo-full.png",
  keywords: [
    "Software Development Agency",
    "Web Development India",
    "App Developers India",
    "Custom AI Integration",
    "Full-Stack Development",
    "Rajkot Web Development",
    "Gujarat Software Company",
  ],
  allowIndexing: true,
  googleSiteVerification: "",
  bingSiteVerification: "",
  gaMeasurementId: "G-QCHH8ELS1K",
};

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "How long does it take to build a website?",
    answer: "Most business websites take between 1–4 weeks depending on complexity, specifications, and client feedback cycles.",
    category: "GENERAL",
    page: "HOME",
    displayOrder: 1,
    status: "PUBLISHED",
  },
  {
    id: "faq-2",
    question: "Do you provide SEO services?",
    answer: "Yes, we provide search engine optimization, keyword research, technical SEO audits, and ongoing digital marketing campaigns.",
    category: "SERVICES",
    page: "HOME",
    displayOrder: 2,
    status: "PUBLISHED",
  },
  {
    id: "faq-3",
    question: "Can you build mobile applications?",
    answer: "Yes, we develop native iOS and Android apps, as well as cross-platform React Native and Flutter solutions.",
    category: "SERVICES",
    page: "HOME",
    displayOrder: 3,
    status: "PUBLISHED",
  },
  {
    id: "faq-4",
    question: "Do you provide website maintenance?",
    answer: "Yes, we offer monthly maintenance plans including hosting management, security updates, regular backups, and technical support.",
    category: "SUPPORT",
    page: "HOME",
    displayOrder: 4,
    status: "PUBLISHED",
  },
  {
    id: "faq-5",
    question: "Can you redesign an existing website?",
    answer: "Absolutely. We specialize in modernizing outdated sites, improving user experience, site speeds, and conversion rates without losing search engine credibility.",
    category: "SERVICES",
    page: "HOME",
    displayOrder: 5,
    status: "PUBLISHED",
  },
  {
    id: "faq-6",
    question: "What technologies do you use?",
    answer: "Our main stack includes Next.js, React, Node.js, TypeScript, Tailwind CSS, PostgreSQL, and modern cloud hosting environments like Vercel and AWS.",
    category: "GENERAL",
    page: "HOME",
    displayOrder: 6,
    status: "PUBLISHED",
  },
  {
    id: "faq-7",
    question: "Do you provide AI solutions?",
    answer: "Yes, we build custom AI-powered integrations, data-processing automation tools, and smart chatbots based on large language models.",
    category: "SERVICES",
    page: "HOME",
    displayOrder: 7,
    status: "PUBLISHED",
  },
  {
    id: "faq-8",
    question: "How can I get a quotation?",
    answer: "Simply contact us through our project form, email, or WhatsApp, and we will schedule a brief consultation to provide a tailored quote.",
    category: "DELIVERY",
    page: "HOME",
    displayOrder: 8,
    status: "PUBLISHED",
  },
];

export const DEFAULT_INDUSTRIES: IndustryItem[] = [
  {
    id: "ind-1",
    slug: "education",
    title: "K-12 Education",
    description: "Digital learning platforms, parent portals, and school management systems.",
    tags: ["LMS", "Portals", "ERP"],
    icon: "School",
    displayOrder: 1,
    status: "PUBLISHED",
    relatedService: "web-development",
  },
  {
    id: "ind-2",
    slug: "higher-education",
    title: "Higher Education",
    description: "Enterprise university infrastructure, course management, and campus automation.",
    tags: ["Campus Tech", "Scale", "Security"],
    icon: "Landmark",
    displayOrder: 2,
    status: "PUBLISHED",
    relatedService: "custom-software-development",
  },
  {
    id: "ind-3",
    slug: "healthcare",
    title: "Healthcare",
    description: "Secure patient portals, telemedicine tools, and clinic management systems.",
    tags: ["Telemed", "Security", "EMR"],
    icon: "Hospital",
    displayOrder: 3,
    status: "PUBLISHED",
    relatedService: "web-development",
  },
  {
    id: "ind-4",
    slug: "retail",
    title: "Retail & E-Commerce",
    description: "High-conversion online stores, inventory systems, and omnichannel platforms.",
    tags: ["Shopify", "Custom E-Com", "Inventory"],
    icon: "Store",
    displayOrder: 4,
    status: "PUBLISHED",
    relatedService: "web-development",
  },
  {
    id: "ind-5",
    slug: "real-estate",
    title: "Real Estate",
    description: "Property listing platforms, virtual tours, and broker CRM systems.",
    tags: ["Listings", "CRM", "Portals"],
    icon: "Building2",
    displayOrder: 5,
    status: "PUBLISHED",
    relatedService: "web-development",
  },
  {
    id: "ind-6",
    slug: "hospitality",
    title: "Hospitality & Dining",
    description: "Direct booking engines, digital menus, and restaurant reservation systems.",
    tags: ["Direct Booking", "Menus", "Reservations"],
    icon: "Hotel",
    displayOrder: 6,
    status: "PUBLISHED",
    relatedService: "web-development",
  },
  {
    id: "ind-7",
    slug: "fitness-wellness",
    title: "Fitness & Wellness",
    description: "Gym booking platforms, trainer scheduling calendars, and membership subscriptions.",
    tags: ["Memberships", "Classes", "Passes"],
    icon: "HeartPulse",
    displayOrder: 7,
    status: "PUBLISHED",
    relatedService: "web-development",
  },
  {
    id: "ind-8",
    slug: "saas-startups",
    title: "B2B SaaS & Tech",
    description: "Product marketing landing pages, pipeline analytics dashboards, and onboarding funnels.",
    tags: ["Analytics", "Funnel", "Pipelines"],
    icon: "Lightbulb",
    displayOrder: 8,
    status: "PUBLISHED",
    relatedService: "custom-software-development",
  },
];

// ─────────────────────────────────────────────────────────────
// Data Retrieval Helpers (Single Source of Truth)
// ─────────────────────────────────────────────────────────────

/**
 * Retrieves the published Homepage content, gracefully falling back to defaults.
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const setting = await db.websiteSetting.findUnique({
      where: { key: "homepage" },
    });
    if (setting && setting.data && setting.status === "PUBLISHED") {
      return {
        ...DEFAULT_HOMEPAGE_CONTENT,
        ...(setting.data as Partial<HomepageContent>),
      };
    }
  } catch (error) {
    // DB unreachable or unit test environment — return static default
  }
  return DEFAULT_HOMEPAGE_CONTENT;
}

/**
 * Retrieves the published About page content, gracefully falling back to defaults.
 */
export async function getAboutPageContent(): Promise<AboutPageContent> {
  try {
    const setting = await db.websiteSetting.findUnique({
      where: { key: "about" },
    });
    if (setting && setting.data && setting.status === "PUBLISHED") {
      return {
        ...DEFAULT_ABOUT_CONTENT,
        ...(setting.data as Partial<AboutPageContent>),
      };
    }
  } catch (error) {
    // DB unreachable — return static default
  }
  return DEFAULT_ABOUT_CONTENT;
}

/**
 * Retrieves central company information.
 */
export async function getCompanyInfo(): Promise<CompanyInfo> {
  try {
    const setting = await db.websiteSetting.findUnique({
      where: { key: "company" },
    });
    if (setting && setting.data && setting.status === "PUBLISHED") {
      return {
        ...DEFAULT_COMPANY_INFO,
        ...(setting.data as Partial<CompanyInfo>),
      };
    }
  } catch (error) {
    // DB unreachable — return static default
  }
  return DEFAULT_COMPANY_INFO;
}

/**
 * Retrieves SEO configuration settings.
 */
export async function getSeoSettings(): Promise<SeoSettings> {
  try {
    const setting = await db.websiteSetting.findUnique({
      where: { key: "seo" },
    });
    if (setting && setting.data && setting.status === "PUBLISHED") {
      return {
        ...DEFAULT_SEO_SETTINGS,
        ...(setting.data as Partial<SeoSettings>),
      };
    }
  } catch (error) {
    // DB unreachable — return static default
  }
  return DEFAULT_SEO_SETTINGS;
}

/**
 * Retrieves published FAQs filtered by category or page.
 */
export async function getPublishedFaqs(category?: string, page?: string): Promise<FaqItem[]> {
  try {
    const where: Record<string, any> = { status: "PUBLISHED" };
    if (category && category !== "ALL") where.category = category;
    if (page && page !== "ALL") where.page = page;

    const dbFaqs = await db.websiteFaq.findMany({
      where,
      orderBy: { displayOrder: "asc" },
    });

    if (dbFaqs.length > 0) {
      return dbFaqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category,
        page: f.page,
        displayOrder: f.displayOrder,
        status: f.status,
      }));
    }
  } catch (error) {
    // Fall back to static
  }

  // Filter default FAQs
  let faqs = [...DEFAULT_FAQS];
  if (category && category !== "ALL") {
    faqs = faqs.filter((f) => f.category.toLowerCase() === category.toLowerCase());
  }
  if (page && page !== "ALL") {
    faqs = faqs.filter((f) => f.page.toLowerCase() === page.toLowerCase() || f.page === "GLOBAL");
  }
  return faqs;
}

/**
 * Retrieves published services, merging database records with static catalogue.
 */
export async function getPublishedServices(): Promise<ServiceData[]> {
  try {
    const dbServices = await db.websiteService.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" },
    });

    if (dbServices.length > 0) {
      // Map DB services to ServiceData interface
      return dbServices.map((s) => ({
        slug: s.slug as any,
        title: s.title,
        badge: s.badge || "Professional Service",
        shortDescription: s.shortDescription,
        heroDescription: s.heroDescription,
        icon: s.icon || "Code",
        metaTitle: s.metaTitle || `${s.title} | Axivon Technologies`,
        metaDescription: s.metaDescription || s.shortDescription,
        benefits: (s.benefits as any) || [],
        process: (s.process as any) || [],
        technologies: (s.technologies as any) || [],
        faqs: (s.faqs as any) || [],
        cta: (s.cta as any) || {
          title: "Ready to get started?",
          description: "Contact our team for a tailored quotation.",
        },
      }));
    }
  } catch (error) {
    // Fall back to static
  }
  return servicesData;
}

/**
 * Retrieves a single published service by slug.
 */
export async function getPublishedServiceBySlug(slug: string): Promise<ServiceData | null> {
  try {
    const dbService = await db.websiteService.findUnique({
      where: { slug },
    });
    if (dbService && dbService.status === "PUBLISHED") {
      return {
        slug: dbService.slug as any,
        title: dbService.title,
        badge: dbService.badge || "Professional Service",
        shortDescription: dbService.shortDescription,
        heroDescription: dbService.heroDescription,
        icon: dbService.icon || "Code",
        metaTitle: dbService.metaTitle || `${dbService.title} | Axivon Technologies`,
        metaDescription: dbService.metaDescription || dbService.shortDescription,
        benefits: (dbService.benefits as any) || [],
        process: (dbService.process as any) || [],
        technologies: (dbService.technologies as any) || [],
        faqs: (dbService.faqs as any) || [],
        cta: (dbService.cta as any) || {
          title: "Ready to get started?",
          description: "Contact our team for a tailored quotation.",
        },
      };
    }
  } catch (error) {
    // Fall back to static
  }

  try {
    return getStaticServiceBySlug(slug as any);
  } catch {
    return null;
  }
}

/**
 * Retrieves published industries.
 */
export async function getPublishedIndustries(): Promise<IndustryItem[]> {
  try {
    const dbIndustries = await db.websiteIndustry.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" },
    });

    if (dbIndustries.length > 0) {
      return dbIndustries.map((ind) => ({
        id: ind.id,
        slug: ind.slug,
        title: ind.title,
        description: ind.description,
        tags: ind.tags,
        icon: ind.icon || "Building2",
        displayOrder: ind.displayOrder,
        status: ind.status,
        relatedService: ind.relatedService,
        metaTitle: ind.metaTitle,
        metaDescription: ind.metaDescription,
      }));
    }
  } catch (error) {
    // Fall back to default
  }
  return DEFAULT_INDUSTRIES;
}

/**
 * Retrieves published blog articles.
 */
export async function getPublishedArticles(): Promise<BlogPost[]> {
  try {
    const dbArticles = await db.websiteArticle.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    });

    if (dbArticles.length > 0) {
      return dbArticles.map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category as any,
        publishedDate: a.publishedAt ? a.publishedAt.toISOString().split("T")[0] : a.createdAt.toISOString().split("T")[0],
        author: {
          name: a.authorName,
          role: a.authorRole,
          avatar: a.authorAvatar || "/assets/images/team/vikas-kumar-founder.jpg",
        },
        readingTime: a.readingTime,
        featuredImage: a.featuredImage,
        featuredImageAlt: a.featuredImageAlt || a.title,
        featured: a.featured,
        keywords: a.keywords,
        metaTitle: a.metaTitle || a.title,
        metaDescription: a.metaDescription || a.excerpt,
        canonicalUrl: a.canonicalUrl || `https://axivontech.in/blog/${a.slug}`,
        ogImage: a.featuredImage,
        toc: [],
        relatedSlugs: [],
        contentHtml: a.contentHtml,
      }));
    }
  } catch (error) {
    // Fall back to static
  }
  return BLOG_POSTS;
}

/**
 * Retrieves a single published blog article by slug.
 */
export async function getPublishedArticleBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const article = await db.websiteArticle.findFirst({
      where: { slug, status: "PUBLISHED" },
    });

    if (article) {
      return {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category as any,
        publishedDate: article.publishedAt
          ? article.publishedAt.toISOString().split("T")[0]
          : article.createdAt.toISOString().split("T")[0],
        author: {
          name: article.authorName,
          role: article.authorRole,
          avatar: article.authorAvatar || "/assets/images/team/vikas-kumar-founder.jpg",
        },
        readingTime: article.readingTime,
        featuredImage: article.featuredImage,
        featuredImageAlt: article.featuredImageAlt || article.title,
        featured: article.featured,
        keywords: article.keywords,
        metaTitle: article.metaTitle || article.title,
        metaDescription: article.metaDescription || article.excerpt,
        canonicalUrl: article.canonicalUrl || `https://axivontech.in/blog/${article.slug}`,
        ogImage: article.featuredImage,
        toc: [],
        relatedSlugs: [],
        contentHtml: article.contentHtml,
      };
    }
  } catch (error) {
    // Fall back to static
  }
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}

