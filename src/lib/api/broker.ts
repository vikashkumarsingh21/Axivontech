import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";
import { getAuthenticatedSession, SessionPayload } from "@/lib/auth/session";
import { normalizeRole, canAccessPartnerPortal } from "@/lib/auth/roles";
import type { BrokerProfile, User } from "@prisma/client";
import {
  apiSuccess,
  apiError,
  parseBody,
  getPagination,
  checkIdempotency,
  checkRateLimit,
} from "./foundation";

export interface BrokerAuthContext {
  session: SessionPayload;
  user: User;
  brokerProfile: BrokerProfile;
  brokerId: string;
  profileId: string;
  role: string;
}

/**
 * Enforces authenticated broker / business partner session.
 * Rejects with 401/403/404 with clear, standardized error messages.
 */
export async function requireBroker(req: Request | NextRequest): Promise<BrokerAuthContext> {
  const session = await getAuthenticatedSession(req);
  const role = normalizeRole(session.role);

  if (!canAccessPartnerPortal(role)) {
    throw new ApiError(
      403,
      "Access denied: Business Partner / Broker credentials required.",
      { currentRole: role },
      "FORBIDDEN_NOT_BROKER"
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      brokerProfile: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "User account not found.", undefined, "USER_NOT_FOUND");
  }

  if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
    throw new ApiError(
      403,
      "Your partner account is currently inactive or suspended. Please contact AXIVON administration.",
      { status: user.status },
      "ACCOUNT_INACTIVE"
    );
  }

  if (!user.brokerProfile) {
    throw new ApiError(
      404,
      "Broker profile record not found. Please contact administration.",
      undefined,
      "BROKER_PROFILE_NOT_FOUND"
    );
  }

  return {
    session,
    user,
    brokerProfile: user.brokerProfile,
    brokerId: user.id,
    profileId: user.brokerProfile.id,
    role,
  };
}

/**
 * Helper to get pagination params with a hard maximum limit of 50
 */
export function getBrokerPagination(req: Request | NextRequest, defaultLimit = 15) {
  return getPagination(req, defaultLimit, 50);
}

/**
 * Central helper to create AuditLog entries safely for broker operations
 */
export async function logBrokerAudit(params: {
  userId: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        details: params.details as any,
      },
    });
  } catch (err) {
    console.error(`[AuditLog] Failed to record broker action '${params.action}':`, err);
  }
}

/**
 * Central helper to notify platform administrators & founders
 */
export async function notifyAdmins(params: {
  title: string;
  message: string;
  link: string;
  type?: "SYSTEM" | "ACTIVITY" | "ALERT";
}) {
  try {
    const adminUsers = await db.userRole.findMany({
      where: { role: { name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] } } },
      select: { userId: true },
    });
    const recipientIds = [...new Set(adminUsers.map((u) => u.userId))];

    if (recipientIds.length > 0) {
      await db.notification.createMany({
        data: recipientIds.map((userId) => ({
          userId,
          type: (params.type || "SYSTEM") as any,
          title: params.title,
          message: params.message,
          link: params.link,
        })),
      });
    }
  } catch (err) {
    console.error("[notifyAdmins] Failed to dispatch admin notifications:", err);
  }
}

/**
 * Central helper to notify a specific broker
 */
export async function notifyBroker(params: {
  userId: string;
  title: string;
  message: string;
  link: string;
  type?: "SYSTEM" | "ACTIVITY" | "ALERT";
}) {
  try {
    await db.notification.create({
      data: {
        userId: params.userId,
        type: (params.type || "SYSTEM") as any,
        title: params.title,
        message: params.message,
        link: params.link,
      },
    });
  } catch (err) {
    console.error(`[notifyBroker] Failed to notify broker '${params.userId}':`, err);
  }
}

export {
  apiSuccess,
  apiError,
  parseBody,
  getPagination,
  checkIdempotency,
  checkRateLimit,
};
