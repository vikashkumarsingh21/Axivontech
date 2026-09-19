import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { handleApiError, ApiError } from "@/lib/api-error";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const body = await req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    // Fetch current password hash
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!dbUser) {
      throw new ApiError(404, "User not found");
    }

    // Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!isCurrentValid) {
      throw new ApiError(401, "Current password is incorrect");
    }

    // Prevent reuse of the same password
    const isSamePassword = await verifyPassword(newPassword, dbUser.passwordHash);
    if (isSamePassword) {
      throw new ApiError(400, "New password must be different from your current password");
    }

    // Hash the new password
    const newHash = await hashPassword(newPassword);

    // Get the current session token to preserve it
    const currentSessionToken = req.cookies.get("axivon_session")?.value;

    // Update password and invalidate all OTHER sessions in a transaction
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      }),
      // Invalidate all sessions except the current one
      db.session.deleteMany({
        where: {
          userId: user.id,
          ...(currentSessionToken ? { token: { not: currentSessionToken } } : {}),
        },
      }),
    ]);

    // Create audit log — NEVER log passwords
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_PASSWORD_CHANGED",
        resource: "User",
        details: { selfService: true },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully. All other sessions have been signed out.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
