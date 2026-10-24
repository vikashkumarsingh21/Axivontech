import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { normalizeRole, resolveRoleDashboardUrl, canAccessPartnerPortal } from "@/lib/auth/roles";

// Need to duplicate secret resolution for Edge runtime compatibility
// process.env.SESSION_SECRET is available in Edge middleware if defined in .env
const rawSecret = process.env.SESSION_SECRET || "";
if (!rawSecret && process.env.NODE_ENV === "production") {
  console.error("[CRITICAL SECURITY]: SESSION_SECRET is not configured in production.");
}
const secretKey = new TextEncoder().encode(rawSecret || "fallback-dev-session-secret-at-least-32-chars-long");

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

  // Protect /analytics API routes
  const isAnalyticsApiRoute = pathname.startsWith("/api/v1/analytics");

  // General authenticated APIs (applicable to all authenticated roles)
  const isGeneralAuthApiRoute =
    pathname.startsWith("/api/v1/me") ||
    pathname.startsWith("/api/v1/notifications") ||
    pathname.startsWith("/api/v1/reminders") ||
    pathname.startsWith("/api/v1/documents") ||
    pathname.startsWith("/api/v1/activity") ||
    pathname.startsWith("/api/v1/preferences") ||
    pathname.startsWith("/api/v1/automations") ||
    pathname.startsWith("/api/v1/announcements") ||
    pathname.startsWith("/api/v1/portal-ai") ||
    pathname.startsWith("/api/v1/search");

  const isProtectedApiRoute =
    isEmployeeApiRoute ||
    isAdminApiRoute ||
    isExecutiveApiRoute ||
    isBrokerApiRoute ||
    isClientApiRoute ||
    isCrmApiRoute ||
    isAnalyticsApiRoute ||
    isGeneralAuthApiRoute;
  const isProtectedRoute =
    isEmployeeRoute ||
    isAdminRoute ||
    isExecutiveRoute ||
    isBrokerRoute ||
    isClientRoute ||
    isCrmRoute;

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

      // Role based checks with canonical role normalization
      const role = normalizeRole(payload.role as string);
      
      const getRoleRedirectUrl = (userRole: string) => {
        return new URL(resolveRoleDashboardUrl(userRole), req.url);
      };

      if ((isAdminRoute || isAdminApiRoute || isAnalyticsApiRoute) && role !== "ADMIN" && role !== "FOUNDER" && role !== "CO_FOUNDER") {
        if (isAdminApiRoute || isAnalyticsApiRoute) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(getRoleRedirectUrl(role));
      }

      if ((isExecutiveRoute || isExecutiveApiRoute) && role !== "FOUNDER" && role !== "CO_FOUNDER") {
        if (isExecutiveApiRoute) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(getRoleRedirectUrl(role));
      }

      if ((isEmployeeRoute || isEmployeeApiRoute) && (role === "BUSINESS_PARTNER" || role === "CLIENT")) {
        if (isEmployeeApiRoute) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(getRoleRedirectUrl(role));
      }

      if ((isBrokerRoute || isBrokerApiRoute) && !canAccessPartnerPortal(role)) {
        if (isBrokerApiRoute) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(getRoleRedirectUrl(role));
      }

      if ((isClientRoute || isClientApiRoute) && role !== "CLIENT" && role !== "ADMIN" && role !== "FOUNDER" && role !== "CO_FOUNDER") {
        if (isClientApiRoute) {
           return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(getRoleRedirectUrl(role));
      }

      // Add user info to headers for downstream consumption securely (always canonical role)
      requestHeaders.set("x-user-id", payload.userId as string);
      requestHeaders.set("x-user-role", role);

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
    "/api/v1/analytics/:path*",
    "/api/v1/jobs/:path*",
    "/api/v1/me/:path*",
    "/api/v1/notifications/:path*",
    "/api/v1/reminders/:path*",
    "/api/v1/documents/:path*",
    "/api/v1/activity/:path*",
    "/api/v1/preferences/:path*",
    "/api/v1/automations/:path*",
    "/api/v1/announcements/:path*",
    "/api/v1/portal-ai/:path*",
    "/api/v1/search/:path*",
  ],
};
