import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";

async function fetchUserAuthRecord(userId: string) {
  return db.user.findUnique({
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
}

type UserWithRoles = NonNullable<Awaited<ReturnType<typeof fetchUserAuthRecord>>>;

interface CachedUserAuth {
  user: UserWithRoles;
  roles: string[];
  permissions: Set<string>;
  isSuperAdmin: boolean;
  status: string;
  expiresAt: number;
}

const AUTH_CACHE_TTL_MS = 60_000; // 60 seconds TTL
const MAX_CACHE_SIZE = 500;
const userAuthCache = new Map<string, CachedUserAuth>();

/**
 * Invalidates the in-memory permission cache for a user (or all users).
 */
export function invalidateUserPermissionCache(userId?: string) {
  if (userId) {
    userAuthCache.delete(userId);
  } else {
    userAuthCache.clear();
  }
}

/**
 * Helper to fetch or read from warm in-memory cache
 */
async function getCachedUserAuth(userId: string): Promise<CachedUserAuth | null> {
  const now = Date.now();
  const cached = userAuthCache.get(userId);

  if (cached && cached.expiresAt > now) {
    return cached;
  }

  // Prune cache if grown too large
  if (userAuthCache.size > MAX_CACHE_SIZE) {
    for (const [key, val] of userAuthCache.entries()) {
      if (val.expiresAt <= now) {
        userAuthCache.delete(key);
      }
    }
  }

  const user = await fetchUserAuthRecord(userId);

  if (!user) {
    userAuthCache.delete(userId);
    return null;
  }

  const roles: string[] = [];
  const permissions = new Set<string>();
  let isSuperAdmin = false;

  for (const ur of user.userRoles) {
    const roleName = ur.role.name;
    roles.push(roleName);
    if (roleName === "FOUNDER" || roleName === "CO_FOUNDER" || roleName === "ADMIN") {
      isSuperAdmin = true;
    }
    if (ur.role.rolePermissions) {
      for (const rp of ur.role.rolePermissions) {
        if (rp.permission?.name) {
          permissions.add(rp.permission.name);
        }
      }
    }
  }

  const entry: CachedUserAuth = {
    user,
    roles,
    permissions,
    isSuperAdmin,
    status: user.status,
    expiresAt: now + AUTH_CACHE_TTL_MS,
  };

  userAuthCache.set(userId, entry);
  return entry;
}

export async function validateActiveUser(userId: string | null) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const authData = await getCachedUserAuth(userId);

  if (!authData || !authData.user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (authData.status === "INACTIVE") {
    throw new ApiError(
      403,
      "ACCOUNT_INACTIVE: Your account is currently inactive. Please contact your administrator."
    );
  }

  return authData.user;
}

export async function hasPermission(userId: string, requiredPermission: string): Promise<boolean> {
  const authData = await getCachedUserAuth(userId);

  if (!authData || authData.status === "INACTIVE") {
    return false;
  }

  if (authData.isSuperAdmin) {
    return true;
  }

  return authData.permissions.has(requiredPermission);
}

export async function requirePermission(userId: string | null, requiredPermission: string) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const authData = await getCachedUserAuth(userId);

  if (!authData || !authData.user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (authData.status === "INACTIVE") {
    throw new ApiError(
      403,
      "ACCOUNT_INACTIVE: Your account is currently inactive. Please contact your administrator."
    );
  }

  if (authData.isSuperAdmin || authData.permissions.has(requiredPermission)) {
    return authData.user;
  }

  throw new ApiError(403, `Forbidden: Requires ${requiredPermission} permission`);
}
