import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Need to duplicate secret resolution for Edge runtime compatibility
// process.env.SESSION_SECRET is available in Edge middleware if defined in .env
const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || "");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /employee and /api/v1/employee routes
  const isEmployeeRoute = pathname.startsWith("/employee");
  const isEmployeeApiRoute = pathname.startsWith("/api/v1/employee");
  
  // Protect /admin routes (Phase 3 placeholder)
  const isAdminRoute = pathname.startsWith("/admin");

  if (isEmployeeRoute || isEmployeeApiRoute || isAdminRoute) {
    const sessionCookie = req.cookies.get("axivon_session")?.value;

    if (!sessionCookie) {
      if (isEmployeeApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      // Verify token
      const { payload } = await jwtVerify(sessionCookie, secretKey, {
        algorithms: ["HS256"],
      });

      // Role based basic checks
      const role = payload.role as string;
      
      if (isAdminRoute && role !== "ADMIN" && role !== "FOUNDER") {
        return NextResponse.redirect(new URL("/employee/dashboard", req.url));
      }

      // Add user info to headers for downstream consumption
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", payload.userId as string);
      requestHeaders.set("x-user-role", payload.role as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Invalid token
      const response = isEmployeeApiRoute
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : NextResponse.redirect(new URL("/login", req.url));
      
      response.cookies.delete("axivon_session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/employee/:path*",
    "/api/v1/employee/:path*",
    "/admin/:path*",
  ],
};
