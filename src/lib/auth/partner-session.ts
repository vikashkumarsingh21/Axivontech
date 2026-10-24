import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "./session";
import { normalizeRole, isBusinessPartnerRole, canAccessPartnerPortal } from "./roles";

export interface AuthenticatedPartnerSession {
  userId: string;
  role: string;
  sessionId: string;
  brokerProfileId: string | null;
  brokerProfile: any | null;
  isPartner: boolean;
  isAdmin: boolean;
}

/**
 * Validates partner session authentication for partner portal endpoints.
 * Cryptographically verifies session JWT, normalizes legacy BROKER to canonical BUSINESS_PARTNER,
 * and fetches the associated partner profile.
 *
 * Guarantees strict tenant isolation between Partner A and Partner B.
 */
export async function getAuthenticatedPartnerSession(req: Request): Promise<AuthenticatedPartnerSession> {
  const session = await getAuthenticatedSession(req);
  const normalizedRole = normalizeRole(session.role);

  if (!canAccessPartnerPortal(normalizedRole)) {
    throw new ApiError(403, "Access denied. Partners or Administrators only.");
  }

  const isPartner = isBusinessPartnerRole(normalizedRole);
  const isAdmin = !isPartner;

  // Resolve partner profile associated with this user
  const brokerProfile = await db.brokerProfile.findUnique({
    where: { userId: session.userId },
  });

  if (isPartner && !brokerProfile) {
    throw new ApiError(404, "Partner profile not found.");
  }

  return {
    userId: session.userId,
    role: normalizedRole,
    sessionId: session.sessionId,
    brokerProfileId: brokerProfile?.id ?? null,
    brokerProfile,
    isPartner,
    isAdmin,
  };
}
