import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isRateLimited, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";

const checkStatusSchema = z.object({
  applicationId: z.string().trim().min(5, "Application ID is required"),
  email: z.string().email("Valid email is required").toLowerCase().trim(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = isRateLimited(`bpa_status:${ip}`, RATE_LIMIT_PRESETS.PUBLIC_LEADS);
    if (rateLimit.limited) {
      throw new ApiError(
        429,
        `Too many status inquiries. Please wait ${Math.ceil(rateLimit.resetMs / 60000)} minutes.`
      );
    }

    const body = await req.json().catch(() => ({}));
    const { applicationId, email } = checkStatusSchema.parse(body);

    const application = await db.businessPartnerApplication.findFirst({
      where: {
        applicationId: { equals: applicationId, mode: "insensitive" },
        email: { equals: email, mode: "insensitive" },
      },
      select: {
        applicationId: true,
        fullName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        emailVerifiedAt: true,
        decisionReason: true,
      },
    });

    if (!application) {
      throw new ApiError(404, "No application found matching the provided Application ID and Email address.");
    }

    // Return safe projection only
    return NextResponse.json({
      success: true,
      application: {
        applicationId: application.applicationId,
        fullName: application.fullName,
        status: application.status,
        emailVerified: Boolean(application.emailVerifiedAt),
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        decisionReason: application.status === "REJECTED" || application.status === "MORE_INFO_REQUESTED"
          ? application.decisionReason
          : null,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
