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
  category: "COMPANY" | "SERVICES" | "PROCESS" | "PRICING" | "FAQ" | "PORTFOLIO" | "TECHNOLOGY" | "CONTACT" | "INDUSTRIES";
  keywords: string[];
  title: string;
  content: string;
  priority: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
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

export const AXIVON_KNOWLEDGE: KnowledgeEntry[] = [
  // ── COMPANY ──────────────────────────────────────────────────────────────────
  {
    id: "company-overview",
    category: "COMPANY",
    keywords: ["axivon", "company", "about", "who", "what", "founded", "overview", "technologies"],
    title: "About Axivon Technologies",
    content:
      "Axivon Technologies is a premier Indian technology company specializing in Website Development, Mobile App Development, AI Solutions, Custom Software, UI/UX Design, Cloud & DevOps, SEO, IoT, and Robotics. Founded by Vikash Kumar (Founder & CEO) and Pathan Rokhiya Khanam (Co-Founder), the company serves startups, SMEs, and enterprises across India and internationally. Axivon operates with a team of expert engineers, designers, and product specialists focused on delivering measurable results.",
    priority: 9,
    confidence: "HIGH",
  },
  {
    id: "founder-info",
    category: "COMPANY",
    keywords: ["founder", "ceo", "vikash", "rokhiya", "team", "leadership", "owner", "co-founder", "pathan"],
    title: "Axivon Leadership Team",
    content:
      "Axivon Technologies is led by Vikash Kumar, Founder & CEO, who oversees strategic direction, software architecture, and AI innovation. Pathan Rokhiya Khanam is the Co-Founder, responsible for operational excellence, client experience, and business growth. Together they lead a team of engineers, designers, and product professionals.",
    priority: 8,
    confidence: "HIGH",
  },
  // ── SERVICES ─────────────────────────────────────────────────────────────────
  {
    id: "service-web-development",
    category: "SERVICES",
    keywords: ["website", "web", "react", "next", "frontend", "backend", "landing page", "business website", "ecommerce", "portfolio site", "web app"],
    title: "Web Development",
    content:
      "Axivon builds high-performance websites and web applications using Next.js, React 19, TypeScript, and Tailwind CSS. Services include business websites, landing pages, e-commerce portals, SaaS platforms, and enterprise web apps. All sites are SEO-optimized, mobile-responsive, and built for speed and security.",
    priority: 9,
    confidence: "HIGH",
  },
  {
    id: "service-mobile-app",
    category: "SERVICES",
    keywords: ["mobile", "app", "android", "ios", "flutter", "react native", "application", "smartphone", "play store", "app store", "cross-platform"],
    title: "Mobile App Development",
    content:
      "Axivon builds native and cross-platform mobile applications for iOS and Android using React Native and Flutter. Apps include ordering apps, booking systems, delivery apps, loyalty apps, healthcare apps, education apps, and custom business apps. Complete with cloud backend, push notifications, payment integrations, and App Store/Play Store publishing.",
    priority: 9,
    confidence: "HIGH",
  },
  {
    id: "service-ai-solutions",
    category: "SERVICES",
    keywords: ["ai", "artificial intelligence", "machine learning", "chatbot", "llm", "automation", "ml", "gpt", "nlp", "intelligent", "prediction", "recommendation"],
    title: "AI Solutions",
    content:
      "Axivon delivers custom AI solutions including AI chatbots, intelligent automation, predictive analytics, custom LLM integrations, computer vision, NLP systems, and AI-powered dashboards. Suitable for businesses wanting to automate processes, gain insights from data, or build AI-first products.",
    priority: 9,
    confidence: "HIGH",
  },
  {
    id: "service-custom-software",
    category: "SERVICES",
    keywords: ["custom software", "erp", "crm", "management system", "enterprise", "workflow", "internal tool", "business software", "saas", "platform"],
    title: "Custom Software Development",
    content:
      "Axivon builds tailor-made software solutions including CRMs, ERPs, SaaS platforms, business management systems, internal tools, and workflow automation systems. Built with scalable architecture, role-based access control, and integration capabilities. Ideal when off-the-shelf solutions do not fit your business model.",
    priority: 9,
    confidence: "HIGH",
  },
  {
    id: "service-uiux",
    category: "SERVICES",
    keywords: ["ui", "ux", "design", "figma", "wireframe", "prototype", "user experience", "user interface", "visual design", "mockup"],
    title: "UI/UX Design",
    content:
      "Axivon provides comprehensive UI/UX design services including user research, wireframing, interactive prototypes, design systems, and pixel-perfect visual design using Figma. Designs are optimized for conversion, usability, and brand consistency.",
    priority: 8,
    confidence: "HIGH",
  },
  {
    id: "service-cloud-devops",
    category: "SERVICES",
    keywords: ["cloud", "aws", "gcp", "devops", "server", "deployment", "hosting", "docker", "kubernetes", "ci/cd", "infrastructure"],
    title: "Cloud & DevOps",
    content:
      "Axivon offers cloud infrastructure setup and DevOps services including AWS/GCP cloud architecture, Docker containerization, Kubernetes orchestration, CI/CD pipeline automation, and managed deployments with 99.9% uptime SLA management.",
    priority: 8,
    confidence: "HIGH",
  },
  {
    id: "service-seo",
    category: "SERVICES",
    keywords: ["seo", "search engine", "google ranking", "digital marketing", "keywords", "organic traffic", "content marketing"],
    title: "SEO & Digital Marketing",
    content:
      "Axivon's SEO and digital marketing services help businesses rank higher on Google through technical SEO audits, keyword strategy, on-page optimization, content marketing, link building, and performance tracking. Results-driven campaigns for sustainable organic growth.",
    priority: 8,
    confidence: "HIGH",
  },
  {
    id: "service-iot-robotics",
    category: "SERVICES",
    keywords: ["iot", "robotics", "embedded", "arduino", "raspberry pi", "sensors", "hardware", "automation hardware", "smart device"],
    title: "IoT & Robotics",
    content:
      "Axivon designs and develops IoT solutions and robotics projects including smart sensors, automated systems, real-time monitoring platforms, agricultural IoT, environmental monitoring, and educational robotics. Projects include Arduino/Raspberry Pi systems with cloud dashboards.",
    priority: 8,
    confidence: "HIGH",
  },
  // ── PRICING ──────────────────────────────────────────────────────────────────
  {
    id: "pricing-general",
    category: "PRICING",
    keywords: ["price", "cost", "pricing", "quote", "budget", "estimate", "how much", "charge", "fee", "rate", "affordable", "rupees", "inr", "₹", "lakh", "thousand"],
    title: "Project Pricing at Axivon",
    content:
      "Axivon Technologies projects start from ₹15,000 for basic websites. Mobile apps and custom software typically start from ₹50,000 onwards. AI solutions and complex enterprise software vary based on scope. Final pricing depends on features, complexity, integrations, timeline, and technology stack. An exact quotation requires a free consultation call. Axivon does not offer guaranteed discounts or fixed-price promises without a detailed scope review.",
    priority: 9,
    confidence: "HIGH",
  },
  {
    id: "pricing-consultation",
    category: "PRICING",
    keywords: ["get quote", "get estimate", "get proposal", "free consultation", "discuss requirements", "talk about project"],
    title: "Getting a Price Quote",
    content:
      "To get an accurate quote, book a free consultation. Share your project requirements and the Axivon team will provide a detailed estimate within 2-5 business days. Contact via WhatsApp at +91 94732 63768, email at contact@axivontech.in, or fill the contact form at axivontech.in/contact.",
    priority: 8,
    confidence: "HIGH",
  },
  // ── PROCESS ──────────────────────────────────────────────────────────────────
  {
    id: "process-overview",
    category: "PROCESS",
    keywords: ["process", "how", "work", "steps", "methodology", "approach", "workflow", "development process", "how do you build"],
    title: "Axivon Development Process",
    content:
      "Axivon follows a 6-stage process: 1. Discovery — understand your requirements, goals, and constraints. 2. Planning — architecture, technology selection, and project roadmap. 3. UI/UX Design — wireframes, prototypes, and visual design. 4. Development — agile sprints with regular demos. 5. Testing — QA, performance, and security testing. 6. Deployment & Support — go-live, training, and ongoing maintenance.",
    priority: 8,
    confidence: "HIGH",
  },
  {
    id: "process-timeline",
    category: "PROCESS",
    keywords: ["timeline", "duration", "time", "how long", "weeks", "months", "delivery", "deadline", "launch"],
    title: "Project Timelines",
    content:
      "Typical timelines: Simple business websites — 2 to 4 weeks. E-commerce sites — 4 to 8 weeks. Mobile apps (basic) — 6 to 12 weeks. Custom software platforms — 3 to 6 months. AI/ML projects — 4 to 8 months. Timelines depend on scope, complexity, and client feedback speed.",
    priority: 8,
    confidence: "HIGH",
  },
  // ── FAQ ──────────────────────────────────────────────────────────────────────
  {
    id: "faq-maintenance",
    category: "FAQ",
    keywords: ["maintenance", "support", "after", "post-launch", "bug", "update", "ongoing", "hosting", "manage"],
    title: "Post-Launch Support & Maintenance",
    content:
      "Axivon provides post-launch maintenance and support packages including bug fixes, security updates, performance monitoring, and feature enhancements. Support is available via WhatsApp, email, and scheduled calls. Maintenance plans are customized based on project type.",
    priority: 7,
    confidence: "HIGH",
  },
  {
    id: "faq-nda-ip",
    category: "FAQ",
    keywords: ["nda", "intellectual property", "ip", "ownership", "code", "source code", "confidential", "rights"],
    title: "NDA & IP Ownership",
    content:
      "Axivon signs NDAs and IP assignment agreements for all client projects. All source code and intellectual property transfers to the client upon final payment. Axivon takes confidentiality very seriously.",
    priority: 7,
    confidence: "HIGH",
  },
  {
    id: "faq-services-all",
    category: "FAQ",
    keywords: ["services", "offer", "what do you do", "what can you build", "capabilities", "what axivon does"],
    title: "All Axivon Services",
    content:
      "Axivon Technologies offers: Web Development, Mobile App Development (iOS & Android), AI Solutions & Chatbots, Custom Software Development, UI/UX Design, Cloud & DevOps, SEO & Digital Marketing, IoT Solutions, and Robotics. From startups to enterprises, Axivon delivers end-to-end digital solutions.",
    priority: 9,
    confidence: "HIGH",
  },
  // ── PORTFOLIO ─────────────────────────────────────────────────────────────────
  {
    id: "portfolio-overview",
    category: "PORTFOLIO",
    keywords: ["portfolio", "project", "work", "built", "example", "past work", "case study", "client"],
    title: "Axivon Portfolio Overview",
    content:
      "Axivon has built several impactful projects including: Axivon Technologies (company website), Krishi Drishti (AI smart irrigation for agriculture), JalMitra (solar-powered water cleaning system with AI), and Nani Tathagat (business automation & lead generation platform). View the full portfolio at axivontech.in/portfolio.",
    priority: 8,
    confidence: "HIGH",
  },
  {
    id: "portfolio-krishi-drishti",
    category: "PORTFOLIO",
    keywords: ["krishi drishti", "agriculture", "farm", "irrigation", "iot agriculture", "smart farming", "agri"],
    title: "Portfolio: Krishi Drishti",
    content:
      "Krishi Drishti is an AI-powered smart irrigation platform built by Axivon. Features: IoT sensor monitoring, weather analytics, automated irrigation control, real-time agricultural insights. Live at krishi-drishti.onrender.com. Technologies: HTML, CSS, JavaScript, Firebase, Node.js, IoT.",
    priority: 7,
    confidence: "HIGH",
  },
  {
    id: "portfolio-jalmitra",
    category: "PORTFOLIO",
    keywords: ["jalmitra", "water", "solar", "environment", "cleaning", "environmental technology", "waste"],
    title: "Portfolio: JalMitra",
    content:
      "JalMitra is a smart AI-based solar water cleaning system to remove floating waste from water bodies using automation and environmental monitoring. Live at jal-mitraafrontend.onrender.com. Technologies: HTML, CSS, JavaScript, Firebase, Node.js, AI, IoT.",
    priority: 7,
    confidence: "HIGH",
  },
  {
    id: "portfolio-nani-tathagat",
    category: "PORTFOLIO",
    keywords: ["nani tathagat", "business automation", "lead generation", "sales", "marketing automation"],
    title: "Portfolio: Nani Tathagat",
    content:
      "Nani Tathagat is a business automation and lead generation platform for streamlining operations, marketing, sales, and customer engagement. Live at nanitathagat.in. Technologies: HTML, CSS, JavaScript, Node.js, SQL, Bootstrap, Google Apps Script.",
    priority: 7,
    confidence: "HIGH",
  },
  // ── CONTACT ──────────────────────────────────────────────────────────────────
  {
    id: "contact-info",
    category: "CONTACT",
    keywords: ["contact", "email", "phone", "whatsapp", "reach", "talk", "call", "message", "address", "location", "get in touch"],
    title: "Contact Axivon Technologies",
    content:
      "Contact Axivon Technologies:\n📧 Email: contact@axivontech.in\n📞 WhatsApp/Call: +91 94732 63768\n🌐 Website: https://axivontech.in/contact\n💬 WhatsApp Direct: https://wa.me/919473263768\n\nThe team responds within 24 hours on business days.",
    priority: 10,
    confidence: "HIGH",
  },
  // ── TECHNOLOGY ───────────────────────────────────────────────────────────────
  {
    id: "technology-stack",
    category: "TECHNOLOGY",
    keywords: ["technology", "stack", "tools", "language", "framework", "typescript", "python", "flutter", "react", "node", "postgres", "firebase", "aws"],
    title: "Axivon Technology Stack",
    content:
      "Axivon uses a modern tech stack: Frontend: Next.js, React, TypeScript, Tailwind CSS, Framer Motion. Backend: Node.js, Python, Express, Prisma, REST APIs, GraphQL. Mobile: React Native, Flutter. Databases: PostgreSQL, MySQL, MongoDB, Firebase. Cloud: AWS, GCP, Vercel, Render. AI: Gemini, OpenAI, custom ML models. IoT: Arduino, Raspberry Pi, MQTT.",
    priority: 8,
    confidence: "HIGH",
  },
  // ── INDUSTRIES ───────────────────────────────────────────────────────────────
  {
    id: "industries-served",
    category: "INDUSTRIES",
    keywords: ["industry", "sector", "restaurant", "hotel", "hospital", "school", "education", "startup", "business", "retail", "manufacturing", "agriculture", "healthcare", "logistics"],
    title: "Industries Served by Axivon",
    content:
      "Axivon serves many industries: Restaurants & Food (ordering, table booking, delivery), Retail & E-commerce, Healthcare & Clinics, Education & EdTech, Agriculture & AgriTech, Startups & SaaS, Manufacturing & Operations, Logistics & Supply Chain, Real Estate, and General Business Services. Solutions are customized for each industry.",
    priority: 8,
    confidence: "HIGH",
  },
];

// ── Knowledge Search (keyword TF-IDF style) ──────────────────────────────────
export function searchKnowledge(query: string, topK = 3): KnowledgeEntry[] {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  const scored = AXIVON_KNOWLEDGE.map((entry) => {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) score += entry.priority * 2;
    }
    for (const w of words) {
      if (entry.content.toLowerCase().includes(w)) score += 1;
      if (entry.title.toLowerCase().includes(w)) score += 2;
    }
    return { entry, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.entry);
}

// ── Intent Detection ─────────────────────────────────────────────────────────
export function detectIntent(
  message: string,
  history: Array<{ role: string; content: string }> = []
): ChatIntent {
  const m = message.toLowerCase();

  const humanTriggers = ["speak to human", "talk to someone", "real person", "live agent", "call me", "escalate", "complaint", "i want to talk"];
  if (humanTriggers.some((t) => m.includes(t))) return "HUMAN_HANDOFF";

  const pricingTriggers = ["price", "cost", "how much", "budget", "quote", "pricing", "estimate", "charge", "fee", "₹", "rupees", "inr", "lakh"];
  if (pricingTriggers.some((t) => m.includes(t))) return "PRICING";

  const portfolioTriggers = ["portfolio", "past work", "example", "previous project", "case study", "built before", "show me work"];
  if (portfolioTriggers.some((t) => m.includes(t))) return "PORTFOLIO";

  const projectTriggers = ["i want", "i need", "build", "create", "develop", "make", "need an app", "need a website", "need software", "looking for", "planning to", "want to create", "want to build"];
  if (projectTriggers.some((t) => m.includes(t))) return "PROJECT_INQUIRY";

  const serviceTriggers = ["service", "offer", "provide", "do you do", "can you", "mobile app", "web development", "ai solution", "seo", "cloud", "iot", "robotics", "software"];
  if (serviceTriggers.some((t) => m.includes(t))) return "SERVICE_INFORMATION";

  const leadTriggers = ["contact me", "get in touch", "send details", "book consultation", "schedule call", "free consultation"];
  if (leadTriggers.some((t) => m.includes(t))) return "LEAD_CAPTURE";

  // Context-aware — if recent msgs are about a project, continuation counts as PROJECT_INQUIRY
  const recentContext = history.slice(-4).map((h) => h.content.toLowerCase()).join(" ");
  if (recentContext.includes("project") || recentContext.includes("app") || recentContext.includes("website") || recentContext.includes("build")) {
    const continueTerms = ["restaurant", "hospital", "school", "retail", "ecommerce", "startup", "yes", "ordering", "booking", "delivery", "features", "month", "week", "budget", "lakh"];
    if (continueTerms.some((t) => m.includes(t))) return "PROJECT_INQUIRY";
  }

  return "UNKNOWN";
}

// ── Lead Scoring ─────────────────────────────────────────────────────────────
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
  if (score >= 9) return "HOT";
  if (score >= 5) return "WARM";
  return "COLD";
}

// ── Conversation Summary ─────────────────────────────────────────────────────
export function generateConversationSummary(
  data: LeadData,
  messages: Array<{ role: string; content: string }>
): string {
  const parts: string[] = [];
  if (data.industry) parts.push(`${data.industry} business`);
  if (data.projectType) parts.push(`looking for ${data.projectType}`);
  if (data.features) parts.push(`with features: ${data.features}`);
  if (data.platform) parts.push(`on ${data.platform}`);
  if (data.budget) parts.push(`budget approx. ${data.budget}`);
  if (data.timeline) parts.push(`timeline ${data.timeline}`);
  if (data.existingSystem) parts.push(`existing system: ${data.existingSystem}`);
  return parts.length > 0
    ? parts.join(". ") + "."
    : `Chatbot inquiry with ${messages.length} messages exchanged.`;
}
