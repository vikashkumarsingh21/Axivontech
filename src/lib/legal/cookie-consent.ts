export interface CookieConsentPreferences {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

export const CONSENT_STORAGE_KEY = "axivon_consent_preferences";
export const CONSENT_COOKIE_KEY = "axivon_consent_preferences";
export const CONSENT_EVENT_NAME = "axivon_cookie_consent_updated";
export const CURRENT_CONSENT_VERSION = "2.1";

export const DEFAULT_CONSENT: CookieConsentPreferences = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
  timestamp: "",
  version: CURRENT_CONSENT_VERSION,
};

export function getStoredConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const item = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (item) {
      const parsed = JSON.parse(item) as CookieConsentPreferences;
      if (parsed && typeof parsed.necessary === "boolean") {
        return parsed;
      }
    }

    // Fallback to cookie check
    const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE_KEY}=([^;]*)`));
    if (match) {
      const decoded = decodeURIComponent(match[1]);
      const parsed = JSON.parse(decoded) as CookieConsentPreferences;
      if (parsed && typeof parsed.necessary === "boolean") {
        return parsed;
      }
    }
  } catch (err) {
    // Malformed JSON or storage unavailable
  }

  return null;
}

export function saveConsent(preferences: Partial<CookieConsentPreferences>): CookieConsentPreferences {
  const fullConsent: CookieConsentPreferences = {
    necessary: true, // Always required
    preferences: Boolean(preferences.preferences),
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    timestamp: new Date().toISOString(),
    version: CURRENT_CONSENT_VERSION,
  };

  if (typeof window !== "undefined") {
    try {
      const serialized = JSON.stringify(fullConsent);
      window.localStorage.setItem(CONSENT_STORAGE_KEY, serialized);

      // Set cookie expiring in 365 days
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie = `${CONSENT_COOKIE_KEY}=${encodeURIComponent(serialized)}; path=/; max-age=${maxAge}; SameSite=Lax`;

      // Dispatch global event for listeners (like GoogleAnalytics script loader)
      window.dispatchEvent(new CustomEvent(CONSENT_EVENT_NAME, { detail: fullConsent }));

      // Send telemetry record to backend asynchronously
      fetch("/api/v1/public/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: fullConsent }),
      }).catch(() => {
        // Safe ignore
      });
    } catch (err) {
      // Storage error
    }
  }

  return fullConsent;
}

export function acceptAllCookies(): CookieConsentPreferences {
  return saveConsent({
    necessary: true,
    preferences: true,
    analytics: true,
    marketing: true,
  });
}

export function rejectOptionalCookies(): CookieConsentPreferences {
  return saveConsent({
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
  });
}
