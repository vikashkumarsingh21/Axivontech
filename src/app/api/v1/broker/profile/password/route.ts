import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  requireBroker,
  apiSuccess,
  checkRateLimit,
  logBrokerAudit,
} from "@/lib/api/broker";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long")
    .regex(/[A-Za-z]/, "New password must contain at least one letter")
    .regex(/[0-9]/, "New password must contain at least one number"),
});

export async function POST(req: NextRequest) {
  try {
    const { user, brokerId } = await requireBroker(req);

    // Rate limit: Max 5 password change attempts per 15 minutes
    checkRateLimit(`broker_pwd_change:${brokerId}`, 5, 900);

    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    // Verify current password
    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(400, "The current password you entered is incorrect.", undefined, "INVALID_CURRENT_PASSWORD");
    }

    if (currentPassword === newPassword) {
      throw new ApiError(400, "New password must be different from your current password.", undefined, "PASSWORD_UNCHANGED");
    }

    const newHash = await hashPassword(newPassword);

    await db.user.update({
      where: { id: brokerId },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    await logBrokerAudit({
      userId: brokerId,
      action: "BROKER_PASSWORD_CHANGED",
      resource: `User:${brokerId}`,
      details: {
        method: "PORTAL_PASSWORD_CHANGE",
      },
    });

    return apiSuccess({ message: "Password updated successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
