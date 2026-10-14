// src/data/leadpilot-data.ts
// LeadPilot CRM & Sales Management Dashboard — Central Sample Data Model

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost";
export type LeadPriority = "Low" | "Medium" | "High";
export type DealStage = "Discovery" | "Qualification" | "Proposal" | "Negotiation" | "Won" | "Lost";
export type TaskStatus = "To Do" | "In Progress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";
export type ActivityType = "Call" | "Meeting" | "Note" | "Follow-up" | "Status Change" | "Task Update";

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyId: string;
  companyName: string;
  jobTitle: string;
  source: "Website Form" | "Inbound Referral" | "LinkedIn" | "Outbound Campaign" | "Industry Event" | "Demo Request";
  interestedService: string;
  status: LeadStatus;
  priority: LeadPriority;
  assignedOwner: string;
  estimatedValue: number;
  createdAt: string; // ISO date YYYY-MM-DD
  lastContactedAt: string;
  nextFollowUpAt: string;
  notes: string;
}

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyId: string;
  companyName: string;
  jobTitle: string;
  assignedOwner: string;
  relatedLeadId?: string;
  notes: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: "B2B SaaS" | "E-commerce" | "Healthcare Tech" | "Financial Services" | "Logistics" | "Consulting & Agency" | "Renewable Energy" | "Manufacturing";
  website: string;
  companySize: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  location: string; // Illustrative demo city/country
  assignedOwner: string;
  notes: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  primaryContactId: string;
  primaryContactName: string;
  relatedLeadId?: string;
  estimatedValue: number;
  stage: DealStage;
  probability: number; // 0 - 100
  expectedCloseDate: string; // YYYY-MM-DD
  assignedOwner: string;
  notes: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  relatedLeadId?: string;
  relatedLeadName?: string;
  relatedCompanyId?: string;
  relatedCompanyName?: string;
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  assignedOwner: string;
  completedAt?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  relatedLeadId?: string;
  relatedLeadName?: string;
  relatedCompanyId?: string;
  relatedCompanyName?: string;
  performedBy: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "task" | "lead" | "deal" | "info";
  timestamp: string;
  read: boolean;
  link?: string;
}

// ─────────────────────────────────────────────────────────────
// Sample Team Owners
// ─────────────────────────────────────────────────────────────
export const TEAM_MEMBERS = [
  "Alex Rivera (Account Exec)",
  "Priya Sharma (Sales Director)",
  "Marcus Vance (SDR Lead)",
  "Elena Rostova (Solutions Architect)",
  "David Kim (Enterprise Exec)",
];

// ─────────────────────────────────────────────────────────────
// Initial Realistic Sample Dataset (Fictional CRM demonstration)
// ─────────────────────────────────────────────────────────────

export const INITIAL_COMPANIES: Company[] = [
  {
    id: "comp-1",
    name: "Nexus Flow Systems",
    industry: "B2B SaaS",
    website: "https://example-nexusflow.com",
    companySize: "51-200",
    location: "Austin, TX (Demo Data)",
    assignedOwner: "Alex Rivera (Account Exec)",
    notes: "Evaluating automated pipeline workflow sync across 4 branches.",
    createdAt: "2026-08-12",
  },
  {
    id: "comp-2",
    name: "Aura Logistics Group",
    industry: "Logistics",
    website: "https://example-auralogistics.com",
    companySize: "201-500",
    location: "Hamburg, Germany (Demo Data)",
    assignedOwner: "Priya Sharma (Sales Director)",
    notes: "Fleet telemetry management and carrier scheduling integration.",
    createdAt: "2026-08-18",
  },
  {
    id: "comp-3",
    name: "Vanguard Health Analytics",
    industry: "Healthcare Tech",
    website: "https://example-vanguardhealth.io",
    companySize: "51-200",
    location: "Toronto, Canada (Demo Data)",
    assignedOwner: "David Kim (Enterprise Exec)",
    notes: "Clinical trial patient enrollment tracking portal upgrade.",
    createdAt: "2026-08-25",
  },
  {
    id: "comp-4",
    name: "Apex Retail Solutions",
    industry: "E-commerce",
    website: "https://example-apexretail.com",
    companySize: "11-50",
    location: "Manchester, UK (Demo Data)",
    assignedOwner: "Marcus Vance (SDR Lead)",
    notes: "Omnichannel inventory sync and checkout analytics revamp.",
    createdAt: "2026-09-02",
  },
  {
    id: "comp-5",
    name: "Crestview Capital Advisory",
    industry: "Financial Services",
    website: "https://example-crestviewcap.com",
    companySize: "51-200",
    location: "Zurich, Switzerland (Demo Data)",
    assignedOwner: "Priya Sharma (Sales Director)",
    notes: "Private equity portfolio company deal flow tracking platform.",
    createdAt: "2026-09-10",
  },
  {
    id: "comp-6",
    name: "Luminary Media Studio",
    industry: "Consulting & Agency",
    website: "https://example-luminarymedia.agency",
    companySize: "11-50",
    location: "Sydney, Australia (Demo Data)",
    assignedOwner: "Alex Rivera (Account Exec)",
    notes: "Multi-client retainer performance dashboards and contract alerts.",
    createdAt: "2026-09-14",
  },
  {
    id: "comp-7",
    name: "Solaria Clean Energy",
    industry: "Renewable Energy",
    website: "https://example-solariaenergy.org",
    companySize: "201-500",
    location: "Denver, CO (Demo Data)",
    assignedOwner: "David Kim (Enterprise Exec)",
    notes: "Commercial rooftop solar installation quoting and proposal CRM.",
    createdAt: "2026-09-20",
  },
  {
    id: "comp-8",
    name: "Precision Precision Fab",
    industry: "Manufacturing",
    website: "https://example-precisionfab.com",
    companySize: "500+",
    location: "Detroit, MI (Demo Data)",
    assignedOwner: "Elena Rostova (Solutions Architect)",
    notes: "CNC tooling parts procurement and customer quote approvals.",
    createdAt: "2026-09-28",
  },
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: "cnt-1",
    fullName: "Rachel Sterling",
    email: "rachel.sterling@example-nexusflow.com",
    phone: "+1 (512) 555-0192",
    companyId: "comp-1",
    companyName: "Nexus Flow Systems",
    jobTitle: "VP of Commercial Growth",
    assignedOwner: "Alex Rivera (Account Exec)",
    notes: "Key decision maker for sales operations tech budget.",
    createdAt: "2026-08-14",
  },
  {
    id: "cnt-2",
    fullName: "Hendrik Van Der Meer",
    email: "h.vandermeer@example-auralogistics.com",
    phone: "+49 40 555 4910",
    companyId: "comp-2",
    companyName: "Aura Logistics Group",
    jobTitle: "Director of Digital Systems",
    assignedOwner: "Priya Sharma (Sales Director)",
    notes: "Focused on API stability and dispatch operations team buy-in.",
    createdAt: "2026-08-20",
  },
  {
    id: "cnt-3",
    fullName: "Dr. Alistair Chen",
    email: "alistair.chen@example-vanguardhealth.io",
    phone: "+1 (416) 555-7822",
    companyId: "comp-3",
    companyName: "Vanguard Health Analytics",
    jobTitle: "Chief Technology Officer",
    assignedOwner: "David Kim (Enterprise Exec)",
    notes: "Strict data privacy requirements; requested SOC2 compliance info.",
    createdAt: "2026-08-27",
  },
  {
    id: "cnt-4",
    fullName: "Sophie Gallagher",
    email: "sophie.g@example-apexretail.com",
    phone: "+44 161 555 9201",
    companyId: "comp-4",
    companyName: "Apex Retail Solutions",
    jobTitle: "Head of Omnichannel Commerce",
    assignedOwner: "Marcus Vance (SDR Lead)",
    notes: "Rebuilding direct-to-consumer store with headless backend.",
    createdAt: "2026-09-04",
  },
  {
    id: "cnt-5",
    fullName: "Beatrix Zimmerman",
    email: "b.zimmerman@example-crestviewcap.com",
    phone: "+41 44 555 3302",
    companyId: "comp-5",
    companyName: "Crestview Capital Advisory",
    jobTitle: "Managing Director, Operations",
    assignedOwner: "Priya Sharma (Sales Director)",
    notes: "Wants executive dashboard for partners meeting next month.",
    createdAt: "2026-09-12",
  },
  {
    id: "cnt-6",
    fullName: "Liam Macintyre",
    email: "liam@example-luminarymedia.agency",
    phone: "+61 2 5555 0891",
    companyId: "comp-6",
    companyName: "Luminary Media Studio",
    jobTitle: "Founder & Creative Director",
    assignedOwner: "Alex Rivera (Account Exec)",
    notes: "Needs automated recurring client invoicing milestones.",
    createdAt: "2026-09-16",
  },
  {
    id: "cnt-7",
    fullName: "Camila Navarro",
    email: "c.navarro@example-solariaenergy.org",
    phone: "+1 (303) 555-6619",
    companyId: "comp-7",
    companyName: "Solaria Clean Energy",
    jobTitle: "VP Enterprise Business Development",
    assignedOwner: "David Kim (Enterprise Exec)",
    notes: "Expanding regional sales rep headcount from 12 to 35.",
    createdAt: "2026-09-22",
  },
  {
    id: "cnt-8",
    fullName: "Kurt Hendershot",
    email: "khendershot@example-precisionfab.com",
    phone: "+1 (313) 555-8840",
    companyId: "comp-8",
    companyName: "Precision Precision Fab",
    jobTitle: "VP Supply Chain Logistics",
    assignedOwner: "Elena Rostova (Solutions Architect)",
    notes: "Looking for CAD drawing upload directly into deal scope.",
    createdAt: "2026-09-30",
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: "lead-101",
    fullName: "Rachel Sterling",
    email: "rachel.sterling@example-nexusflow.com",
    phone: "+1 (512) 555-0192",
    companyId: "comp-1",
    companyName: "Nexus Flow Systems",
    jobTitle: "VP of Commercial Growth",
    source: "Demo Request",
    interestedService: "Enterprise Custom CRM & Workflow Automation",
    status: "Proposal",
    priority: "High",
    assignedOwner: "Alex Rivera (Account Exec)",
    estimatedValue: 42000,
    createdAt: "2026-09-02",
    lastContactedAt: "2026-10-09",
    nextFollowUpAt: "2026-10-16",
    notes: "Security checklist reviewed. Sent formal proposal document for 60 seats.",
  },
  {
    id: "lead-102",
    fullName: "Hendrik Van Der Meer",
    email: "h.vandermeer@example-auralogistics.com",
    phone: "+49 40 555 4910",
    companyId: "comp-2",
    companyName: "Aura Logistics Group",
    jobTitle: "Director of Digital Systems",
    source: "Website Form",
    interestedService: "Real-Time Dispatch Pipeline & IoT Sync",
    status: "Qualified",
    priority: "High",
    assignedOwner: "Priya Sharma (Sales Director)",
    estimatedValue: 68000,
    createdAt: "2026-09-10",
    lastContactedAt: "2026-10-11",
    nextFollowUpAt: "2026-10-17",
    notes: "Discovery workshop completed. Architecture team validated API latency specs.",
  },
  {
    id: "lead-103",
    fullName: "Dr. Alistair Chen",
    email: "alistair.chen@example-vanguardhealth.io",
    phone: "+1 (416) 555-7822",
    companyId: "comp-3",
    companyName: "Vanguard Health Analytics",
    jobTitle: "Chief Technology Officer",
    source: "Inbound Referral",
    interestedService: "HIPAA Compliant Patient Intake & Analytics",
    status: "Won",
    priority: "High",
    assignedOwner: "David Kim (Enterprise Exec)",
    estimatedValue: 95000,
    createdAt: "2026-08-28",
    lastContactedAt: "2026-10-08",
    nextFollowUpAt: "2026-10-24",
    notes: "Master Services Agreement executed! Kickoff scheduled for next sprint.",
  },
  {
    id: "lead-104",
    fullName: "Sophie Gallagher",
    email: "sophie.g@example-apexretail.com",
    phone: "+44 161 555 9201",
    companyId: "comp-4",
    companyName: "Apex Retail Solutions",
    jobTitle: "Head of Omnichannel Commerce",
    source: "LinkedIn",
    interestedService: "B2B E-commerce Portal & Sales Rep App",
    status: "Contacted",
    priority: "Medium",
    assignedOwner: "Marcus Vance (SDR Lead)",
    estimatedValue: 24000,
    createdAt: "2026-09-18",
    lastContactedAt: "2026-10-10",
    nextFollowUpAt: "2026-10-15",
    notes: "Had 20-min initial qualification call. Shared case studies and pricing deck.",
  },
  {
    id: "lead-105",
    fullName: "Beatrix Zimmerman",
    email: "b.zimmerman@example-crestviewcap.com",
    phone: "+41 44 555 3302",
    companyId: "comp-5",
    companyName: "Crestview Capital Advisory",
    jobTitle: "Managing Director, Operations",
    source: "Industry Event",
    interestedService: "Portfolio Deal Flow Intelligence CRM",
    status: "Proposal",
    priority: "High",
    assignedOwner: "Priya Sharma (Sales Director)",
    estimatedValue: 84000,
    createdAt: "2026-09-15",
    lastContactedAt: "2026-10-12",
    nextFollowUpAt: "2026-10-18",
    notes: "Final legal review of terms. Projected decision before month end.",
  },
  {
    id: "lead-106",
    fullName: "Liam Macintyre",
    email: "liam@example-luminarymedia.agency",
    phone: "+61 2 5555 0891",
    companyId: "comp-6",
    companyName: "Luminary Media Studio",
    jobTitle: "Founder & Creative Director",
    source: "Website Form",
    interestedService: "Agency Client Portal & Retainer Billing",
    status: "New",
    priority: "Medium",
    assignedOwner: "Alex Rivera (Account Exec)",
    estimatedValue: 18500,
    createdAt: "2026-10-12",
    lastContactedAt: "2026-10-12",
    nextFollowUpAt: "2026-10-14",
    notes: "Inbound inquiry submitted via pricing calculator. Looking to deploy in Q4.",
  },
  {
    id: "lead-107",
    fullName: "Camila Navarro",
    email: "c.navarro@example-solariaenergy.org",
    phone: "+1 (303) 555-6619",
    companyId: "comp-7",
    companyName: "Solaria Clean Energy",
    jobTitle: "VP Enterprise Business Development",
    source: "Outbound Campaign",
    interestedService: "Commercial Field Sales Mobility Suite",
    status: "Qualified",
    priority: "High",
    assignedOwner: "David Kim (Enterprise Exec)",
    estimatedValue: 56000,
    createdAt: "2026-09-24",
    lastContactedAt: "2026-10-07",
    nextFollowUpAt: "2026-10-16",
    notes: "Field reps require offline lead capture and instant quote PDF generation.",
  },
  {
    id: "lead-108",
    fullName: "Kurt Hendershot",
    email: "khendershot@example-precisionfab.com",
    phone: "+1 (313) 555-8840",
    companyId: "comp-8",
    companyName: "Precision Precision Fab",
    jobTitle: "VP Supply Chain Logistics",
    source: "Inbound Referral",
    interestedService: "Supplier Portal & ERP Order Synchronization",
    status: "Contacted",
    priority: "Medium",
    assignedOwner: "Elena Rostova (Solutions Architect)",
    estimatedValue: 72000,
    createdAt: "2026-10-01",
    lastContactedAt: "2026-10-09",
    nextFollowUpAt: "2026-10-19",
    notes: "Scheduling technical architecture deep-dive with factory IT director.",
  },
  {
    id: "lead-109",
    fullName: "Nathaniel Drake",
    email: "n.drake@example-novapulse.co",
    phone: "+1 (415) 555-0211",
    companyId: "comp-1",
    companyName: "NovaPulse Technologies",
    jobTitle: "Head of Customer Acquisition",
    source: "Demo Request",
    interestedService: "Inbound Lead Routing & SLA Escalations",
    status: "New",
    priority: "Low",
    assignedOwner: "Marcus Vance (SDR Lead)",
    estimatedValue: 15000,
    createdAt: "2026-10-13",
    lastContactedAt: "2026-10-13",
    nextFollowUpAt: "2026-10-15",
    notes: "Submitted interactive demo request form yesterday evening.",
  },
  {
    id: "lead-110",
    fullName: "Tanya Belova",
    email: "tbelova@example-kestrelfin.com",
    phone: "+44 20 7946 0992",
    companyId: "comp-5",
    companyName: "Kestrel Wealth Advisors",
    jobTitle: "Compliance & Tech Partner",
    source: "Website Form",
    interestedService: "Client Onboarding & Identity Verification CRM",
    status: "Lost",
    priority: "Low",
    assignedOwner: "Priya Sharma (Sales Director)",
    estimatedValue: 32000,
    createdAt: "2026-08-15",
    lastContactedAt: "2026-09-22",
    nextFollowUpAt: "2026-12-01",
    notes: "Postponed project till next fiscal year due to internal compliance audit.",
  },
  {
    id: "lead-111",
    fullName: "Julian Thorne",
    email: "j.thorne@example-solarsphere.de",
    phone: "+49 30 555 1209",
    companyId: "comp-7",
    companyName: "SolarSphere Clean Tech",
    jobTitle: "Chief Operating Officer",
    source: "Industry Event",
    interestedService: "Renewable Project Pipeline Management",
    status: "New",
    priority: "Medium",
    assignedOwner: "Alex Rivera (Account Exec)",
    estimatedValue: 38000,
    createdAt: "2026-10-11",
    lastContactedAt: "2026-10-11",
    nextFollowUpAt: "2026-10-16",
    notes: "Met at Berlin GreenTech Summit. Impressed with deal stage analytics demo.",
  },
  {
    id: "lead-112",
    fullName: "Chloe Montalvo",
    email: "cmontalvo@example-veloxlogistics.es",
    phone: "+34 91 555 4018",
    companyId: "comp-2",
    companyName: "Velox Freight Hub",
    jobTitle: "Regional Logistics Manager",
    source: "Website Form",
    interestedService: "Multilingual Carrier CRM & SLA Dispatch",
    status: "Contacted",
    priority: "High",
    assignedOwner: "Priya Sharma (Sales Director)",
    estimatedValue: 51000,
    createdAt: "2026-10-04",
    lastContactedAt: "2026-10-11",
    nextFollowUpAt: "2026-10-17",
    notes: "Reviewing pilot proposal for Iberian peninsula dispatch network.",
  },
];

export const INITIAL_DEALS: Deal[] = [
  {
    id: "deal-201",
    name: "Nexus Flow — 60 Seat Enterprise Rollout",
    companyId: "comp-1",
    companyName: "Nexus Flow Systems",
    primaryContactId: "cnt-1",
    primaryContactName: "Rachel Sterling",
    relatedLeadId: "lead-101",
    estimatedValue: 42000,
    stage: "Proposal",
    probability: 75,
    expectedCloseDate: "2026-10-31",
    assignedOwner: "Alex Rivera (Account Exec)",
    notes: "Final contract redlines with legal. Procurement approval secured.",
    createdAt: "2026-09-05",
  },
  {
    id: "deal-202",
    name: "Aura Logistics — Fleet Dispatch CRM Engine",
    companyId: "comp-2",
    companyName: "Aura Logistics Group",
    primaryContactId: "cnt-2",
    primaryContactName: "Hendrik Van Der Meer",
    relatedLeadId: "lead-102",
    estimatedValue: 68000,
    stage: "Qualification",
    probability: 60,
    expectedCloseDate: "2026-11-15",
    assignedOwner: "Priya Sharma (Sales Director)",
    notes: "Technical architecture review scheduled with European IT infrastructure lead.",
    createdAt: "2026-09-12",
  },
  {
    id: "deal-203",
    name: "Vanguard Health — Clinical Portal Modernization",
    companyId: "comp-3",
    companyName: "Vanguard Health Analytics",
    primaryContactId: "cnt-3",
    primaryContactName: "Dr. Alistair Chen",
    relatedLeadId: "lead-103",
    estimatedValue: 95000,
    stage: "Won",
    probability: 100,
    expectedCloseDate: "2026-10-05",
    assignedOwner: "David Kim (Enterprise Exec)",
    notes: "Closed Won! SOW signed, first deposit invoice disbursed.",
    createdAt: "2026-08-30",
  },
  {
    id: "deal-204",
    name: "Apex Retail — B2B Merchant Ordering Portal",
    companyId: "comp-4",
    companyName: "Apex Retail Solutions",
    primaryContactId: "cnt-4",
    primaryContactName: "Sophie Gallagher",
    relatedLeadId: "lead-104",
    estimatedValue: 24000,
    stage: "Discovery",
    probability: 30,
    expectedCloseDate: "2026-11-30",
    assignedOwner: "Marcus Vance (SDR Lead)",
    notes: "Initial scope evaluation. Comparing custom portal vs Shopify Plus B2B.",
    createdAt: "2026-09-20",
  },
  {
    id: "deal-205",
    name: "Crestview Capital — Deal Flow CRM Platform",
    companyId: "comp-5",
    companyName: "Crestview Capital Advisory",
    primaryContactId: "cnt-5",
    primaryContactName: "Beatrix Zimmerman",
    relatedLeadId: "lead-105",
    estimatedValue: 84000,
    stage: "Negotiation",
    probability: 85,
    expectedCloseDate: "2026-10-28",
    assignedOwner: "Priya Sharma (Sales Director)",
    notes: "Agreed on commercial scope. Finalizing payment milestone schedule.",
    createdAt: "2026-09-18",
  },
  {
    id: "deal-206",
    name: "Solaria Clean Energy — Quoting & Territory CRM",
    companyId: "comp-7",
    companyName: "Solaria Clean Energy",
    primaryContactId: "cnt-7",
    primaryContactName: "Camila Navarro",
    relatedLeadId: "lead-107",
    estimatedValue: 56000,
    stage: "Qualification",
    probability: 50,
    expectedCloseDate: "2026-11-20",
    assignedOwner: "David Kim (Enterprise Exec)",
    notes: "Requirements workshop held with Western territory regional directors.",
    createdAt: "2026-09-26",
  },
  {
    id: "deal-207",
    name: "Precision Fab — Automated Quote Approvals",
    companyId: "comp-8",
    companyName: "Precision Precision Fab",
    primaryContactId: "cnt-8",
    primaryContactName: "Kurt Hendershot",
    relatedLeadId: "lead-108",
    estimatedValue: 72000,
    stage: "Discovery",
    probability: 25,
    expectedCloseDate: "2026-12-15",
    assignedOwner: "Elena Rostova (Solutions Architect)",
    notes: "Initial technical exchange. Request for information document received.",
    createdAt: "2026-10-02",
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-301",
    title: "Review MSA contract clauses with legal for Nexus Flow",
    description: "Confirm indemnification limit and annual subscription payment schedule with legal counsel.",
    relatedLeadId: "lead-101",
    relatedLeadName: "Rachel Sterling",
    relatedCompanyId: "comp-1",
    relatedCompanyName: "Nexus Flow Systems",
    dueDate: "2026-10-15",
    priority: "High",
    status: "To Do",
    assignedOwner: "Alex Rivera (Account Exec)",
    createdAt: "2026-10-10",
  },
  {
    id: "task-302",
    title: "Send technical architecture deck to Aura Logistics",
    description: "Provide API endpoint specification, latency guarantees, and webhook payload samples.",
    relatedLeadId: "lead-102",
    relatedLeadName: "Hendrik Van Der Meer",
    relatedCompanyId: "comp-2",
    relatedCompanyName: "Aura Logistics Group",
    dueDate: "2026-10-16",
    priority: "High",
    status: "In Progress",
    assignedOwner: "Priya Sharma (Sales Director)",
    createdAt: "2026-10-11",
  },
  {
    id: "task-303",
    title: "Finalize Crestview Capital billing milestone schedule",
    description: "Draft 30/40/30 payment milestones breakdown for Zurich finance controller.",
    relatedLeadId: "lead-105",
    relatedLeadName: "Beatrix Zimmerman",
    relatedCompanyId: "comp-5",
    relatedCompanyName: "Crestview Capital Advisory",
    dueDate: "2026-10-17",
    priority: "Medium",
    status: "To Do",
    assignedOwner: "Priya Sharma (Sales Director)",
    createdAt: "2026-10-12",
  },
  {
    id: "task-304",
    title: "Follow up with Liam Macintyre regarding discovery demo",
    description: "Confirm video call availability for Thursday 11 AM AEST for Luminary Media team.",
    relatedLeadId: "lead-106",
    relatedLeadName: "Liam Macintyre",
    relatedCompanyId: "comp-6",
    relatedCompanyName: "Luminary Media Studio",
    dueDate: "2026-10-14",
    priority: "Medium",
    status: "To Do",
    assignedOwner: "Alex Rivera (Account Exec)",
    createdAt: "2026-10-12",
  },
  {
    id: "task-305",
    title: "Execute Vanguard Health kickoff onboarding pack",
    description: "Deliver Jira access credentials, security questionnaire sign-off, and weekly standup calendar invite.",
    relatedLeadId: "lead-103",
    relatedLeadName: "Dr. Alistair Chen",
    relatedCompanyId: "comp-3",
    relatedCompanyName: "Vanguard Health Analytics",
    dueDate: "2026-10-13",
    priority: "High",
    status: "Completed",
    assignedOwner: "David Kim (Enterprise Exec)",
    completedAt: "2026-10-13",
    createdAt: "2026-10-06",
  },
  {
    id: "task-306",
    title: "Prepare tailored mobile sales rep demo for Solaria Energy",
    description: "Configure custom field schema showing solar panel kW rating and financing terms.",
    relatedLeadId: "lead-107",
    relatedLeadName: "Camila Navarro",
    relatedCompanyId: "comp-7",
    relatedCompanyName: "Solaria Clean Energy",
    dueDate: "2026-10-18",
    priority: "Medium",
    status: "In Progress",
    assignedOwner: "David Kim (Enterprise Exec)",
    createdAt: "2026-10-09",
  },
  {
    id: "task-307",
    title: "Initial qualification call with Nathaniel Drake",
    description: "Assess seat requirements, current CRM migration friction, and budget expectations.",
    relatedLeadId: "lead-109",
    relatedLeadName: "Nathaniel Drake",
    dueDate: "2026-10-15",
    priority: "Low",
    status: "To Do",
    assignedOwner: "Marcus Vance (SDR Lead)",
    createdAt: "2026-10-13",
  },
  {
    id: "task-308",
    title: "Send follow-up materials after Berlin Summit to Julian Thorne",
    description: "Share recorded pipeline forecasting webinar and European data residency compliance summary.",
    relatedLeadId: "lead-111",
    relatedLeadName: "Julian Thorne",
    dueDate: "2026-10-16",
    priority: "Medium",
    status: "To Do",
    assignedOwner: "Alex Rivera (Account Exec)",
    createdAt: "2026-10-11",
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "act-401",
    type: "Status Change",
    title: "Deal Closed Won for Vanguard Health",
    description: "Vanguard Health deal stage transitioned to Won with total estimated contract value $95,000.",
    relatedLeadId: "lead-103",
    relatedLeadName: "Dr. Alistair Chen",
    relatedCompanyId: "comp-3",
    relatedCompanyName: "Vanguard Health Analytics",
    performedBy: "David Kim (Enterprise Exec)",
    date: "2026-10-08",
    time: "16:45",
  },
  {
    id: "act-402",
    type: "Call",
    title: "Commercial negotiation call with Crestview Capital",
    description: "Discussed multi-entity reporting requirements. Beatrix confirmed board approval for $84,000 budget.",
    relatedLeadId: "lead-105",
    relatedLeadName: "Beatrix Zimmerman",
    relatedCompanyId: "comp-5",
    relatedCompanyName: "Crestview Capital Advisory",
    performedBy: "Priya Sharma (Sales Director)",
    date: "2026-10-10",
    time: "14:15",
  },
  {
    id: "act-403",
    type: "Meeting",
    title: "Architecture sync with Aura Logistics team",
    description: "Conducted 45-minute technical review with Hendrik and systems lead. Walked through API rate limits.",
    relatedLeadId: "lead-102",
    relatedLeadName: "Hendrik Van Der Meer",
    relatedCompanyId: "comp-2",
    relatedCompanyName: "Aura Logistics Group",
    performedBy: "Priya Sharma (Sales Director)",
    date: "2026-10-11",
    time: "10:30",
  },
  {
    id: "act-404",
    type: "Note",
    title: "Contract redline feedback received from Nexus Flow",
    description: "Rachel requested minor clarifications on data export SLAs. Forwarded to legal team for review.",
    relatedLeadId: "lead-101",
    relatedLeadName: "Rachel Sterling",
    relatedCompanyId: "comp-1",
    relatedCompanyName: "Nexus Flow Systems",
    performedBy: "Alex Rivera (Account Exec)",
    date: "2026-10-12",
    time: "11:20",
  },
  {
    id: "act-405",
    type: "Follow-up",
    title: "Inbound inquiry response sent to Luminary Media",
    description: "Emailed calendar booking link and shared agency portal overview video.",
    relatedLeadId: "lead-106",
    relatedLeadName: "Liam Macintyre",
    relatedCompanyId: "comp-6",
    relatedCompanyName: "Luminary Media Studio",
    performedBy: "Alex Rivera (Account Exec)",
    date: "2026-10-12",
    time: "17:05",
  },
  {
    id: "act-406",
    type: "Task Update",
    title: "Completed Vanguard Health onboarding pack",
    description: "David completed onboarding documentation delivery and scheduled sprint kickoff.",
    relatedLeadId: "lead-103",
    relatedLeadName: "Dr. Alistair Chen",
    performedBy: "David Kim (Enterprise Exec)",
    date: "2026-10-13",
    time: "09:30",
  },
  {
    id: "act-407",
    type: "Status Change",
    title: "Lead created from inbound demo form",
    description: "Nathaniel Drake submitted website demo request for NovaPulse Technologies.",
    relatedLeadId: "lead-109",
    relatedLeadName: "Nathaniel Drake",
    performedBy: "System Automation",
    date: "2026-10-13",
    time: "18:22",
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Follow-up Task Due Soon",
    message: "Contract review with legal for Nexus Flow Systems is due October 15.",
    type: "task",
    timestamp: "10 minutes ago",
    read: false,
    link: "/demo-projects/saas/leadpilot/tasks",
  },
  {
    id: "notif-2",
    title: "Deal Status Advanced",
    message: "Crestview Capital deal advanced to Negotiation ($84,000).",
    type: "deal",
    timestamp: "2 hours ago",
    read: false,
    link: "/demo-projects/saas/leadpilot/deals",
  },
  {
    id: "notif-3",
    title: "New Inbound Lead Received",
    message: "Nathaniel Drake requested an enterprise CRM product demo.",
    type: "lead",
    timestamp: "5 hours ago",
    read: false,
    link: "/demo-projects/saas/leadpilot/leads",
  },
  {
    id: "notif-4",
    title: "Deal Closed Successfully",
    message: "Vanguard Health Analytics Master Services Agreement executed ($95,000).",
    type: "deal",
    timestamp: "Yesterday",
    read: true,
    link: "/demo-projects/saas/leadpilot/deals",
  },
];
