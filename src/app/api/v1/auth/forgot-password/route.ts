import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isRateLimited, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { sendTransactionalEmail } from "@/lib/email/service";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = isRateLimited(`forgot_password:${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 5 });
    if (rateCheck.limited) {
      throw new ApiError(429, "Too many password reset requests. Please try again in 15 minutes.");
    }

    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

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

      await db.user.update({
        where: { id: user.id },
        data: {
          activationToken: hashedToken,
          mustChangePassword: true,
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in";
      const resetLink = `${baseUrl}/login?resetToken=${rawToken}`;

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
        },
      });

      await db.auditLog.create({
        data: {
          userId: user.id,
          action: "AUTH_PASSWORD_RESET_REQUESTED",
          resource: `User:${user.id}`,
          ipAddress: ip,
          userAgent: req.headers.get("user-agent"),
        },
      }).catch(() => {});
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      success: true,
      message: "If an active account exists for this email address, password reset instructions have been dispatched.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
