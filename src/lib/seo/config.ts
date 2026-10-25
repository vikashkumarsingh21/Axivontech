// src/lib/seo/config.ts
// Axivon Technologies — Single Source of Truth for Site & SEO Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://axivontech.in";

export const SITE_NAME = "Axivon Technologies";
export const SHORT_NAME = "Axivon";

export const DEFAULT_TITLE = "Axivon Technologies | AI & Software Engineering";
export const DEFAULT_DESCRIPTION =
  "Axivon Technologies engineers custom software, web platforms, mobile apps, and AI solutions for startups and growing businesses in the USA and India.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/logo/logo-full.png`;
export const DEFAULT_OG_IMAGE_SQUARE = `${SITE_URL}/assets/logo/logo-icon.png`;

export const FOUNDED_YEAR = "2026";

export const CONTACT_INFO = {
  email: "info@axivontech.in",
  phone: "+91 9473263768",
  phoneTel: "+919473263768",
  headquarters: "Remote-first technology company serving clients in the USA and India",
  areaServed: ["US", "IN"] as const,
  languages: ["English", "Hindi"] as const,
};

// Confirmed official social profiles only. Do NOT add unverified profiles.
export const SOCIAL_PROFILES = {
  linkedin: "https://www.linkedin.com/company/axivon-technology/",
  instagram: "https://www.instagram.com/axivontechnology/",
} as const;

export const siteConfig = {
  name: SITE_NAME,
  shortName: SHORT_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  defaultTitle: DEFAULT_TITLE,
  ogImage: DEFAULT_OG_IMAGE,
  ogImageSquare: DEFAULT_OG_IMAGE_SQUARE,
  contact: CONTACT_INFO,
  social: SOCIAL_PROFILES,
  foundedYear: FOUNDED_YEAR,
} as const;

export type SiteConfig = typeof siteConfig;
