import { db } from "@/lib/db";

// -----------------------------------------------------------------------
// Document access scoping logic — determines if a user can access a document
// based on visibility rules. Always enforced server-side.
// -----------------------------------------------------------------------

export type VisibilityScope = "COMPANY" | "DEPARTMENT" | "ROLE" | "PROJECT" | "PRIVATE" | "USERS";

export interface DocumentAccessContext {
  userId: string;
  userDepartment?: string | null;
  userRole?: string;
}

/**
 * Returns true if the user can access the document based on visibility rules.
 * NEVER rely on the client to supply this — always call server-side.
 */
export async function canAccessDocument(
  documentId: string,
  ctx: DocumentAccessContext
): Promise<boolean> {
  const doc = await db.document.findUnique({
    where: { id: documentId },
    include: { permissions: true },
  });

  if (!doc) return false;
  if (doc.isArchived) return false;

  const { userId, userDepartment, userRole } = ctx;

  // Owner always has access
  if (doc.uploadedById === userId) return true;

  // Explicit per-user permission
  const userPerm = doc.permissions.find((p) => p.userId === userId);
  if (userPerm) return true;

  // Role-based explicit permission
  if (userRole) {
    const rolePerm = doc.permissions.find((p) => p.role === userRole && !p.userId);
    if (rolePerm) return true;
  }

  switch (doc.visibility as VisibilityScope) {
    case "COMPANY":
      return true; // All active authenticated users

    case "DEPARTMENT":
      return !!userDepartment && doc.visibilityScope === userDepartment;

    case "ROLE":
      return !!userRole && doc.visibilityScope === userRole;

    case "PROJECT":
      if (!doc.visibilityScope) return false;
      const isMember = await db.projectMember.findFirst({
        where: { projectId: doc.visibilityScope, userId },
      });
      return !!isMember;

    case "USERS":
      // visibilityScope is a comma-separated list of user IDs
      if (!doc.visibilityScope) return false;
      return doc.visibilityScope.split(",").includes(userId);

    case "PRIVATE":
      return doc.uploadedById === userId;

    default:
      return false;
  }
}

/**
 * Allowed MIME types for document uploads — SECURITY: allowlist only.
 */
export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export function validateFileUpload(mimeType: string, sizeBytes: number): void {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`File type "${mimeType}" is not permitted. Only approved document formats are allowed.`);
  }
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size exceeds maximum limit of 20MB.`);
  }
}
