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

    const response = NextResponse.json({ message: "Logged out successfully" });

    // Clear the cookie
    response.cookies.delete("axivon_session");

    return response;
  } catch (error) {
    // Even if something fails, ensure the cookie is cleared
    const response = NextResponse.json({ message: "Logged out" });
    response.cookies.delete("axivon_session");
    return response;
  }
}
