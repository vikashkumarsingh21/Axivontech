import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { JobRunner } from "@/lib/jobs/runner";
import { hashPassword, generateStrongPassword, validatePasswordStrength } from "@/lib/auth/password";
import { isOutboundEmailConfigured } from "@/lib/email/service";
import { z } from "zod";
import crypto from "crypto";

const actionSchema = z.object({
  action: z.enum(["resend_activation", "suspend", "deactivate", "reactivate", "reset_password"]),
  reason: z.string().max(1000).optional(),
  mode: z.enum(["DIRECT_PASSWORD", "ACTIVATION_LINK"]).optional(),
  newPassword: z.string().optional(),
  password: z.string().optional(),
  mustChangePassword: z.boolean().optional(),
  requirePasswordChange: z.boolean().optional(),
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
    const parsed = actionSchema.parse(body);
    const action = parsed.action;
    const reason = parsed.reason;
    const mode = parsed.mode || "DIRECT_PASSWORD";
    const rawNewPassword = parsed.newPassword?.trim() || parsed.password?.trim();
    const mustChangePassword = parsed.mustChangePassword ?? parsed.requirePasswordChange ?? true;

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
      throw new ApiError(404, "Broker account not found.");
    }

    const brokerProfile = brokerUser.brokerProfile;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in";

    const emailConfigured = isOutboundEmailConfigured();

    if (action === "resend_activation") {
      const activationToken = crypto.randomUUID();
      await db.user.update({
        where: { id: brokerUser.id },
        data: {
          activationToken,
          status: "PENDING_ACTIVATION",
          mustChangePassword: true,
        },
      });

      const activationLink = `${appUrl}/broker-partner/activate?token=${activationToken}`;

      if (emailConfigured) {
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
      }

      await db.auditLog.create({
        data: {
          userId: adminId,
          action: "BROKER_ACTIVATION_RESENT",
          resource: `User:${brokerUser.id}`,
          details: { partnerId: brokerProfile.partnerId, email: brokerUser.email, ip },
        },
      });

      return NextResponse.json({
        success: true,
        message: emailConfigured
          ? `Activation link generated and email sent to ${brokerUser.email}`
          : "Activation link generated. Outbound email is not configured, please copy the link manually.",
        activationLink,
        emailConfigured,
      });
    }

    if (action === "suspend" || action === "deactivate") {
      const newStatus = action === "suspend" ? "SUSPENDED" : "INACTIVE";
      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: brokerUser.id },
          data: {
            status: newStatus,
            inactiveAt: new Date(),
          },
        });

        // Invalidate active sessions
        await tx.session.deleteMany({
          where: { userId: brokerUser.id },
        });

        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: `BROKER_${action.toUpperCase()}`,
            resource: `User:${brokerUser.id}`,
            details: { reason, partnerId: brokerProfile.partnerId, status: newStatus, ip },
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Broker account has been ${action === "suspend" ? "suspended" : "deactivated"}.`,
      });
    }

    if (action === "reactivate") {
      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: brokerUser.id },
          data: {
            status: "ACTIVE",
            inactiveAt: null,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: "BROKER_REACTIVATED",
            resource: `User:${brokerUser.id}`,
            details: { partnerId: brokerProfile.partnerId, ip },
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: "Broker account has been successfully reactivated.",
      });
    }

    if (action === "reset_password") {
      if (mode === "ACTIVATION_LINK") {
        const activationToken = crypto.randomUUID();
        const placeholderHash = await hashPassword(crypto.randomUUID());

        await db.user.update({
          where: { id: brokerUser.id },
          data: {
            activationToken,
            passwordHash: placeholderHash,
            mustChangePassword: true,
          },
        });

        const activationLink = `${appUrl}/broker-partner/activate?token=${activationToken}`;

        if (emailConfigured) {
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
        }

        await db.auditLog.create({
          data: {
            userId: adminId,
            action: "BROKER_PASSWORD_RESET_VIA_LINK",
            resource: `User:${brokerUser.id}`,
            details: { partnerId: brokerProfile.partnerId, ip },
          },
        });

        return NextResponse.json(
          {
            success: true,
            message: emailConfigured
              ? `Password reset link sent to ${brokerUser.email}`
              : "Password reset link generated. Outbound email is not configured, please copy the link manually.",
            activationLink,
            emailConfigured,
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          }
        );
      }

      // Direct password mode
      const rawPassword = rawNewPassword || generateStrongPassword(14);
      const validation = validatePasswordStrength(rawPassword);
      if (!validation.isValid) {
        throw new ApiError(400, `Password does not meet rules: ${validation.errors.join(" ")}`);
      }

      const hashedPassword = await hashPassword(rawPassword);

      await db.user.update({
        where: { id: brokerUser.id },
        data: {
          passwordHash: hashedPassword,
          mustChangePassword,
          status: "ACTIVE",
        },
      });

      await db.auditLog.create({
        data: {
          userId: adminId,
          action: "BROKER_PASSWORD_RESET_DIRECT",
          resource: `User:${brokerUser.id}`,
          details: { partnerId: brokerProfile.partnerId, mustChangePassword, ip },
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Password reset successfully. Credentials ready for distribution.",
          emailConfigured,
          data: {
            loginUrl: `${appUrl}/login`,
            email: brokerUser.email,
            password: rawPassword,
            mustChangePassword,
            partnerId: brokerProfile.partnerId,
            referralCode: brokerProfile.referralCode,
          },
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    throw new ApiError(400, "Unsupported action.");
  } catch (error: any) {
    return handleApiError(error);
  }
}
