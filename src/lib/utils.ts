import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Checks whether the current pathname belongs to an authenticated portal,
 * login/auth flow, or standalone demo project where the public marketing
 * Navbar, Footer, and floating ChatWidget should not be rendered.
 */
export function isPortalOrStandaloneRoute(pathname: string | null): boolean {
  if (!pathname) return false;

  // Login, App, and Auth flows
  if (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname === "/logout" ||
    pathname.startsWith("/logout/") ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/")
  ) {
    return true;
  }

  // Enterprise Portals
  const portalPrefixes = [
    "/app",
    "/admin",
    "/employee",
    "/broker",
    "/executive",
    "/client",
    "/manager",
    "/crm",
  ];

  if (portalPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }

  // Standalone Demo Projects with their own navigation strips
  if (pathname.startsWith("/demo-projects/") && pathname !== "/demo-projects") {
    return true;
  }

  return false;
}