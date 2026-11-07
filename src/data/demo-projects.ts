export interface DemoProject {
  id: string;
  name: string;
  slug?: string;
  category: string;
  shortDescription: string;
  targetAudience: string;
  features: string[];
  priority: "P1" | "P2" | "P3";
  isFeatured: boolean;
  status: "Live Demo" | "Coming Soon";
  demoUrl?: string;
  enquiryType: "View Demo" | "Request a Similar Project";
  accentColor?: string; // Subtle brand accent for visual identity
  image?: string;
  gallery?: string[];
  problemStatement?: string;
  solutionOverview?: string;
  techStack?: string[];
  relatedServiceSlug?: string;
  displayOrder?: number;
}

export const DEMO_CATEGORIES = [
  "All Projects",
  "Business & Corporate",
  "Healthcare",
  "Education",
  "Restaurants & Food",
  "Hotels & Travel",
  "Furniture & Interiors",
  "Real Estate",
  "E-commerce",
  "Fitness & Wellness",
  "SaaS & Software",
  "Local Businesses",
  "Events",
  "Professional Services",
  "Agriculture & IoT",
  "Finance & Accounting",
  "Logistics",
  "Recruitment",
  "Beauty & Lifestyle",
  "Creative & Marketing",
  "Dashboards & Portals",
  "AI & Automation",
  "Nonprofit",
  "Other Industries",
] as const;

export type DemoCategory = (typeof DEMO_CATEGORIES)[number];

/**
 * Global configuration flag to control whether unlaunched concepts ("Coming Soon")
 * are displayed in the main public catalogue.
 * By default (false), only fully interactive "Live Demo" projects are displayed.
 * Setting this to true instantly displays all 47 demo concepts.
 */
export const SHOW_COMING_SOON_DEMOS = false;

export const DEMO_PROJECTS: DemoProject[] = [
  // ── LIVE DEMO 1: Healthcare ──
  {
    id: "medicare",
    name: "MediCare",
    slug: "medicare",
    category: "Healthcare",
    shortDescription: "Modern medical clinic & hospital portal with doctor discovery, department profiles, OPD schedules, and health service overviews.",
    targetAudience: "Hospitals, multi-specialty clinics, diagnostic centers, private doctors",
    features: ["Doctor Directory & Specialities", "Department Overviews", "OPD Schedule Showcase", "Patient Resource Hub"],
    priority: "P1",
    isFeatured: true,
    status: "Live Demo",
    enquiryType: "View Demo",
    demoUrl: "/demo-projects/healthcare/medicare",
    accentColor: "#147D78",
    image: "/images/demo-projects/medicare/hero-consultation.jpg",
    gallery: [
      "/images/demo-projects/medicare/hero-consultation.jpg",
      "/images/demo-projects/medicare/dept-general.jpg",
      "/images/demo-projects/medicare/dept-cardiology.jpg",
      "/images/demo-projects/medicare/dept-neurology.jpg",
    ],
    techStack: ["Next.js 15", "TypeScript", "Tailwind CSS", "Lucide React", "WCAG AAA Compliant"],
    problemStatement: "Patients seeking clinical care frequently encounter difficult-to-navigate hospital portals that obscure doctor credentials, OPD schedules, and direct consultation request options.",
    solutionOverview: "MediCare provides a calming, accessible healthcare portal with real-time doctor specialty filtering, department service hubs, OPD timetable showcases, and streamlined appointment request funnels.",
    relatedServiceSlug: "web-development",
    displayOrder: 1,
  },

  // ── LIVE DEMO 2: K-12 School Education ──
  {
    id: "oakfield",
    name: "Oakfield International School",
    slug: "oakfield",
    category: "Education",
    shortDescription: "Premier CBSE K-12 institutional platform featuring progressive academic wings, Principal's desk, validated admissions workflow, faculty roster, and campus infrastructure.",
    targetAudience: "K-12 schools, CBSE/ICSE institutions, academic trusts, international academies",
    features: ["Four Academic Wings (EYFS to Grade XII)", "Online Admissions Workflow & Validation", "Principal's Welcome Address", "15-Acre Campus Infrastructure Showcase"],
    priority: "P1",
    isFeatured: true,
    status: "Live Demo",
    enquiryType: "View Demo",
    demoUrl: "/demo-projects/education/oakfield",
    accentColor: "#143D30",
    image: "/demo-assets/education/oakfield/hero-campus.jpg",
    gallery: [
      "/demo-assets/education/oakfield/hero-campus.jpg",
      "/demo-assets/education/oakfield/smart-classroom.jpg",
      "/demo-assets/education/oakfield/stem-robotics.jpg",
      "/demo-assets/education/oakfield/school-library.jpg",
      "/demo-assets/education/oakfield/sports-ground.jpg",
    ],
    techStack: ["Next.js 16", "TypeScript", "Tailwind CSS", "Interactive Admissions Engine"],
    problemStatement: "School management trusts struggle to convey academic caliber, CBSE accreditation, and campus facilities through generic school templates.",
    solutionOverview: "Oakfield delivers a realistic, prestigious school web platform with progressive academic wing exploration, online admission enquiry validation, digital circulars, and guided campus tour booking.",
    relatedServiceSlug: "web-development",
    displayOrder: 2,
  },

  // ── LIVE DEMO 3: Higher Education & Academies ──
  {
    id: "edusmart",
    name: "EduSmart",
    slug: "edusmart",
    category: "Education",
    shortDescription: "Comprehensive academic institution portal covering admissions, academic curriculums, campus tours, and student notices.",
    targetAudience: "Schools, colleges, universities, coaching academies, ed-tech brands",
    features: ["Admissions Workflow", "Course & Program Finder", "Faculty Directory", "Digital Notice Board"],
    priority: "P1",
    isFeatured: true,
    status: "Live Demo",
    enquiryType: "View Demo",
    demoUrl: "/demo-projects/education/edusmart",
    accentColor: "#33243B",
    image: "/images/demo-projects/edusmart/hero-campus.jpg",
    gallery: [
      "/images/demo-projects/edusmart/hero-campus.jpg",
      "/images/demo-projects/edusmart/campus-library.jpg",
      "/images/demo-projects/edusmart/academic-seminar.jpg",
      "/images/demo-projects/edusmart/about-learning.jpg",
    ],
    techStack: ["Next.js 15", "TypeScript", "Tailwind CSS", "Lucide React"],
    problemStatement: "Educational academies and universities need to present multi-tier degree curricula, campus facilities, and admissions deadlines clearly to prospective students and parents.",
    solutionOverview: "EduSmart (Aurevia Academy) provides an academic digital portal featuring program filtering, curriculum modal views, admissions inquiry forms, faculty directories, and campus life photo galleries.",
    relatedServiceSlug: "web-development",
    displayOrder: 3,
  },

  // ── LIVE DEMO 4: Hotels & Travel ──
  {
    id: "solara",
    name: "Solara Retreat & Resort",
    slug: "solara",
    category: "Hotels & Travel",
    shortDescription: "Luxury eco-hospitality website featuring private plunge-pool villas, organic farm-to-table dining, Ayurvedic wellness spa, stargazing observatory, and reservation booking.",
    targetAudience: "Luxury resorts, boutique eco-hotels, wellness retreats, safari lodges",
    features: ["Eighteen Villa & Suite Dossiers", "Farm-to-Table Dining Showcase", "Ayurvedic Spa & Hydrotherapy", "Curated Stay Reservation Desk"],
    priority: "P1",
    isFeatured: true,
    status: "Live Demo",
    enquiryType: "View Demo",
    demoUrl: "/demo-projects/hospitality/solara",
    accentColor: "#B57A42",
    image: "/demo-assets/hospitality/solara/hero-resort.jpg",
    gallery: [
      "/demo-assets/hospitality/solara/hero-resort.jpg",
      "/demo-assets/hospitality/solara/villa-plunge-pool.jpg",
      "/demo-assets/hospitality/solara/canopy-suite.jpg",
      "/demo-assets/hospitality/solara/harvest-dining.jpg",
      "/demo-assets/hospitality/solara/ayurvedic-spa.jpg",
      "/demo-assets/hospitality/solara/stargazing-deck.jpg",
    ],
    techStack: ["Next.js 16", "TypeScript", "Tailwind CSS", "Interactive Reservation Engine"],
    problemStatement: "Luxury resorts and wellness retreats require atmospheric storytelling, accommodation dossiers, and direct booking inquiries without high OTA commission leakage.",
    solutionOverview: "Solara creates an editorial hospitality flagship showcasing private pool villas, farm-to-table menus, Ayurvedic wellness therapies, and an interactive stay reservation desk.",
    relatedServiceSlug: "web-development",
    displayOrder: 4,
  },

  // ── LIVE DEMO 5: Real Estate ──
  {
    id: "estatevista",
    name: "EstateVista",
    slug: "estatevista",
    category: "Real Estate",
    shortDescription: "Curated architectural real estate platform featuring verified listings, CAD floor plans, enclave guides, mortgage calculators, and private viewing workflows.",
    targetAudience: "Luxury brokerages, property developers, private family offices, institutional investors",
    features: ["Interactive Multi-Facet Search", "CAD Floor Plan Room Dimensions", "Side-by-Side Comparison", "Dynamic Mortgage Modeler"],
    priority: "P1",
    isFeatured: true,
    status: "Live Demo",
    enquiryType: "View Demo",
    demoUrl: "/demo-projects/real-estate/estatevista",
    accentColor: "#123C32",
    image: "/images/demo-projects/estatevista/hero-villa.jpg",
    gallery: [
      "/images/demo-projects/estatevista/hero-villa.jpg",
      "/images/demo-projects/estatevista/prop-1-exterior.jpg",
      "/images/demo-projects/estatevista/prop-2-interior.jpg",
      "/images/demo-projects/estatevista/prop-3-courtyard.jpg",
    ],
    techStack: ["Next.js 15", "TypeScript", "Tailwind CSS", "Framer Motion", "Vector CAD Blueprints"],
    problemStatement: "Ultra-luxury real estate brokerages struggle to convey architectural grandeur through generic real estate templates that lack CAD floor plans, enclave context, or dynamic mortgage telemetry.",
    solutionOverview: "EstateVista delivers an architectural-grade real estate experience featuring verified high-value property dossiers, vector CAD floor plans with room measurements, enclave guides, interactive mortgage calculators, and private VIP tour booking.",
    relatedServiceSlug: "web-development",
    displayOrder: 5,
  },

  // ── LIVE DEMO 6: Live Client Restaurant ──
  {
    id: "purvarang",
    name: "Purvarang Family Restaurant",
    slug: "purvarang-family-restaurant",
    category: "Restaurants & Food",
    shortDescription: "Dedicated restaurant website showcasing authentic North Indian, Tandoori, and Chinese culinary offerings with a digital menu, ambiance showcase, and direct customer contact in Lalganj, Vaishali.",
    targetAudience: "Family restaurants, multi-cuisine dining, banquet halls, local culinary businesses",
    features: ["Interactive Digital Menu", "Dining Space Ambiance Showcase", "One-Tap Calling & Contact", "Google Maps Location Directions"],
    priority: "P1",
    isFeatured: true,
    status: "Live Demo",
    enquiryType: "View Demo",
    demoUrl: "https://purvarang-family-restaurant.onrender.com/",
    accentColor: "#C2410C",
    image: "/assets/images/portfolio/purvarang-family-restaurant.jpg",
    gallery: [
      "/assets/images/portfolio/purvarang-family-restaurant.jpg",
    ],
    techStack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Digital Menu"],
    problemStatement: "Local family restaurants require a clean, fast online presence to display complete digital menus, operating hours, and location directions without high aggregator fees.",
    solutionOverview: "A dedicated digital menu and restaurant identity platform engineered for customer convenience, fast mobile loading, and direct customer inquiries.",
    relatedServiceSlug: "web-development",
    displayOrder: 6,
  },

  // ── LIVE DEMO 7: Fine Dining & Culinary ──
  {
    id: "foodiehub",
    name: "FoodieHub",
    slug: "foodiehub",
    category: "Restaurants & Food",
    shortDescription: "Visual restaurant & cafe experience featuring rich digital menus, chef specials, table reservations, and branch finders.",
    targetAudience: "Fine dining restaurants, cafe chains, cloud kitchens, bistros",
    features: ["Digital Visual Menu", "Online Table Reservation", "Chef's Specials Carousel", "Customer Review Integration"],
    priority: "P1",
    isFeatured: true,
    status: "Live Demo",
    enquiryType: "View Demo",
    demoUrl: "/demo-projects/food/foodiehub",
    accentColor: "#B85C38",
    image: "/images/demo-projects/foodiehub/hero-dish.jpg",
    gallery: [
      "/images/demo-projects/foodiehub/hero-dish.jpg",
      "/images/demo-projects/foodiehub/ambience-interior.jpg",
      "/images/demo-projects/foodiehub/sig-paneer-tikka.jpg",
      "/images/demo-projects/foodiehub/private-dining.jpg",
    ],
    techStack: ["Next.js 15", "React 19", "Tailwind CSS", "Framer Motion", "Image Optimization"],
    problemStatement: "Fine dining restaurants require atmospheric storytelling, interactive digital menus with allergen and dietary tagging, and reliable reservation lead capture without paying exorbitant aggregator fees.",
    solutionOverview: "FoodieHub creates an editorial culinary showcase featuring high-res signature dish presentation, interactive multi-course digital menus with allergen indicators, and direct table reservation workflows.",
    relatedServiceSlug: "web-development",
    displayOrder: 7,
  },

  // ── LIVE DEMO 8: Live Client Furniture Showroom ──
  {
    id: "udaan-furniture",
    name: "Udaan Furniture",
    slug: "udaan-furniture",
    category: "Furniture & Interiors",
    shortDescription: "Showroom website presenting residential and office furniture collections across living, bedroom, dining, and workspace interiors for customers in Rajkot, Gujarat.",
    targetAudience: "Furniture showrooms, home interior retailers, modular kitchen studios, office decor brands",
    features: ["Showroom Collection Galleries", "Living & Bedroom Furniture", "Office & Ergonomic Desks", "Store Directions & Contact"],
    priority: "P1",
    isFeatured: true,
    status: "Live Demo",
    enquiryType: "View Demo",
    demoUrl: "https://udaan-furniture.onrender.com/",
    accentColor: "#B45309",
    image: "/assets/images/portfolio/udaan-furniture.jpg",
    gallery: [
      "/assets/images/portfolio/udaan-furniture.jpg",
    ],
    techStack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Responsive UI"],
    problemStatement: "Regional furniture showrooms need to present extensive collections across residential and corporate segments clearly to local retail buyers.",
    solutionOverview: "A modern furniture catalog website highlighting craftsmanship, room-by-room collections, and direct showroom visit booking.",
    relatedServiceSlug: "web-development",
    displayOrder: 8,
  },

  // ── LIVE DEMO 9: E-Commerce Store ──
  {
    id: "novacart",
    name: "NovaCart",
    slug: "novacart",
    category: "E-commerce",
    shortDescription: "Thoughtfully selected everyday lifestyle products with dynamic filtering, live cart persistence, and checkout demonstration.",
    targetAudience: "D2C brands, online retailers, lifestyle boutique stores, consumer products",
    features: ["Dynamic Cart & Wishlist", "Category & Price Filters", "Live Product Search", "Simulated Checkout Flow"],
    priority: "P1",
    isFeatured: true,
    status: "Live Demo",
    enquiryType: "View Demo",
    demoUrl: "/demo-projects/ecommerce/novacart",
    accentColor: "#D8F16A",
    image: "/images/demo-projects/novacart/hero-lifestyle.jpg",
    gallery: [
      "/images/demo-projects/novacart/hero-lifestyle.jpg",
      "/images/demo-projects/novacart/watch-matte-chrono.jpg",
      "/images/demo-projects/novacart/backpack-commuter.jpg",
      "/images/demo-projects/novacart/mechanical-keyboard.jpg",
    ],
    techStack: ["Next.js 15", "React Context API", "LocalStorage Persistence", "Tailwind CSS", "Framer Motion"],
    problemStatement: "D2C lifestyle retailers require sub-second catalog responsiveness, dynamic multi-attribute filtering, persistent cart state across sessions, and simulated checkout flows to maximize conversion.",
    solutionOverview: "NovaCart is an ultra-fast lifestyle e-commerce demonstration featuring live search, faceted category and price filtering, reactive cart and wishlist drawers, discount coupon logic, and interactive checkout simulation.",
    relatedServiceSlug: "web-development",
    displayOrder: 9,
  },

  // ── LIVE DEMO 10: Fitness & 3D Gym ──
  {
    id: "fitzone",
    name: "FitZone",
    slug: "fitzone",
    category: "Fitness & Wellness",
    shortDescription: "High-performance 3D gym & athletic club experience featuring 7-day schedule telemetry, master coach rosters, interactive split planner, and free trial pass booking.",
    targetAudience: "Gyms, athletic clubs, CrossFit boxes, combat academies, personal training studios",
    features: [
      "Interactive 3D Perspective Hero",
      "7-Day Class Schedule Telemetry",
      "Trainer Roster & Bio Modals",
      "AI Split & Goal Planner",
      "Free VIP Trial Pass Form",
    ],
    priority: "P1",
    isFeatured: true,
    status: "Live Demo",
    enquiryType: "View Demo",
    demoUrl: "/demo-projects/fitness/fitzone",
    accentColor: "#FF7138",
    image: "/assets/images/services/web-engineering.jpg",
    gallery: [
      "/assets/images/services/web-engineering.jpg",
      "/assets/images/services/web-development.jpg",
      "/assets/images/services/ui-ux-design.jpg",
    ],
    techStack: ["Next.js 15", "Framer Motion", "Tailwind 3D Perspective", "TypeScript", "Canvas Graphics"],
    problemStatement: "Athletic clubs and boutique gyms fail to convert online visitors when websites present static schedule PDFs and generic trainer lists without immersive kinetic energy.",
    solutionOverview: "FitZone delivers an energetic 3D gym experience featuring dynamic class telemetry, coach biography modals, interactive workout split planning, and VIP free trial lead capture.",
    relatedServiceSlug: "web-development",
    displayOrder: 10,
  },

  // ── LIVE DEMO 11: Enterprise & Business ──
  {
    id: "corporate-pro",
    name: "CorporatePro",
    slug: "corporatepro",
    category: "Business & Corporate",
    shortDescription: "High-performance enterprise website showcasing organizational credibility, service pillars, leadership, and investor relations.",
    targetAudience: "Corporations, B2B enterprises, consulting firms, holding companies",
    features: ["Executive Leadership Profile", "Interactive Service Matrix", "Investor Relations Portal", "Multi-office Locator"],
    priority: "P1",
    isFeatured: true,
    status: "Live Demo",
    demoUrl: "/demo-projects/business/corporatepro",
    enquiryType: "View Demo",
    accentColor: "#29483b",
    image: "/images/demo-projects/corporatepro/hero-advisory.jpg",
    gallery: [
      "/images/demo-projects/corporatepro/hero-advisory.jpg",
      "/images/demo-projects/corporatepro/about-philosophy.jpg",
      "/images/demo-projects/corporatepro/digital-transformation.jpg",
      "/images/demo-projects/corporatepro/operations-case-study.jpg",
    ],
    techStack: ["Next.js 15", "TypeScript", "Tailwind CSS", "Framer Motion", "Lucide React"],
    problemStatement: "Multi-practice consulting firms and large B2B enterprises need to project institutional credibility, executive depth, and global service capabilities without suffering from slow legacy CMS architectures.",
    solutionOverview: "CorporatePro delivers an ultra-fast corporate digital flagship featuring interactive service matrices, leadership dossiers, investor governance repositories, and multi-office locator routing.",
    relatedServiceSlug: "web-development",
    displayOrder: 11,
  },

  // ── LIVE DEMO 12: B2B SaaS CRM Cockpit ──
  {
    id: "leadpilot",
    name: "LeadPilot",
    slug: "leadpilot",
    category: "Dashboards & Portals",
    shortDescription: "B2B CRM and sales pipeline dashboard demo demonstrating kanban lead stages, deal probability scoring, and team activity logs.",
    targetAudience: "Inside sales teams, agency business developers, real estate sales",
    features: ["Kanban Deal Stage Board", "Contact Timeline & History", "Automated Follow-up Tasks", "Revenue Forecast Metrics"],
    priority: "P1",
    isFeatured: true,
    status: "Live Demo",
    demoUrl: "/demo-projects/saas/leadpilot",
    enquiryType: "View Demo",
    accentColor: "#2F806A",
    image: "/assets/images/services/custom-software-development.jpg",
    gallery: [
      "/assets/images/services/custom-software-development.jpg",
      "/assets/images/services/cloud-solutions.jpg",
      "/assets/images/services/automation.jpg",
    ],
    techStack: ["Next.js 15", "TypeScript", "Lucide React", "Tailwind CSS", "Interactive State"],
    problemStatement: "B2B sales teams frequently struggle with fragmented customer relationship tracking, manual follow-up reminders, and opaque revenue forecast calculations.",
    solutionOverview: "LeadPilot provides a high-efficiency sales pipeline cockpit featuring interactive kanban stage boards, contact activity logs, automated deal scoring, and real-time revenue projection metrics.",
    relatedServiceSlug: "custom-software-development",
    displayOrder: 12,
  },

  // ── CONCEPT 1 ──
  {
    id: "staysphere",
    name: "StaySphere",
    slug: "staysphere",
    category: "Hotels & Travel",
    shortDescription: "Luxury boutique resort & hotel website highlighting room categories, amenities, local experiences, and direct reservation inquiries.",
    targetAudience: "Boutique hotels, luxury resorts, homestays, vacation rentals",
    features: ["Room Suite Previews", "Amenities Grid", "Seasonal Offer Banners", "Direct Booking Inquiries"],
    priority: "P1",
    isFeatured: true,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
    accentColor: "#f59e0b",
  },

  // ── CONCEPT 2 ──
  {
    id: "creativefolio",
    name: "CreativeFolio",
    slug: "creativefolio",
    category: "Creative & Marketing",
    shortDescription: "Immersive agency portfolio designed to present case studies, brand identity transformations, motion showcases, and client impact.",
    targetAudience: "Design studios, branding agencies, creative directors, production houses",
    features: ["Case Study Deep-dives", "Interactive Client Grid", "Awards & Recognition", "Project Inquiry Builder"],
    priority: "P1",
    isFeatured: true,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
    accentColor: "#6366f1",
  },

  // ── CONCEPT 3 ──
  {
    id: "locallift",
    name: "LocalLift",
    slug: "locallift",
    category: "Local Businesses",
    shortDescription: "High-conversion local service business website built to capture local search leads, emergency booking, and customer trust.",
    targetAudience: "Plumbing, electrical, home repairs, cleaning, local workshops",
    features: ["Click-to-Call Floating CTA", "Service Radius Map", "Transparent Pricing Tiers", "Verified Customer Testimonials"],
    priority: "P1",
    isFeatured: true,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
    accentColor: "#eab308",
  },

  // ── CONCEPT 4 ──
  {
    id: "saaslaunch",
    name: "SaaSLaunch",
    slug: "saaslaunch",
    category: "SaaS & Software",
    shortDescription: "High-converting SaaS product landing page with interactive feature breakdowns, live interactive demo previews, and tiered pricing tables.",
    targetAudience: "Tech startups, B2B software vendors, product teams, micro-SaaS",
    features: ["Interactive Feature Showcase", "Interactive Pricing Calculator", "Customer Social Proof", "Free Trial Onboarding Funnel"],
    priority: "P1",
    isFeatured: true,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
    accentColor: "#3b82f6",
  },

  // ── CONCEPT 5 ──
  {
    id: "eventora",
    name: "Eventora",
    category: "Events",
    shortDescription: "Conference & summit landing page with keynote speaker lineups, agenda tracks, venue guidance, and ticket tier registration.",
    targetAudience: "Conference organizers, trade shows, event agencies, tech summits",
    features: ["Multi-Track Agenda Timeline", "Speaker Spotlight Grid", "Sponsor Tiers Showcase", "Early Bird Pass Lead Flow"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 6 ──
  {
    id: "autocare-pro",
    name: "AutoCare Pro",
    category: "Local Businesses",
    shortDescription: "Automotive repair & service workshop website with service packages, quote estimators, and vehicle diagnostic appointments.",
    targetAudience: "Auto repair shops, detailing centers, car dealerships, mechanics",
    features: ["Service Package Selector", "Instant Quote Form", "Customer Diagnostic Guide", "Location & Directions"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 7 ──
  {
    id: "consultedge",
    name: "ConsultEdge",
    category: "Professional Services",
    shortDescription: "B2B management & strategic advisory consulting website highlighting industry practice areas, thought leadership, and partner bios.",
    targetAudience: "Management consultants, strategy advisors, accounting firms, law practices",
    features: ["Practice Area Deep-dives", "Whitepaper Downloads", "Partner Bios", "Confidential Consultation Request"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 8 ──
  {
    id: "impactnow",
    name: "ImpactNow",
    category: "Nonprofit",
    shortDescription: "Non-profit & NGO website dedicated to community initiatives, transparent fund utilization reports, and volunteer sign-ups.",
    targetAudience: "Charitable trusts, non-profits, international NGOs, community foundations",
    features: ["Cause Impact Metrics", "Volunteer Application Portal", "Annual Reports Archive", "Transparent Fund Utilization"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 9 ──
  {
    id: "krishi-drishti-demo",
    name: "Krishi Drishti",
    category: "Agriculture & IoT",
    shortDescription: "Smart agriculture & precision irrigation platform demo showcasing IoT sensor data, weather analytics, and crop advisory systems.",
    targetAudience: "Agri-tech startups, farm cooperatives, government agro missions",
    features: ["IoT Sensor Telemetry", "Automated Irrigation Controls", "Weather Advisory Forecast", "Crop Health Diagnostics"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 10 ──
  {
    id: "glowstudio",
    name: "GlowStudio",
    category: "Beauty & Lifestyle",
    shortDescription: "Luxury salon, spa, and beauty studio website with service menus, aesthetic galleries, package bookings, and stylist profiles.",
    targetAudience: "Spas, premium salons, aesthetic clinics, beauty practitioners",
    features: ["Treatment Menu with Pricing", "Stylist Lookbook Gallery", "Online Appointment Request", "Gift Voucher Inquiries"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 11 ──
  {
    id: "cargoflow",
    name: "CargoFlow",
    category: "Logistics",
    shortDescription: "Commercial logistics & freight forwarding website with shipment tracking previews, route coverage, and instant freight quote calculators.",
    targetAudience: "Freight forwarders, 3PL providers, courier companies, warehousing firms",
    features: ["Consignment Tracking Mockup", "Freight Rate Estimator", "Global Fleet Overview", "Port & Terminal Directory"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 12 ──
  {
    id: "talentbridge",
    name: "TalentBridge",
    category: "Recruitment",
    shortDescription: "Executive search and staffing firm website showcasing candidate placements, employer hiring services, and active job listings.",
    targetAudience: "Staffing agencies, executive search firms, HR consultancies",
    features: ["Live Job Board", "Resume Drop Box", "Employer Talent Request", "Sector Specialization Matrix"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 13 ──
  {
    id: "finedge",
    name: "FinEdge",
    category: "Finance & Accounting",
    shortDescription: "Corporate finance, tax advisory, and wealth management firm website built with security-first credibility and client portal gateways.",
    targetAudience: "Chartered accountants, wealth managers, tax advisors, investment firms",
    features: ["Financial Calculator Tools", "Tax Compliance Calendar", "Secure Client Portal Gateway", "Service Package Comparison"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 14 ──
  {
    id: "spacecraft",
    name: "SpaceCraft",
    category: "Professional Services",
    shortDescription: "Architectural & interior design studio portfolio presenting 3D rendering case studies, material palettes, and consultation estimators.",
    targetAudience: "Interior designers, architects, decor studios, turnkey builders",
    features: ["Before/After Sliders", "Room Transformation Portfolio", "Material & Style Guide", "Design Consultation Form"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 15 ──
  {
    id: "stylestreet",
    name: "StyleStreet",
    category: "E-commerce",
    shortDescription: "Trend-driven fashion apparel eCommerce demo highlighting lookbooks, size guide assistants, and seasonal collection curation.",
    targetAudience: "Fashion labels, streetwear brands, apparel manufacturers",
    features: ["Lookbook Interactive Hotspots", "Size Recommendation Guide", "Wishlist & Quick View", "Instagram Feed Integration"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 16 ──
  {
    id: "appnova",
    name: "AppNova",
    category: "SaaS & Software",
    shortDescription: "Mobile app showcase landing page designed to drive App Store / Google Play downloads with interactive phone mockups and reviews.",
    targetAudience: "Mobile app developers, consumer tech startups, app publishers",
    features: ["Interactive Device Mockup", "Feature Walkthrough Carousel", "App Store Smart Badges", "Press & Media Kit"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 17 ──
  {
    id: "securestack",
    name: "SecureStack",
    category: "SaaS & Software",
    shortDescription: "Cybersecurity & managed IT services provider website showcasing threat protection suites, compliance certifications, and audits.",
    targetAudience: "Managed service providers (MSP), SOC teams, cybersecurity firms",
    features: ["Security Audit Questionnaire", "Compliance Checklist (SOC2, ISO)", "24/7 Incident Response CTA", "Threat Intelligence Highlights"],
    priority: "P2",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 18 ──
  {
    id: "learnsphere",
    name: "LearnSphere",
    category: "Education",
    shortDescription: "Online learning platform demonstration with course video player, quiz engine, instructor management, and progress tracker.",
    targetAudience: "EdTech platforms, online course creators, corporate training firms",
    features: ["Curriculum & Module Viewer", "Video Lessons Interface", "Student Quiz & Certificate Mockup", "Instructor Analytics"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 19 ──
  {
    id: "careernest",
    name: "CareerNest",
    category: "Recruitment",
    shortDescription: "Full-scale job portal experience featuring applicant filtering, employer job posting workflows, and instant candidate matching.",
    targetAudience: "Niche job boards, industry associations, university alumni networks",
    features: ["Advanced Filter by Salary/Skill", "Candidate Application Funnel", "Employer Posting Wizard", "Email Job Alerts"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 20 ──
  {
    id: "bookease",
    name: "BookEase",
    category: "Local Businesses",
    shortDescription: "Universal appointment booking marketplace for local service providers, doctors, tutors, and consultants with calendar sync.",
    targetAudience: "Service marketplaces, multi-vendor booking platforms, appointment aggregators",
    features: ["Multi-provider Calendar Sync", "Time Slot Real-time Selector", "Automated SMS/Email Reminders", "Payment Milestone Preview"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 21 ──
  {
    id: "rentpilot",
    name: "RentPilot",
    category: "Real Estate",
    shortDescription: "Property management dashboard enabling landlords and tenants to monitor rent payments, maintenance tickets, and leases.",
    targetAudience: "Property managers, real estate investment trusts, co-living operators",
    features: ["Tenant Rent Collection Tracking", "Maintenance Ticket Workflow", "Lease Expiry Calendar", "Financial Inflow Breakdown"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 22 ──
  {
    id: "stockwise",
    name: "StockWise",
    category: "Dashboards & Portals",
    shortDescription: "Point-of-Sale and multi-store inventory dashboard showcasing low-stock alerts, barcode scanner integration, and daily revenue reports.",
    targetAudience: "Retail chains, FMCG distributors, electronics stores, boutiques",
    features: ["Real-time Inventory Ledger", "Low Stock Automated Alerts", "Multi-branch Reconciliation", "Sales Analytics Graphing"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 23 ──
  {
    id: "teampulse",
    name: "TeamPulse",
    category: "Dashboards & Portals",
    shortDescription: "Employee self-service intranet portal featuring attendance check-ins, leave approvals, expense claims, and company announcements.",
    targetAudience: "HR departments, growing companies (20-500 staff), distributed teams",
    features: ["Attendance & Leave Balance", "Expense Reimbursement Tracker", "Company Directory & Org Chart", "Internal Polls & Newsfeed"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 24 ──
  {
    id: "workboard",
    name: "WorkBoard",
    category: "Dashboards & Portals",
    shortDescription: "Agile project management workspace featuring sprint planning, burndown charts, task assignment, and client deliverable milestones.",
    targetAudience: "Software engineering shops, design studios, product companies",
    features: ["Sprint Backlog & Kanban", "Time Tracking per Task", "Burndown & Velocity Charts", "Role-based Client Guest Views"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 25 ──
  {
    id: "insightiq",
    name: "InsightIQ",
    category: "Dashboards & Portals",
    shortDescription: "Executive business intelligence dashboard aggregating multi-channel metrics, gross margins, customer churn, and growth projections.",
    targetAudience: "Founders, C-suite executives, financial analysts, operations leaders",
    features: ["Interactive Chart Filtering", "Custom Metric Builder", "Automated PDF Export", "KPI Health Indicators"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 26 ──
  {
    id: "helpdesk-pro",
    name: "HelpDesk Pro",
    category: "Dashboards & Portals",
    shortDescription: "Omnichannel customer support ticketing portal with SLA countdown timers, agent assignment, and knowledge base integration.",
    targetAudience: "Customer support teams, IT service desks, e-commerce support operations",
    features: ["SLA Timer & Priority Triage", "Canned Responses & Macros", "Knowledge Base Article Search", "Customer Satisfaction (CSAT) Scoring"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 27 ──
  {
    id: "axivon-assist",
    name: "Axivon Assist",
    category: "AI & Automation",
    shortDescription: "Enterprise AI chatbot widget demonstration with domain knowledge retrieval, CRM lead capture, and live escalation workflows.",
    targetAudience: "Customer service departments, digital agencies, automated front-desks",
    features: ["RAG Knowledge Retrieval Demo", "Conversational Lead Qualification", "Human Agent Handoff Trigger", "Custom Widget Theming"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 28 ──
  {
    id: "smartfarm-iot",
    name: "SmartFarm IoT",
    category: "Agriculture & IoT",
    shortDescription: "Industrial IoT telematics dashboard for agricultural automation, showing soil sensors, valve actuators, and power consumption.",
    targetAudience: "Commercial greenhouses, agricultural cooperatives, smart city parks",
    features: ["Live Gauge Telemetry", "Threshold Alert Rules", "Actuator Remote Trigger Mockup", "Historical Trend Analysis"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 29 ──
  {
    id: "caretrack",
    name: "CareTrack",
    category: "Healthcare",
    shortDescription: "Hospital operations & patient vitals tracking interface demonstrating bed allocation, shift rosters, and nursing charts.",
    targetAudience: "Hospitals, nursing homes, clinical research institutes",
    features: ["Ward Bed Occupancy Visualizer", "Patient Shift Log", "Doctor On-Call Roster", "Discharge Checklist"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 30 ──
  {
    id: "quickbite",
    name: "QuickBite",
    category: "Restaurants & Food",
    shortDescription: "Progressive Web App for quick-service restaurant food ordering with real-time kitchen display and order tracking.",
    targetAudience: "Quick-service restaurants, food courts, delivery kitchens, food trucks",
    features: ["Instant Menu Customizer", "Kitchen Display System (KDS)", "Live Order Status Stepper", "Digital Payment Integration"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 31 ──
  {
    id: "eventdesk",
    name: "EventDesk",
    category: "Events",
    shortDescription: "Event organizer operations portal featuring badge printing preview, attendee check-in scan interface, and ticket sales analytics.",
    targetAudience: "Event production teams, convention bureaus, expo managers",
    features: ["On-site Check-in Scanner View", "Badge Printing Layout Mockup", "Live Attendance Counter", "VIP Guest Alerts"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 32 ──
  {
    id: "giveforward",
    name: "GiveForward",
    category: "Nonprofit",
    shortDescription: "Crowdfunding and fundraising campaign platform with live progress meters, donor walls, and tax exemption receipt generator.",
    targetAudience: "Fundraisers, charity campaigns, disaster relief funds",
    features: ["Real-time Campaign Progress Bar", "Supporters Donor Wall", "Social Share Boosters", "80G/Tax Receipt Automation"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 33 ──
  {
    id: "triptrail",
    name: "TripTrail",
    category: "Hotels & Travel",
    shortDescription: "Curated travel discovery & custom itinerary planner website designed for destination marketing organizations and tour agencies.",
    targetAudience: "Tour operators, travel bloggers, adventure companies, tourism boards",
    features: ["Day-by-Day Itinerary Builder", "Interactive Travel Map", "Trip Cost Estimator", "Custom Package Inquiry"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 34 ──
  {
    id: "servestack",
    name: "ServeStack",
    category: "Restaurants & Food",
    shortDescription: "Comprehensive restaurant operations dashboard monitoring table turnover, kitchen prep times, and inventory wastage.",
    targetAudience: "Multi-outlet restaurant managers, F&B operations directors",
    features: ["Table Occupancy Heatmap", "Kitchen Preparation Bottlenecks", "Recipe Costing & Margins", "Daily P&L Snapshot"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 35 ──
  {
    id: "campuscore",
    name: "CampusCore",
    category: "Education",
    shortDescription: "Unified school management ERP portal tracking student attendance, exam grading, fee receipts, and teacher timetables.",
    targetAudience: "K-12 schools, international academies, multi-campus groups",
    features: ["Student Gradebook & Report Cards", "Fee Collection Ledger", "Automated Timetable Matrix", "Parent Communication Logs"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 36 ──
  {
    id: "clinicslot",
    name: "ClinicSlot",
    category: "Healthcare",
    shortDescription: "Doctor appointment booking web app with token queue tracking, specialty doctor schedules, and digital prescription preview.",
    targetAudience: "Polyclinics, doctor chambers, telemedicine platforms",
    features: ["Live Token Queue Number", "Doctor Specialty Filter", "Slot Booking SMS Confirmation", "Prescription Download Portal"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 37 ──
  {
    id: "marketmint",
    name: "MarketMint",
    category: "Creative & Marketing",
    shortDescription: "Modern digital marketing agency website showcasing SEO rankings, PPC case study ROI metrics, and free audit lead capture.",
    targetAudience: "Digital marketing agencies, SEO consultants, performance growth teams",
    features: ["Instant SEO Audit Lead Magnet", "PPC Growth Case Studies", "Transparent Retainer Pricing", "Client ROAS Calculators"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 38 ──
  {
    id: "buildsphere",
    name: "BuildSphere",
    category: "Other Industries",
    shortDescription: "Civil engineering and commercial construction firm website detailing ongoing projects, safety certifications, and tenders.",
    targetAudience: "Construction contractors, civil engineering firms, commercial builders",
    features: ["Ongoing Project Site Gallery", "Safety & Compliance Certifications", "Tender Bidding Inquiries", "Heavy Equipment Showcase"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  },

  // ── CONCEPT 39 ──
  {
    id: "moments-studio",
    name: "Moments Studio",
    category: "Beauty & Lifestyle",
    shortDescription: "High-end photography and wedding visual studio website with masonry galleries, video showreels, and booking calendars.",
    targetAudience: "Wedding photographers, commercial studios, cinematographers",
    features: ["Fullscreen Masonry Gallery", "Cinematography Showreel Embed", "Package Pricing Inquiries", "Client Private Proofing Area"],
    priority: "P3",
    isFeatured: false,
    status: "Coming Soon",
    enquiryType: "Request a Similar Project",
  }
];
/**
 * Returns demo projects respecting the SHOW_COMING_SOON_DEMOS configuration flag.
 */
export function getVisibleDemoProjects(): DemoProject[] {
  if (SHOW_COMING_SOON_DEMOS) {
    return DEMO_PROJECTS;
  }
  return DEMO_PROJECTS.filter((p) => p.status === "Live Demo");
}


/**
 * Maps a demo project to its verified image URL.
 * Prefers project.image, falls back to category-matched asset.
 */
export function getDemoProjectImage(project: DemoProject): string {
  if (project.image) return project.image;

  const categoryImages: Record<string, string> = {
    "Business & Corporate": "/images/demo-projects/corporatepro/hero-advisory.jpg",
    "Healthcare": "/images/demo-projects/medicare/hero-consultation.jpg",
    "Restaurants & Food": "/images/demo-projects/foodiehub/hero-dish.jpg",
    "Education": "/images/demo-projects/edusmart/hero-campus.jpg",
    "E-commerce": "/images/demo-projects/novacart/hero-lifestyle.jpg",
    "Real Estate": "/images/demo-projects/estatevista/estatevista-hero.jpg",
    "Fitness & Wellness": "/assets/images/services/web-engineering.jpg",
    "Dashboards & Portals": "/assets/images/services/custom-software-development.jpg",
    "SaaS & Software": "/assets/images/services/custom-software-development.jpg",
    "Hotels & Travel": "/assets/images/services/services-hero-office.jpg",
    "AI & Automation": "/assets/images/services/ai-solutions.jpg",
    "Agriculture & IoT": "/assets/images/services/robotics-iot.jpg",
    "Creative & Marketing": "/assets/images/services/ui-ux-design.jpg",
    "Logistics": "/assets/images/services/automation.jpg",
    "Finance & Accounting": "/assets/images/services/cloud-solutions.jpg",
    "Events": "/assets/images/services/digital-marketing.jpg",
    "Beauty & Lifestyle": "/images/demo-projects/novacart/cat-home.jpg",
    "Local Businesses": "/assets/images/services/web-development.jpg",
    "Professional Services": "/images/demo-projects/corporatepro/operations-case-study.jpg",
    "Nonprofit": "/assets/images/services/services-hero-office.jpg",
  };

  return categoryImages[project.category] || "/assets/images/services/web-development.jpg";
}

/**
 * Returns a guaranteed slug for any project.
 */
export function getDemoProjectSlug(project: DemoProject): string {
  return project.slug || project.id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/**
 * Retrieves a demo project by its unique slug or ID.
 */
export function getDemoProjectBySlug(slug: string): DemoProject | undefined {
  const normalized = slug.toLowerCase().trim();
  return DEMO_PROJECTS.find(
    (p) =>
      (p.slug && p.slug.toLowerCase() === normalized) ||
      p.id.toLowerCase() === normalized
  );
}

/**
 * Retrieves all live interactive demos.
 */
export function getLiveDemoProjects(): DemoProject[] {
  return DEMO_PROJECTS.filter((p) => p.status === "Live Demo");
}

/**
 * Retrieves all featured showcase demos.
 */
export function getFeaturedDemoProjects(): DemoProject[] {
  return DEMO_PROJECTS.filter((p) => p.isFeatured && p.status === "Live Demo");
}
