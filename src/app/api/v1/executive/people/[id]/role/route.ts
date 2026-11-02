import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { getExecutiveScope } from "@/lib/auth/executive-scope";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  enforceExecutiveAccountLimits,
  isExecutiveRole,
} from "@/lib/auth/executive-account-guard";

const VALID_ROLES = ["EMPLOYEE", "ADMIN", "CO_FOUNDER"] as const;

const changeRoleSchema = z.object({
  roleName: z.enum(VALID_ROLES),
});

export async function PATCH(
  req: Request,
  props: { params: Promise<{ [key: string]: string }> }
) {
  const params = await props.params;
  try {
    const actorId = req.headers.get("x-user-id");
    await requirePermission(actorId, "people.view");
    const scope = await getExecutiveScope(actorId);

    // Both Founder & Co-Founder possess executive authority to manage personnel roles
    if (!scope.isFounder && !scope.isExecutive) {
      throw new ApiError(403, "Forbidden: Only Founders can change user roles");
    }

    const { id } = await params;
    const body = await req.json();
    const { roleName } = changeRoleSchema.parse(body);

    // Prevent self-demotion
    if (actorId === id) {
      throw new ApiError(400, "You cannot change your own role");
    }

    const targetUser = await db.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    // Protect designated executive accounts from demotion or role tampering
    const isTargetExecutive = targetUser.userRoles.some((ur) =>
      isExecutiveRole(ur.role.name)
    );
    if (isTargetExecutive) {
      throw new ApiError(403, "Forbidden: Cannot change a Founder's role");
    }

    // Check if the target already has this role
    const currentRole = targetUser.userRoles.length > 0 ? targetUser.userRoles[0].role.name : null;
    if (currentRole === roleName) {
      throw new ApiError(400, `User already has the ${roleName} role`);
    }

    // Strictly enforce account limits: exactly 1 Founder and exactly 1 Co-Founder
    if (roleName === "CO_FOUNDER" || (roleName as string) === "FOUNDER") {
      await enforceExecutiveAccountLimits(roleName, id, db);
    }

    // Get or create the target role record
    let targetRole = await db.role.findUnique({ where: { name: roleName } });
    if (!targetRole) {
      targetRole = await db.role.create({
        data: { name: roleName, description: `${roleName} role` },
      });
    }

    // Replace all existing roles with the new one in a transaction
    await db.$transaction([
      db.userRole.deleteMany({ where: { userId: id } }),
      db.userRole.create({
        data: { userId: id, roleId: targetRole.id },
      }),
      // Invalidate sessions so old role JWT is no longer valid
      db.session.deleteMany({ where: { userId: id } }),
    ]);

    // Audit log
    await db.auditLog.create({
      data: {
        userId: actorId,
        action: "USER_ROLE_CHANGED",
        resource: "User",
        details: {
          targetUserId: id,
          targetUserEmail: targetUser.email,
          oldRole: currentRole,
          newRole: roleName,
          executedByExecutiveRole: scope.role,
        },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Role changed to ${roleName} for ${targetUser.name}. User has been signed out and must re-authenticate.`,
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          message: error.message,
          code: error.code || "API_ERROR",
        },
        { status: error.statusCode }
      );
    }
    return handleApiError(error);
  }
}
