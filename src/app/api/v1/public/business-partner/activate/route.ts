import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { hashPassword } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/api/broker";
import crypto from "crypto";

const activateSchema = z.object({
  token: z.string().min(10, "Activation token is invalid or missing."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    checkRateLimit(`bp_activate:${ip}`, 10, 60);

    const body = await req.json().catch(() => ({}));
    const { token, password } = activateSchema.parse(body);

    const user = await db.user.findFirst({
      where: { activationToken: token, status: "PENDING_ACTIVATION" },
      include: { brokerProfile: true },
    });

    if (!user) {
      throw new ApiError(400, "Invalid or expired activation token. Please request a new activation link.", undefined, "INVALID_TOKEN");
    }

    const hashedPassword = await hashPassword(password);

    const { updatedUser, updatedProfile } = await db.$transaction(async (tx) => {
      let profile = user.brokerProfile;

      // If brokerProfile is missing, initialize it
      if (!profile) {
        const safeName = (user.name || "BRK").split(" ")[0].replace(/[^A-Za-z0-9]/g, "").substring(0, 5).toUpperCase() || "BRK";
        const referralCode = `AXP-${safeName}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
        const partnerId = `AXP-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

        profile = await tx.brokerProfile.create({
          data: {
            userId: user.id,
            referralCode,
            partnerId,
          },
        });
      } else if (!profile.referralCode) {
        // Automatically heal missing referralCode on activation so they don't get trapped in onboarding
        const safeName = (user.name || "BRK").split(" ")[0].replace(/[^A-Za-z0-9]/g, "").substring(0, 5).toUpperCase() || "BRK";
        const referralCode = `AXP-${safeName}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

        profile = await tx.brokerProfile.update({
          where: { id: profile.id },
          data: { referralCode },
        });
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

      // Send Welcome in-app notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: "SYSTEM",
          title: "Welcome to Axivon Partner Portal",
          message: `Your partner account is now fully active! Your referral code is ${profile.referralCode}.`,
          link: "/broker/dashboard",
        },
      });

      return { updatedUser: u, updatedProfile: profile };
    });

    // Create audit log
    try {
      await db.auditLog.create({
        data: {
          userId: updatedUser.id,
          action: "PARTNER_ACCOUNT_ACTIVATED",
          resource: `User:${updatedUser.id}`,
          details: {
            partnerId: updatedProfile.partnerId,
            referralCode: updatedProfile.referralCode,
          },
        },
      });
    } catch {
      // ignore non-critical audit log errors
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account activated successfully. You can now log in.",
        data: {
          partnerId: updatedProfile.partnerId,
          referralCode: updatedProfile.referralCode,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
