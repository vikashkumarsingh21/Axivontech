import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken, CaptchaVerifyResult } from "./turnstile";
import { isRateLimited, RateLimitOptions } from "@/lib/rate-limit";

export interface FormProtectionOptions {
  action?: string | string[];
  expectedHostname?: string;
  rateLimitKey?: string;
  rateLimitPreset?: RateLimitOptions;
  checkHoneypot?: boolean;
}

export interface FormProtectionResult {
  success: boolean;
  errorResponse?: NextResponse;
  response?: NextResponse;
  captchaResult?: CaptchaVerifyResult;
}

/**
 * Standardized server-side anti-bot verification boundary
 * Enforces rate limiting, honeypot traps, and Cloudflare Turnstile token validation.
 */
export async function verifyFormProtection(
  req: NextRequest | Request,
  body: Record<string, any>,
  options: FormProtectionOptions = {}
): Promise<FormProtectionResult> {
  const { action, expectedHostname, rateLimitKey, rateLimitPreset, checkHoneypot = true } = options;

  // Extract client IP safely
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 1. Layered Defense: Honeypot trap check
  if (checkHoneypot) {
    const honeypotVal = body.honeypot || body._gotcha || body.website_trap;
    if (honeypotVal && typeof honeypotVal === "string" && honeypotVal.trim() !== "") {
      const resp = NextResponse.json(
        { success: true, message: "Submission received.", botBlocked: true },
        { status: 200 }
      );
      return {
        success: false,
        errorResponse: resp,
        response: resp,
      };
    }
  }

  // 2. Layered Defense: Rate Limiting
  if (rateLimitPreset) {
    const actionKey = Array.isArray(action) ? action[0] : (action || "general");
    const key = rateLimitKey || `form_protection:${actionKey}:${ip}`;
    const rateCheck = isRateLimited(key, rateLimitPreset);
    if (rateCheck.limited) {
      const retryAfterSec = Math.ceil(rateCheck.resetMs / 1000);
      const resp = NextResponse.json(
        {
          error: "Too many submissions. Please slow down and try again.",
          retryAfter: retryAfterSec,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSec) },
        }
      );
      return {
        success: false,
        errorResponse: resp,
        response: resp,
      };
    }
  }

  // 3. Extract CAPTCHA token from body or headers
  const token =
    body.captchaToken ||
    body.turnstileToken ||
    body["cf-turnstile-response"] ||
    req.headers.get("x-captcha-token");

  // 4. Verify token with Cloudflare Turnstile
  const result = await verifyTurnstileToken({
    token,
    remoteIp: ip,
    expectedAction: action,
    expectedHostname,
  });

  if (!result.success) {
    const statusCode =
      result.status === "CONFIGURATION_ERROR"
        ? 500
        : result.status === "PROVIDER_UNAVAILABLE"
        ? 503
        : 400;

    const resp = NextResponse.json(
      {
        error: result.message,
        code: result.status,
        requiresCaptchaReset: true,
      },
      { status: statusCode }
    );

    return {
      success: false,
      captchaResult: result,
      errorResponse: resp,
      response: resp,
    };
  }

  return {
    success: true,
    captchaResult: result,
  };
}
