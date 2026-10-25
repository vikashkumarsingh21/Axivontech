import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { JobRunner } from "@/lib/jobs/runner";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";
import crypto from "crypto";

const actionSchema = z.object({
  action: z.enum(["resend_activation", "suspend", "reactivate", "reset_password"]),
  reason: z.string().max(1000).optional(),
  newPassword: z.string().min(8).optional(),
});

export async function POST(
  req: Request,
  props: { params: Promise<{ [key: string]: string }> }
) {
  const params = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:write");

    const identifier = params.id;
    const body = await req.json().catch(() => ({}));
    const { action, reason, newPassword } = actionSchema.parse(body);

    const brokerUser = await db.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { brokerProfile: { id: identifier } },
          { brokerProfile: { partnerId: identifier } },
        ],
        userRoles: { some: { role: { name: { in: ["BUSINESS_PARTNER", "BROKER"] } } } },
      },
      include: { brokerProfile: true },
    });

    if (!brokerUser || !brokerUser.brokerProfile) {
      throw new ApiError(404, "Broker not found.");
    }

    const brokerProfile = brokerUser.brokerProfile;

    if (action === "resend_activation") {
      const activationToken = crypto.randomUUID();
      const updatedUser = await db.user.update({
        where: { id: brokerUser.id },
        data: {
          activationToken,
          status: "PENDING_ACTIVATION",
          mustChangePassword: true,
        },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const activationLink = `${appUrl}/business-partner/activate?token=${activationToken}`;

      await JobRunner.enqueue("SEND_EMAIL", {
        to: brokerUser.email,
        templateKey: "PARTNER_ACCOUNT_ACTIVATION",
        variables: {
          name: brokerUser.name,
          partnerId: brokerProfile.partnerId || "",
          referralCode: brokerProfile.referralCode || "",
          activationLink,
        },
      });

      await db.auditLog.create({
        data: {
          userId: adminId,
          action: "BROKER_ACTIVATION_RESENT",
          resource: `User:${brokerUser.id}`,
          details: { partnerId: brokerProfile.partnerId, email: brokerUser.email },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Activation link generated and email sent to ${brokerUser.email}`,
        activationLink,
      });
    }

    if (action === "suspend") {
      await db.user.update({
        where: { id: brokerUser.id },
        data: {
          status: "INACTIVE",
          inactiveAt: new Date(),
        },
      });

      // Send in-app notification if needed
      await db.notification.create({
        data: {
          userId: brokerUser.id,
          type: "SYSTEM",
          title: "Account Suspended",
          message: reason || "Your business partner account has been temporarily suspended by administration.",
          link: "/broker/support",
        },
      }).catch(() => null);

      await db.auditLog.create({
        data: {
          userId: adminId,
          action: "BROKER_SUSPENDED",
          resource: `User:${brokerUser.id}`,
          details: { reason, partnerId: brokerProfile.partnerId },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Broker account has been suspended.",
      });
    }

    if (action === "reactivate") {
      await db.user.update({
        where: { id: brokerUser.id },
        data: {
          status: "ACTIVE",
          inactiveAt: null,
        },
      });

      await db.notification.create({
        data: {
          userId: brokerUser.id,
          type: "SYSTEM",
          title: "Account Reactivated",
          message: "Your business partner account has been reactivated. You have full portal access.",
          link: "/broker/dashboard",
        },
      }).catch(() => null);

      await db.auditLog.create({
        data: {
          userId: adminId,
          action: "BROKER_REACTIVATED",
          resource: `User:${brokerUser.id}`,
          details: { partnerId: brokerProfile.partnerId },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Broker account has been successfully reactivated.",
      });
    }

    if (action === "reset_password") {
      const generatedPassword = newPassword || `Axivon@${crypto.randomBytes(3).toString("hex")}`;
      const hashedPassword = await hashPassword(generatedPassword);

      await db.user.update({
        where: { id: brokerUser.id },
        data: {
          passwordHash: hashedPassword,
          mustChangePassword: true,
        },
      });

      await db.auditLog.create({
        data: {
          userId: adminId,
          action: "BROKER_PASSWORD_RESET",
          resource: `User:${brokerUser.id}`,
          details: { partnerId: brokerProfile.partnerId },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Password reset successfully. The partner will be prompted to change it upon login.",
        temporaryPassword: generatedPassword,
      });
    }

    throw new ApiError(400, "Unsupported action.");
  } catch (error: any) {
    return handleApiError(error);
  }
}
