import { db } from "@/lib/db";

export type ChatIntent =
  | "GENERAL_INFORMATION"
  | "SERVICE_INFORMATION"
  | "PRICING"
  | "PORTFOLIO"
  | "PROJECT_INQUIRY"
  | "LEAD_CAPTURE"
  | "HUMAN_HANDOFF"
  | "UNKNOWN";

export interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  sourceType: string;
  sourceReference?: string | null;
  version: number;
}

export interface LeadData {
  projectType?: string;
  industry?: string;
  features?: string;
  platform?: string;
  budget?: string;
  timeline?: string;
  existingSystem?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  serviceInterest?: string;
  requirementSummary?: string;
}

/**
 * ── AUTHORITATIVE KNOWLEDGE RETRIEVAL ─────────────────────────────────────────
 * Retrieves ONLY currently published knowledge from the database.
 * Does NOT merge with static duplicate shadow arrays to ensure that deleted
 * or unpublished documents are immediately excluded.
 */
export async function getPublishedKnowledge(): Promise<KnowledgeEntry[]> {
  try {
    const docs = await db.knowledgeDocument.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        category: true,
        content: true,
        tags: true,
        sourceType: true,
        sourceReference: true,
        version: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return docs.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      content: d.content,
      tags: d.tags || [],
      sourceType: d.sourceType,
      sourceReference: d.sourceReference,
      version: d.version,
    }));
  } catch (error) {
    console.error("[KnowledgeBase] Failed to fetch published knowledge:", error);
    return [];
  }
}

/**
 * Verified initial knowledge definitions derived strictly from authoritative
 * repository sources (src/app/about/page.tsx, src/components/Footer.tsx, src/app/services).
 * Used exclusively for idempotent seeding into the database.
 */
export const VERIFIED_SEED_KNOWLEDGE: Array<{
  title: string;
  category: string;
  content: string;
  tags: string[];
  sourceType: string;
  sourceReference: string;
}> = [
  {
    title: "About Axivon Technologies & Mission",
    category: "COMPANY",
    content:
      "Axivon Technologies is an Indian technology company specializing in Website Development, Mobile App Development, AI Solutions, Custom Software Development, UI/UX Design, Cloud & DevOps, and SEO. Founded with a mission to help modern businesses embrace digital transformation with enterprise-grade, resilient architecture and intuitive user experiences. Axivon partners with startups, growing mid-market companies, and established enterprises across industries.",
    tags: ["axivon", "about", "mission", "company", "overview", "technologies"],
    sourceType: "WEBSITE_PAGE",
    sourceReference: "/about",
  },
  {
    title: "Leadership Team & Founders",
    category: "COMPANY",
    content:
      "Axivon Technologies leadership:\n- Vikas Kumar (Founder): Focuses on Strategic Direction, Software Architecture, and AI Innovation. 'Building purposeful digital solutions that turn ambitious ideas into market leadership.'\n- P. Rokhiya Khanam (Co-Founder): Focuses on Operational Excellence, Client Experience, and Business Growth. 'Ensuring every client engagement achieves real business results and flawless execution.'",
    tags: ["founder", "ceo", "vikas kumar", "rokhiya khanam", "leadership", "team", "co-founder"],
    sourceType: "WEBSITE_PAGE",
    sourceReference: "/about",
  },
  {
    title: "Web Development Services",
    category: "SERVICES",
    content:
      "Axivon engineers high-performance web applications, business websites, SaaS platforms, and custom portals using modern technologies including Next.js, React, TypeScript, and Tailwind CSS. All web applications are engineered for search engine optimization (SEO), sub-second load times, responsive mobile-first layouts, and enterprise security.",
    tags: ["web development", "website", "nextjs", "react", "frontend", "backend", "saas", "portal"],
    sourceType: "WEBSITE_PAGE",
    sourceReference: "/services/web-development",
  },
  {
    title: "Mobile App Development Services",
    category: "SERVICES",
    content:
      "Axivon builds native and cross-platform mobile applications for iOS and Android using Flutter and React Native. Solutions range from on-demand booking systems, consumer marketplaces, healthcare applications, and enterprise workflow tools with cloud synchronization, push notifications, and App Store / Google Play publishing support.",
    tags: ["mobile app", "android", "ios", "flutter", "react native", "smartphone", "application"],
    sourceType: "WEBSITE_PAGE",
    sourceReference: "/services/mobile-app-development",
  },
  {
    title: "AI Solutions & Automation",
    category: "SERVICES",
    content:
      "Axivon delivers bespoke Artificial Intelligence and machine learning integrations, including conversational AI assistants, workflow automation, natural language processing, predictive analytics, and intelligent business intelligence dashboards to automate manual processes and extract actionable business insights.",
    tags: ["ai", "artificial intelligence", "machine learning", "automation", "chatbot", "llm", "nlp"],
    sourceType: "WEBSITE_PAGE",
    sourceReference: "/services/ai-solutions",
  },
  {
    title: "Custom Software & Cloud DevOps",
    category: "SERVICES",
    content:
      "Axivon architects and develops tailored software platforms, internal operations tools, CRMs, and ERPs designed for specific business models when off-the-shelf software falls short. Services include cloud infrastructure management (AWS, GCP), containerization (Docker, Kubernetes), and CI/CD automated deployments.",
    tags: ["custom software", "crm", "erp", "cloud", "devops", "aws", "docker", "scalability"],
    sourceType: "WEBSITE_PAGE",
    sourceReference: "/services",
  },
  {
    title: "SEO & Digital Marketing",
    category: "SERVICES",
    content:
      "Axivon provides technical SEO audits, search engine marketing (SEM), keyword positioning, structured data optimization, content strategy, and performance analytics to increase qualified organic search visibility and digital customer acquisition.",
    tags: ["seo", "digital marketing", "sem", "google ranking", "organic search", "analytics"],
    sourceType: "WEBSITE_PAGE",
    sourceReference: "/services/seo-services",
  },
  {
    title: "Project Pricing & Estimation Policy",
    category: "PRICING",
    content:
      "At Axivon Technologies, all project pricing is custom-scoped based on architectural complexity, feature requirements, integrations, design specifications, and delivery timelines. Axivon does not offer one-size-fits-all fixed packages or unverified guarantees. Every engagement begins with a free discovery consultation call, after which our engineering team delivers a structured proposal detailing the scope, timeline, and investment.",
    tags: ["pricing", "cost", "quote", "budget", "estimate", "fee", "how much", "consultation"],
    sourceType: "WEBSITE_PAGE",
    sourceReference: "/contact",
  },
  {
    title: "Development Process & Methodology",
    category: "PROCESS",
    content:
      "Axivon follows an outcome-driven development methodology:\n1. Discovery & Requirement Analysis: Deep understanding of business goals, technical constraints, and user personas.\n2. Architecture & Roadmap: Technical architecture specification, database design, and sprint milestones.\n3. UI/UX Design: Wireframes, interactive prototypes, and conversion-optimized design systems.\n4. Agile Development: Sprint-based implementation with frequent milestone demos.\n5. QA & Security Testing: Performance auditing, automated regression, and security verification.\n6. Deployment & Post-Launch Support: Production launch, monitoring, and ongoing maintenance.",
    tags: ["process", "methodology", "agile", "workflow", "steps", "discovery", "timeline"],
    sourceType: "WEBSITE_PAGE",
    sourceReference: "/about",
  },
  {
    title: "Official Contact Channels & Inquiries",
    category: "CONTACT",
    content:
      "Official Contact Details for Axivon Technologies:\n- Email: info@axivontech.in\n- WhatsApp / Phone: +91 9473263768 (Direct WhatsApp: https://wa.me/919473263768)\n- Website & Inquiries: https://axivontech.in/contact\n- Office Hours: Business days, responses typically within 24 hours.",
    tags: ["contact", "email", "phone", "whatsapp", "reach", "support", "office"],
    sourceType: "WEBSITE_PAGE",
    sourceReference: "/contact",
  },
  {
    title: "Portfolio & Verified Case Studies",
    category: "PORTFOLIO",
    content:
      "Notable verified projects delivered by Axivon Technologies:\n- Krishi Drishti: Smart AI & IoT-enabled agricultural irrigation system.\n- JalMitra: Solar-powered automated water cleaning system with environmental monitoring.\n- Nani Tathagat: Business workflow automation and lead capture platform.\nFull portfolio and interactive demonstrations are accessible at https://axivontech.in/portfolio.",
    tags: ["portfolio", "case studies", "krishi drishti", "jalmitra", "nani tathagat", "past work"],
    sourceType: "WEBSITE_PAGE",
    sourceReference: "/portfolio",
  },
];

/**
 * ── IDEMPOTENT INITIAL KNOWLEDGE SEEDING ─────────────────────────────────────
 * Seeds verified initial records into the database without overwriting
 * existing administrator edits. Requires administrative authorization.
 */
export async function seedInitialKnowledge(userId?: string | null): Promise<{
  success: boolean;
  seededCount: number;
  skippedCount: number;
  existingCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let seededCount = 0;
  let skippedCount = 0;

  try {
    const existingDocs = await db.knowledgeDocument.findMany({
      select: { title: true },
    });
    const existingTitles = new Set(existingDocs.map((d) => d.title.trim().toLowerCase()));

    for (const seed of VERIFIED_SEED_KNOWLEDGE) {
      const normalizedTitle = seed.title.trim().toLowerCase();
      if (existingTitles.has(normalizedTitle)) {
        skippedCount++;
        continue;
      }

      try {
        await db.knowledgeDocument.create({
          data: {
            title: seed.title,
            category: seed.category,
            content: seed.content,
            tags: seed.tags,
            sourceType: seed.sourceType,
            sourceReference: seed.sourceReference,
            status: "PUBLISHED",
            version: 1,
            createdById: userId || null,
            updatedById: userId || null,
          },
        });
        seededCount++;
        existingTitles.add(normalizedTitle);
      } catch (insertErr) {
        errors.push(`Failed to insert '${seed.title}': ${(insertErr as Error).message}`);
      }
    }

    return {
      success: errors.length === 0,
      seededCount,
      skippedCount,
      existingCount: existingDocs.length,
      errors,
    };
  } catch (err) {
    return {
      success: false,
      seededCount,
      skippedCount,
      existingCount: 0,
      errors: [(err as Error).message],
    };
  }
}

/**
 * ── MULTI-FIELD RELEVANCE SEARCH ──────────────────────────────────────────────
 * Searches verified published documents using keyword overlap, title match,
 * category match, and content term frequency.
 */
export function searchKnowledge(
  query: string,
  documents: KnowledgeEntry[],
  topK = 4
): Array<{ entry: KnowledgeEntry; score: number; confidence: "HIGH" | "MEDIUM" | "LOW" }> {
  if (!query || documents.length === 0) return [];

  const q = query.toLowerCase();
  const words = q
    .split(/[^a-zA-Z0-9]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2);

  const scored = documents.map((entry) => {
    let score = 0;
    const titleLower = entry.title.toLowerCase();
    const contentLower = entry.content.toLowerCase();
    const categoryLower = entry.category.toLowerCase();
    const tagsLower = entry.tags.map((t) => t.toLowerCase());

    // 1. Tag matching (+5 points for exact tag match, +2 for tag word match)
    for (const tag of tagsLower) {
      if (q.includes(tag)) {
        score += 5;
      } else {
        const tagWords = tag.split(/[^a-zA-Z0-9]+/).filter((tw) => tw.length > 2);
        for (const tw of tagWords) {
          if (words.includes(tw)) score += 2;
        }
      }
    }

    // 2. Title matching (+4 points for exact substring, +3 per word)
    if (q.includes(titleLower) || titleLower.includes(q)) score += 8;
    for (const w of words) {
      if (titleLower.includes(w)) score += 3;
    }

    // 3. Category matching (+3 points)
    if (q.includes(categoryLower)) score += 3;

    // 4. Content keyword matching (+2 points per matching word)
    for (const w of words) {
      if (contentLower.includes(w)) score += 2;
    }

    let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    if (score >= 10) confidence = "HIGH";
    else if (score >= 4) confidence = "MEDIUM";

    return { entry, score, confidence };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * ── INTENT DETECTION ─────────────────────────────────────────────────────────
 * Classifies user intent based on user query and recent conversational history.
 */
export function detectIntent(
  message: string,
  history: Array<{ role: string; content: string }> = []
): ChatIntent {
  const m = message.toLowerCase();

  const humanTriggers = [
    "human agent",
    "human support",
    "speak to human",
    "speak to a human",
    "talk to a human",
    "talk to human",
    "talk to someone",
    "real person",
    "live agent",
    "call me",
    "escalate",
    "complaint",
    "i want to talk",
    "speak with someone",
  ];
  if (humanTriggers.some((t) => m.includes(t))) return "HUMAN_HANDOFF";

  const pricingTriggers = [
    "price",
    "pricing",
    "cost",
    "how much",
    "budget",
    "quote",
    "quotation",
    "estimate",
    "charge",
    "fee",
    "rates",
    "package",
    "charges",
  ];
  if (pricingTriggers.some((t) => m.includes(t))) return "PRICING";

  const portfolioTriggers = [
    "portfolio",
    "past work",
    "example",
    "previous project",
    "case study",
    "built before",
    "show me work",
    "samples",
    "demos",
    "krishi drishti",
    "jalmitra",
    "nani tathagat",
  ];
  if (portfolioTriggers.some((t) => m.includes(t))) return "PORTFOLIO";

  const projectTriggers = [
    "i want to build",
    "i need a website",
    "i need an app",
    "i want to create",
    "build a website",
    "build an app",
    "develop an app",
    "looking for development",
    "need custom software",
    "hire developer",
    "start a project",
    "get a proposal",
  ];
  if (projectTriggers.some((t) => m.includes(t))) return "PROJECT_INQUIRY";

  const leadTriggers = [
    "contact me",
    "get in touch",
    "schedule a call",
    "book consultation",
    "send proposal",
    "call me back",
    "my email is",
    "my phone is",
  ];
  if (leadTriggers.some((t) => m.includes(t))) return "LEAD_CAPTURE";

  const serviceTriggers = [
    "services",
    "offer",
    "what do you do",
    "what can you build",
    "capabilities",
    "web development",
    "mobile app",
    "ai solution",
    "cloud",
    "devops",
    "seo",
    "ui/ux",
    "design",
  ];
  if (serviceTriggers.some((t) => m.includes(t))) return "SERVICE_INFORMATION";

  // Context-aware continuation check
  const recentContext = history.slice(-4).map((h) => h.content.toLowerCase()).join(" ");
  if (
    recentContext.includes("project") ||
    recentContext.includes("app") ||
    recentContext.includes("website") ||
    recentContext.includes("build")
  ) {
    const continueTerms = [
      "restaurant",
      "hospital",
      "school",
      "ecommerce",
      "startup",
      "features",
      "timeline",
      "budget",
      "weeks",
      "months",
    ];
    if (continueTerms.some((t) => m.includes(t))) return "PROJECT_INQUIRY";
  }

  return "UNKNOWN";
}

/**
 * ── LEAD SCORING ─────────────────────────────────────────────────────────────
 */
export function scoreLead(data: LeadData): "HOT" | "WARM" | "COLD" {
  let score = 0;
  if (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) score += 3;
  if (data.phone && data.phone.replace(/\D/g, "").length >= 10) score += 2;
  if (data.budget) score += 2;
  if (data.timeline) score += 2;
  if (data.projectType && data.projectType !== "default") score += 2;
  if (data.features) score += 1;
  if (data.industry) score += 1;
  if (data.company) score += 1;

  if (score >= 8) return "HOT";
  if (score >= 4) return "WARM";
  return "COLD";
}

/**
 * ── CONVERSATION SUMMARY ─────────────────────────────────────────────────────
 */
export function generateConversationSummary(
  data: LeadData,
  messages: Array<{ role: string; content: string }>
): string {
  const parts: string[] = [];
  if (data.industry) parts.push(`Industry: ${data.industry}`);
  if (data.projectType) parts.push(`Project: ${data.projectType}`);
  if (data.features) parts.push(`Features: ${data.features}`);
  if (data.platform) parts.push(`Platform: ${data.platform}`);
  if (data.budget) parts.push(`Budget: ${data.budget}`);
  if (data.timeline) parts.push(`Timeline: ${data.timeline}`);
  if (data.existingSystem) parts.push(`Current System: ${data.existingSystem}`);

  return parts.length > 0
    ? parts.join(" | ")
    : `Inquiry with ${messages.length} messages exchanged.`;
}

/**
 * ── DYNAMIC PORTFOLIO KNOWLEDGE ──────────────────────────────────────────────
 */
export async function getDynamicPortfolioKnowledge(): Promise<string> {
  try {
    const projects = await db.portfolioProject.findMany({
      where: { status: "PUBLISHED" },
      select: {
        title: true,
        category: true,
        industry: true,
        shortDescription: true,
        technologies: true,
        slug: true,
      },
      take: 10,
    });
    if (projects.length === 0) return "";
    return projects
      .map(
        (p) =>
          `Project: ${p.title} (${p.category} / ${p.industry})\nDescription: ${p.shortDescription}\nTech: ${p.technologies.join(
            ", "
          )}\nURL: https://axivontech.in/portfolio/${p.slug}`
      )
      .join("\n\n");
  } catch {
    return "";
  }
}
