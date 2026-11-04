import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { normalizeRole, resolveRoleDashboardUrl, ROLE_HIERARCHY } from "@/lib/auth/roles";
import { signSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const secretKey = new TextEncoder().encode(env.SESSION_SECRET);

/**
 * GET /api/v1/auth/session
 * Validates, restores, and optionally rolls forward an authenticated user session.
 */
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("axivon_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // 1. Cryptographically verify the session token
    let payload: any;
    try {
      const verified = await jwtVerify(sessionCookie, secretKey, {
        algorithms: ["HS256"],
      });
      payload = verified.payload;
    } catch {
      const res = NextResponse.json(
        { authenticated: false, error: "Session expired or invalid" },
        { status: 401 }
      );
      res.cookies.set({
        name: "axivon_session",
        value: "",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
      return res;
    }

    // 2. Verify user exists and account status is ACTIVE in database
    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      const res = NextResponse.json(
        { authenticated: false, error: "User not found" },
        { status: 401 }
      );
      res.cookies.set({
        name: "axivon_session",
        value: "",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
      return res;
    }

    if (user.status !== "ACTIVE") {
      const res = NextResponse.json(
        {
          authenticated: false,
          error: "Account inactive or suspended",
          accountStatus: user.status,
        },
        { status: 403 }
      );
      res.cookies.set({
        name: "axivon_session",
        value: "",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
      return res;
    }

    // 3. Resolve authoritative role and authorized portal dashboard URL
    const userRoleNames = user.userRoles.map((ur) => normalizeRole(ur.role.name));
    const role =
      ROLE_HIERARCHY.find((r) => userRoleNames.includes(r)) ||
      userRoleNames[0] ||
      normalizeRole(payload.role as string) ||
      "EMPLOYEE";

    const mustChangePassword = !!user.mustChangePassword;
    const dashboardUrl = mustChangePassword
      ? "/auth/change-password"
      : resolveRoleDashboardUrl(role);

    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        status: user.status,
        mustChangePassword,
      },
      dashboardUrl,
      mustChangePassword,
    });

    // 4. Rolling renewal: If token has less than 7 days remaining, renew for 30 days
    const exp = (payload.exp as number) || 0;
    const nowSec = Math.floor(Date.now() / 1000);
    const sevenDaysSec = 7 * 24 * 60 * 60;

    if (exp - nowSec < sevenDaysSec) {
      const sessionDays = 30;
      const renewedToken = await signSession(
        {
          userId: user.id,
          role,
          sessionId: (payload.sessionId as string) || crypto.randomUUID(),
          mustChangePassword,
        },
        `${sessionDays}d`
      );

      const isHttps =
        req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
      const isSecure = process.env.NODE_ENV === "production" ? true : isHttps;

      response.cookies.set({
        name: "axivon_session",
        value: renewedToken,
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * sessionDays,
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, error: error.message || "Failed to restore session" },
      { status: 500 }
    );
  }
}
