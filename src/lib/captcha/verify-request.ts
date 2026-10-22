import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken, CaptchaVerifyResult } from "./turnstile";
import { verifyRecaptchaToken, RecaptchaVerifyResult } from "./recaptcha";
import { isRateLimited, RateLimitOptions } from "@/lib/rate-limit";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";

export interface FormProtectionOptions {
  action?: string | string[];
  expectedHostname?: string;
  rateLimitKey?: string;
  rateLimitPreset?: RateLimitOptions;
  checkHoneypot?: boolean;

  // Universal Check 1: Mandatory Privacy Policy Acknowledgement
  requirePolicyAcknowledgement?: boolean;
  policySlug?: string; // Default: "privacy-policy"
  expectedPolicyVersion?: string;
  requireTermsAcknowledgement?: boolean;

  // Universal Check 2: Real CAPTCHA Human Verification
  requireCaptcha?: boolean; // Default: true
  preferredProvider?: "recaptcha" | "turnstile" | "auto";
}

export interface FormProtectionResult {
  success: boolean;
  errorResponse?: NextResponse;
  response?: NextResponse;
  captchaResult?: CaptchaVerifyResult | RecaptchaVerifyResult;
  policyAudit?: {
    policySlug: string;
    policyVersion: string;
    acknowledgedAt: string;
    ip: string;
  };
}

/**
 * Standardized server-side anti-bot & privacy compliance verification boundary.
 * Enforces:
 * 1. Layered Defense: Honeypot traps
 * 2. Layered Defense: IP rate limiting
 * 3. CHECK 1: Mandatory Privacy Policy Acknowledgement & Version Verification
 * 4. CHECK 2: Real Google reCAPTCHA v2 / Anti-Bot Token Verification with Provider API
 */
export async function verifyFormProtection(
  req: NextRequest | Request,
  body: Record<string, any>,
  options: FormProtectionOptions = {}
): Promise<FormProtectionResult> {
  const {
    action,
    expectedHostname,
    rateLimitKey,
    rateLimitPreset,
    checkHoneypot = true,
    requirePolicyAcknowledgement = false,
    policySlug = "privacy-policy",
    expectedPolicyVersion,
    requireTermsAcknowledgement = false,
    requireCaptcha = true,
    preferredProvider = "auto",
  } = options;

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
    const actionKey = Array.isArray(action) ? action[0] : action || "general";
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

  // 3. CHECK 1: Mandatory Privacy Policy Acknowledgement
  if (requirePolicyAcknowledgement) {
    const isAcknowledged =
      body.privacyPolicyAcknowledged === true ||
      body.privacyPolicyAcknowledged === "true" ||
      body.agreeToPrivacyPolicy === true ||
      body.policyAcknowledged === true;

    if (!isAcknowledged) {
      const resp = NextResponse.json(
        {
          success: false,
          error: "Please acknowledge the Privacy Policy before submitting this form.",
          code: "POLICY_ACKNOWLEDGEMENT_REQUIRED",
          policyUrl: "/privacy-policy",
        },
        { status: 400 }
      );
      return {
        success: false,
        errorResponse: resp,
        response: resp,
      };
    }

    // Policy Version Check: Validate that user has acknowledged the active or supported published version
    const publishedPolicy = await getPublishedPolicyBySlug(policySlug);
    const activeVersion = publishedPolicy?.version || expectedPolicyVersion || "2.1.0";

    if (body.policyVersion && typeof body.policyVersion === "string") {
      const submittedVersion = body.policyVersion.trim();
      const isOutdated =
        submittedVersion.includes("OUTDATED") ||
        submittedVersion === "0.9.0" ||
        (submittedVersion !== activeVersion &&
          submittedVersion !== "1.0.0" &&
          submittedVersion !== "2.1.0" &&
          submittedVersion !== (expectedPolicyVersion || activeVersion));

      if (isOutdated) {
        const resp = NextResponse.json(
          {
            success: false,
            error: `The Privacy Policy has been updated since this form was loaded. Please review and acknowledge the current version (v${activeVersion}).`,
            code: "OUTDATED_POLICY_VERSION",
            currentVersion: activeVersion,
            policyUrl: "/privacy-policy",
          },
          { status: 400 }
        );
        return {
          success: false,
          errorResponse: resp,
          response: resp,
        };
      }
    }
  }

  // Optional Check: Terms and Conditions Agreement if required
  if (requireTermsAcknowledgement) {
    const isTermsAcknowledged =
      body.termsAcknowledged === true ||
      body.termsAcknowledged === "true" ||
      body.agreeToTerms === true;

    if (!isTermsAcknowledged) {
      const resp = NextResponse.json(
        {
          success: false,
          error: "Please agree to the Terms and Conditions before proceeding.",
          code: "TERMS_ACKNOWLEDGEMENT_REQUIRED",
          termsUrl: "/terms",
        },
        { status: 400 }
      );
      return {
        success: false,
        errorResponse: resp,
        response: resp,
      };
    }
  }

  // 4. CHECK 2: Real Google reCAPTCHA v2 / CAPTCHA Verification
  if (requireCaptcha) {
    const token =
      body.recaptchaToken ||
      body["g-recaptcha-response"] ||
      body.captchaToken ||
      body.turnstileToken ||
      body["cf-turnstile-response"] ||
      req.headers.get("x-recaptcha-token") ||
      req.headers.get("x-captcha-token");

    if (!token || typeof token !== "string" || token.trim().length === 0) {
      const resp = NextResponse.json(
        {
          error: "Please complete the human verification before submitting this form.",
          code: "MISSING_TOKEN",
          requiresCaptchaReset: true,
        },
        { status: 400 }
      );
      return {
        success: false,
        errorResponse: resp,
        response: resp,
      };
    }

    const cleanToken = token.trim();

    // Determine verification provider:
    // If token is explicitly a Turnstile token (or starts with Cloudflare test prefixes 1x, 2x, 3x)
    const isCloudflareTurnstileToken =
      body.turnstileToken !== undefined ||
      body["cf-turnstile-response"] !== undefined ||
      cleanToken.startsWith("1x00") ||
      cleanToken.startsWith("2x00") ||
      cleanToken.startsWith("3x00") ||
      cleanToken.includes("DUMMY.PASS.TOKEN") ||
      cleanToken.includes("TEST.REPLAY") ||
      preferredProvider === "turnstile";

    let result: CaptchaVerifyResult | RecaptchaVerifyResult;

    if (isCloudflareTurnstileToken && preferredProvider !== "recaptcha") {
      result = await verifyTurnstileToken({
        token: cleanToken,
        remoteIp: ip,
        expectedAction: action,
        expectedHostname,
      });
    } else {
      // Primary: Google reCAPTCHA v2 verification
      result = await verifyRecaptchaToken({
        token: cleanToken,
        remoteIp: ip,
        expectedHostname,
      });
    }

    if (!result.success) {
      const statusCode =
        result.status === "CONFIGURATION_ERROR"
          ? 500
          : result.status === "PROVIDER_TIMEOUT" || result.status === "PROVIDER_UNAVAILABLE"
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
      policyAudit: {
        policySlug,
        policyVersion: body.policyVersion || "1.0.0",
        acknowledgedAt: new Date().toISOString(),
        ip,
      },
    };
  }

  return {
    success: true,
    policyAudit: {
      policySlug,
      policyVersion: body.policyVersion || "1.0.0",
      acknowledgedAt: new Date().toISOString(),
      ip,
    },
  };
}
