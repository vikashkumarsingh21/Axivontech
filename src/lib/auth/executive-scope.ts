import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";

export interface ExecutiveScope {
  userId: string;
  role: string;
  isFounder: boolean;
  responsibilityProfile: string; // FULL, TECHNOLOGY, OPERATIONS, BUSINESS_GROWTH
  allowedDepartments: string[] | null; // null means unrestricted (all)
  allowedProjects: string[] | null;    // null means unrestricted (all)
}

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

  // Founder has full unrestricted access
  if (isFounder || user.executiveProfile?.responsibilityProfile === "FULL") {
    return {
      userId,
      role: isFounder ? "FOUNDER" : "CO_FOUNDER",
      isFounder: true,
      responsibilityProfile: "FULL",
      allowedDepartments: null,
      allowedProjects: null,
    };
  }

  // Co-Founder with specific responsibility profile and scope
  const profile = user.executiveProfile;
  const respProfile = profile?.responsibilityProfile || "OPERATIONS";

  const allowedDepartments = profile?.departmentScope
    ? profile.departmentScope.split(",").map((d) => d.trim()).filter(Boolean)
    : null;

  const allowedProjects = profile?.projectScope
    ? profile.projectScope.split(",").map((p) => p.trim()).filter(Boolean)
    : null;

  return {
    userId,
    role: "CO_FOUNDER",
    isFounder: false,
    responsibilityProfile: respProfile,
    allowedDepartments,
    allowedProjects,
  };
}

export function isDepartmentAllowed(scope: ExecutiveScope, department?: string | null): boolean {
  if (scope.isFounder || !scope.allowedDepartments) return true;
  if (!department) return false;
  return scope.allowedDepartments.some(
    (d) => d.toLowerCase() === department.toLowerCase()
  );
}
