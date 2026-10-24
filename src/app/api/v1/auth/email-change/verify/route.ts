import { NextRequest, NextResponse } from "next/server";
import {
  verifyEmailChange,
  hashVerificationToken,
  verifyEmailChangeSchema,
} from "@/lib/services/profile-settings.service";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = verifyEmailChangeSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const result = await verifyEmailChange(token, {
      ipAddress,
      userAgent,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      throw new ApiError(400, "Verification token parameter is required.");
    }

    const tokenHash = hashVerificationToken(token.trim());

    const request = await db.emailChangeRequest.findUnique({
      where: { tokenHash },
      select: {
        status: true,
        newEmail: true,
        expiresAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!request || request.status !== "PENDING") {
      return NextResponse.json({
        valid: false,
        error: "This verification link is invalid or has already been used.",
      });
    }

    if (new Date() > request.expiresAt) {
      return NextResponse.json({
        valid: false,
        error: "This verification link has expired. Please submit a new request.",
      });
    }

    return NextResponse.json({
      valid: true,
      newEmail: request.newEmail,
      userName: request.user.name,
      expiresAt: request.expiresAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
