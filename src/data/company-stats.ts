/**
 * Centralized Single Source of Truth for Axivon Technologies Verified Statistics
 *
 * Requirements:
 * - Consistent metrics across all public and authenticated pages
 * - Accurate, verifiable data without inflated or fabricated vanity metrics
 * - Prevents zero-value count-up display bugs during SSR and initial viewport load
 */

export interface CompanyStat {
  id: string;
  value: string;
  numericValue: number;
  suffix?: string;
  prefix?: string;
  label: string;
  description: string;
}

export const COMPANY_STATS = {
  projectsDelivered: {
    id: "projects",
    value: "10+",
    numericValue: 10,
    suffix: "+",
    label: "Projects Delivered",
    description: "Successfully engineered websites, mobile applications, and custom systems",
  },
  coreServices: {
    id: "services",
    value: "8",
    numericValue: 8,
    suffix: "",
    label: "Core Services",
    description: "Specialized engineering domains across web, mobile, AI, and cloud",
  },
  support: {
    id: "support",
    value: "24/7",
    numericValue: 24,
    suffix: "/7",
    label: "Support",
    description: "Dedicated round-the-clock technical monitoring and response",
  },
  codeQuality: {
    id: "quality",
    value: "100%",
    numericValue: 100,
    suffix: "%",
    label: "Code Quality",
    description: "Rigorous type-safety, automated testing, and scalable architecture",
  },
} as const;

export const HOMEPAGE_STATS: readonly CompanyStat[] = [
  COMPANY_STATS.projectsDelivered,
  COMPANY_STATS.coreServices,
  COMPANY_STATS.support,
  COMPANY_STATS.codeQuality,
];
