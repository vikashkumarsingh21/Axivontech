import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { getExecutiveScope } from "@/lib/auth/executive-scope";
import { hashPassword } from "@/lib/auth/password";
import { handleApiError, ApiError } from "@/lib/api-error";

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actorId = req.headers.get("x-user-id");
    await requirePermission(actorId, "people.view");
    const scope = await getExecutiveScope(actorId);

    // Only Founders can reset passwords (strictest sensitive action)
    if (!scope.isFounder) {
      throw new ApiError(403, "Forbidden: Only Founders can reset user passwords");
    }

    const { id } = await params;
    const body = await req.json();
    const { newPassword } = resetPasswordSchema.parse(body);

    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    // Prevent Founder from resetting own password through this endpoint
    // (Founders should use the self-service password change flow)
    if (actorId === id) {
      throw new ApiError(400, "Use the self-service password change to update your own password");
    }

    const newHash = await hashPassword(newPassword);

    // Update password and invalidate ALL target user sessions
    await db.$transaction([
      db.user.update({
        where: { id },
        data: { passwordHash: newHash },
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
          resetBy: "FOUNDER",
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
    return handleApiError(error);
  }
}
