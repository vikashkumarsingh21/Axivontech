// src/config/siteFacts.ts
// Axivon Technologies — Single Source of Truth for Site Facts & Metrics
// ─────────────────────────────────────────────────────────────────────────────

import { portfolioProjects } from "@/data/portfolio";
import { servicesData } from "@/data/services";
// import { DEFAULT_INDUSTRIES } from "@/lib/content/content-db";

/**
 * Centrally verified facts and metrics.
 * Computed directly from real data arrays to prevent contradictory claims.
 */

// TODO: Founder to confirm whether additional delivered projects (not currently in portfolio)
// should be counted once written up as case studies, or if count should strictly reflect listed portfolio (4).
export const PROJECTS_COUNT = portfolioProjects.length; // 4
export const PROJECTS_LABEL = "Projects Listed";
export const PROJECTS_DISPLAY = `${PROJECTS_COUNT}`;

export const SERVICES_COUNT = servicesData.length; // 10
export const SERVICES_LABEL = "Core Services";
export const SERVICES_DISPLAY = `${SERVICES_COUNT}`;

// TODO: Founder to confirm whether industry count display should follow the 8 primary CMS domain
// categories or the 12 specific sub-verticals defined in the showcase.
// export const INDUSTRIES_COUNT = DEFAULT_INDUSTRIES.length; // 8
export const INDUSTRIES_COUNT = 8;
export const INDUSTRIES_LABEL = "Industry Domains";
export const INDUSTRIES_DISPLAY = `${INDUSTRIES_COUNT}`;

export const SUPPORT_LABEL = "Founder Access";
export const SUPPORT_DISPLAY = "Direct";
export const SUPPORT_DESCRIPTION = "Support during business hours with fast WhatsApp response";

export const CODE_QUALITY_LABEL = "Type-Safe Focus";
export const CODE_QUALITY_DISPLAY = "100%";
export const CODE_QUALITY_DESCRIPTION = "Rigorous type-safety, automated testing, and scalable architecture";

export const SITE_FACTS = {
  projects: {
    count: PROJECTS_COUNT,
    label: PROJECTS_LABEL,
    display: PROJECTS_DISPLAY,
    description: "Successfully engineered websites, mobile applications, and custom systems",
  },
  services: {
    count: SERVICES_COUNT,
    label: SERVICES_LABEL,
    display: SERVICES_DISPLAY,
    description: "Specialized engineering domains across web, mobile, AI, and cloud",
  },
  industries: {
    count: INDUSTRIES_COUNT,
    label: INDUSTRIES_LABEL,
    display: INDUSTRIES_DISPLAY,
    description: "Tailored digital solutions across key commercial and institutional sectors",
  },
  support: {
    display: SUPPORT_DISPLAY,
    label: SUPPORT_LABEL,
    description: SUPPORT_DESCRIPTION,
  },
  quality: {
    display: CODE_QUALITY_DISPLAY,
    label: CODE_QUALITY_LABEL,
    description: CODE_QUALITY_DESCRIPTION,
  },
} as const;
