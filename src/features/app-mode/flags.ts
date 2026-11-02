/**
 * Axivon Mobile App Mode Kill-Switch & Feature Flag System
 *
 * Isolation & Safety Rules:
 * 1. Default state of APP_MODE_ENABLED is strictly FALSE.
 * 2. Default state of organization setting 'app.enabled' is strictly FALSE.
 * 3. App Mode requires BOTH the environment kill-switch to be enabled
 *    AND the organization setting to be enabled.
 * 4. Zero DB calls in Edge middleware (checks env flag and headers only).
 * 5. When flag is OFF, all app routes return 404 and no app JS/CSS is served.
 */

export const APP_USER_AGENT_TOKEN = "AxivonApp";

export interface AppModeSettings {
  "app.enabled"?: boolean;
  "app.download_popup_enabled"?: boolean;
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
 */
export function isAppUserAgent(userAgent?: string | null): boolean {
  if (!userAgent) return false;
  return userAgent.includes(APP_USER_AGENT_TOKEN);
}

/**
 * Full master kill-switch check.
 * Requires BOTH:
 * - process.env.APP_MODE_ENABLED === "true"
 * - (optional) organization setting 'app.enabled' === true when provided.
 *
 * If either is false, App Mode is completely OFF.
 */
export function isAppModeEnabled(settings?: AppModeSettings | null): boolean {
  // Master kill switch: env flag must be explicitly true
  if (!isAppModeEnvEnabled()) {
    return false;
  }

  // If organization settings are provided, app.enabled must also be explicitly true
  if (settings && settings["app.enabled"] !== true) {
    return false;
  }

  return true;
}

/**
 * Determines whether App Mode should be actively applied for a given request.
 * Requires:
 * 1. App Mode master kill-switch is enabled
 * 2. Request User-Agent contains 'AxivonApp'
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
