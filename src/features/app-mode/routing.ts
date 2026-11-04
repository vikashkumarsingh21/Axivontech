/**
 * Axivon Mobile App Mode Route Policy & Enforcement
 *
 * Rules:
 * - When in App Mode, marketing & showcase pages are strictly unreachable.
 * - Allowed: Login, Logout, role portals, activation, preferences, legal.
 * - Disallowed public routes redirect to role dashboard (if session exists) or /login.
 * - Zero redirect loops.
 */

export const ALLOWED_EXACT_APP_ROUTES = new Set([
  "/app",
  "/app/login",
  "/login",
  "/logout",
  "/client/activate",
  "/business-partner/activate",
  "/broker-partner/activate",
  "/verify-email-change",
  "/preferences",
  "/cookie-preferences",
  "/privacy-policy",
  "/terms",
  "/terms-and-conditions",
  "/privacy-requests",
  "/disclaimer",
  "/security-policy",
  "/service-delivery-policy",
  "/refund-cancellation-policy",
  "/cookie-policy",
  "/ai-privacy-notice",
  "/ai-usage",
  "/intellectual-property",
  "/acceptable-use-policy",
  "/accessibility",
]);

export const ALLOWED_PREFIX_APP_ROUTES = [
  "/app",
  "/auth",
  "/admin",
  "/executive",
  "/employee",
  "/broker",
  "/client",
  "/manager",
  "/crm",
  "/legal",
  "/download",
  "/api",
  "/_next",
  "/assets",
];

/**
 * Determines whether a pathname is permitted inside the mobile WebView.
 */
export function isAllowedAppRoute(pathname: string): boolean {
  if (ALLOWED_EXACT_APP_ROUTES.has(pathname)) {
    return true;
  }

  for (const prefix of ALLOWED_PREFIX_APP_ROUTES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return true;
    }
  }

  // Next.js static metadata assets
  if (
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/apple-touch-icon.png"
  ) {
    return true;
  }

  return false;
}
