// src/config/contact.ts
// Axivon Technologies — Official Contact & Business Details Configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface ContactConfig {
  /** Primary contact email address */
  email: string;
  /** Primary phone number in E.164 format */
  phone: string;
  /** Formatted phone number for human display */
  phoneDisplay: string;
  /** WhatsApp direct international number */
  whatsappNumber: string;
  /** Default prefilled WhatsApp inquiry message */
  whatsappMessage: string;

  // ── Optional Registered Business Details ──────────────────────────────────
  // These fields are only rendered if explicitly set with verified values.
  // Otherwise, they render nothing to prevent inventing unverified facts.
  officeCity?: string;
  officeAddress?: string;
  businessHours?: string;
  gstNumber?: string;
  udyamNumber?: string;
}

export const CONTACT_CONFIG: ContactConfig = {
  email: "info@axivontech.in",
  phone: "+919473263768",
  phoneDisplay: "+91 9473263768",
  whatsappNumber: "919473263768",
  whatsappMessage: "Hi Axivon, I'd like to discuss a project",

  // Business address / registration fields — intentionally undefined until verified
  officeCity: undefined,
  officeAddress: undefined,
  businessHours: "Monday – Saturday: 9:30 AM – 6:30 PM IST",
  gstNumber: undefined,
  udyamNumber: undefined,
};

/**
 * Returns the fully encoded WhatsApp URL with prefilled message.
 */
export function getWhatsAppUrl(customMessage?: string): string {
  const text = customMessage || CONTACT_CONFIG.whatsappMessage;
  return `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Returns click-to-call tel: link.
 */
export function getPhoneTelLink(): string {
  return `tel:${CONTACT_CONFIG.phone}`;
}

/**
 * Returns mailto: link.
 */
export function getEmailMailtoLink(): string {
  return `mailto:${CONTACT_CONFIG.email}`;
}
