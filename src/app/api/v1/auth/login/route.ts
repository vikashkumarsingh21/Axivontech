import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/session";
import { ROLE_HIERARCHY, normalizeRole } from "@/lib/auth/roles";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isRateLimited, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { verifyFormProtection } from "@/lib/captcha";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const rateLimitKey = `auth_login:${ip}`;
    const rateCheck = isRateLimited(rateLimitKey, RATE_LIMIT_PRESETS.AUTH_LOGIN);
    if (rateCheck.limited) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json();

    // Verify anti-bot protection (Google reCAPTCHA v2 / Turnstile) & honeypot traps
    const protectionResult = await verifyFormProtection(req, body, {
      action: "auth_login",
      requirePolicyAcknowledgement: false,
      requireCaptcha: true,
    });
    if (!protectionResult.success) {
      return protectionResult.response!;
    }

    const { email, password } = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
      throw new ApiError(403, `Account is ${user.status}. Please check your email or contact support.`);
    }

    if (user.mustChangePassword) {
      throw new ApiError(403, "Please complete your account activation and password setup using the link sent to your email.");
    }

    // Identify primary role for session based on centralized role hierarchy and canonical normalization
    const userRoleNames = user.userRoles.map((ur) => normalizeRole(ur.role.name));
    const role = ROLE_HIERARCHY.find((r) => userRoleNames.includes(r)) || userRoleNames[0] || "EMPLOYEE";

    // Generate Session
    const sessionToken = await signSession({
      userId: user.id,
      role: role,
      sessionId: crypto.randomUUID(),
    });

    // Create session record in database
    await db.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Log the event
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "user.login",
        resource: "Auth",
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent"),
      },
    });

    // Set cookie (always secure in production or when forwarded over HTTPS)
    const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
    const isSecure = process.env.NODE_ENV === "production" ? true : isHttps;
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
      },
    });

    response.cookies.set({
      name: "axivon_session",
      value: sessionToken,
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
