import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { getExecutiveScope } from "@/lib/auth/executive-scope";
import { hashPassword } from "@/lib/auth/password";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  preventCrossExecutiveCredentialModification,
  isExecutiveRole,
} from "@/lib/auth/executive-account-guard";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm the password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(
  req: Request,
  props: { params: Promise<{ [key: string]: string }> }
) {
  const params = await props.params;
  try {
    const actorId = req.headers.get("x-user-id");
    await requirePermission(actorId, "people.view");
    const scope = await getExecutiveScope(actorId);

    // Both Founder & Co-Founder hold executive oversight
    if (!scope.isFounder && !scope.isExecutive) {
      throw new ApiError(403, "Forbidden: Only Founders can reset user passwords");
    }

    const { id } = await params;
    const body = await req.json();
    const { newPassword } = resetPasswordSchema.parse(body);

    const targetUser = await db.user.findUnique({
      where: { id },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    // Prevent executive from resetting own password through this endpoint
    // (Executives must use the self-service password change flow in Account Settings)
    if (actorId === id) {
      throw new ApiError(400, "Use the self-service password change in Account Settings to update your own password");
    }

    // STRICT EXECUTIVE CREDENTIAL ISOLATION:
    // Neither executive can reset the other executive's password!
    await preventCrossExecutiveCredentialModification(
      actorId,
      id,
      "reset the password for",
      db
    );

    const isTargetExecutive = targetUser.userRoles.some((ur) =>
      isExecutiveRole(ur.role.name)
    );
    if (isTargetExecutive) {
      throw new ApiError(
        403,
        "Forbidden: Executive credentials cannot be reset via administrative override. Each executive must manage their own credentials securely via Account Settings."
      );
    }

    const newHash = await hashPassword(newPassword);

    // Update password and invalidate ALL target user sessions
    await db.$transaction([
      db.user.update({
        where: { id },
        data: { passwordHash: newHash, mustChangePassword: true },
      }),
      db.session.deleteMany({ where: { userId: id } }),
    ]);

    // Audit log — NEVER log passwords or hashes
    await db.auditLog.create({
      data: {
        userId: actorId,
        action: "USER_PASSWORD_RESET",
        resource: "User",
        details: {
          targetUserId: id,
          targetUserEmail: targetUser.email,
          resetByRole: scope.role,
        },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Password reset for ${targetUser.name}. User has been signed out and must log in with the new password.`,
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
