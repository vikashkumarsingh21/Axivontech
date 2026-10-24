/**
 * Centralized Single Source of Truth for Axivon Technologies Verified Statistics
 *
 * Requirements:
 * - Consistent metrics across all public and authenticated pages
 * - Accurate, verifiable data without inflated or fabricated vanity metrics
 * - Prevents zero-value count-up display bugs during SSR and initial viewport load
 */

import { SITE_FACTS } from "@/config/siteFacts";

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
    value: SITE_FACTS.projects.display,
    numericValue: SITE_FACTS.projects.count,
    suffix: "",
    label: SITE_FACTS.projects.label,
    description: SITE_FACTS.projects.description,
  },
  coreServices: {
    id: "services",
    value: SITE_FACTS.services.display,
    numericValue: SITE_FACTS.services.count,
    suffix: "",
    label: SITE_FACTS.services.label,
    description: SITE_FACTS.services.description,
  },
  support: {
    id: "support",
    value: SITE_FACTS.support.display,
    numericValue: 1,
    suffix: "",
    label: SITE_FACTS.support.label,
    description: SITE_FACTS.support.description,
  },
  codeQuality: {
    id: "quality",
    value: SITE_FACTS.quality.display,
    numericValue: 100,
    suffix: "%",
    label: SITE_FACTS.quality.label,
    description: SITE_FACTS.quality.description,
  },
} as const;

export const HOMEPAGE_STATS: readonly CompanyStat[] = [
  COMPANY_STATS.projectsDelivered,
  COMPANY_STATS.coreServices,
  COMPANY_STATS.support,
  COMPANY_STATS.codeQuality,
];

