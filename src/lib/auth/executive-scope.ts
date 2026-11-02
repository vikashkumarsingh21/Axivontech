import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";

export interface ExecutiveScope {
  userId: string;
  role: "FOUNDER" | "CO_FOUNDER" | string;
  isFounder: boolean; // Retained as true for both Founder & Co-Founder for 50-50 equality across legacy checks
  isCoFounder: boolean;
  isExecutive: boolean;
  responsibilityProfile: string; // FULL, TECHNOLOGY, OPERATIONS, BUSINESS_GROWTH
  allowedDepartments: string[] | null; // null means unrestricted (all departments)
  allowedProjects: string[] | null;    // null means unrestricted (all projects)
}

/**
 * Resolves the executive scope for an authenticated executive.
 *
 * BUSINESS RULE (Consolidated Executive Governance):
 * The Founder and Co-Founder represent equal 50-50 business partners.
 * Both accounts possess equivalent executive permissions across all modules:
 * - Unrestricted visibility across all departments and projects
 * - Equal authority to review executive reports, analytics, people, and governance approvals
 * - Distinct personal identity, session, and audit tracking
 */
export async function getExecutiveScope(userId: string | null): Promise<ExecutiveScope> {
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: { role: true },
      },
      executiveProfile: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  const roles = user.userRoles.map((ur) => ur.role.name);
  const isFounder = roles.includes("FOUNDER");
  const isCoFounder = roles.includes("CO_FOUNDER");

  if (!isFounder && !isCoFounder) {
    throw new ApiError(403, "Forbidden: Executive portal access required");
  }

  // Founder and Co-Founder have EQUAL 50-50 business authority
  // Full unrestricted access across company departments and projects
  const roleName = isFounder ? "FOUNDER" : "CO_FOUNDER";
  const userProfile = user.executiveProfile;
  const responsibilityProfile = userProfile?.responsibilityProfile || "FULL";

  return {
    userId,
    role: roleName,
    isFounder: true, // Equal executive authority: passes all existing executive capability checks
    isCoFounder,
    isExecutive: true,
    responsibilityProfile,
    allowedDepartments: null, // Unrestricted (all departments)
    allowedProjects: null,    // Unrestricted (all projects)
  };
}

/**
 * Checks if a specific department is accessible under the given executive scope.
 * For equal 50-50 partners (Founder & Co-Founder), all departments are always accessible.
 */
export function isDepartmentAllowed(scope: ExecutiveScope, department?: string | null): boolean {
  if (scope.isFounder || scope.isExecutive || !scope.allowedDepartments) {
    return true;
  }
  if (!department) return false;
  return scope.allowedDepartments.some(
    (d) => d.toLowerCase() === department.toLowerCase()
  );
}
