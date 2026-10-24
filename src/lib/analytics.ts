/**
 * Centralized Web Analytics & Conversion Event Engine
 *
 * Requirements:
 * - Production-ready GA4 & event tracking
 * - Strict PII sanitization (NEVER send emails, phones, passwords, full names, or private messages)
 * - Support for client-side SPA route transitions without duplicate events
 * - Safe server/client execution guards
 */

// Declare global gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

import { getStoredConsent } from "@/lib/legal/cookie-consent";

/** Blocklist of sensitive field names that must never be sent to analytics */
const PII_EXACT_OR_SUFFIX = [
  "email",
  "phone",
  "mobile",
  "telephone",
  "password",
  "fullname",
  "full_name",
  "firstname",
  "first_name",
  "lastname",
  "last_name",
  "name",
  "applicantname",
  "applicant_name",
  "clientname",
  "client_name",
  "useremail",
  "user_email",
  "applicantphone",
  "applicant_phone",
  "address",
  "resume",
  "resumeurl",
  "resume_url",
  "token",
  "secret",
  "apikey",
  "api_key",
];

const SAFE_NAME_KEYS = [
  "servicename",
  "service_name",
  "pagename",
  "page_name",
  "eventname",
  "event_name",
  "brandname",
  "brand_name",
  "filename",
  "file_name",
  "tagname",
  "tag_name",
  "appname",
  "app_name",
  "companyname",
  "company_name",
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]*)?(?:\(?\d{2,5}\)?[-.\s]*)?\d{3,5}[-.\s]*\d{4,5}/;

/**
 * Sanitizes an event parameter dictionary, stripping any field that matches PII patterns
 * and redacting any email or phone number embedded inside freeform string values.
 */
export function sanitizeAnalyticsParams(params?: Record<string, any>): Record<string, any> {
  if (!params) return {};
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9_]/g, "");
    const normalizedNoUnderscore = lowerKey.replace(/_/g, "");

    const isSafe = SAFE_NAME_KEYS.some(
      (safe) => lowerKey === safe || normalizedNoUnderscore === safe.replace(/_/g, "")
    );

    const isPiiKey =
      !isSafe &&
      PII_EXACT_OR_SUFFIX.some((pii) => {
        const piiClean = pii.replace(/_/g, "");
        return (
          normalizedNoUnderscore === piiClean ||
          normalizedNoUnderscore.endsWith(piiClean) ||
          normalizedNoUnderscore.startsWith(piiClean)
        );
      });

    if (!isPiiKey) {
      if (typeof value === "string") {
        if (EMAIL_REGEX.test(value)) {
          cleaned[key] = "[REDACTED_EMAIL]";
        } else if (PHONE_REGEX.test(value)) {
          cleaned[key] = "[REDACTED_PHONE]";
        } else {
          cleaned[key] = value;
        }
      } else if (typeof value === "number" || typeof value === "boolean") {
        cleaned[key] = value;
      }
    }
  }

  return cleaned;
}

/**
 * Checks whether analytics is enabled and user has granted explicit cookie consent.
 */
export function isAnalyticsAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.gtag !== "function") return false;
  try {
    const consent = getStoredConsent();
    return Boolean(consent?.analytics);
  } catch {
    return false;
  }
}

/**
 * Core event dispatcher — strictly does nothing unless analytics is enabled AND cookie consent is given.
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  if (!isAnalyticsAllowed()) return;

  const sanitized = sanitizeAnalyticsParams(params);
  window.gtag!("event", eventName, sanitized);
}

/**
 * Track page view on client-side route transitions
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: url,
      page_title: title || (typeof document !== "undefined" ? document.title : ""),
    });
  } else if (process.env.NODE_ENV === "development") {
    console.debug(`[Analytics PageView] ${url}`);
  }
}

/**
 * Meaningful Conversion Events
 */

/**
 * Fires ONLY after server confirms successful creation of a client lead.
 */
export function trackLeadSubmission(params: {
  leadCode?: string;
  service?: string;
  serviceInterest?: string;
  timeline?: string;
  budget?: string;
  sourcePage?: string;
  [key: string]: any;
}) {
  trackEvent("generate_lead", {
    lead_code: params.leadCode || "unknown",
    service_type: params.service || params.serviceInterest || "unspecified",
    timeline: params.timeline || "unspecified",
    budget_range: params.budget || "unspecified",
    source_page: params.sourcePage || "unknown",
    ...params,
  });
}

/**
 * Fires ONLY after server confirms successful submission of a business partner application.
 */
export function trackPartnerApplication(params: {
  applicationCode?: string;
  businessType?: string;
  partnershipType?: string;
  experienceLevel?: string;
  [key: string]: any;
}) {
  trackEvent("partner_application", {
    application_code: params.applicationCode || "unknown",
    business_type: params.businessType || params.partnershipType || "unspecified",
    experience_level: params.experienceLevel || "unspecified",
    ...params,
  });
}

/**
 * Fires when user views an interactive demo showcase.
 */
export function trackDemoView(
  demoSlugOrParams: string | { demoSlug: string; category?: string; isLive?: boolean },
  category?: string
) {
  if (typeof demoSlugOrParams === "string") {
    trackEvent("select_content", {
      content_type: "demo_project",
      item_id: demoSlugOrParams,
      category: category || "General",
    });
  } else {
    trackEvent("select_content", {
      content_type: "demo_project",
      item_id: demoSlugOrParams.demoSlug,
      category: demoSlugOrParams.category || category || "General",
    });
  }
}

/**
 * Fires when user filters demo portfolio by category.
 */
export function trackDemoFilter(category: string) {
  trackEvent("filter_demo_portfolio", {
    category,
  });
}

/**
 * Fires when user clicks WhatsApp direct consultation button.
 */
export function trackWhatsAppClick(sourcePage: string) {
  trackEvent("contact_whatsapp", {
    channel: "whatsapp",
    source_location: sourcePage,
  });
}

/**
 * Fires when user clicks a primary Service CTA button.
 */
export function trackServiceCtaClick(serviceSlug: string, ctaLocation: string) {
  trackEvent("service_cta_click", {
    service_slug: serviceSlug,
    cta_location: ctaLocation,
  });
}

/**
 * Fires when user clicks a primary conversion CTA button (e.g. Get Quote, Book Consultation).
 */
export function trackCtaClick(ctaLabel: string, ctaLocation: string = "header") {
  trackEvent("cta_click", {
    cta_label: ctaLabel,
    cta_location: ctaLocation,
  });
}
