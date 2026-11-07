import { normalizeRole } from "@/lib/auth/roles";

export const WRITE_ROLES = [
  "ADMIN",
  "FOUNDER",
  "CO_FOUNDER",
  "MANAGER",
  "DEPARTMENT_MANAGER",
] as const;

export const ARCHIVE_ROLES = [
  "ADMIN",
  "FOUNDER",
  "CO_FOUNDER",
] as const;

/**
 * Checks whether the given role has write access to the Project Library
 * (create, edit, update, upload media/documents, full export).
 */
export function hasProjectLibraryWriteAccess(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = normalizeRole(role);
  return (
    normalized === "ADMIN" ||
    normalized === "FOUNDER" ||
    normalized === "CO_FOUNDER" ||
    normalized === "DEPARTMENT_MANAGER" ||
    normalized === "MANAGER"
  );
}

/**
 * Checks whether the given role has archive/restore permissions
 * (Admin, Founder, Co-Founder).
 */
export function hasProjectLibraryArchiveAccess(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = normalizeRole(role);
  return (
    normalized === "ADMIN" ||
    normalized === "FOUNDER" ||
    normalized === "CO_FOUNDER"
  );
}

/**
 * Checks whether the role can view full internal audit history and internal notes.
 */
export function canViewAuditHistory(role: string | null | undefined): boolean {
  return hasProjectLibraryWriteAccess(role);
}

/**
 * Checks whether the role can access the full project data structure.
 */
export function canAccessFullProjectDetails(role: string | null | undefined): boolean {
  return hasProjectLibraryWriteAccess(role);
}

/**
 * Checks whether the role can launch Client Presentation mode.
 * Accessible to Write users and business development partners when authorized.
 */
export function canUsePresentationMode(role: string | null | undefined): boolean {
  return hasProjectLibraryWriteAccess(role);
}

/**
 * Sanitizes a project library item strictly based on the caller's server-verified role.
 * Read-only users (Broker, Employee, Client, standard User) receive ONLY:
 * 1. Project Name
 * 2. Project Field / Industry
 * 3. Project Live URL
 * 4. Project Completion Date
 * (Plus id and slug for navigation and identification)
 *
 * Full project details, technical architecture, internal notes, team details,
 * and confidential assets are strictly stripped server-side.
 */
export function sanitizeProjectRecord(
  project: any,
  role: string | null | undefined
): any {
  if (!project) return null;

  if (hasProjectLibraryWriteAccess(role)) {
    // Write users receive complete project data
    return project;
  }

  // Restricted Read-Only Users receive strictly the 4 mandated fields:
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    industry: project.industry,
    liveUrl: project.liveUrl,
    completionDate: project.completionDate,
    status: project.status, // Required for status badge
  };
}

/**
 * Strips potential formula injection prefixes (=, +, -, @) from spreadsheet cells.
 */
export function sanitizeForExcel(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/^[=\+\-@]/.test(str)) {
    return `'${str}`;
  }
  return str;
}
