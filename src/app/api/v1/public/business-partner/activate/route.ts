import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { hashPassword } from "@/lib/auth/password";

const activateSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = activateSchema.parse(body);

    const user = await db.user.findFirst({
      where: { activationToken: token, status: "PENDING_ACTIVATION" },
    });

    if (!user) {
      throw new ApiError(400, "Invalid or expired activation token");
    }

    const hashedPassword = await hashPassword(password);

    const updatedUser = await db.$transaction(async (tx) => {
      // Find broker profile to get partner details
      const profile = await tx.brokerProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile) {
        throw new ApiError(500, "Partner profile not found for this user");
      }

      const u = await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          mustChangePassword: false,
          activationToken: null,
          status: "ACTIVE",
        },
      });

      return { user: u, profile };
    });

    // Create audit log
    try {
      await db.auditLog.create({
        data: {
          userId: updatedUser.user.id,
          action: "PARTNER_ACCOUNT_ACTIVATED",
          resource: `User:${updatedUser.user.id}`,
          details: {
            partnerId: updatedUser.profile.partnerId,
          },
        },
      });
    } catch {
      // ignore audit log failure
    }

    return NextResponse.json(
      {
        message: "Account activated successfully",
        partnerId: updatedUser.profile.partnerId,
        referralCode: updatedUser.profile.referralCode,
      },
      { status: 200 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
