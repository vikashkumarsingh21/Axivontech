import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";

export async function validateActiveUser(userId: string | null) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      requiredDailyMinutes: true,
      department: true,
      designation: true,
      organizationId: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (user.status === "INACTIVE") {
    throw new ApiError(
      403,
      "ACCOUNT_INACTIVE: Your account is currently inactive. Please contact your administrator."
    );
  }

  return user;
}

export async function hasPermission(userId: string, requiredPermission: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
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

  if (!user || user.status === "INACTIVE") {
    return false;
  }

  for (const ur of user.userRoles) {
    for (const rp of ur.role.rolePermissions) {
      if (rp.permission.name === requiredPermission) {
        return true;
      }
    }
  }

  return false;
}

export async function requirePermission(userId: string | null, requiredPermission: string) {
  const user = await validateActiveUser(userId);

  const allowed = await hasPermission(user.id, requiredPermission);
  if (!allowed) {
    throw new ApiError(403, `Forbidden: Requires ${requiredPermission} permission`);
  }

  return user;
}
