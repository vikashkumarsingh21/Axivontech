/**
 * Centralized Role Definitions & Normalization System
 * Axivon Technologies / Axivon ONE
 *
 * BUSINESS REQUIREMENT:
 * In Axivon Technologies, "Business Partner" and "Broker" represent the EXACT SAME business role.
 * They must not be treated as two independent roles with separate permissions,
 * dashboards, account ownership, or business logic.
 *
 * Canonical Role: BUSINESS_PARTNER
 * Legacy Compatibility Alias: BROKER
 */

export const ROLES = {
  FOUNDER: "FOUNDER",
  CO_FOUNDER: "CO_FOUNDER",
  ADMIN: "ADMIN",
  EXECUTIVE: "EXECUTIVE",
  HR: "HR",
  FINANCE: "FINANCE",
  LEAD_DEVELOPER: "LEAD_DEVELOPER",
  EMPLOYEE: "EMPLOYEE",
  CLIENT: "CLIENT",
  BUSINESS_PARTNER: "BUSINESS_PARTNER",
  // Legacy compatibility alias (always normalized to BUSINESS_PARTNER at boundaries)
  BROKER: "BROKER",
  USER: "USER",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES] | string;

/**
 * Priority hierarchy for resolving primary session role when a user has multiple role assignments.
 * Canonical BUSINESS_PARTNER takes precedence over legacy aliases.
 */
export const ROLE_HIERARCHY: readonly string[] = [
  "FOUNDER",
  "CO_FOUNDER",
  "ADMIN",
  "EXECUTIVE",
  "BUSINESS_PARTNER",
  "BROKER", // legacy alias
  "CLIENT",
  "HR",
  "FINANCE",
  "LEAD_DEVELOPER",
  "EMPLOYEE",
  "USER",
] as const;

/**
 * Numeric priority map used for ordering roles by administrative weight.
 */
export const ROLE_PRIORITY: Record<string, number> = {
  FOUNDER: 100,
  CO_FOUNDER: 95,
  ADMIN: 90,
  EXECUTIVE: 85,
  HR: 80,
  FINANCE: 70,
  LEAD_DEVELOPER: 60,
  EMPLOYEE: 50,
  CLIENT: 45,
  BUSINESS_PARTNER: 40,
  BROKER: 40, // equal weight to canonical partner
  USER: 10,
};

/**
 * Normalizes any role string to its canonical representation.
 * If "BROKER" or "PARTNER" is passed, it is normalized to "BUSINESS_PARTNER".
 */
export function normalizeRole(role: string | null | undefined): string {
  if (!role) return "USER";
  const trimmed = role.trim().toUpperCase();
  if (trimmed === "BROKER" || trimmed === "PARTNER") {
    return "BUSINESS_PARTNER";
  }
  return trimmed;
}

/**
 * Checks whether a given role is a Business Partner (canonical or legacy alias).
 */
export function isBusinessPartnerRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return normalizeRole(role) === "BUSINESS_PARTNER";
}

/**
 * Checks whether a user possesses the Business Partner role or higher administrative privilege.
 * Administrators, Founders, and Co-Founders have authorized access to partner systems.
 */
export function canAccessPartnerPortal(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = normalizeRole(role);
  return (
    normalized === "BUSINESS_PARTNER" ||
    normalized === "ADMIN" ||
    normalized === "FOUNDER" ||
    normalized === "CO_FOUNDER"
  );
}

/**
 * Canonical route resolver for user dashboards based on normalized primary role.
 * Single source of truth for login redirection, middleware navigation, and access fallback.
 */
export function resolveRoleDashboardUrl(userRole: string | null | undefined): string {
  const normalized = normalizeRole(userRole);
  if (normalized === "FOUNDER" || normalized === "CO_FOUNDER") {
    return "/executive/dashboard";
  }
  if (normalized === "ADMIN") {
    return "/admin/dashboard";
  }
  if (normalized === "BUSINESS_PARTNER") {
    return "/broker/dashboard";
  }
  if (normalized === "CLIENT") {
    return "/client/dashboard";
  }
  return "/employee/dashboard";
}
