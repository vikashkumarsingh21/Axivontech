import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { checkRateLimit } from "@/lib/api/broker";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    checkRateLimit(`referral_val:${ip}`, 30, 60);

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim();

    if (!code) {
      throw new ApiError(400, "Referral code is required.", undefined, "MISSING_CODE");
    }

    const brokerProfile = await db.brokerProfile.findUnique({
      where: { referralCode: code },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!brokerProfile || !brokerProfile.user) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: {
            code: "REFERRAL_CODE_NOT_FOUND",
            message: "The referral link provided is invalid or does not exist.",
          },
          message: "Invalid referral code.",
        },
        { status: 404 }
      );
    }

    if (brokerProfile.user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: {
            code: "REFERRAL_CODE_INACTIVE",
            message: "This partner referral link is currently inactive or suspended.",
          },
          message: "Inactive referral link.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        referralCode: brokerProfile.referralCode,
        partnerName: brokerProfile.user.name,
        companyName: brokerProfile.companyName || null,
        city: brokerProfile.city || null,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
