import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isRateLimited } from "@/lib/rate-limit";
import { sendTransactionalEmail } from "@/lib/email/service";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * Initiates an account password reset request.
 * Security guarantees:
 * - Strict rate limiting (max 5 requests per 15 min per IP)
 * - Zero account enumeration: Returns generic success message regardless of email existence
 * - Single-use, cryptographically secure 32-byte hex token
 * - Only SHA-256 hash of token stored in DB with 30-minute expiration
 * - Multi-platform: supports web (/reset-password) and mobile app (/app/reset-password) links
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = isRateLimited(`forgot_password:${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 5 });
    if (rateCheck.limited) {
      throw new ApiError(429, "Too many password reset requests. Please try again in 15 minutes.");
    }

    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const isApp = Boolean(
      body.isApp ||
      req.headers.get("x-axivon-app") === "1" ||
      req.headers.get("user-agent")?.includes("AxivonApp")
    );

    if (!email || !email.includes("@")) {
      throw new ApiError(400, "Please provide a valid registered email address.");
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, status: true },
    });

    // If user exists and is active, generate secure reset token and send email
    if (user && user.status === "ACTIVE") {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAtMs = Date.now() + 30 * 60 * 1000; // 30 minutes expiry
      const tokenPayload = `pwd_reset:${hashedToken}:${expiresAtMs}`;

      await db.user.update({
        where: { id: user.id },
        data: {
          activationToken: tokenPayload,
          mustChangePassword: true,
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in";
      const resetPath = isApp ? "/app/reset-password" : "/reset-password";
      const resetLink = `${baseUrl}${resetPath}?token=${rawToken}`;

      await sendTransactionalEmail({
        to: user.email,
        templateKey: "PASSWORD_RESET",
        eventKey: `pwd_reset:${user.id}:${Math.floor(Date.now() / (10 * 60 * 1000))}`, // Max 1 per 10min
        variables: {
          name: user.name,
          resetLink,
        },
        metadata: {
          userId: user.id,
          type: "PASSWORD_RESET_REQUEST",
          ip,
          isApp,
        },
      }).catch((emailErr) => {
        console.error("[ForgotPassword] Email dispatch error:", emailErr);
      });

      await db.auditLog
        .create({
          data: {
            userId: user.id,
            action: "AUTH_PASSWORD_RESET_REQUESTED",
            resource: `User:${user.id}`,
            ipAddress: ip,
            userAgent: req.headers.get("user-agent"),
            details: { isApp, expiresAt: new Date(expiresAtMs).toISOString() },
          },
        })
        .catch(() => {});
    }

    // Always return a generic success message to prevent account enumeration attacks
    return NextResponse.json({
      success: true,
      message:
        "If an active account exists with this email address, you will receive instructions to reset your password shortly.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
