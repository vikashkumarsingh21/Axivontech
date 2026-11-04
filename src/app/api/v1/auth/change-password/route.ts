import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getAuthenticatedSession, signSession } from "@/lib/auth/session";
import { verifyPassword, hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { resolveRoleDashboardUrl } from "@/lib/auth/roles";
import crypto from "crypto";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(10, "New password must be at least 10 characters"),
  confirmPassword: z.string().min(1, "Password confirmation is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const userId = session.userId;

    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword, confirmPassword } = changePasswordSchema.parse(body);

    if (newPassword !== confirmPassword) {
      throw new ApiError(400, "New password and confirmation do not match.");
    }

    if (currentPassword === newPassword) {
      throw new ApiError(400, "New password cannot be the same as your temporary password.");
    }

    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      throw new ApiError(400, `New password does not meet security rules: ${validation.errors.join(" ")}`);
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new ApiError(401, "Current password is incorrect.");
    }

    const newHashed = await hashPassword(newPassword);

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHashed,
          mustChangePassword: false,
          updatedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "user.password_change_completed",
          resource: `User:${user.id}`,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          userAgent: req.headers.get("user-agent"),
        },
      });
    });

    // Dispatch Security Notification via Centralized Email Service
    try {
      const { sendTransactionalEmail } = await import("@/lib/email/service");
      await sendTransactionalEmail({
        to: user.email,
        templateKey: "PASSWORD_CHANGED",
        eventKey: `password_changed:${user.id}:${Date.now()}`,
        variables: {
          name: user.name,
        },
        metadata: {
          userId: user.id,
          type: "SECURITY_PASSWORD_CHANGED",
        },
      });
    } catch (emailErr) {
      console.warn("[PasswordChange] Failed to dispatch security alert email:", emailErr);
    }

    // Re-sign session with mustChangePassword = false
    const newSessionToken = await signSession({
      userId: user.id,
      role: session.role,
      sessionId: crypto.randomUUID(),
      mustChangePassword: false,
    });

    const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
    const isSecure = process.env.NODE_ENV === "production" ? true : isHttps;

    const destinationUrl =
      session.role === "BUSINESS_PARTNER" || session.role === "BROKER"
        ? "/broker/onboarding"
        : resolveRoleDashboardUrl(session.role);

    const response = NextResponse.json({
      success: true,
      message: "Password changed successfully.",
      redirectUrl: destinationUrl,
    });

    response.cookies.set({
      name: "axivon_session",
      value: newSessionToken,
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
