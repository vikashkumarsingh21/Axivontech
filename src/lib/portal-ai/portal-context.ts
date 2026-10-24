import { db } from "@/lib/db";
import { PortalContext, PortalRole } from "./types";

/**
 * Resolve authenticated user context and role for Portal AI
 */
export async function resolvePortalContext(userId: string | null): Promise<PortalContext | null> {
  if (!userId) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        department: true,
        organizationId: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status === "INACTIVE") return null;

    // Collect permissions
    const permissions: string[] = [];
    let detectedRole: PortalRole = "EMPLOYEE";

    // Determine highest privileged role
    const roleNames = user.userRoles.map((ur) => ur.role.name);
    if (roleNames.includes("FOUNDER")) detectedRole = "FOUNDER";
    else if (roleNames.includes("CO_FOUNDER")) detectedRole = "CO_FOUNDER";
    else if (roleNames.includes("ADMIN")) detectedRole = "ADMIN";
    else if (roleNames.includes("CLIENT")) detectedRole = "CLIENT";
    else if (roleNames.includes("BROKER") || roleNames.includes("BUSINESS_PARTNER") || roleNames.includes("PARTNER")) detectedRole = "BROKER";
    else detectedRole = "EMPLOYEE";

    for (const ur of user.userRoles || []) {
      for (const rp of ur.role?.rolePermissions || []) {
        if (!permissions.includes(rp.permission?.name)) {
          permissions.push(rp.permission?.name);
        }
      }
    }

    return {
      userId: user.id,
      role: detectedRole,
      name: user.name || "Authenticated User",
      email: user.email,
      organizationId: user.organizationId,
      department: user.department,
      permissions,
    };
  } catch (error) {
    console.error("[resolvePortalContext] Error resolving context:", error);
    return null;
  }
}
