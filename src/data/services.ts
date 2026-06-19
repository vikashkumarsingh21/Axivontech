// src/data/services.ts
// Axivon Technologies — Production Service Data
// ─────────────────────────────────────────────

export type ServiceSlug =
  | "web-development"
  | "mobile-app-development"
  | "ai-solutions"
  | "cloud-solutions"
  | "seo-services"
  | "digital-marketing"
  | "ui-ux-design"
  | "custom-software-development";

export interface ServiceBenefit {
  title: string;
  description: string;
}

export interface ServiceProcess {
  title: string;
  description: string;
}

export interface ServiceTechnology {
  name: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceCTA {
  title: string;
  description: string;
}

export interface ServiceData {
  slug: ServiceSlug;
  title: string;
  shortDescription: string;
  heroDescription: string;
  badge: string;
  icon: string;
  metaTitle: string;
  metaDescription: string;
  benefits: ServiceBenefit[];
  process: ServiceProcess[];
  technologies: ServiceTechnology[];
  faq: ServiceFAQ[];
  cta: ServiceCTA;
}

// ─────────────────────────────────────────────
// Service Definitions
// ─────────────────────────────────────────────

export const servicesData: ServiceData[] = [
  // ── 1. Web Development ──────────────────────
  {
    slug: "web-development",
    title: "Web Development",
    shortDescription:
      "High-performance websites and web applications engineered for scale, speed, and conversions.",
    heroDescription:
      "At Axivon Technologies, we build web experiences that don't just look exceptional — they perform. From lightning-fast marketing sites to complex SaaS platforms, our engineering team delivers pixel-perfect, SEO-optimised, and conversion-focused web solutions that help startups grow and enterprises modernise.",
    badge: "Full-Stack Excellence",
    icon: "Globe",
    metaTitle: "Web Development Services | Axivon Technologies",
    metaDescription:
      "Axivon Technologies delivers high-performance web development — from marketing sites to enterprise SaaS platforms. Next.js, React, TypeScript. Get a free consultation.",
    benefits: [
      {
        title: "Blazing-Fast Performance",
        description:
          "Every millisecond matters. We optimise Core Web Vitals, server-side rendering, and asset delivery so your site scores 90+ on Google PageSpeed — reducing bounce rates and boosting rankings.",
      },
      {
        title: "Conversion-Optimised Architecture",
        description:
          "We design and engineer with your funnel in mind. Strategic CTAs, structured data, and user-flow analysis ensure every visitor has a clear path to becoming a customer.",
      },
      {
        title: "Scalable & Maintainable Codebase",
        description:
          "Built with TypeScript, modular components, and clean architecture patterns so your team can iterate confidently and your platform grows without technical debt.",
      },
      {
        title: "SEO-Ready from Day One",
        description:
          "Semantic HTML, dynamic metadata, sitemap generation, and schema markup baked in — not bolted on. Your site launches search-engine-ready.",
      },
      {
        title: "Security & Compliance",
        description:
          "OWASP best practices, HTTPS enforcement, CSP headers, and GDPR-compliant data handling ensure your platform earns and keeps user trust.",
      },
      {
        title: "Ongoing Support & Iteration",
        description:
          "Post-launch, our team provides SLA-backed support, performance monitoring, and rapid iteration cycles so you never hit a growth ceiling.",
      },
    ],
    process: [
      {
        title: "Discovery & Scope Definition",
        description:
          "We start with a deep-dive into your business goals, target users, and technical requirements. We audit existing systems, define success metrics, and produce a comprehensive project blueprint.",
      },
      {
        title: "Architecture & Tech Stack Planning",
        description:
          "Our architects select the optimal stack — Next.js, Remix, or headless CMS — and design the data models, API contracts, and infrastructure topology before a single line of code is written.",
      },
      {
        title: "UI Design & Prototype Review",
        description:
          "Our design team delivers high-fidelity Figma prototypes aligned with your brand. Stakeholders review and approve before development begins, eliminating costly rework.",
      },
      {
        title: "Agile Development Sprints",
        description:
          "We work in two-week sprints with daily async standups and weekly demo calls. You have full visibility via a shared project board and staging environment at every stage.",
      },
      {
        title: "QA, Testing & Performance Audit",
        description:
          "Automated unit, integration, and end-to-end tests, combined with manual QA, ensure zero critical bugs at launch. We also run full Lighthouse audits and fix issues before go-live.",
      },
      {
        title: "Launch, Monitoring & Handover",
        description:
          "We manage deployment to your cloud provider, configure monitoring and alerting, and provide thorough documentation and team training so your engineers feel confident owning the platform.",
      },
    ],
    technologies: [
      { name: "Next.js 15" },
      { name: "React 19" },
      { name: "TypeScript" },
      { name: "Tailwind CSS" },
      { name: "Node.js" },
      { name: "PostgreSQL" },
      { name: "Prisma ORM" },
      { name: "GraphQL" },
      { name: "Vercel" },
      { name: "AWS" },
      { name: "Stripe" },
      { name: "Contentful" },
    ],
    faqs: [
      {
        question: "How long does a typical web development project take?",
        answer:
          "A standard marketing website or landing page takes 3–5 weeks. A full-featured web application or SaaS platform typically ranges from 8–20 weeks depending on complexity, integrations, and the number of revision cycles.",
      },
      {
        question: "Do you build custom CMS solutions or use off-the-shelf platforms?",
        answer:
          "Both. We integrate best-in-class headless CMS platforms like Contentful, Sanity, or Strapi, and we also build custom admin dashboards when your content model requires it. We recommend based on your team's workflow.",
      },
      {
        question: "Will my website be mobile-friendly?",
        answer:
          "Absolutely. Every project we deliver is fully responsive and tested across major browsers and devices — from the latest Chrome on desktop to Safari on older iPhones.",
      },
      {
        question: "Can you take over an existing project or codebase?",
        answer:
          "Yes. We frequently rescue legacy projects. We begin with a technical audit, document the existing architecture, and plan a migration or modernisation roadmap with minimal disruption to live users.",
      },
      {
        question: "What does post-launch support look like?",
        answer:
          "We offer tiered retainer packages covering bug fixes, feature additions, performance monitoring, and security patches. Our standard SLA guarantees a response to critical issues within 4 business hours.",
      },
    ],
    cta: {
      title: "Ready to Build Something Remarkable?",
      description:
        "Tell us about your project. Our team will respond within one business day with a tailored proposal, timeline, and pricing estimate — no commitment required.",
    },
  },

  // ── 2. Mobile App Development ───────────────
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    shortDescription:
      "Native and cross-platform mobile apps that delight users and drive measurable business outcomes.",
    heroDescription:
      "Axivon Technologies crafts mobile experiences that users love and businesses rely on. Whether you're launching a consumer app on the App Store or deploying a mission-critical enterprise tool, our mobile team delivers polished, performant, and scalable applications for iOS and Android.",
    badge: "iOS & Android",
    icon: "Smartphone",
    metaTitle: "Mobile App Development Services | Axivon Technologies",
    metaDescription:
      "Expert iOS and Android app development by Axivon Technologies. React Native, Swift, Kotlin. We build high-performance apps for startups and enterprises. Free consultation.",
    benefits: [
      {
        title: "Cross-Platform Efficiency",
        description:
          "Using React Native or Flutter, we deliver iOS and Android apps from a single codebase — cutting development time and cost by up to 40% without sacrificing native performance.",
      },
      {
        title: "Native Performance Where It Counts",
        description:
          "For performance-critical modules — AR, real-time video, biometrics — we write native Swift and Kotlin code, giving your users a silky-smooth experience on every device.",
      },
      {
        title: "App Store Optimisation (ASO)",
        description:
          "We prepare your app listing with keyword-optimised metadata, compelling screenshots, and preview videos to maximise organic downloads from day one.",
      },
      {
        title: "Offline-First Architecture",
        description:
          "Our apps handle poor connectivity gracefully, syncing data in the background so users stay productive regardless of network conditions.",
      },
      {
        title: "Secure by Design",
        description:
          "Certificate pinning, biometric authentication, encrypted local storage, and secure API communication patterns protect your users and your reputation.",
      },
      {
        title: "Analytics & Crash Reporting",
        description:
          "Integrated from day one, analytics and crash reporting give your product team the data they need to iterate confidently post-launch.",
      },
    ],
    process: [
      {
        title: "Product Discovery & UX Research",
        description:
          "We map out user personas, competitive landscape, and core jobs-to-be-done. This shapes a lean feature set that delivers maximum value on launch.",
      },
      {
        title: "Wireframing & Prototyping",
        description:
          "Interactive Figma prototypes let stakeholders experience the app before engineering begins, validating flows and catching design issues early.",
      },
      {
        title: "Technical Architecture Design",
        description:
          "We define the state management strategy, API design, offline sync approach, and third-party integrations, then document everything in an Architecture Decision Record.",
      },
      {
        title: "Iterative Development",
        description:
          "Two-week sprints with testable builds pushed to TestFlight and Google Play Internal Testing after each sprint so stakeholders can provide real-device feedback continuously.",
      },
      {
        title: "Quality Assurance & Device Testing",
        description:
          "We test across a matrix of real devices and OS versions, covering functional, regression, performance, and accessibility scenarios before any release.",
      },
      {
        title: "App Store Submission & Launch",
        description:
          "We handle the full submission process for App Store and Google Play, including review guidelines compliance, age ratings, privacy policy requirements, and post-launch monitoring.",
      },
    ],
    technologies: [
      { name: "React Native" },
      { name: "Expo" },
      { name: "Flutter" },
      { name: "Swift" },
      { name: "Kotlin" },
      { name: "Firebase" },
      { name: "Supabase" },
      { name: "Redux Toolkit" },
      { name: "Zustand" },
      { name: "Fastlane" },
      { name: "Detox" },
      { name: "Sentry" },
    ],
    faqs: [
      {
        question: "Should I build native or cross-platform?",
        answer:
          "For most startups and product companies, React Native or Flutter delivers 90% of the native experience at a fraction of the cost. We recommend fully native Swift/Kotlin only when your app's core functionality is deeply hardware-dependent (e.g., advanced camera processing, AR, or Bluetooth peripherals).",
      },
      {
        question: "How much does it cost to develop a mobile app?",
        answer:
          "A focused MVP typically ranges from $20,000–$60,000 USD depending on features, integrations, and platform targets. We provide a detailed estimate after the discovery phase.",
      },
      {
        question: "Will you manage the App Store and Google Play submissions?",
        answer:
          "Yes. We handle the entire submission process, including developer account setup, privacy policy requirements, review guideline compliance, and responding to any reviewer feedback.",
      },
      {
        question: "Can you add features to an app we've already launched?",
        answer:
          "Absolutely. We conduct a code audit first to understand the existing architecture and identify risks, then build a sprint plan for new feature development.",
      },
      {
        question: "Do you provide maintenance after launch?",
        answer:
          "Yes, we offer monthly maintenance retainers covering OS compatibility updates, dependency upgrades, bug fixes, and minor feature improvements to keep your app healthy over time.",
      },
    ],
    cta: {
      title: "Turn Your App Idea into Reality",
      description:
        "Book a free 30-minute strategy call. We'll scope your MVP, estimate the timeline, and show you exactly how we'd bring your app to market.",
    },
  },

  // ── 3. AI Solutions ─────────────────────────
  {
    slug: "ai-solutions",
    title: "AI Solutions",
    shortDescription:
      "Custom AI and machine learning solutions that automate operations, surface insights, and create competitive advantage.",
    heroDescription:
      "Axivon Technologies helps businesses harness the transformative power of artificial intelligence — not with off-the-shelf tools, but with bespoke AI systems built around your data, your workflows, and your goals. From LLM-powered products to computer vision pipelines, we make enterprise AI accessible and actionable.",
    badge: "Generative AI & ML",
    icon: "BrainCircuit",
    metaTitle: "AI Solutions & Machine Learning Development | Axivon Technologies",
    metaDescription:
      "Custom AI solutions by Axivon Technologies — LLM integration, RAG pipelines, computer vision, predictive analytics, and AI automation. Book a free AI strategy session.",
    benefits: [
      {
        title: "LLM Integration & Fine-Tuning",
        description:
          "We integrate OpenAI, Anthropic, Mistral, and open-source models into your products, and fine-tune them on your proprietary data for domain-specific accuracy.",
      },
      {
        title: "RAG-Powered Knowledge Systems",
        description:
          "Retrieval-Augmented Generation pipelines let your AI answer questions accurately from your internal documents, knowledgebases, and databases — no hallucinations.",
      },
      {
        title: "Intelligent Process Automation",
        description:
          "We replace repetitive manual workflows with AI agents that read, reason, and act — freeing your team to focus on high-value strategic work.",
      },
      {
        title: "Predictive Analytics",
        description:
          "Custom ML models trained on your historical data surface actionable predictions — churn risk, demand forecasting, fraud detection, lead scoring, and more.",
      },
      {
        title: "Computer Vision",
        description:
          "Object detection, image classification, OCR, and quality inspection systems that automate visual tasks at scale across industries from logistics to healthcare.",
      },
      {
        title: "Responsible AI Practices",
        description:
          "We build with explainability, bias auditing, and data privacy requirements in mind, ensuring your AI systems are trustworthy and compliant.",
      },
    ],
    process: [
      {
        title: "AI Opportunity Assessment",
        description:
          "We audit your existing processes and data assets to identify where AI can deliver the highest ROI — separating genuine opportunity from hype.",
      },
      {
        title: "Data Readiness & Pipeline Design",
        description:
          "Great AI requires great data. We assess your data quality, design collection and labelling pipelines, and implement the data infrastructure needed to train reliable models.",
      },
      {
        title: "Model Selection & Prototyping",
        description:
          "We prototype multiple approaches — from prompt engineering with foundation models to custom fine-tuning — and benchmark them against your specific success criteria.",
      },
      {
        title: "Integration & API Development",
        description:
          "AI models ship as robust, versioned APIs with monitoring, rate limiting, and fallback mechanisms integrated into your existing technology stack.",
      },
      {
        title: "Evaluation, Safety & Red-Teaming",
        description:
          "We rigorously evaluate model outputs for accuracy, bias, and safety before deployment, using automated evals and structured adversarial testing.",
      },
      {
        title: "MLOps & Continuous Improvement",
        description:
          "We implement monitoring, drift detection, and retraining pipelines so your AI improves with new data and never degrades silently in production.",
      },
    ],
    technologies: [
      { name: "OpenAI GPT-4o" },
      { name: "Anthropic Claude" },
      { name: "LangChain" },
      { name: "LlamaIndex" },
      { name: "Pinecone" },
      { name: "Weaviate" },
      { name: "Python" },
      { name: "PyTorch" },
      { name: "Hugging Face" },
      { name: "FastAPI" },
      { name: "AWS SageMaker" },
      { name: "Vertex AI" },
    ],
    faqs: [
      {
        question: "Do we need a large dataset to start with AI?",
        answer:
          "Not always. Modern foundation models like GPT-4o and Claude deliver strong results with minimal data via few-shot prompting and RAG. For custom ML models, we assess your data volume in the discovery phase and recommend the right approach.",
      },
      {
        question: "How do you handle data privacy when using LLMs?",
        answer:
          "We offer multiple deployment options — including on-premise open-source models and Azure OpenAI with data residency guarantees — ensuring sensitive data never leaves your controlled environment.",
      },
      {
        question: "What industries have you built AI solutions for?",
        answer:
          "We've delivered AI solutions across fintech, healthcare, e-commerce, legal, logistics, and SaaS. Our process is industry-agnostic; the key is understanding your data and workflows.",
      },
      {
        question: "How long does it take to build an AI product?",
        answer:
          "A focused AI feature or integration typically takes 4–8 weeks. A full AI-native product with custom model training, RAG pipelines, and production infrastructure can take 3–6 months.",
      },
      {
        question: "Can you audit or improve an AI system we've already built?",
        answer:
          "Yes. We offer AI audits covering model accuracy, latency, safety, cost efficiency, and maintainability, followed by a prioritised optimisation roadmap.",
      },
    ],
    cta: {
      title: "Unlock the Power of AI for Your Business",
      description:
        "Schedule a free AI strategy session. We'll identify your highest-impact AI opportunity and map a clear path from idea to production.",
    },
  },

  // ── 4. Cloud Solutions ──────────────────────
  {
    slug: "cloud-solutions",
    title: "Cloud Solutions",
    shortDescription:
      "Scalable, secure, and cost-optimised cloud infrastructure designed to power your business at any scale.",
    heroDescription:
      "Axivon Technologies designs and manages cloud infrastructure that is resilient, secure, and built for growth. Whether you're migrating a legacy monolith, designing a greenfield cloud-native architecture, or optimising runaway cloud spend, our certified cloud engineers deliver infrastructure you can rely on.",
    badge: "AWS · GCP · Azure",
    icon: "Cloud",
    metaTitle: "Cloud Solutions & Infrastructure Services | Axivon Technologies",
    metaDescription:
      "Expert cloud architecture, migration, DevOps, and optimisation by Axivon Technologies. AWS, GCP, Azure certified engineers. Cut costs and scale confidently.",
    benefits: [
      {
        title: "Elastic Scalability",
        description:
          "Auto-scaling groups, serverless functions, and containerised workloads mean your infrastructure scales up for peak demand and scales down to save cost — automatically.",
      },
      {
        title: "Cloud Cost Optimisation",
        description:
          "We audit your cloud spend, eliminate waste, right-size instances, and implement reserved capacity strategies — typically reducing bills by 20–40%.",
      },
      {
        title: "High Availability & Disaster Recovery",
        description:
          "Multi-region deployments, automated backups, and tested DR runbooks ensure your services stay up even when the unexpected happens.",
      },
      {
        title: "DevOps & CI/CD Automation",
        description:
          "Automated build, test, and deployment pipelines eliminate manual deployments, reduce human error, and let your team ship multiple times per day with confidence.",
      },
      {
        title: "Security & Compliance",
        description:
          "VPC design, IAM least-privilege policies, WAF, secrets management, and compliance frameworks (SOC 2, ISO 27001, HIPAA) protect your cloud environment from top to bottom.",
      },
      {
        title: "Infrastructure as Code",
        description:
          "Every resource is defined in version-controlled Terraform or AWS CDK, making your infrastructure reproducible, auditable, and disaster-proof.",
      },
    ],
    process: [
      {
        title: "Cloud Assessment & Strategy",
        description:
          "We audit your current infrastructure, application workloads, and cost profile to produce a cloud strategy tailored to your business objectives and risk tolerance.",
      },
      {
        title: "Architecture Design",
        description:
          "Our architects design a Well-Architected cloud environment — covering compute, networking, storage, security, and observability — documented in a detailed Architecture Diagram and ADR.",
      },
      {
        title: "Infrastructure Provisioning",
        description:
          "We provision all resources via Terraform or AWS CDK, ensuring consistency between development, staging, and production environments from day one.",
      },
      {
        title: "Migration & Deployment",
        description:
          "Using proven migration patterns (lift-and-shift, re-platform, or re-architect), we move workloads to the cloud with minimal downtime and zero data loss.",
      },
      {
        title: "CI/CD Pipeline Implementation",
        description:
          "We build automated pipelines in GitHub Actions, GitLab CI, or AWS CodePipeline covering build, test, security scanning, and deployment stages.",
      },
      {
        title: "Monitoring, Alerting & Handover",
        description:
          "We configure observability dashboards, set meaningful alert thresholds, run game days to validate runbooks, and hand over documentation so your team operates confidently.",
      },
    ],
    technologies: [
      { name: "AWS" },
      { name: "Google Cloud Platform" },
      { name: "Microsoft Azure" },
      { name: "Terraform" },
      { name: "AWS CDK" },
      { name: "Kubernetes" },
      { name: "Docker" },
      { name: "GitHub Actions" },
      { name: "Datadog" },
      { name: "Grafana" },
      { name: "Prometheus" },
      { name: "Vault by HashiCorp" },
    ],
    faqs: [
      {
        question: "Which cloud provider do you recommend?",
        answer:
          "It depends on your existing tooling, team expertise, and workload characteristics. AWS leads on breadth of services, GCP excels for AI/ML, and Azure is often preferred for enterprises with Microsoft investments. We assess your situation and provide a vendor-neutral recommendation.",
      },
      {
        question: "Can you help us reduce our existing AWS bill?",
        answer:
          "Yes. Our cloud cost optimisation engagements typically deliver 20–40% savings within 30–60 days through right-sizing, Reserved Instance planning, and eliminating idle resources.",
      },
      {
        question: "Do you offer ongoing managed cloud services?",
        answer:
          "Yes. We offer managed cloud retainers covering 24/7 monitoring, incident response, security patching, cost reviews, and architecture evolution support.",
      },
      {
        question: "How do you handle cloud migrations with zero downtime?",
        answer:
          "We use blue-green deployment patterns, database replication, and traffic shifting via load balancers or DNS to migrate workloads incrementally with no downtime for end users.",
      },
      {
        question: "Are you certified on major cloud platforms?",
        answer:
          "Yes. Our team holds AWS Solutions Architect, GCP Professional Cloud Architect, and Azure Administrator certifications.",
      },
    ],
    cta: {
      title: "Build Infrastructure That Scales With You",
      description:
        "Get a free cloud assessment. We'll review your current architecture and deliver a concrete roadmap to improve reliability, security, and cost efficiency.",
    },
  },

  // ── 5. SEO Services ─────────────────────────
  {
    slug: "seo-services",
    title: "SEO Services",
    shortDescription:
      "Data-driven SEO strategies that build organic authority, drive qualified traffic, and generate leads that compound over time.",
    heroDescription:
      "Axivon Technologies delivers enterprise-grade SEO programmes that go beyond keyword rankings. We build sustainable organic growth engines — combining technical excellence, authoritative content, and strategic link acquisition — to make your website the most trusted resource in your industry.",
    badge: "Technical & Content SEO",
    icon: "TrendingUp",
    metaTitle: "SEO Services for Startups & Enterprises | Axivon Technologies",
    metaDescription:
      "Axivon Technologies provides technical SEO, content strategy, and link building that drives compounding organic growth. Get a free SEO audit today.",
    benefits: [
      {
        title: "Technical SEO Foundation",
        description:
          "Core Web Vitals, crawl budget optimisation, structured data, hreflang, and site architecture improvements that make your site easy for Google to understand and rank.",
      },
      {
        title: "Keyword Strategy & Content Architecture",
        description:
          "We map your buyers' search journey and build a topic cluster strategy that establishes topical authority and captures demand at every funnel stage.",
      },
      {
        title: "Conversion-Focused Content",
        description:
          "SEO without conversion is vanity. Our content combines search intent alignment with persuasive copywriting to turn organic visitors into qualified leads and customers.",
      },
      {
        title: "Authority Link Building",
        description:
          "White-hat digital PR, strategic partnership content, and editorial outreach earn high-DA backlinks that improve domain authority and accelerate ranking timelines.",
      },
      {
        title: "Transparent Reporting",
        description:
          "Monthly reports track rankings, organic traffic, impressions, clicks, and attributed pipeline — with clear commentary on what moved the needle and why.",
      },
      {
        title: "Compounding ROI",
        description:
          "Unlike paid ads that stop the moment you pause spend, organic rankings compound. A page ranked today continues to generate leads for years.",
      },
    ],
    process: [
      {
        title: "Comprehensive SEO Audit",
        description:
          "We audit technical health, content quality, backlink profile, competitor positions, and keyword opportunities to establish a clear baseline and prioritised action plan.",
      },
      {
        title: "Keyword & Competitor Research",
        description:
          "Using Ahrefs, SEMrush, and proprietary research, we identify the highest-value keyword opportunities your competitors are winning and the gaps you can own.",
      },
      {
        title: "Technical Remediation",
        description:
          "We fix crawl errors, improve page speed, implement schema markup, optimise internal linking, and resolve duplicate content issues that hold your rankings back.",
      },
      {
        title: "Content Strategy & Creation",
        description:
          "Our SEO writers and strategists produce pillar pages, cluster articles, and landing pages engineered to rank, educate, and convert your target audience.",
      },
      {
        title: "Link Acquisition & Digital PR",
        description:
          "We execute targeted outreach campaigns, data-led content assets, and digital PR to earn editorial backlinks from authoritative publications in your industry.",
      },
      {
        title: "Monitoring & Iterative Optimisation",
        description:
          "We track every keyword, page, and backlink, continuously testing and optimising — adjusting the strategy based on real data, algorithm updates, and competitive shifts.",
      },
    ],
    technologies: [
      { name: "Ahrefs" },
      { name: "SEMrush" },
      { name: "Google Search Console" },
      { name: "Google Analytics 4" },
      { name: "Screaming Frog" },
      { name: "Surfer SEO" },
      { name: "Schema Markup" },
      { name: "Looker Studio" },
      { name: "PageSpeed Insights" },
      { name: "Clearscope" },
    ],
    faqs: [
      {
        question: "How long does it take to see SEO results?",
        answer:
          "Technical fixes can produce measurable improvements within 4–8 weeks. Content-driven ranking improvements typically become visible in 3–6 months. Significant domain authority gains usually take 6–12 months. SEO is a long-term investment with compounding returns.",
      },
      {
        question: "Do you offer one-time audits or ongoing retainers?",
        answer:
          "Both. We offer standalone technical audits and content audits, as well as full-service monthly retainers covering ongoing execution, content production, and link building.",
      },
      {
        question: "Will you write content for us?",
        answer:
          "Yes. Our SEO retainers include content production — from pillar pages to blog articles — written by specialist writers and optimised by our SEO strategists.",
      },
      {
        question: "How do you approach link building?",
        answer:
          "We focus exclusively on white-hat methods: digital PR, guest contributions on relevant publications, resource page outreach, and creating linkable content assets. We never use PBNs, link farms, or paid link schemes.",
      },
      {
        question: "Can you help with local SEO?",
        answer:
          "Yes. For businesses with a local presence, we optimise Google Business Profiles, manage citations, build local backlinks, and create location-specific landing pages.",
      },
    ],
    cta: {
      title: "Start Building Your Organic Growth Engine",
      description:
        "Claim your free SEO audit. We'll identify your biggest technical and content opportunities and show you the exact roadmap to grow organic revenue.",
    },
  },

  // ── 6. Digital Marketing ────────────────────
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    shortDescription:
      "Full-funnel digital marketing strategies that attract, convert, and retain high-value customers for ambitious brands.",
    heroDescription:
      "Axivon Technologies builds growth-oriented digital marketing programmes that deliver predictable, measurable results. From paid acquisition to email nurture, social strategy to conversion rate optimisation, we take an integrated, data-first approach that maximises every dollar of your marketing budget.",
    badge: "Growth & Performance",
    icon: "Megaphone",
    metaTitle: "Digital Marketing Agency for Startups & Enterprises | Axivon Technologies",
    metaDescription:
      "Axivon Technologies delivers full-funnel digital marketing — paid ads, email, social, and CRO — that drives measurable growth for startups and established brands.",
    benefits: [
      {
        title: "Paid Acquisition That Scales",
        description:
          "Google Ads, Meta, LinkedIn, and programmatic campaigns expertly managed to maximise ROAS — with continuous testing and optimisation to improve performance every week.",
      },
      {
        title: "Email & Marketing Automation",
        description:
          "Sophisticated nurture sequences, behavioural triggers, and segmentation strategies that move prospects through the funnel and drive repeat purchases from existing customers.",
      },
      {
        title: "Social Media Strategy",
        description:
          "Platform-native content strategies that build engaged communities, amplify your brand voice, and generate organic leads on LinkedIn, Instagram, X, and TikTok.",
      },
      {
        title: "Conversion Rate Optimisation (CRO)",
        description:
          "A/B testing, heatmaps, session recordings, and copy experiments that squeeze more revenue from your existing traffic — increasing conversion rates without increasing spend.",
      },
      {
        title: "Attribution & Analytics",
        description:
          "We implement rigorous multi-touch attribution so you know exactly which channels and campaigns are driving pipeline, enabling confident budget allocation decisions.",
      },
      {
        title: "Integrated Full-Funnel View",
        description:
          "We don't run channels in silos. Our integrated approach ensures awareness, consideration, and conversion campaigns reinforce each other, reducing CAC and increasing LTV.",
      },
    ],
    process: [
      {
        title: "Marketing Audit & Growth Diagnostic",
        description:
          "We audit your existing channels, analytics setup, funnel conversion rates, and competitive positioning to identify the highest-leverage growth opportunities.",
      },
      {
        title: "Strategy & Campaign Planning",
        description:
          "We build a 90-day integrated marketing plan covering channel mix, budget allocation, messaging, creative direction, and KPIs aligned to your revenue targets.",
      },
      {
        title: "Creative Development",
        description:
          "Our creative team produces ad copy, visuals, landing pages, and email templates that align with your brand and are engineered for conversion.",
      },
      {
        title: "Campaign Launch & Optimisation",
        description:
          "We launch campaigns with structured testing plans — A/B testing creatives, audiences, and copy — iterating weekly based on performance data.",
      },
      {
        title: "Analytics, Attribution & Reporting",
        description:
          "We configure GA4, Pixel tracking, UTM structures, and attribution models to give you an accurate view of what's driving revenue across every channel.",
      },
      {
        title: "Monthly Strategy Reviews",
        description:
          "Monthly performance reviews analyse what worked, what didn't, and where budget should be reallocated — ensuring your programme continuously improves.",
      },
    ],
    technologies: [
      { name: "Google Ads" },
      { name: "Meta Ads" },
      { name: "LinkedIn Ads" },
      { name: "Google Analytics 4" },
      { name: "HubSpot" },
      { name: "Klaviyo" },
      { name: "Mailchimp" },
      { name: "Hotjar" },
      { name: "Looker Studio" },
      { name: "Zapier" },
      { name: "Segment" },
    ],
    faqs: [
      {
        question: "What budget do I need to get started with paid advertising?",
        answer:
          "We recommend a minimum ad spend of $3,000–$5,000 per month for meaningful data and optimisation cycles. Below this threshold, the cost-per-conversion data is too sparse to optimise effectively. Our management fee is separate from ad spend.",
      },
      {
        question: "Do you specialise in any particular industry?",
        answer:
          "We work across B2B SaaS, e-commerce, professional services, fintech, and healthcare. Our methodology is channel-agnostic and adapts to your audience's behaviour and buyer journey.",
      },
      {
        question: "How quickly can I expect to see results from paid campaigns?",
        answer:
          "Paid campaigns typically show initial performance data within the first 2–4 weeks. Meaningful optimisation and consistent ROAS improvement usually emerges in weeks 4–8 as we accumulate conversion data.",
      },
      {
        question: "Do you handle creative production?",
        answer:
          "Yes. Our team produces ad copy, static visuals, and basic video edits in-house. For complex video production or brand shoots, we work with trusted partners.",
      },
      {
        question: "How do you measure marketing ROI?",
        answer:
          "We define KPIs upfront — CAC, MQL-to-SQL rate, ROAS, pipeline attributed — and report against them monthly. We work with your sales team to close the loop between marketing activity and closed revenue.",
      },
    ],
    cta: {
      title: "Grow Faster With Smarter Marketing",
      description:
        "Book a free growth strategy session. We'll audit your current marketing, benchmark you against competitors, and present a tailored plan to hit your revenue targets.",
    },
  },

  // ── 7. UI/UX Design ─────────────────────────
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    shortDescription:
      "Human-centred design that makes complex products intuitive, beautiful, and impossible to put down.",
    heroDescription:
      "At Axivon Technologies, design is not decoration — it is the primary driver of product adoption and business growth. Our UX team combines research rigour with visual craft to deliver interfaces that reduce friction, increase engagement, and make users feel like your product was made specifically for them.",
    badge: "Research-Driven Design",
    icon: "Palette",
    metaTitle: "UI/UX Design Services | Axivon Technologies",
    metaDescription:
      "Expert UI/UX design by Axivon Technologies — user research, wireframing, prototyping, design systems. We design digital products that convert and delight.",
    benefits: [
      {
        title: "User Research & Insight",
        description:
          "We ground every design decision in real user behaviour — interviews, usability tests, and analytics review — ensuring we solve actual problems, not assumed ones.",
      },
      {
        title: "Reduced Development Cost",
        description:
          "Decisions made in Figma cost a fraction of decisions made in code. Our thorough design process surfaces issues early, reducing expensive engineering rework.",
      },
      {
        title: "Conversion-Optimised Flows",
        description:
          "We design with your business metrics in mind — signup flows, onboarding sequences, and checkout paths engineered to remove friction and increase activation.",
      },
      {
        title: "Scalable Design Systems",
        description:
          "We build comprehensive Figma component libraries and design tokens that keep your product visually consistent as it grows across platforms and teams.",
      },
      {
        title: "Accessibility (WCAG 2.2)",
        description:
          "We design to WCAG 2.2 AA standards as a default — ensuring your product is usable by everyone and reducing legal compliance risk.",
      },
      {
        title: "Developer Handoff Excellence",
        description:
          "Annotated specs, redlines, and developer-friendly Figma files mean engineers can implement designs accurately and efficiently without constant back-and-forth.",
      },
    ],
    process: [
      {
        title: "Discovery & User Research",
        description:
          "We conduct stakeholder interviews, user research sessions, competitive audits, and heuristic evaluations to build a deep understanding of user needs and business goals.",
      },
      {
        title: "Information Architecture & User Flows",
        description:
          "We map the information architecture and design user flows that address key tasks, minimise cognitive load, and guide users toward their goals efficiently.",
      },
      {
        title: "Wireframing & Low-Fidelity Prototyping",
        description:
          "Rapid wireframes let us explore multiple layout approaches and get stakeholder alignment before investing in high-fidelity visuals.",
      },
      {
        title: "High-Fidelity UI Design",
        description:
          "We craft pixel-perfect screens that express your brand with intention — typography, colour, spacing, and motion all working in harmony to create a premium experience.",
      },
      {
        title: "Usability Testing & Iteration",
        description:
          "We run moderated and unmoderated usability tests with target users, gather structured feedback, and iterate the design before development begins.",
      },
      {
        title: "Design System & Dev Handoff",
        description:
          "We deliver a comprehensive design system — components, tokens, usage guidelines, and annotated specs — and hold a handoff session with your engineering team.",
      },
    ],
    technologies: [
      { name: "Figma" },
      { name: "FigJam" },
      { name: "Framer" },
      { name: "Maze" },
      { name: "Hotjar" },
      { name: "Lottie" },
      { name: "Storybook" },
      { name: "Tailwind CSS" },
      { name: "Radix UI" },
      { name: "Adobe Illustrator" },
    ],
    faqs: [
      {
        question: "Do you offer UX research separately from visual design?",
        answer:
          "Yes. We offer standalone UX research engagements — user interviews, usability testing, heuristic audits — as well as end-to-end design programmes.",
      },
      {
        question: "What deliverables do we receive?",
        answer:
          "Depending on the engagement, deliverables include research reports, user flow diagrams, wireframes, high-fidelity Figma designs, interactive prototypes, and a design system.",
      },
      {
        question: "Can you work within our existing brand guidelines?",
        answer:
          "Absolutely. We work within your brand system, or we can evolve it if the existing guidelines don't translate well to digital interfaces.",
      },
      {
        question: "Do you design for both web and mobile?",
        answer:
          "Yes. We design responsive web interfaces, iOS apps, Android apps, and tablet-specific layouts — all from a single cohesive design system.",
      },
      {
        question: "How do you handle design handoff to our engineering team?",
        answer:
          "We provide annotated Figma files with spacing, typography, colour tokens, component specifications, and interaction notes. We also offer a live handoff session to walk engineers through the designs.",
      },
    ],
    cta: {
      title: "Design an Experience Your Users Will Love",
      description:
        "Schedule a free design consultation. We'll review your current product experience, identify the highest-impact improvements, and show you what's possible.",
    },
  },

  // ── 8. Custom Software Development ──────────
  {
    slug: "custom-software-development",
    title: "Custom Software Development",
    shortDescription:
      "Bespoke software solutions engineered precisely for your business processes, integrations, and growth trajectory.",
    heroDescription:
      "Off-the-shelf software makes compromises. Axivon Technologies builds software that fits your business exactly — purpose-engineered to automate your unique workflows, integrate with your existing systems, and provide a competitive edge that packaged tools simply cannot match.",
    badge: "Enterprise-Grade Engineering",
    icon: "Code2",
    metaTitle: "Custom Software Development Company | Axivon Technologies",
    metaDescription:
      "Axivon Technologies builds custom software — ERP systems, internal tools, SaaS platforms, and API integrations. Enterprise engineering for startups and scale-ups.",
    benefits: [
      {
        title: "Fits Your Exact Workflows",
        description:
          "Unlike SaaS tools that force you to adapt your process to their UI, custom software is built around how your team actually works — maximising efficiency and adoption.",
      },
      {
        title: "Competitive Differentiation",
        description:
          "Your proprietary software becomes an asset your competitors cannot replicate. The more tailored it is to your operation, the deeper your moat.",
      },
      {
        title: "Seamless Integrations",
        description:
          "We build deep, reliable integrations with your ERP, CRM, payment processors, and third-party APIs — creating a single source of truth across your technology stack.",
      },
      {
        title: "Full Ownership",
        description:
          "You own every line of code, every database schema, and every design asset. No vendor lock-in. No per-seat pricing that scales against you.",
      },
      {
        title: "Scales With Your Business",
        description:
          "We architect systems to grow with you — handling 10x user growth and feature expansion without requiring a full rebuild.",
      },
      {
        title: "Long-Term Partnership",
        description:
          "We build for longevity — clean code, thorough documentation, and a partnership model that means we're invested in your success beyond the delivery date.",
      },
    ],
    process: [
      {
        title: "Business Process Analysis",
        description:
          "We spend time with your team understanding your current workflows, pain points, and goals — mapping the processes your software needs to support with precision.",
      },
      {
        title: "Requirements Documentation",
        description:
          "We produce a comprehensive Product Requirements Document (PRD) covering functional specifications, technical constraints, integration requirements, and non-functional requirements.",
      },
      {
        title: "System Architecture Design",
        description:
          "Our architects design the database schema, API architecture, integration patterns, and infrastructure topology, ensuring the system can scale and evolve.",
      },
      {
        title: "Phased Agile Development",
        description:
          "We build in phases — delivering a working MVP first, then expanding in prioritised sprints — so you see value early and can adapt scope based on real feedback.",
      },
      {
        title: "Integration, Testing & Security Audit",
        description:
          "End-to-end integration testing, penetration testing, and performance load testing ensure the software is ready for real business operations before go-live.",
      },
      {
        title: "Training, Documentation & Ongoing Support",
        description:
          "We provide admin and end-user training, comprehensive technical documentation, and tiered support packages to ensure smooth adoption and operation.",
      },
    ],
    technologies: [
      { name: "TypeScript" },
      { name: "Node.js" },
      { name: "Python" },
      { name: "Go" },
      { name: "PostgreSQL" },
      { name: "Redis" },
      { name: "Elasticsearch" },
      { name: "gRPC" },
      { name: "REST APIs" },
      { name: "GraphQL" },
      { name: "Kubernetes" },
      { name: "Terraform" },
    ],
    faqs: [
      {
        question: "When does custom software make sense over buying off-the-shelf?",
        answer:
          "Custom software makes sense when: no existing solution fits your workflow without significant compromise; your process is a competitive differentiator you want to protect; total cost of ownership over 3–5 years for SaaS licences exceeds build cost; or you need deep integrations that off-the-shelf tools don't support.",
      },
      {
        question: "How do you manage risk on large software projects?",
        answer:
          "We mitigate risk through thorough discovery, phased delivery, regular stakeholder demos, and a fixed-scope engagement model for each phase. You never invest in a large phase without reviewing the output of the previous one.",
      },
      {
        question: "Do you sign NDAs and IP assignment agreements?",
        answer:
          "Yes, always. All IP produced during your engagement transfers to you in full upon final payment. We sign NDAs and provide IP assignment clauses in our standard contract.",
      },
      {
        question: "Can you build internal tools as well as customer-facing software?",
        answer:
          "Absolutely. Many of our most impactful engagements are internal tools — custom CRMs, operations dashboards, workflow automation systems, and data pipelines — that significantly reduce manual overhead.",
      },
      {
        question: "What happens if our requirements change mid-project?",
        answer:
          "We use an agile change request process. New requirements are scoped, estimated, and prioritised against the existing backlog. You stay in control of scope and budget at every stage.",
      },
    ],
    cta: {
      title: "Build Software That Gives You the Edge",
      description:
        "Talk to our team about your requirements. We'll help you evaluate whether custom development is the right choice and provide a detailed estimate within 5 business days.",
    },
  },
];

// ─────────────────────────────────────────────
// Utility Helpers
// ─────────────────────────────────────────────

/** Returns a single service by slug, or undefined if not found. */
export function getServiceBySlug(slug: ServiceSlug): ServiceData | undefined {
  return servicesData.find((service) => service.slug === slug);
}

/** Returns all service slugs — useful for generateStaticParams in Next.js. */
export function getAllServiceSlugs(): ServiceSlug[] {
  return servicesData.map((service) => service.slug);
}