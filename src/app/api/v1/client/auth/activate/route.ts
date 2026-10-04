import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";

const passwordSetupSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

// BP-0905: Client Account First Login Password Setup
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = passwordSetupSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const { token, newPassword } = parsed.data;

    // Use transaction to ensure safe activation
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { 
          activationToken: token,
          status: "PENDING_ACTIVATION"
        },
      });

      if (!user) {
        throw new ApiError(400, "Invalid or expired activation token.");
      }

      const passwordHash = await hashPassword(newPassword);

      // Securely clear activation token and require-change flag, set active
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          mustChangePassword: false,
          activationToken: null,
          status: "ACTIVE",
        },
      });
      
      // Update CRM client profile status to ACTIVE if exists
      await tx.crmClient.updateMany({
        where: { ownerId: user.id, status: "ONBOARDING" },
        data: { status: "ACTIVE" }
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CLIENT_ACCOUNT_ACTIVATED",
          resource: "User",
          details: { clientId: user.id },
        },
      });

      // Also invalidate any existing sessions (just for security)
      await tx.session.deleteMany({
        where: { userId: user.id }
      });

      return { activated: true };
    });

    return NextResponse.json({ success: true, message: "Account activated. Please log in with your new password.", data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
