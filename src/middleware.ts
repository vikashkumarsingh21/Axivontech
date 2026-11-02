import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { env } from "./lib/env";
import {
  normalizeRole,
  canAccessPartnerPortal,
  resolveRoleDashboardUrl,
} from "./lib/auth/roles";
import { isAllowedAppRoute } from "./features/app-mode/routing";

const secretKey = new TextEncoder().encode(env.SESSION_SECRET);

export async function middleware(req: any) {
  const pathname = req.nextUrl.pathname;

  // ─── Legacy Founder & Co-Founder Portal Route Redirects ───────────────────
  if (
    pathname === "/founder" ||
    pathname.startsWith("/founder/") ||
    pathname === "/cofounder" ||
    pathname.startsWith("/cofounder/") ||
    pathname === "/co-founder" ||
    pathname.startsWith("/co-founder/")
  ) {
    const cleanRemainder = pathname
      .replace(/^\/(founder|cofounder|co-founder)/, "")
      .replace(/^\/+/, "");
    const targetUrl = cleanRemainder ? `/executive/${cleanRemainder}` : "/executive/dashboard";
    return NextResponse.redirect(new URL(targetUrl, req.url));
  }

  // Protect /employee and /api/v1/employee routes
  const isEmployeeRoute = pathname.startsWith("/employee");
  const isEmployeeApiRoute = pathname.startsWith("/api/v1/employee");
  
  // Protect /admin routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/v1/admin");

  // Protect /executive routes (Phase 4)
  const isExecutiveRoute = pathname.startsWith("/executive");
  const isExecutiveApiRoute = pathname.startsWith("/api/v1/executive");

  // Protect /manager routes (Department Manager Portal)
  const isManagerRoute = pathname.startsWith("/manager");
  const isManagerApiRoute = pathname.startsWith("/api/v1/manager");

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

  // Protect /api/v1/jobs route
  const isJobsApiRoute = pathname.startsWith("/api/v1/jobs");

  // Change password route
  const isChangePasswordRoute = pathname === "/auth/change-password";

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
    isJobsApiRoute ||
    isEmployeeApiRoute ||
    isAdminApiRoute ||
    isExecutiveApiRoute ||
    isManagerApiRoute ||
    isBrokerApiRoute ||
    isClientApiRoute ||
    isCrmApiRoute ||
    isAnalyticsApiRoute ||
    isGeneralAuthApiRoute;

  const isProtectedRoute =
    isEmployeeRoute ||
    isAdminRoute ||
    isExecutiveRoute ||
    isManagerRoute ||
    isBrokerRoute ||
    isClientRoute ||
    isCrmRoute ||
    isChangePasswordRoute;

  // IMPORTANT: Prevent header spoofing on public routes
  // Next.js passes client headers through. We must strictly control x-user-id.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete("x-user-id");
  requestHeaders.delete("x-user-role");
  requestHeaders.delete("x-app-mode");
  requestHeaders.delete("x-axivon-app");
  requestHeaders.delete("x-axivon-app-version");

  // ─── Mobile App Mode Header & Route Handling ───
  // Minimal early check: zero DB calls, zero latency when APP_MODE_ENABLED is not true
  const isMasterAppEnabled = process.env.APP_MODE_ENABLED === "true";
  let isAppRequest = false;
  let appVersion: string | null = null;

  if (isMasterAppEnabled) {
    const userAgent = req.headers.get("user-agent") || "";
    if (userAgent.includes("AxivonApp")) {
      isAppRequest = true;
      const match = userAgent.match(/AxivonApp\/([0-9.]+)/i);
      appVersion = match ? match[1] : null;
    } else if (process.env.NODE_ENV !== "production") {
      const url = req.nextUrl;
      if (url.searchParams.get("app") === "1" || req.cookies.get("axivon_app_dev")?.value === "1") {
        isAppRequest = true;
        appVersion = "dev";
      }
    }

    if (isAppRequest) {
      requestHeaders.set("x-axivon-app", "1");
      requestHeaders.set("x-app-mode", "true");
      if (appVersion) {
        requestHeaders.set("x-axivon-app-version", appVersion);
      }

      // App-Mode Routing Policy: Public marketing routes redirect out of public view
      if (!isAllowedAppRoute(pathname)) {
        const sessionCookie = req.cookies.get("axivon_session")?.value;
        if (!sessionCookie) {
          return NextResponse.redirect(new URL("/login", req.url));
        }

        try {
          const { payload } = await jwtVerify(sessionCookie, secretKey, {
            algorithms: ["HS256"],
          });
          const role = normalizeRole(payload.role as string);
          const targetUrl = resolveRoleDashboardUrl(role);
          return NextResponse.redirect(new URL(targetUrl, req.url));
        } catch {
          const res = NextResponse.redirect(new URL("/login", req.url));
          res.cookies.delete("axivon_session");
          return res;
        }
      }
    }
  }

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
      const mustChangePassword = !!payload.mustChangePassword;

      // ── Forced First-Login Password Change Gate ──
      if (mustChangePassword) {
        const isAllowedPasswordChangeApi = pathname === "/api/v1/auth/change-password";
        const isLogout = pathname === "/api/v1/auth/logout" || pathname === "/logout";

        if (!isChangePasswordRoute && !isAllowedPasswordChangeApi && !isLogout) {
          if (isProtectedApiRoute) {
            return NextResponse.json(
              {
                error: "PASSWORD_CHANGE_REQUIRED",
                message: "Password change required before accessing platform features.",
                mustChangePassword: true,
              },
              { status: 403 }
            );
          }
          return NextResponse.redirect(new URL("/auth/change-password", req.url));
        }
      } else if (isChangePasswordRoute) {
        // If password is already changed, send user to their dashboard
        return NextResponse.redirect(new URL(resolveRoleDashboardUrl(role), req.url));
      }

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

      const allowedManagerRoles = ["DEPARTMENT_MANAGER", "MANAGER", "ADMIN", "FOUNDER", "CO_FOUNDER"];
      if ((isManagerRoute || isManagerApiRoute) && !allowedManagerRoles.includes(role)) {
        if (isManagerApiRoute) {
          return NextResponse.json({ error: "Forbidden: Department manager access required." }, { status: 403 });
        }
        return NextResponse.redirect(getRoleRedirectUrl(role));
      }

      if (isJobsApiRoute && role !== "ADMIN" && role !== "FOUNDER" && role !== "CO_FOUNDER") {
        return NextResponse.json({ error: "Forbidden: Administrative access required." }, { status: 403 });
      }

      const allowedEmployeeRoles = ["EMPLOYEE", "ADMIN", "FOUNDER", "CO_FOUNDER", "DEPARTMENT_MANAGER", "MANAGER"];
      if ((isEmployeeRoute || isEmployeeApiRoute) && !allowedEmployeeRoles.includes(role)) {
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
    /*
     * Match all request paths except:
     * - _next/static (static chunks, css, media)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, manifest.webmanifest
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest).*)",
  ],
};
