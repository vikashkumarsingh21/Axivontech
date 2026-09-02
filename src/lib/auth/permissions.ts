import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";

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
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) return false;

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
  if (!userId) throw new ApiError(401, "Unauthorized");
  
  const allowed = await hasPermission(userId, requiredPermission);
  if (!allowed) {
    throw new ApiError(403, `Forbidden: Requires ${requiredPermission} permission`);
  }
}
