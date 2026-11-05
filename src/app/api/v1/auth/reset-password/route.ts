import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isRateLimited } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/auth/password";
import { validatePasswordStrength } from "@/lib/auth/password-utils";
import { sendTransactionalEmail } from "@/lib/email/service";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * Resets an account password using a validated single-use reset token.
 * Requirements:
 * - Validates matching passwords & enforce password policy (10+ chars, uppercase, lowercase, number, symbol)
 * - Verifies token hash and expiration
 * - Hashes password using bcrypt 12 salt rounds
 * - Atomically consumes token (sets activationToken: null), resets mustChangePassword
 * - Revokes all existing active user sessions
 * - Dispatches PASSWORD_CHANGED confirmation email to registered address
 * - Creates an audit log entry
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = isRateLimited(`reset_password_post:${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 10 });
    if (rateCheck.limited) {
      throw new ApiError(429, "Too many password reset attempts. Please try again later.");
    }

    const body = await req.json().catch(() => ({}));
    const rawToken = typeof body.token === "string" ? body.token.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!rawToken || rawToken.length < 32) {
      throw new ApiError(400, "A valid password reset token is required.");
    }

    if (!newPassword || !confirmPassword) {
      throw new ApiError(400, "Please provide and confirm your new password.");
    }

    if (newPassword !== confirmPassword) {
      throw new ApiError(400, "New password and confirmation password do not match.");
    }

    // Validate password complexity
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.isValid) {
      throw new ApiError(400, passwordCheck.errors[0] || "Password does not meet security requirements.");
    }

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Locate user by hashed token
    const user = await db.user.findFirst({
      where: {
        activationToken: {
          contains: hashedToken,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        activationToken: true,
      },
    });

    if (!user || !user.activationToken || !user.activationToken.startsWith("pwd_reset:")) {
      throw new ApiError(400, "This password reset link is invalid or has already been used.");
    }

    const parts = user.activationToken.split(":");
    if (parts.length < 3) {
      throw new ApiError(400, "This password reset token is corrupted.");
    }

    const expiresAtMs = parseInt(parts[2], 10);
    if (isNaN(expiresAtMs) || Date.now() > expiresAtMs) {
      throw new ApiError(400, "This password reset link has expired. Please request a new one.");
    }

    if (user.status !== "ACTIVE") {
      throw new ApiError(403, "This account is inactive or disabled. Password reset is not permitted.");
    }

    // Hash new password using bcrypt 12 salt rounds
    const newPasswordHash = await hashPassword(newPassword);

    // Atomically update password, consume token, and revoke active sessions
    await db.$transaction(async (tx) => {
      // 1. Update user password and consume token
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          activationToken: null, // Consumes token (single-use guaranteed)
          mustChangePassword: false,
        },
      });

      // 2. Revoke all active sessions
      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      // 3. Write security audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "AUTH_PASSWORD_RESET_COMPLETED",
          resource: `User:${user.id}`,
          ipAddress: ip,
          userAgent: req.headers.get("user-agent"),
          details: { completedAt: new Date().toISOString() },
        },
      });
    });

    // 4. Dispatch confirmation email (fire-and-forget)
    sendTransactionalEmail({
      to: user.email,
      templateKey: "PASSWORD_CHANGED",
      eventKey: `pwd_changed:${user.id}:${Date.now()}`,
      variables: {
        name: user.name,
      },
      metadata: {
        userId: user.id,
        type: "PASSWORD_CHANGED_CONFIRMATION",
        ip,
      },
    }).catch((emailErr) => {
      console.error("[ResetPassword] Confirmation email dispatch error:", emailErr);
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
