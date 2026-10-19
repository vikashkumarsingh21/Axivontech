/**
 * AXIVON ONE: Centralized Cloudflare Turnstile CAPTCHA & Anti-Bot Service
 *
 * Implements server-side verification using the official Cloudflare Siteverify API:
 * POST https://challenges.cloudflare.com/turnstile/v0/siteverify
 *
 * Security Guarantees:
 * 1. Secret key is kept strictly server-side and never exposed.
 * 2. Tokens are validated for structure, length, expiration, and replay.
 * 3. In-memory replay prevention prevents reusing tokens within their 5-min TTL.
 * 4. Timeouts (5000ms) prevent slow third-party providers from hanging requests.
 * 5. Production fails closed if keys are missing; dev/test uses official Turnstile dummy keys.
 * 6. Detailed metrics and diagnostics are kept safely without logging secrets or PII.
 */

export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFICATION_TIMEOUT_MS = 5000;
const TOKEN_TTL_MS = 5 * 60 * 1000; // Turnstile tokens are valid for up to 5 minutes

// Official Cloudflare Dummy Test Keys
export const TURNSTILE_TEST_KEYS = {
  ALWAYS_PASSES_SITEKEY: "1x00000000000000000000AA",
  ALWAYS_PASSES_SECRET: "1x0000000000000000000000000000000AA",
  ALWAYS_BLOCKS_SITEKEY: "2x00000000000000000000AB",
  ALWAYS_BLOCKS_SECRET: "2x0000000000000000000000000000000AB",
  FORCES_CHALLENGE_SITEKEY: "3x00000000000000000000FF",
};

export type CaptchaVerificationStatus =
  | "VERIFIED"
  | "INVALID_TOKEN"
  | "EXPIRED_OR_DUPLICATE"
  | "MISSING_TOKEN"
  | "PROVIDER_UNAVAILABLE"
  | "CONFIGURATION_ERROR"
  | "INVALID_CONTEXT";

export interface CaptchaVerifyResult {
  success: boolean;
  status: CaptchaVerificationStatus;
  errorCodes?: string[];
  hostname?: string;
  action?: string;
  challengeTs?: string;
  message: string;
}

export interface CaptchaMetrics {
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
  failuresByReason: Record<string, number>;
  lastVerifiedAt: string | null;
  lastFailureAt: string | null;
  provider: "Cloudflare Turnstile (Managed)";
}

// In-memory replay prevention cache: token -> expiry timestamp
const usedTokensCache = new Map<string, number>();

// In-memory operational diagnostics (Zero secrets, zero PII)
const captchaMetrics: CaptchaMetrics = {
  totalVerifications: 0,
  successfulVerifications: 0,
  failedVerifications: 0,
  failuresByReason: {},
  lastVerifiedAt: null,
  lastFailureAt: null,
  provider: "Cloudflare Turnstile (Managed)",
};

// Periodic garbage collection for used tokens cache
const gcTimer = setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of usedTokensCache.entries()) {
    if (now > expiry) {
      usedTokensCache.delete(token);
    }
  }
}, 60000);

if (typeof gcTimer.unref === "function") {
  gcTimer.unref();
}

/**
 * Resets the in-memory replay prevention cache for automated testing
 */
export function clearUsedTokensCacheForTesting() {
  usedTokensCache.clear();
}

/**
 * Record safe operational metrics
 */
function recordMetric(status: CaptchaVerificationStatus, isSuccess: boolean) {
  const now = new Date().toISOString();
  captchaMetrics.totalVerifications++;
  if (isSuccess) {
    captchaMetrics.successfulVerifications++;
    captchaMetrics.lastVerifiedAt = now;
  } else {
    captchaMetrics.failedVerifications++;
    captchaMetrics.lastFailureAt = now;
    captchaMetrics.failuresByReason[status] = (captchaMetrics.failuresByReason[status] || 0) + 1;
  }
}

/**
 * Returns read-only operational CAPTCHA metrics for the Admin Panel
 */
export function getCaptchaMetrics(): CaptchaMetrics {
  return { ...captchaMetrics, failuresByReason: { ...captchaMetrics.failuresByReason } };
}

/**
 * Resolves the active Turnstile Secret Key.
 * In production: requires non-dummy configured secret.
 * In dev/test: defaults to official always-passing testing secret.
 */
export function getTurnstileSecretKey(): { secretKey: string | null; isTestKey: boolean; isConfigured: boolean } {
  const envSecret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const isProd = process.env.NODE_ENV === "production";

  if (envSecret && envSecret.length > 0) {
    const isTestKey =
      envSecret === TURNSTILE_TEST_KEYS.ALWAYS_PASSES_SECRET ||
      envSecret === TURNSTILE_TEST_KEYS.ALWAYS_BLOCKS_SECRET;
    return {
      secretKey: envSecret,
      isTestKey,
      isConfigured: true,
    };
  }

  // If not configured in production, do not invent credentials
  if (isProd) {
    return { secretKey: null, isTestKey: false, isConfigured: false };
  }

  // In development and test, fallback to official Turnstile test key
  return {
    secretKey: TURNSTILE_TEST_KEYS.ALWAYS_PASSES_SECRET,
    isTestKey: true,
    isConfigured: true,
  };
}

/**
 * Resolves the public Turnstile Site Key for frontend widgets
 */
export function getTurnstileSiteKey(): { siteKey: string; isTestKey: boolean } {
  const envKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  if (envKey && envKey.length > 0) {
    const isTestKey =
      envKey === TURNSTILE_TEST_KEYS.ALWAYS_PASSES_SITEKEY ||
      envKey === TURNSTILE_TEST_KEYS.ALWAYS_BLOCKS_SITEKEY;
    return { siteKey: envKey, isTestKey };
  }

  return {
    siteKey: TURNSTILE_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
    isTestKey: true,
  };
}

/**
 * Server-side verification of a Cloudflare Turnstile token
 */
export async function verifyTurnstileToken(opts: {
  token?: string | null;
  remoteIp?: string | null;
  expectedAction?: string | string[];
  expectedHostname?: string;
}): Promise<CaptchaVerifyResult> {
  const { token, remoteIp, expectedAction, expectedHostname } = opts;

  // 1. Check for token presence
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    recordMetric("MISSING_TOKEN", false);
    return {
      success: false,
      status: "MISSING_TOKEN",
      message: "Anti-bot verification token is missing. Please complete the security check.",
    };
  }

  const cleanToken = token.trim();

  // 2. Token structural validation: Prevent excessively large or malformed strings
  if (cleanToken.length < 10 || cleanToken.length > 2048) {
    recordMetric("INVALID_TOKEN", false);
    return {
      success: false,
      status: "INVALID_TOKEN",
      message: "Anti-bot verification token is malformed.",
    };
  }

  // 3. Replay prevention: check if token was already used
  if (usedTokensCache.has(cleanToken)) {
    recordMetric("EXPIRED_OR_DUPLICATE", false);
    return {
      success: false,
      status: "EXPIRED_OR_DUPLICATE",
      message: "Anti-bot verification token has already been used or expired. Please retry.",
    };
  }

  // 4. Resolve secret key
  const { secretKey, isConfigured, isTestKey } = getTurnstileSecretKey();
  if (!isConfigured || !secretKey) {
    recordMetric("CONFIGURATION_ERROR", false);
    console.error("[Turnstile] Error: TURNSTILE_SECRET_KEY is not configured in production.");
    return {
      success: false,
      status: "CONFIGURATION_ERROR",
      message: "Security verification service is misconfigured. Please contact support.",
    };
  }

  // 4b. Local Development / Test simulation for official Turnstile testing tokens
  const isDevOrTest = process.env.NODE_ENV !== "production" || isTestKey;
  if (isDevOrTest) {
    if (
      cleanToken === TURNSTILE_TEST_KEYS.ALWAYS_PASSES_SITEKEY ||
      cleanToken === "XXXX.DUMMY.PASS.TOKEN.XXXX" ||
      cleanToken === "FALLBACK_CLIENT_VERIFIED"
    ) {
      recordMetric("VERIFIED", true);
      const matchedAction = Array.isArray(expectedAction) ? expectedAction[0] : expectedAction;
      return {
        success: true,
        status: "VERIFIED",
        hostname: expectedHostname || "localhost",
        action: matchedAction,
        challengeTs: new Date().toISOString(),
        message: "Verification successful (Test Mode).",
      };
    }
    if (cleanToken.startsWith("XXXX.TEST.REPLAY.")) {
      usedTokensCache.set(cleanToken, Date.now() + TOKEN_TTL_MS);
      recordMetric("VERIFIED", true);
      const matchedAction = Array.isArray(expectedAction) ? expectedAction[0] : expectedAction;
      return {
        success: true,
        status: "VERIFIED",
        hostname: expectedHostname || "localhost",
        action: matchedAction,
        challengeTs: new Date().toISOString(),
        message: "Verification successful (Test Mode).",
      };
    }
    if (cleanToken === TURNSTILE_TEST_KEYS.ALWAYS_BLOCKS_SITEKEY || cleanToken === "XXXX.DUMMY.FAIL.TOKEN.XXXX") {
      recordMetric("INVALID_TOKEN", false);
      return {
        success: false,
        status: "INVALID_TOKEN",
        errorCodes: ["invalid-input-response"],
        message: "Anti-bot verification failed (Test Mode Block).",
      };
    }
  }

  // 5. Query Cloudflare Siteverify API
  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", cleanToken);

    if (remoteIp && remoteIp !== "127.0.0.1" && remoteIp !== "::1") {
      // Send sanitized IP if safe
      formData.append("remoteip", remoteIp.split(",")[0].trim());
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), VERIFICATION_TIMEOUT_MS);

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      recordMetric("PROVIDER_UNAVAILABLE", false);
      return {
        success: false,
        status: "PROVIDER_UNAVAILABLE",
        message: "Verification provider returned an unexpected error. Please retry.",
      };
    }

    const data: {
      success: boolean;
      "error-codes"?: string[];
      challenge_ts?: string;
      hostname?: string;
      action?: string;
      cdata?: string;
    } = await response.json();

    // 6. Inspect provider outcome
    if (!data.success) {
      const errorCodes = data["error-codes"] || [];
      const isExpired = errorCodes.includes("timeout-or-duplicate");
      const status: CaptchaVerificationStatus = isExpired ? "EXPIRED_OR_DUPLICATE" : "INVALID_TOKEN";

      recordMetric(status, false);
      return {
        success: false,
        status,
        errorCodes,
        message: isExpired
          ? "Verification token expired or already used. Please complete a fresh challenge."
          : "Anti-bot verification failed. Please try again.",
      };
    }

    // 7. Validate expected action if specified
    if (expectedAction && data.action) {
      const allowedActions = Array.isArray(expectedAction) ? expectedAction : [expectedAction];
      if (!allowedActions.includes(data.action)) {
        recordMetric("INVALID_CONTEXT", false);
        return {
          success: false,
          status: "INVALID_CONTEXT",
          message: "Verification action context mismatch.",
        };
      }
    }

    // 8. Validate expected hostname if specified
    if (expectedHostname && data.hostname) {
      const normalizedExpected = expectedHostname.toLowerCase();
      const normalizedActual = data.hostname.toLowerCase();
      if (normalizedActual !== normalizedExpected && normalizedActual !== "localhost") {
        recordMetric("INVALID_CONTEXT", false);
        return {
          success: false,
          status: "INVALID_CONTEXT",
          message: "Verification origin mismatch.",
        };
      }
    }

    // 9. Successfully verified! Mark token as used to prevent replay
    usedTokensCache.set(cleanToken, Date.now() + TOKEN_TTL_MS);
    recordMetric("VERIFIED", true);

    return {
      success: true,
      status: "VERIFIED",
      hostname: data.hostname,
      action: data.action,
      challengeTs: data.challenge_ts,
      message: "Verification successful.",
    };
  } catch (error: any) {
    const isTimeout = error.name === "AbortError";
    const status: CaptchaVerificationStatus = isTimeout ? "PROVIDER_UNAVAILABLE" : "PROVIDER_UNAVAILABLE";

    recordMetric(status, false);
    console.error("[Turnstile] Verification request error:", isTimeout ? "Timeout" : error.message);

    return {
      success: false,
      status,
      message: isTimeout
        ? "Verification service timed out. Please try again."
        : "Security verification temporarily unavailable. Please try again later.",
    };
  }
}
