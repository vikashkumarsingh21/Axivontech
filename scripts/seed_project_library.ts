import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface InitialProjectData {
  slug: string;
  name: string;
  clientName: string;
  clientCompany: string;
  industry: string;
  category: string;
  projectType: string;
  status: string;
  startDate: Date | null;
  completionDate: Date | null;
  liveUrl: string;
  demoUrl?: string;
  clientPreviewUrl?: string;
  documentationUrl?: string;
  githubUrl?: string;
  shortDescription: string;
  overview: string;
  businessRequirement: string;
  problemStatement: string;
  solutionDelivered: string;
  objectives: string;
  scopeOfWork: string;
  deliverables: string;
  frontendTech: string[];
  backendTech: string[];
  databaseTech: string[];
  frameworks: string[];
  languages: string[];
  apisAndIntegrations: string[];
  hostingPlatform: string;
  devTools: string[];
  additionalTech: string[];
  technologies: string[];
  features: string[];
  thumbnailUrl: string;
  websiteScreenshots: string[];
  dashboardScreenshots: string[];
  mobileScreenshots: string[];
  galleryImages: string[];
  demoVideoUrl?: string;
  presentationHighlights: string[];
  presentationNotes: string;
  isPresentationReady: boolean;
  internalNotes: string;
  assignedTeam: string;
  projectOwner: string;
  developmentDepartment: string;
  deliveryNotes: string;
  maintenanceInfo: string;
  qualityNotes: string;
  confidentialData: string;
  deliveryConfirmation: boolean;
  reviewStatus: string;
  finalApprovedLink: string;
}

const verifiedProjects: InitialProjectData[] = [
  {
    slug: "purvarang-family-restaurant",
    name: "Purvarang Family Restaurant",
    clientName: "Purvarang Family Restaurant",
    clientCompany: "Purvarang Family Restaurant",
    industry: "Restaurant / Food & Hospitality",
    category: "Website Development",
    projectType: "Restaurant Portal & Digital Menu Showcase",
    status: "COMPLETED",
    startDate: new Date("2026-01-20T00:00:00Z"),
    completionDate: new Date("2026-02-15T00:00:00Z"),
    liveUrl: "https://purvarang-family-restaurant.onrender.com/",
    demoUrl: "https://purvarang-family-restaurant.onrender.com/",
    githubUrl: "https://github.com/vikashkumarsingh21/Axivontech",
    shortDescription:
      "Dedicated restaurant website showcasing authentic North Indian, Tandoori, and Chinese culinary offerings with a digital menu, ambiance showcase, and direct customer contact in Lalganj, Vaishali.",
    overview:
      "Purvarang Family Restaurant is a dedicated dining and hospitality web platform engineered to establish a prominent digital presence for the restaurant located at Tinpulwa Chowk in Lalganj, Vaishali. The platform provides customers with an interactive digital menu covering North Indian specialties, tandoori starters, biryani, Chinese dishes, pastas, and refreshing beverages. Designed with a mobile-first philosophy, the website delivers fast load times, clear restaurant operating hours, dining space previews, and direct calling and location directions for local families and traveling guests.",
    businessRequirement:
      "A popular local family restaurant required a centralized digital presence to showcase its extensive multi-cuisine menu, location coordinates, and dining facilities, replacing inefficient inquiry handling over unstructured channels.",
    problemStatement:
      "The client lacked a searchable web menu, professional brand identity online, and direct location discovery for travelers passing through Lalganj on major transit routes.",
    solutionDelivered:
      "Axivon Technologies engineered a high-performance, responsive restaurant website featuring structured menu categorization, dining ambiance imagery, transparent pricing, and instant one-tap calling and Google Maps navigation.",
    objectives:
      "1. Enable fast mobile browsing of 80+ menu items.\n2. Streamline direct telephone reservations.\n3. Provide one-click Google Maps GPS navigation to the dining premises.",
    scopeOfWork:
      "Brand styling, menu data taxonomy, responsive UI design, Google Maps API integration, high-resolution photo optimization, and static deployment on Render.",
    deliverables:
      "Production-ready responsive web application, interactive menu catalog, contact integration, Google Maps coordinates, source code archive.",
    frontendTech: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    backendTech: ["Node.js"],
    databaseTech: ["Static JSON Taxonomy"],
    frameworks: ["React 18", "Tailwind CSS"],
    languages: ["TypeScript", "HTML5", "CSS3"],
    apisAndIntegrations: ["Google Maps API", "Tel URI Direct Dialing"],
    hostingPlatform: "Render Cloud Platform",
    devTools: ["Vite", "Git", "VS Code", "Postman"],
    additionalTech: ["Responsive Web Architecture", "SEO Optimization"],
    technologies: ["React", "TypeScript", "Vite", "Tailwind CSS", "Google Maps", "Responsive Design"],
    features: [
      "Interactive Digital Menu",
      "Multi-Cuisine Catalog (North Indian, Tandoori, Chinese)",
      "Mobile-First Responsive Interface",
      "One-Tap Telephone Contact",
      "Google Maps Location Directions",
      "Dining Space & Ambiance Showcase",
      "Operating Hours & Customer Information",
      "Fast Static Asset Delivery"
    ],
    thumbnailUrl: "/assets/images/portfolio/purvarang-family-restaurant.jpg",
    websiteScreenshots: ["/assets/images/portfolio/purvarang-family-restaurant.jpg"],
    dashboardScreenshots: [],
    mobileScreenshots: [],
    galleryImages: ["/assets/images/portfolio/purvarang-family-restaurant.jpg"],
    presentationHighlights: [
      "Live production deployment serving customers in Lalganj, Bihar",
      "Zero-latency interactive multi-cuisine menu navigation",
      "Seamless GPS directions bringing travelers directly to the restaurant"
    ],
    presentationNotes:
      "Demonstrate on mobile viewport to showcase one-tap calling and instant category switching for dining guests.",
    isPresentationReady: true,
    internalNotes:
      "Delivered ahead of schedule. Customer signed off on delivery on 15 Feb 2026. Hosted on Render with SSL active.",
    assignedTeam: "Frontend Web Engineering Team",
    projectOwner: "VIKASH KUMAR",
    developmentDepartment: "Web Development",
    deliveryNotes: "Customer verified and approved all menu item prices and telephone callouts.",
    maintenanceInfo: "Periodic menu and pricing updates managed through AxivonTech content team.",
    qualityNotes: "Lighthouse mobile performance score: 96/100. All cross-browser checks passed.",
    confidentialData: "Client POC phone: Direct owner line verified in contract archive.",
    deliveryConfirmation: true,
    reviewStatus: "APPROVED",
    finalApprovedLink: "https://purvarang-family-restaurant.onrender.com/"
  },
  {
    slug: "udaan-furniture",
    name: "Udaan Furniture",
    clientName: "Udaan Furniture Showroom",
    clientCompany: "Udaan Furniture Showroom",
    industry: "Furniture / Retail / Home Interiors",
    category: "Website Development",
    projectType: "Showroom Catalog & Inquiry Platform",
    status: "COMPLETED",
    startDate: new Date("2026-02-15T00:00:00Z"),
    completionDate: new Date("2026-03-20T00:00:00Z"),
    liveUrl: "https://udaan-furniture.onrender.com/",
    demoUrl: "https://udaan-furniture.onrender.com/",
    githubUrl: "https://github.com/vikashkumarsingh21/Axivontech",
    shortDescription:
      "Showroom website presenting residential and office furniture collections across living, bedroom, dining, and workspace interiors for customers in Rajkot, Gujarat.",
    overview:
      "Udaan Furniture is a modern showroom digital platform designed to highlight high-quality residential and commercial furniture collections in Rajkot, Gujarat. The website features meticulously organized furniture categories—including modern living room sofas and sectionals, solid wood beds with hydraulic storage, handcrafted natural wood dining sets, ergonomic office desks, and storage cabinetry. Built to facilitate showroom footfall and customer inquiries, the platform presents detailed product imagery, dimensional specifications, craftsmanship details, and seamless showroom consultation contact points.",
    businessRequirement:
      "A premier furniture showroom in Rajkot needed an elegant digital showroom catalog to exhibit artisan woodwork and modern interiors to architects, interior decorators, and homeowners.",
    problemStatement:
      "Physical brochures quickly became outdated, and prospective buyers could not browse full living, bedroom, and office setups prior to scheduling physical showroom visits.",
    solutionDelivered:
      "Axivon Technologies built a responsive, catalog-driven showroom platform featuring categorized room collections, high-definition material showcases, dimensional details, and direct consultation request workflows.",
    objectives:
      "1. Showcase 4 primary collection wings (Living, Bedroom, Dining, Office).\n2. Present detailed timber specifications and upholstery options.\n3. Increase verified weekend showroom walk-ins through digital consultation requests.",
    scopeOfWork:
      "UI/UX design, Next.js architecture, product imagery optimization, specification sheets, inquiry form routing, and production deployment.",
    deliverables:
      "Modern Next.js showroom website, responsive catalog interface, inquiry email notification integration, showroom address and visiting hours hub.",
    frontendTech: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    backendTech: ["Next.js Server Components", "Node.js"],
    databaseTech: ["Structured Product Schemas"],
    frameworks: ["Next.js 14", "Tailwind CSS"],
    languages: ["TypeScript", "JavaScript"],
    apisAndIntegrations: ["Email Dispatch API", "Google Maps Embed"],
    hostingPlatform: "Render Cloud Platform",
    devTools: ["VS Code", "Git", "Figma", "Render CLI"],
    additionalTech: ["Catalog Architecture", "Responsive UI", "Product Showcase"],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Catalog Architecture", "Responsive UI", "Product Showcase"],
    features: [
      "Comprehensive Furniture Catalog",
      "Living, Bedroom, Dining & Office Collections",
      "Product Specification & Dimension Display",
      "High-Resolution Material Galleries",
      "Showroom Consultation & Inquiry Flow",
      "Location & Visit Planning Information",
      "Responsive Cross-Device Layout",
      "SEO-Structured Product Categories"
    ],
    thumbnailUrl: "/assets/images/portfolio/udaan-furniture.jpg",
    websiteScreenshots: ["/assets/images/portfolio/udaan-furniture.jpg"],
    dashboardScreenshots: [],
    mobileScreenshots: [],
    galleryImages: ["/assets/images/portfolio/udaan-furniture.jpg"],
    presentationHighlights: [
      "High-end showroom presentation displaying bedroom, living, dining, and executive suites",
      "Direct consultation funnels routing customer inquiries to sales representatives in Rajkot",
      "SEO architecture structured around regional interior design keywords"
    ],
    presentationNotes:
      "Demonstrate category filtering and high-resolution wood finish showcases to interior design clients.",
    isPresentationReady: true,
    internalNotes:
      "Delivered on March 20, 2026. Client confirmed satisfaction with catalog layout and mobile layout responsiveness.",
    assignedTeam: "E-Commerce & Catalog Systems Unit",
    projectOwner: "VIKASH KUMAR",
    developmentDepartment: "Web Development",
    deliveryNotes: "All specifications and dimensions validated against actual showroom floor inventory.",
    maintenanceInfo: "Quarterly seasonal collection updates scheduled with the marketing team.",
    qualityNotes: "Image assets compressed via modern WebP formats for sub-second load times.",
    confidentialData: "Commercial sales margins and showroom volume agreements archived in partner vault.",
    deliveryConfirmation: true,
    reviewStatus: "APPROVED",
    finalApprovedLink: "https://udaan-furniture.onrender.com/"
  },
  {
    slug: "axivon-technologies",
    name: "Axivon Technologies Flagship Platform",
    clientName: "Axivon Technologies",
    clientCompany: "Axivon Technologies Private Limited",
    industry: "Information Technology",
    category: "Business Website",
    projectType: "Corporate Enterprise Platform & AI-Ready Application",
    status: "COMPLETED",
    startDate: new Date("2026-04-10T00:00:00Z"),
    completionDate: new Date("2026-06-22T00:00:00Z"),
    liveUrl: "https://axivontech.in",
    demoUrl: "https://axivontech.in",
    githubUrl: "https://github.com/vikashkumarsingh21/Axivontech",
    shortDescription:
      "Premium software company website built with Next.js, TypeScript, AI-ready architecture, dynamic CRM pipelines, and modern UI/UX.",
    overview:
      "Axivon Technologies is a premium technology company website designed to showcase software development services, AI solutions, cloud technologies, digital transformation, and custom business applications. The platform is developed using modern web technologies with a strong focus on scalability, SEO, performance, responsiveness, and enterprise integration. It includes dynamic service pages, portfolio management, career portal, contact management system, blog architecture, and enterprise-level frontend design.",
    businessRequirement:
      "AxivonTech needed an enterprise-grade digital flagship to establish authoritative market presence, demonstrate full-stack software capabilities, and drive high-intent enterprise client inquiries.",
    problemStatement:
      "Traditional startup websites suffer from slow performance, weak SEO, generic templates, and disconnected sales pipelines that lose prospective leads.",
    solutionDelivered:
      "Axivon Technologies was developed as a high-performance corporate platform featuring premium UI/UX, responsive design, optimized SEO, scalable architecture, career management system, lead generation forms, portfolio showcase, and AI assistant capabilities.",
    objectives:
      "1. Build a unified digital flagship representing AxivonTech's technical excellence.\n2. Integrate automated inbound CRM lead collection.\n3. Provide dedicated portals for employees, executives, partners, and clients.",
    scopeOfWork:
      "Full architecture from database to UI, Next.js App Router, PostgreSQL / Neon database, Prisma ORM, role-based access control, dark/light theme systems, and automated email notifications.",
    deliverables:
      "Production enterprise website, 5 authenticated portal shells, REST API architecture, career portal with resume intake, CRM lead capture engine.",
    frontendTech: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Framer Motion", "Lucide React"],
    backendTech: ["Next.js Server Actions", "Node.js", "Jose JWT"],
    databaseTech: ["PostgreSQL (Neon)", "Prisma ORM"],
    frameworks: ["Next.js 16", "React 19", "Tailwind CSS v4"],
    languages: ["TypeScript", "SQL"],
    apisAndIntegrations: ["Google Sheets API", "Nodemailer SMTP", "Google Gemini AI API", "Cloudflare Turnstile"],
    hostingPlatform: "Vercel Enterprise & Neon Cloud",
    devTools: ["Git", "Prisma Studio", "VS Code", "Vitest", "ESLint"],
    additionalTech: ["Framer Motion", "Jose JWT", "Zod Validation", "ExcelJS"],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Node.js", "Prisma", "PostgreSQL"],
    features: [
      "Premium Modern UI & Animation System",
      "Dynamic Inbound CRM Lead Capture",
      "Multi-Role Authenticated Portal Architecture",
      "Interactive Demo Projects Showcase",
      "Career Application & Job Posting Management",
      "Automated Transactional Email Delivery",
      "Secure RBAC with Cryptographic JWT Verification",
      "Integrated Business Intelligence Analytics"
    ],
    thumbnailUrl: "/assets/portfolio/projects/portfolio-web-development.jpg",
    websiteScreenshots: ["/assets/portfolio/projects/portfolio-web-development.jpg"],
    dashboardScreenshots: [],
    mobileScreenshots: [],
    galleryImages: ["/assets/portfolio/projects/portfolio-web-development.jpg"],
    presentationHighlights: [
      "Flagship corporate web platform powering Axivon Technologies globally",
      "Complete end-to-end integration with PostgreSQL and automated CRM pipeline",
      "World-class 99.9% uptime with sub-second page transition speeds"
    ],
    presentationNotes:
      "Highlight modern UI transitions, clean typography, and the seamless integration between public marketing and authenticated portals.",
    isPresentationReady: true,
    internalNotes:
      "Internal flagship project completed June 22, 2026. Ongoing feature iterations tracked via milestone sprint boards.",
    assignedTeam: "AxivonTech Core Architecture Team",
    projectOwner: "VIKASH KUMAR",
    developmentDepartment: "Core Engineering",
    deliveryNotes: "Platform successfully migrated to production domains with full TLS encryption and security compliance.",
    maintenanceInfo: "Continuous integration and deployment with automated linting and build validation.",
    qualityNotes: "Zero build warnings, strict TypeScript typing across all components and server actions.",
    confidentialData: "Production API keys and database connection secrets secured in encrypted environment variables.",
    deliveryConfirmation: true,
    reviewStatus: "APPROVED",
    finalApprovedLink: "https://axivontech.in"
  },
  {
    slug: "jalmitra",
    name: "JalMitra — Autonomous Water Cleaning System",
    clientName: "Academic Innovation Project",
    clientCompany: "Environmental IoT Solutions",
    industry: "Smart Environmental Solutions",
    category: "Environmental Technology",
    projectType: "Autonomous Robotics & IoT Cloud Platform",
    status: "COMPLETED",
    startDate: new Date("2026-01-05T00:00:00Z"),
    completionDate: new Date("2026-06-15T00:00:00Z"),
    liveUrl: "https://jal-mitraafrontend.onrender.com/",
    demoUrl: "https://jal-mitraafrontend.onrender.com/",
    githubUrl: "https://github.com/vikashkumarsingh21/jalmitra",
    shortDescription:
      "AI-powered autonomous solar water cleaning system for removing floating waste from rivers, lakes, and ponds using IoT and automation.",
    overview:
      "JalMitra is an intelligent environmental monitoring and autonomous water cleaning system designed to reduce floating waste from lakes, rivers, ponds, and other water bodies. The project combines Artificial Intelligence, IoT sensors, automation, renewable solar energy, and real-time monitoring to improve water quality and support sustainable environmental conservation. The platform provides live monitoring, autonomous waste collection, water quality analysis, and AI-based navigation capabilities.",
    businessRequirement:
      "Water conservation authorities and environmental bodies require cost-effective autonomous mechanisms to collect floating plastic pollutants without relying on hazardous, manual labor.",
    problemStatement:
      "Water bodies suffer from accumulated plastic debris. Traditional manual skimming is hazardous, labor-intensive, and provides zero real-time telemetric analytics on water purity.",
    solutionDelivered:
      "JalMitra introduces an autonomous solar-powered robotic boat capable of collecting floating waste while simultaneously monitoring water quality through IoT sensors and transmitting telemetry to a live cloud dashboard.",
    objectives:
      "1. Autonomous water-surface navigation with obstacle avoidance.\n2. Solar-powered continuous operation with zero carbon footprint.\n3. Real-time telemetric telemetry streaming for pH, turbidity, and temperature.",
    scopeOfWork:
      "Robotic chassis design, solar power circuit integration, ESP8266/Arduino firmware development, Firebase real-time telemetry streaming, and web monitoring dashboard.",
    deliverables:
      "Solar robotic vessel prototype, hardware firmware, responsive real-time web monitoring interface, comprehensive research and deployment whitepaper.",
    frontendTech: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
    backendTech: ["Node.js", "Firebase Realtime Database"],
    databaseTech: ["Firebase Realtime DB"],
    frameworks: ["Bootstrap 5"],
    languages: ["C++ (Arduino)", "JavaScript", "HTML/CSS"],
    apisAndIntegrations: ["Firebase REST API", "ESP8266 Wi-Fi / Telemetry"],
    hostingPlatform: "Render Cloud Platform & Firebase",
    devTools: ["Arduino IDE", "VS Code", "Git", "Fritzing"],
    additionalTech: ["ESP8266", "Arduino", "IoT", "Solar Energy", "Turbidity Sensors"],
    technologies: ["HTML", "CSS", "JavaScript", "Bootstrap", "Firebase", "Node.js", "ESP8266", "Arduino", "IoT", "Solar Energy"],
    features: [
      "AI Assisted Water Cleaning & Navigation",
      "Solar Powered Continuous Battery Recharging",
      "Surface Floating Waste Conveyor Collection",
      "Real-Time Water Purity Telemetry (pH, Turbidity, Temp)",
      "Firebase Cloud Data Streaming",
      "Live Operator Telemetry Dashboard",
      "Remote Manual Override Controls",
      "Environmental Trend Analytics"
    ],
    thumbnailUrl: "/assets/portfolio/projects/portfolio-environmental-technology.jpg",
    websiteScreenshots: ["/assets/portfolio/projects/portfolio-environmental-technology.jpg"],
    dashboardScreenshots: [],
    mobileScreenshots: [],
    galleryImages: ["/assets/portfolio/projects/portfolio-environmental-technology.jpg"],
    presentationHighlights: [
      "Proven solar-powered autonomous marine cleaning robot",
      "Real-time sensor telemetry displayed on web dashboard",
      "Recognized for innovation in environmental clean-tech"
    ],
    presentationNotes:
      "Demonstrate live telemetry streaming and solar battery efficiency graphs during smart city and green tech presentations.",
    isPresentationReady: true,
    internalNotes:
      "Completed June 15, 2026. Successfully tested on freshwater lake environments. All hardware schematics and code verified.",
    assignedTeam: "IoT & Embedded Systems Lab",
    projectOwner: "VIKASH KUMAR",
    developmentDepartment: "Embedded Systems & IoT",
    deliveryNotes: "Field trials confirmed successful debris capture rate of 92% under standard calm water conditions.",
    maintenanceInfo: "Filter conveyor inspection recommended every 150 operating hours.",
    qualityNotes: "Waterproofing rating IP67 on electronics housing.",
    confidentialData: "Hardware circuit schematics and solar charge controller design archived in confidential lab storage.",
    deliveryConfirmation: true,
    reviewStatus: "APPROVED",
    finalApprovedLink: "https://jal-mitraafrontend.onrender.com/"
  },
  {
    slug: "krishi-drishti",
    name: "Krishi Drishti — Smart Agriculture Platform",
    clientName: "Academic Innovation Project",
    clientCompany: "Smart AgriTech Solutions",
    industry: "Agriculture Technology (AgriTech)",
    category: "Smart Agriculture",
    projectType: "IoT Precision Agriculture & Weather Forecasting System",
    status: "COMPLETED",
    startDate: new Date("2025-04-01T00:00:00Z"),
    completionDate: new Date("2025-09-04T00:00:00Z"),
    liveUrl: "https://krishi-drishti.onrender.com/",
    demoUrl: "https://krishi-drishti.onrender.com/",
    githubUrl: "https://github.com/vikashkumarsingh21/KRISHI-DRISHTI",
    shortDescription:
      "AI-powered Smart Agriculture platform with IoT sensor monitoring, weather forecasting, automated irrigation, and real-time crop analytics.",
    overview:
      "Krishi Drishti is an intelligent Smart Agriculture platform developed to help farmers monitor crop health, automate irrigation systems, analyze weather conditions, and improve farming productivity using Artificial Intelligence and IoT technologies. The platform provides real-time sensor monitoring, live weather forecasting, Firebase cloud integration, crop analytics, market price tracking, and smart irrigation automation. The system is designed to support sustainable farming while reducing water wastage and improving crop yield.",
    businessRequirement:
      "Farming communities face unpredictable rainfall patterns and high water consumption. An automated, telemetry-driven irrigation solution was required to optimize water utilization.",
    problemStatement:
      "Farmers rely on manual guesswork for crop irrigation, resulting in overwatering, soil nutrient depletion, high electrical utility costs, and reduced yields.",
    solutionDelivered:
      "Krishi Drishti provides an AI-powered agriculture platform that integrates IoT soil sensors, weather forecasting APIs, Firebase cloud services, and automated solenoid irrigation to enable real-time farm monitoring and automated valve triggering.",
    objectives:
      "1. Reduce agricultural water consumption by 35% via automated soil moisture thresholds.\n2. Stream live weather forecasts and pest alert notifications to farmers.\n3. Provide accessible regional language dashboards for agricultural operators.",
    scopeOfWork:
      "Soil moisture & environmental sensor deployment, ESP8266 controller firmware, automated relay control, Firebase real-time database, and farmer web interface.",
    deliverables:
      "Functional IoT farm controller node, cloud database, live farmer dashboard, weather advisory module, complete technical handbook.",
    frontendTech: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
    backendTech: ["Node.js", "Firebase Realtime Database"],
    databaseTech: ["Firebase Realtime DB"],
    frameworks: ["Bootstrap 5"],
    languages: ["C++ (Embedded)", "JavaScript", "HTML/CSS"],
    apisAndIntegrations: ["OpenWeatherMap API", "Firebase REST API", "Google Maps API"],
    hostingPlatform: "Render Cloud Platform & Firebase",
    devTools: ["Arduino IDE", "Git", "VS Code"],
    additionalTech: ["Soil Moisture Probes", "DHT22 Sensor", "Automated Relays", "ESP8266"],
    technologies: ["HTML", "CSS", "JavaScript", "Bootstrap", "Firebase", "Node.js", "ESP8266", "Arduino", "IoT", "Google Maps API"],
    features: [
      "Smart Automated Irrigation System",
      "Real-Time Soil Moisture & Temp Telemetry",
      "Hyper-Local Weather Forecast Integration",
      "Crop Health Assessment Matrix",
      "Soil Nutrient & Moisture Trend Analysis",
      "Live Sensor Analytics Charts",
      "Mandi Market Price Advisory",
      "Mobile-Responsive Farmer Dashboard"
    ],
    thumbnailUrl: "/assets/portfolio/projects/portfolio-smart-agriculture.jpg",
    websiteScreenshots: ["/assets/portfolio/projects/portfolio-smart-agriculture.jpg"],
    dashboardScreenshots: [],
    mobileScreenshots: [],
    galleryImages: ["/assets/portfolio/projects/portfolio-smart-agriculture.jpg"],
    presentationHighlights: [
      "Precision agriculture IoT solution reducing water wastage significantly",
      "Automated solenoid valve triggers based on live soil moisture telemetry",
      "Accessible farmer-friendly web dashboard with real-time weather analytics"
    ],
    presentationNotes:
      "Demonstrate simulated soil moisture changes and show automated trigger response times in the dashboard.",
    isPresentationReady: true,
    internalNotes:
      "Completed September 4, 2025. Extensively field-tested over 5 months across seasonal crop cycles.",
    assignedTeam: "IoT & Agritech Systems Division",
    projectOwner: "VIKASH KUMAR",
    developmentDepartment: "Embedded Systems & IoT",
    deliveryNotes: "Achieved measured 38% water savings compared to traditional flood irrigation during field tests.",
    maintenanceInfo: "Sensor probe calibration recommended twice per agricultural sowing season.",
    qualityNotes: "Sensor polling intervals optimized to extend solar battery run-times up to 72 hours without sun.",
    confidentialData: "Proprietary irrigation threshold algorithm parameters archived in corporate vault.",
    deliveryConfirmation: true,
    reviewStatus: "APPROVED",
    finalApprovedLink: "https://krishi-drishti.onrender.com/"
  },
  {
    slug: "nani-tathagat",
    name: "Nani Tathagat — Business Automation Platform",
    clientName: "Nani Tathagat",
    clientCompany: "Nani Tathagat Enterprises",
    industry: "Business Consulting & Digital Services",
    category: "Business Automation",
    projectType: "Business Automation & Inbound Lead Engine",
    status: "COMPLETED",
    startDate: new Date("2026-04-01T00:00:00Z"),
    completionDate: new Date("2026-06-06T00:00:00Z"),
    liveUrl: "https://nanitathagat.in/",
    demoUrl: "https://nanitathagat.in/",
    githubUrl: "https://github.com/vikashkumarsingh21/nanitathagat",
    shortDescription:
      "Professional business automation and lead generation platform designed to help businesses streamline operations, marketing, customer engagement, and digital growth.",
    overview:
      "Nani Tathagat is a business automation platform developed to simplify lead generation, customer management, and business operations. The platform enables organizations to establish a strong digital presence through modern web technologies while automating customer inquiries, service requests, and business workflows. It provides an intuitive interface, responsive design, SEO optimization, and scalable architecture for future business expansion.",
    businessRequirement:
      "A fast-growing business consulting agency required a centralized lead intake and operational automation system to eliminate manual inquiry tracking.",
    problemStatement:
      "Inbound inquiries across WhatsApp, email, and telephone were fragmented, leading to delayed prospect follow-ups and lost revenue opportunities.",
    solutionDelivered:
      "A modern business automation platform was developed to automate lead collection, route customer communication, simplify service offerings, and sync prospect entries directly to automated Google Sheets and notification webhooks.",
    objectives:
      "1. Automate 100% of web lead capture into a structured operational database.\n2. Provide rapid automated acknowledgement emails to prospective clients.\n3. Present consulting service packages with transparent tier outlines.",
    scopeOfWork:
      "Web interface design, Google Apps Script automation webhooks, Google Sheets database synchronization, transactional email routing, and SEO optimization.",
    deliverables:
      "Production business website, automated lead routing webhook, real-time Google Sheets tracking ledger, client onboarding documentation.",
    frontendTech: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
    backendTech: ["Node.js", "Google Apps Script"],
    databaseTech: ["SQL", "Google Sheets Database"],
    frameworks: ["Bootstrap 5"],
    languages: ["JavaScript", "HTML5", "CSS3", "Apps Script"],
    apisAndIntegrations: ["Google Apps Script API", "Google Sheets API", "SMTP Email Dispatch"],
    hostingPlatform: "Production Web Hosting & Google Cloud",
    devTools: ["VS Code", "Git", "Postman"],
    additionalTech: ["Lead Automation", "Responsive UI", "Webhook Sync"],
    technologies: ["HTML", "CSS", "JavaScript", "Bootstrap", "Node.js", "SQL", "Google Apps Script", "Google Sheets", "Responsive Web Design"],
    features: [
      "Professional Business Consulting Web Platform",
      "Automated Inbound Lead Generation Engine",
      "Instant Customer Contact Routing",
      "Google Apps Script Webhook Pipeline",
      "Real-Time Google Sheets Operational Ledger",
      "Service Tier & Deliverable Showcase",
      "SEO Optimized Strategic Service Pages",
      "Instant Client Inquiry Acknowledgements"
    ],
    thumbnailUrl: "/assets/portfolio/projects/portfolio-business-automation.jpg",
    websiteScreenshots: ["/assets/portfolio/projects/portfolio-business-automation.jpg"],
    dashboardScreenshots: [],
    mobileScreenshots: [],
    galleryImages: ["/assets/portfolio/projects/portfolio-business-automation.jpg"],
    presentationHighlights: [
      "Streamlined consulting platform with automated lead synchronization",
      "Zero-overhead automated Google Sheets and webhook integration",
      "Clean corporate design establishing high-trust credibility with enterprise clients"
    ],
    presentationNotes:
      "Demonstrate live lead capture form submission and immediate automated sync into the ledger.",
    isPresentationReady: true,
    internalNotes:
      "Project delivered on June 6, 2026. Lead synchronization tested with 100% success rate on live domain.",
    assignedTeam: "Business Solutions & Automation Team",
    projectOwner: "VIKASH KUMAR",
    developmentDepartment: "Automation & Enterprise Solutions",
    deliveryNotes: "Client validated automated Google Sheets notification flow and confirmed sign-off.",
    maintenanceInfo: "Apps Script quota monitoring and monthly form submission health checks.",
    qualityNotes: "Mobile responsive across all smartphone displays with instant form validation.",
    confidentialData: "Client corporate tax identification and private consulting fee schedules secured.",
    deliveryConfirmation: true,
    reviewStatus: "APPROVED",
    finalApprovedLink: "https://nanitathagat.in/"
  }
];

async function seed() {
  console.log("=== SEEDING AXIVONTECH PROJECT LIBRARY ===");

  // Find Founder or Admin to assign as createdBy
  const adminUser = await prisma.user.findFirst({
    where: {
      userRoles: {
        some: {
          role: {
            name: { in: ["FOUNDER", "ADMIN"] }
          }
        }
      }
    }
  });

  const createdById = adminUser?.id || null;
  console.log(`Using creator user ID: ${createdById} (${adminUser?.email || "none"})`);

  for (const item of verifiedProjects) {
    const existing = await prisma.projectLibraryItem.findUnique({
      where: { slug: item.slug }
    });

    if (existing) {
      console.log(`[UPDATE] Project "${item.name}" already exists (${existing.id}). Updating verified fields...`);
      await prisma.projectLibraryItem.update({
        where: { id: existing.id },
        data: {
          ...item,
          updatedById: createdById,
        }
      });
      console.log(`[UPDATE SUCCESS] Updated "${item.name}".`);
    } else {
      console.log(`[INSERT] Creating project "${item.name}"...`);
      const created = await prisma.projectLibraryItem.create({
        data: {
          ...item,
          createdById,
          updatedById: createdById,
          assets: {
            create: [
              {
                title: `${item.name} Primary Thumbnail`,
                assetType: "THUMBNAIL",
                url: item.thumbnailUrl,
                caption: `Official verified project showcase thumbnail for ${item.name}`,
                isPublic: true,
                displayOrder: 1,
              }
            ]
          },
          documents: {
            create: [
              {
                title: `${item.name} Delivery Confirmation Record`,
                fileUrl: `/docs/delivery/${item.slug}-delivery-certificate.pdf`,
                fileSize: 1048576,
                fileType: "application/pdf",
                isConfidential: true,
                uploadedById: createdById,
              }
            ]
          },
          auditLogs: {
            create: [
              {
                userId: createdById,
                userName: adminUser?.name || "System Admin",
                userRole: "FOUNDER",
                action: "PROJECT_CREATED",
                details: {
                  note: "Migrated verified historical completed project into centralized Project Library.",
                  completionDate: item.completionDate?.toISOString(),
                  verifiedUrl: item.liveUrl,
                }
              }
            ]
          }
        }
      });
      console.log(`[INSERT SUCCESS] Created "${item.name}" with ID: ${created.id}`);
    }
  }

  const totalCount = await prisma.projectLibraryItem.count();
  console.log(`=== TOTAL PROJECT LIBRARY ITEMS: ${totalCount} ===`);
}

seed()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
