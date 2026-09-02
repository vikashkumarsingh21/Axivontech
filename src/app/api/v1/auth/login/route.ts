import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    // Identify primary role for session (defaults to "USER" if none found)
    const role = user.userRoles.length > 0 ? user.userRoles[0].role.name : "USER";

    // Generate Session
    const sessionToken = await signSession({
      userId: user.id,
      role: role,
      sessionId: crypto.randomUUID(), // Optional: can be stored in DB to track active sessions
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
        action: "employee.login",
        resource: "Auth",
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent"),
      },
    });

    // Set cookie
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
