import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("axivon_session")?.value;

    if (sessionCookie) {
      // Decode to get userId for audit log, ignore expiration errors for logout
      const payload = await verifySession(sessionCookie);

      if (payload) {
        // Delete session from DB
        await db.session.deleteMany({
          where: { token: sessionCookie },
        });

        // Audit Log
        await db.auditLog.create({
          data: {
            userId: payload.userId,
            action: "employee.logout",
            resource: "Auth",
            ipAddress: req.headers.get("x-forwarded-for") || "unknown",
            userAgent: req.headers.get("user-agent"),
          },
        });
      }
    }

    const acceptsHtml = req.headers.get("accept")?.includes("text/html");
    const isFormSubmit = req.headers.get("content-type")?.includes("application/x-www-form-urlencoded");

    let response: NextResponse;
    if (acceptsHtml || isFormSubmit) {
      // Standard browser form submission: redirect directly to login
      response = NextResponse.redirect(new URL("/login?logged_out=1", req.url), 303);
    } else {
      response = NextResponse.json({ message: "Logged out successfully", redirectTo: "/login?logged_out=1" });
    }

    // Clear the cookie explicitly across all browser contexts
    response.cookies.set({
      name: "axivon_session",
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    // Even if something fails, ensure the cookie is cleared and redirect if HTML
    const acceptsHtml = req.headers.get("accept")?.includes("text/html");
    const isFormSubmit = req.headers.get("content-type")?.includes("application/x-www-form-urlencoded");

    let response: NextResponse;
    if (acceptsHtml || isFormSubmit) {
      response = NextResponse.redirect(new URL("/login?logged_out=1", req.url), 303);
    } else {
      response = NextResponse.json({ message: "Logged out", redirectTo: "/login?logged_out=1" });
    }

    response.cookies.set({
      name: "axivon_session",
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    return response;
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("axivon_session")?.value;

    if (sessionCookie) {
      const payload = await verifySession(sessionCookie);

      if (payload) {
        await db.session.deleteMany({
          where: { token: sessionCookie },
        });

        await db.auditLog.create({
          data: {
            userId: payload.userId,
            action: "employee.logout",
            resource: "Auth",
            ipAddress: req.headers.get("x-forwarded-for") || "unknown",
            userAgent: req.headers.get("user-agent"),
          },
        });
      }
    }
  } catch {
    // Ignore error and proceed to redirect
  }

  const response = NextResponse.redirect(new URL("/login?logged_out=1", req.url), 303);
  response.cookies.set({
    name: "axivon_session",
    value: "",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
