import { NextRequest, NextResponse } from "next/server";
import { getCaptchaMetrics, getTurnstileSiteKey, getTurnstileSecretKey } from "@/lib/captcha";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    // Verify admin access
    await requirePermission(userId, "admin:access");

    const siteKey = getTurnstileSiteKey();
    const secretInfo = getTurnstileSecretKey();
    const metrics = getCaptchaMetrics();

    // Mask secret key safely (only show prefix/suffix or indicate status)
    let secretStatus = "NOT_CONFIGURED";
    let maskedSecret = "None";
    if (secretInfo.isConfigured && secretInfo.secretKey) {
      if (secretInfo.isTestKey) {
        secretStatus = "TEST_KEY_DEVELOPMENT";
        maskedSecret = secretInfo.secretKey.substring(0, 6) + "..." + secretInfo.secretKey.substring(secretInfo.secretKey.length - 4);
      } else {
        secretStatus = "CONFIGURED_PRODUCTION";
        maskedSecret = secretInfo.secretKey.substring(0, 4) + "..." + secretInfo.secretKey.substring(secretInfo.secretKey.length - 4);
      }
    }

    const protectedEndpoints = [
      {
        name: "Public Project Inquiries & Leads",
        route: "POST /api/v1/public/leads",
        action: "lead_generation",
        layers: ["Turnstile Managed", "Honeypot Trap", "Rate Limit (Leads)", "Replay Cache"],
        status: "ACTIVE",
      },
      {
        name: "Direct Contact Form",
        route: "POST /api/contact",
        action: "contact_inquiry",
        layers: ["Turnstile Managed", "Honeypot Trap", "Rate Limit (Contact)", "Replay Cache"],
        status: "ACTIVE",
      },
      {
        name: "Career Internship & Job Applications",
        route: "POST /api/careers",
        action: "career_application",
        layers: ["Turnstile Managed", "Honeypot Trap", "Rate Limit (Careers)", "Replay Cache"],
        status: "ACTIVE",
      },
      {
        name: "Resume File Uploads",
        route: "POST /api/v1/public/careers/upload-resume",
        action: "resume_upload",
        layers: ["Turnstile Managed", "MIME Validation", "Size Limit (10MB)", "Rate Limit"],
        status: "ACTIVE",
      },
      {
        name: "Business Partner & Broker Applications",
        route: "POST /api/v1/public/business-partner/applications",
        action: "partner_application",
        layers: ["Turnstile Managed", "Honeypot Trap", "Rate Limit (Partner)", "Replay Cache"],
        status: "ACTIVE",
      },
      {
        name: "Client Testimonials & Reviews",
        route: "POST /api/v1/public/reviews",
        action: "review_submission",
        layers: ["Turnstile Managed", "Honeypot Trap", "Rate Limit (Reviews)", "Replay Cache"],
        status: "ACTIVE",
      },
      {
        name: "Broker Project Request Onboarding",
        route: "POST /api/v1/public/project-requests",
        action: "project_request",
        layers: ["Turnstile Managed", "Honeypot Trap", "Referral Validation", "Replay Cache"],
        status: "ACTIVE",
      },
      {
        name: "AXIVON ONE Portal Authentication",
        route: "POST /api/v1/auth/login",
        action: "auth_login",
        layers: ["Turnstile Managed", "Honeypot Trap", "Strict Rate Limit (5/15min)", "Replay Cache"],
        status: "ACTIVE",
      },
      {
        name: "Employee Self-Service Password Reset",
        route: "POST /api/v1/employee/profile/password",
        action: "change_password",
        layers: ["Turnstile Managed", "Honeypot Trap", "Session Validation", "Replay Cache"],
        status: "ACTIVE",
      },
      {
        name: "Website AI Chatbot Lead Capture",
        route: "POST /api/v1/public/leads",
        action: "chatbot_lead",
        layers: ["Turnstile Compact", "Honeypot Trap", "Lead Qualification", "Replay Cache"],
        status: "ACTIVE",
      },
    ];

    return NextResponse.json({
      success: true,
      provider: "Cloudflare Turnstile",
      mode: "Managed",
      siteKey: siteKey.siteKey,
      secretStatus,
      maskedSecret,
      environment: process.env.NODE_ENV || "development",
      failClosedInProduction: true,
      metrics,
      protectedEndpoints,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
