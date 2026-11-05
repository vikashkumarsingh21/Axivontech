import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isRateLimited } from "@/lib/rate-limit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * Validates a password reset token without consuming it.
 * Checks existence, single-use validity, expiration, and account status.
 */
export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = isRateLimited(`reset_token_validate:${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 30 });
    if (rateCheck.limited) {
      throw new ApiError(429, "Too many validation attempts. Please try again later.");
    }

    const { searchParams } = new URL(req.url);
    const rawToken = searchParams.get("token")?.trim() || "";

    if (!rawToken || rawToken.length < 32) {
      return NextResponse.json({
        valid: false,
        reason: "INVALID_FORMAT",
        message: "Invalid password reset token format.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Search for user whose activationToken contains this hash
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
      return NextResponse.json({
        valid: false,
        reason: "INVALID_OR_CONSUMED",
        message: "This password reset link is invalid or has already been used.",
      });
    }

    // Token format: pwd_reset:<hashedToken>:<expiresAtMs>
    const parts = user.activationToken.split(":");
    if (parts.length < 3) {
      return NextResponse.json({
        valid: false,
        reason: "CORRUPT_TOKEN",
        message: "This password reset token is corrupted.",
      });
    }

    const expiresAtMs = parseInt(parts[2], 10);
    if (isNaN(expiresAtMs) || Date.now() > expiresAtMs) {
      return NextResponse.json({
        valid: false,
        reason: "EXPIRED",
        message: "This password reset link has expired. Please request a new one.",
      });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({
        valid: false,
        reason: "ACCOUNT_INACTIVE",
        message: "This account is inactive or disabled. Please contact an administrator.",
      });
    }

    // Mask user email for presentation (e.g. j***e@example.com)
    const [localPart, domain] = user.email.split("@");
    const maskedLocal =
      localPart.length <= 2
        ? `${localPart}*`
        : `${localPart[0]}${"*".repeat(Math.max(1, localPart.length - 2))}${localPart[localPart.length - 1]}`;
    const maskedEmail = `${maskedLocal}@${domain}`;

    return NextResponse.json({
      valid: true,
      maskedEmail,
      name: user.name,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
