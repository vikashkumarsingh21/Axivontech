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
  
  // Protect /admin routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/v1/admin");

  // Protect /executive routes (Phase 4)
  const isExecutiveRoute = pathname.startsWith("/executive");
  const isExecutiveApiRoute = pathname.startsWith("/api/v1/executive");

  // Protect /broker routes
  const isBrokerRoute = pathname.startsWith("/broker");
  const isBrokerApiRoute = pathname.startsWith("/api/v1/broker");

  // Protect /client routes
  const isClientRoute = pathname.startsWith("/client");
  const isClientApiRoute = pathname.startsWith("/api/v1/client");

  // Protect /crm routes
  const isCrmRoute = pathname.startsWith("/crm");
  const isCrmApiRoute = pathname.startsWith("/api/v1/crm");

  const isProtectedApiRoute = isEmployeeApiRoute || isAdminApiRoute || isExecutiveApiRoute || isBrokerApiRoute || isClientApiRoute || isCrmApiRoute;
  const isProtectedRoute = isEmployeeRoute || isAdminRoute || isExecutiveRoute || isBrokerRoute || isClientRoute || isCrmRoute;

  // IMPORTANT: Prevent header spoofing on public routes
  // Next.js passes client headers through. We must strictly control x-user-id.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete("x-user-id");
  requestHeaders.delete("x-user-role");

  if (isProtectedRoute || isProtectedApiRoute) {
    const sessionCookie = req.cookies.get("axivon_session")?.value;

    if (!sessionCookie) {
      if (isProtectedApiRoute) {
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
      
      if ((isAdminRoute || isAdminApiRoute) && role !== "ADMIN" && role !== "FOUNDER" && role !== "CO_FOUNDER") {
        if (isAdminApiRoute) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(role === "BROKER" ? new URL("/broker/dashboard", req.url) : new URL("/employee/dashboard", req.url));
      }

      if ((isExecutiveRoute || isExecutiveApiRoute) && role !== "FOUNDER" && role !== "CO_FOUNDER") {
        if (isExecutiveApiRoute) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(role === "BROKER" ? new URL("/broker/dashboard", req.url) : new URL("/employee/dashboard", req.url));
      }

      if ((isEmployeeRoute || isEmployeeApiRoute) && role === "BROKER") {
        if (isEmployeeApiRoute) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/broker/dashboard", req.url));
      }

      if ((isBrokerRoute || isBrokerApiRoute) && role !== "BROKER" && role !== "ADMIN" && role !== "FOUNDER" && role !== "CO_FOUNDER") {
        if (isBrokerApiRoute) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/employee/dashboard", req.url));
      }

      if ((isClientRoute || isClientApiRoute) && role !== "CLIENT") {
        if (isClientApiRoute) {
           return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Add user info to headers for downstream consumption securely
      requestHeaders.set("x-user-id", payload.userId as string);
      requestHeaders.set("x-user-role", payload.role as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Invalid token
      const response = isProtectedApiRoute
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : NextResponse.redirect(new URL("/login", req.url));
      
      response.cookies.delete("axivon_session");
      return response;
    }
  }

  // Allow public routes, but with the spoofed headers stripped
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/employee/:path*",
    "/api/v1/employee/:path*",
    "/admin/:path*",
    "/api/v1/admin/:path*",
    "/executive/:path*",
    "/api/v1/executive/:path*",
    "/broker/:path*",
    "/api/v1/broker/:path*",
    "/client/:path*",
    "/api/v1/client/:path*",
    "/crm/:path*",
    "/api/v1/crm/:path*",
  ],
};
