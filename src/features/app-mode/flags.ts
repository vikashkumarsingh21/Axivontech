/**
 * Axivon Mobile App Mode Kill-Switch & Feature Flag System
 *
 * Rules:
 * 1. Default state of APP_MODE_ENABLED is strictly FALSE.
 * 2. Organization setting 'app.enabled' defaults strictly to FALSE.
 * 3. Middleware checks are lightweight: zero DB calls in Edge middleware.
 * 4. Dev override works ONLY when NODE_ENV !== "production".
 */

export const APP_USER_AGENT_TOKEN = "AxivonApp";
export const APP_MODE_HEADER = "x-axivon-app";
export const APP_VERSION_HEADER = "x-axivon-app-version";
export const APP_DEV_COOKIE = "axivon_app_dev";

export interface AppModeSettings {
  "app.enabled"?: boolean;
  "app.download_popup_enabled"?: boolean;
  "app.downloadPrompt.enabled"?: boolean;
  "app.min_version"?: string;
  "app.latest_version"?: string;
  "app.download_url"?: string;
  [key: string]: unknown;
}

/**
 * Checks whether App Mode is enabled at the master environment variable level.
 * Defaults strictly to FALSE unless APP_MODE_ENABLED === "true".
 */
export function isAppModeEnvEnabled(): boolean {
  return process.env.APP_MODE_ENABLED === "true";
}

/**
 * Checks whether the incoming User-Agent belongs to the Axivon Android WebView.
 * Example UA: "Mozilla/5.0 (Linux; Android 14) ... AxivonApp/1.0.0"
 */
export function isAppUserAgent(userAgent?: string | null): boolean {
  if (!userAgent) return false;
  return userAgent.includes(APP_USER_AGENT_TOKEN);
}

/**
 * Extracts version string from AxivonApp/<version> User-Agent token.
 */
export function extractAppVersion(userAgent?: string | null): string | null {
  if (!userAgent) return null;
  const match = userAgent.match(/AxivonApp\/([0-9.]+)/i);
  return match ? match[1] : null;
}

/**
 * Dev-only override: Active ONLY when NODE_ENV !== "production".
 * Checks for query ?app=1, header x-app-dev=1, or cookie axivon_app_dev=1.
 */
export function isDevAppOverride(
  headers?: { get(name: string): string | null } | Record<string, string | string[] | undefined> | null,
  searchParams?: { get(name: string): string | null } | URLSearchParams | null,
  cookies?: { get(name: string): { value: string } | undefined } | null
): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  // Check query parameter ?app=1
  if (searchParams) {
    const appQuery = typeof searchParams.get === "function" ? searchParams.get("app") : (searchParams as any)?.app;
    if (appQuery === "1" || appQuery === "true") return true;
  }

  // Check dev cookie
  if (cookies) {
    const c = typeof cookies.get === "function" ? cookies.get(APP_DEV_COOKIE) : null;
    if (c?.value === "1" || c?.value === "true") return true;
  }

  // Check header
  if (headers) {
    const h = typeof (headers as any).get === "function" ? (headers as any).get("x-app-dev") : (headers as any)?.["x-app-dev"];
    if (h === "1" || h === "true") return true;
  }

  return false;
}

/**
 * Master kill switch check:
 * Requires process.env.APP_MODE_ENABLED === "true" AND (if provided) settings["app.enabled"] === true.
 */
export function isAppModeEnabled(settings?: AppModeSettings | null): boolean {
  if (!isAppModeEnvEnabled()) {
    return false;
  }
  if (settings && settings["app.enabled"] !== true) {
    return false;
  }
  return true;
}

/**
 * Server-side App Mode detector.
 * Checks:
 * 1. Master kill switch is enabled
 * 2. x-axivon-app header is "1" OR User-Agent contains AxivonApp OR dev-mode override.
 */
export function isAppMode(
  headers?: { get(name: string): string | null } | Record<string, string | string[] | undefined> | null
): boolean {
  if (!isAppModeEnvEnabled()) {
    return false;
  }

  if (!headers) return false;

  const getHeader = (name: string): string | null => {
    if (typeof (headers as any).get === "function") {
      return (headers as any).get(name);
    }
    const val = (headers as any)[name] || (headers as any)[name.toLowerCase()];
    if (Array.isArray(val)) return val[0] || null;
    return val || null;
  };

  const axivonAppHeader = getHeader(APP_MODE_HEADER);
  if (axivonAppHeader === "1" || axivonAppHeader === "true") {
    return true;
  }

  const ua = getHeader("user-agent");
  if (isAppUserAgent(ua)) {
    return true;
  }

  if (process.env.NODE_ENV !== "production") {
    const devHeader = getHeader("x-app-dev");
    if (devHeader === "1" || devHeader === "true") return true;
  }

  return false;
}

/**
 * Retrieves the mobile app version from headers or user-agent.
 */
export function getAppModeVersion(
  headers?: { get(name: string): string | null } | Record<string, string | string[] | undefined> | null
): string | null {
  if (!headers) return null;
  const getHeader = (name: string): string | null => {
    if (typeof (headers as any).get === "function") {
      return (headers as any).get(name);
    }
    const val = (headers as any)[name] || (headers as any)[name.toLowerCase()];
    if (Array.isArray(val)) return val[0] || null;
    return val || null;
  };

  const headerVersion = getHeader(APP_VERSION_HEADER);
  if (headerVersion) return headerVersion;

  const ua = getHeader("user-agent");
  return extractAppVersion(ua);
}

/**
 * Full master check combining UA and settings.
 */
export function isAppModeActive(
  userAgent?: string | null,
  settings?: AppModeSettings | null
): boolean {
  if (!isAppModeEnabled(settings)) {
    return false;
  }
  return isAppUserAgent(userAgent);
}
