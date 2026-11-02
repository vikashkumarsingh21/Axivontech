/**
 * Executive Account Guard & Account-Count Enforcement Service
 * Axivon Technologies — Executive Governance System
 *
 * CRITICAL BUSINESS REQUIREMENT:
 * The organization operates on an equal 50-50 business partnership between
 * exactly ONE designated Founder identity and exactly ONE designated Co-Founder identity.
 *
 * This service strictly enforces:
 * 1. Exactly one Founder account in the entire system.
 * 2. Exactly one Co-Founder account in the entire system.
 * 3. Prevention of duplicate executive account creation through any portal, API, or role assignment.
 * 4. Protection against demotion or deletion of designated executive accounts.
 * 5. Complete credential and account isolation: neither executive can modify the other's credentials.
 */

import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";
import { PrismaClient, Prisma } from "@prisma/client";

export const EXECUTIVE_ROLES = {
  FOUNDER: "FOUNDER",
  CO_FOUNDER: "CO_FOUNDER",
} as const;

export type ExecutiveRole = (typeof EXECUTIVE_ROLES)[keyof typeof EXECUTIVE_ROLES];

/**
 * Checks whether a given role is one of the designated executive roles.
 */
export function isExecutiveRole(role: string | null | undefined): boolean {
  if (!role) return false;
  const upper = role.trim().toUpperCase();
  return upper === EXECUTIVE_ROLES.FOUNDER || upper === EXECUTIVE_ROLES.CO_FOUNDER;
}

/**
 * Enforces the strict maximum count (exactly 1) for Founder and Co-Founder accounts.
 *
 * Throws ApiError(409) if:
 * - An attempt is made to create or assign a second FOUNDER account.
 * - An attempt is made to create or assign a second CO_FOUNDER account.
 *
 * Can be safely called within a Prisma transaction client (`tx`) to prevent race conditions.
 */
export async function enforceExecutiveAccountLimits(
  targetRoleName: string,
  targetUserId?: string | null,
  client: PrismaClient | Prisma.TransactionClient = db
): Promise<void> {
  const normalizedRole = targetRoleName.trim().toUpperCase();

  if (normalizedRole === EXECUTIVE_ROLES.FOUNDER) {
    // Check if another active user already possesses the FOUNDER role
    const existingFounder = await client.user.findFirst({
      where: {
        id: targetUserId ? { not: targetUserId } : undefined,
        status: { not: "DELETED" },
        userRoles: {
          some: {
            role: { name: EXECUTIVE_ROLES.FOUNDER },
          },
        },
      },
      select: { id: true, email: true, name: true },
    });

    if (existingFounder) {
      throw new ApiError(
        409,
        "Executive Account Restriction: The organization permits exactly ONE designated Founder account. Creating or assigning an additional Founder account is strictly prohibited."
      );
    }
  }

  if (normalizedRole === EXECUTIVE_ROLES.CO_FOUNDER) {
    // Check if another active user already possesses the CO_FOUNDER role
    const existingCoFounder = await client.user.findFirst({
      where: {
        id: targetUserId ? { not: targetUserId } : undefined,
        status: { not: "DELETED" },
        userRoles: {
          some: {
            role: { name: EXECUTIVE_ROLES.CO_FOUNDER },
          },
        },
      },
      select: { id: true, email: true, name: true },
    });

    if (existingCoFounder) {
      throw new ApiError(
        409,
        "Executive Account Restriction: The organization permits exactly ONE designated Co-Founder account. Creating or assigning an additional Co-Founder account is strictly prohibited."
      );
    }
  }
}

/**
 * Prevents demotion, removal, or role changes of designated executive accounts.
 *
 * Throws ApiError(403) if the target user holds FOUNDER or CO_FOUNDER role.
 */
export async function preventExecutiveDemotion(
  targetUserId: string,
  client: PrismaClient | Prisma.TransactionClient = db
): Promise<void> {
  const targetUser = await client.user.findUnique({
    where: { id: targetUserId },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!targetUser) return;

  const holdsExecutiveRole = targetUser.userRoles.some((ur) =>
    isExecutiveRole(ur.role.name)
  );

  if (holdsExecutiveRole) {
    throw new ApiError(
      403,
      "Executive Account Protection: The designated Founder and Co-Founder accounts cannot be demoted or have their executive status altered through standard role assignment."
    );
  }
}

/**
 * Enforces credential and identity isolation between executives.
 *
 * Neither executive may reset, alter, or tamper with the credentials of the other.
 * Each executive must manage their own account credentials through their self-service portal.
 *
 * Throws ApiError(403) if an actor attempts to modify an executive account other than their own.
 */
export async function preventCrossExecutiveCredentialModification(
  actorId: string | null | undefined,
  targetUserId: string,
  actionDescription = "modify credentials for",
  client: PrismaClient | Prisma.TransactionClient = db
): Promise<void> {
  if (!actorId) {
    throw new ApiError(401, "Authentication required");
  }

  // Self-service is allowed on permitted endpoints
  if (actorId === targetUserId) {
    return;
  }

  const targetUser = await client.user.findUnique({
    where: { id: targetUserId },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!targetUser) return;

  const isTargetExecutive = targetUser.userRoles.some((ur) =>
    isExecutiveRole(ur.role.name)
  );

  if (isTargetExecutive) {
    throw new ApiError(
      403,
      `Executive Credential Isolation: Cross-executive administrative modification is prohibited. Executive credentials cannot be reset or modified via administrative override. Neither executive may ${actionDescription} the other executive's account. Each executive must manage their own credentials securely.`
    );
  }
}

/**
 * Returns current counts and details of designated executive accounts.
 */
export async function getExecutiveAccountSummary(
  client: PrismaClient | Prisma.TransactionClient = db
) {
  const [founders, coFounders] = await Promise.all([
    client.user.findMany({
      where: {
        status: { not: "DELETED" },
        userRoles: { some: { role: { name: EXECUTIVE_ROLES.FOUNDER } } },
      },
      select: { id: true, name: true, email: true, status: true, createdAt: true },
    }),
    client.user.findMany({
      where: {
        status: { not: "DELETED" },
        userRoles: { some: { role: { name: EXECUTIVE_ROLES.CO_FOUNDER } } },
      },
      select: { id: true, name: true, email: true, status: true, createdAt: true },
    }),
  ]);

  return {
    founderCount: founders.length,
    coFounderCount: coFounders.length,
    founders,
    coFounders,
    isValidPair: founders.length === 1 && coFounders.length === 1,
  };
}
