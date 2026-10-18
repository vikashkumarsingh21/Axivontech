/**
 * Axivon Technologies — SEO Keyword-to-Page Mapping Architecture
 *
 * This mapping defines target search queries, user intent categories,
 * prioritized pages, and conversion goals.
 *
 * Search Intent Categories:
 * - TRANSACTIONAL: Ready to hire, request quotes, initiate contracts
 * - COMMERCIAL: Evaluating solutions, inspecting live portfolio, comparing tech stacks
 * - INFORMATIONAL: Researching engineering architectures, tech guides, career openings
 * - NAVIGATIONAL: Direct brand searches for Axivon Technologies & AXIVON ONE
 */

export type SearchIntent = "TRANSACTIONAL" | "COMMERCIAL" | "INFORMATIONAL" | "NAVIGATIONAL";

export interface KeywordPageMapping {
  targetPath: string;
  pageTitle: string;
  intent: SearchIntent;
  priority: "P0" | "P1" | "P2";
  primaryKeyword: string;
  secondaryKeywords: string[];
  targetAudience: string;
  conversionGoal: string;
  serpSnippetGuidelines: {
    recommendedTitle: string;
    recommendedDescription: string;
  };
}

export const KEYWORD_PAGE_MAPPINGS: KeywordPageMapping[] = [
  {
    targetPath: "/",
    pageTitle: "Homepage",
    intent: "COMMERCIAL",
    priority: "P0",
    primaryKeyword: "software development company",
    secondaryKeywords: [
      "full stack web development agency",
      "custom software development company india",
      "next js development agency",
      "digital product engineering",
    ],
    targetAudience: "Founders, CTOs, and business leaders seeking an end-to-end engineering partner.",
    conversionGoal: "Initiate project inquiry or explore interactive demo portfolio.",
    serpSnippetGuidelines: {
      recommendedTitle: "Axivon Technologies — Digital Products & Custom Software Engineering",
      recommendedDescription:
        "Axivon Technologies engineers high-performance web applications, mobile apps, AI integrations, and custom software for high-growth enterprises and startups.",
    },
  },
  {
    targetPath: "/services/web-development",
    pageTitle: "Web Development Services",
    intent: "TRANSACTIONAL",
    priority: "P0",
    primaryKeyword: "custom web development services",
    secondaryKeywords: [
      "nextjs web development company",
      "responsive enterprise web application",
      "react typescript web engineering",
      "performance optimized web architecture",
    ],
    targetAudience: "Companies upgrading legacy portals or launching high-speed web platforms.",
    conversionGoal: "Submit Web Development project inquiry with tech stack specifications.",
    serpSnippetGuidelines: {
      recommendedTitle: "Custom Web Development Services | Next.js & TypeScript | Axivon",
      recommendedDescription:
        "High-performance, secure, responsive web applications built with Next.js, React, and robust APIs. Engineering designed for conversion velocity and scalability.",
    },
  },
  {
    targetPath: "/services/mobile-apps",
    pageTitle: "Mobile App Development Services",
    intent: "TRANSACTIONAL",
    priority: "P0",
    primaryKeyword: "mobile app development services india",
    secondaryKeywords: [
      "react native cross platform app development",
      "ios and android enterprise applications",
      "custom mobile application company",
    ],
    targetAudience: "Businesses launching client-facing mobile experiences with cross-platform efficiency.",
    conversionGoal: "Request mobile application architectural consultation and estimate.",
    serpSnippetGuidelines: {
      recommendedTitle: "Mobile App Development Services | iOS & Android | Axivon",
      recommendedDescription:
        "Cross-platform and native mobile apps engineered for speed, offline reliability, and intuitive UX. From architecture to App Store deployment.",
    },
  },
  {
    targetPath: "/services/custom-software",
    pageTitle: "Custom Software Development Services",
    intent: "TRANSACTIONAL",
    priority: "P0",
    primaryKeyword: "custom software development company",
    secondaryKeywords: [
      "bespoke enterprise software solutions",
      "workflow automation software engineering",
      "scalable database architecture",
    ],
    targetAudience: "Mid-to-large businesses replacing rigid off-the-shelf software with tailored systems.",
    conversionGoal: "Schedule requirements discovery session for bespoke software.",
    serpSnippetGuidelines: {
      recommendedTitle: "Custom Software Engineering Services | Axivon Technologies",
      recommendedDescription:
        "Tailored enterprise platforms, automation systems, and scalable backend architectures engineered around your exact operational workflows.",
    },
  },
  {
    targetPath: "/services/ai-solutions",
    pageTitle: "AI & Machine Learning Solutions",
    intent: "COMMERCIAL",
    priority: "P1",
    primaryKeyword: "ai integration services for business",
    secondaryKeywords: [
      "custom llm integration",
      "enterprise ai automation",
      "intelligent chatbot development",
      "rag knowledge base implementation",
    ],
    targetAudience: "Product teams augmenting customer support, search, or internal data with LLM intelligence.",
    conversionGoal: "Submit AI discovery inquiry or prototype feasibility request.",
    serpSnippetGuidelines: {
      recommendedTitle: "Enterprise AI Solutions & Custom LLM Integration | Axivon",
      recommendedDescription:
        "Deploy practical, production-ready AI models, intelligent assistants, and automated data pipelines with strict data privacy guarantees.",
    },
  },
  {
    targetPath: "/demos",
    pageTitle: "Interactive Demo Portfolio",
    intent: "COMMERCIAL",
    priority: "P0",
    primaryKeyword: "interactive website development portfolio",
    secondaryKeywords: [
      "live web application demos",
      "full stack real estate web platform demo",
      "fitness gym management demo system",
      "ecommerce storefront interactive prototype",
    ],
    targetAudience: "Prospective clients verifying engineering quality through functional, testable demos.",
    conversionGoal: "Experience live demos and click 'Build Similar Website' to convert inquiry.",
    serpSnippetGuidelines: {
      recommendedTitle: "Interactive Web Platform Demos | Live Portfolio | Axivon",
      recommendedDescription:
        "Interact with 8 fully functional demo platforms across Healthcare, Real Estate, E-Commerce, Education, and Fitness. Test live UI and client workflows.",
    },
  },
  {
    targetPath: "/about",
    pageTitle: "About Axivon Technologies",
    intent: "NAVIGATIONAL",
    priority: "P1",
    primaryKeyword: "about axivon technologies",
    secondaryKeywords: [
      "axivon technologies rajkot gujarat",
      "software development team rajkot",
      "vikash kumar software architect",
    ],
    targetAudience: "Partners and clients verifying company legitimacy, leadership, and engineering principles.",
    conversionGoal: "Build trust and direct users to contact or demo projects.",
    serpSnippetGuidelines: {
      recommendedTitle: "About Us | Axivon Technologies — Engineering Digital Growth",
      recommendedDescription:
        "Learn about Axivon Technologies' mission, engineering leadership, verified milestones, and transparent client delivery philosophy.",
    },
  },
  {
    targetPath: "/contact",
    pageTitle: "Contact & Project Inquiries",
    intent: "TRANSACTIONAL",
    priority: "P0",
    primaryKeyword: "contact software development company",
    secondaryKeywords: [
      "hire software engineers india",
      "request software development proposal",
      "axivon technologies contact phone email",
    ],
    targetAudience: "Ready-to-buy decision makers seeking immediate project pricing or proposals.",
    conversionGoal: "Submit verified inquiry form with project scope and budget tier.",
    serpSnippetGuidelines: {
      recommendedTitle: "Contact Axivon Technologies | Request a Project Proposal",
      recommendedDescription:
        "Discuss your project timeline, requirements, and budget with our engineering team. Transparent communication, direct quotes, and NDAs supported.",
    },
  },
  {
    targetPath: "/partners",
    pageTitle: "Business Partner Program",
    intent: "COMMERCIAL",
    priority: "P1",
    primaryKeyword: "technology partner program india",
    secondaryKeywords: [
      "referral partner software development",
      "earn commission software agency",
      "axivon business partner",
    ],
    targetAudience: "Independent consultants, agency founders, and business development professionals.",
    conversionGoal: "Submit verified business partner onboarding application.",
    serpSnippetGuidelines: {
      recommendedTitle: "Business Partner Program | Earn Commission | Axivon",
      recommendedDescription:
        "Collaborate with Axivon Technologies as an official business partner. Transparent commissions, dedicated portal access, and verified project tracking.",
    },
  },
  {
    targetPath: "/careers",
    pageTitle: "Careers at Axivon",
    intent: "INFORMATIONAL",
    priority: "P1",
    primaryKeyword: "careers axivon technologies",
    secondaryKeywords: [
      "full stack developer jobs rajkot",
      "remote typescript react jobs india",
      "axivon software careers",
    ],
    targetAudience: "Engineers and designers seeking transparent, remote-first software roles.",
    conversionGoal: "Submit job application with portfolio and resume.",
    serpSnippetGuidelines: {
      recommendedTitle: "Careers at Axivon Technologies | Engineering & Design Roles",
      recommendedDescription:
        "Explore open positions in Next.js development, TypeScript engineering, UI/UX architecture, and product growth. Build impactful software with us.",
    },
  },
  {
    targetPath: "/blog",
    pageTitle: "Engineering & Architecture Blog",
    intent: "INFORMATIONAL",
    priority: "P1",
    primaryKeyword: "web architecture and development insights",
    secondaryKeywords: [
      "next js app router production best practices",
      "enterprise technical seo guidelines",
      "zero pii analytics engineering",
    ],
    targetAudience: "Developers, founders, and technical managers researching practical software solutions.",
    conversionGoal: "Read engineering articles and explore relevant services or demos.",
    serpSnippetGuidelines: {
      recommendedTitle: "Engineering Blog | Architecture, Next.js & Tech Insights | Axivon",
      recommendedDescription:
        "Practical engineering guides, technical architecture breakdowns, and product development lessons from the team at Axivon Technologies.",
    },
  },
];

const PATH_ALIASES: Record<string, string> = {
  "/demos": "/demos",
  "/demo-projects": "/demos",
  "/partners": "/partners",
  "/business-partner": "/partners",
  "/services/mobile-app-development": "/services/mobile-apps",
  "/services/custom-software-development": "/services/custom-software",
};

function normalizePath(p: string): string {
  const stripped = p.replace(/\/+$/, "");
  return stripped === "" ? "/" : stripped;
}

/**
 * Helper to find mapped keywords and guidelines for a given URL path.
 */
export function getKeywordMappingForPath(path: string): KeywordPageMapping | undefined {
  const normalized = normalizePath(path);
  const resolved = PATH_ALIASES[normalized] || normalized;
  return KEYWORD_PAGE_MAPPINGS.find(
    (m) => normalizePath(m.targetPath) === resolved
  );
}

/**
 * Helper to get all mappings by intent type.
 */
export function getMappingsByIntent(intent: SearchIntent): KeywordPageMapping[] {
  return KEYWORD_PAGE_MAPPINGS.filter((m) => m.intent === intent);
}

