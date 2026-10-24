export interface LegalPolicyItem {
  id: string;
  slug: string;
  title: string;
  category: "CORE_LEGAL" | "COMMERCIAL" | "PRIVACY_DATA" | "PROGRAM_TERMS" | "COMPLIANCE";
  summary: string;
  content: string; // Markdown or rich structured text
  version: string;
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
  effectiveDate: string;
  lastReviewedAt: string;
  reviewedBy?: string | null;
  publishedAt?: string | null;
  requiresApproval: boolean;
  missingDetails: string[];
}

export interface PolicyCategoryMeta {
  key: string;
  label: string;
  description: string;
  badgeColor: string;
}

export const LEGAL_CATEGORIES: PolicyCategoryMeta[] = [
  {
    key: "CORE_LEGAL",
    label: "Core Legal & Governance",
    description: "Fundamental terms, company identification, disclaimers, and overarching operational rules.",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    key: "PRIVACY_DATA",
    label: "Privacy & Data Protection",
    description: "DPDP Act 2023 alignment, cookie controls, data subject rights, and AI transparency disclosures.",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    key: "COMMERCIAL",
    label: "Commercial & Delivery",
    description: "Milestone-based service delivery, payment schedules, cancellation terms, and IP ownership.",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    key: "PROGRAM_TERMS",
    label: "Program Agreements",
    description: "Governing terms for Business Partners, Brokers, and Careers applicants.",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    key: "COMPLIANCE",
    label: "Security & Accessibility",
    description: "Vulnerability disclosure, infrastructure security protocols, and WCAG accessibility standards.",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
];
