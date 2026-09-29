import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const brokerId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!brokerId || role !== "BROKER") {
      throw new ApiError(403, "Forbidden. Only Brokers can generate a referral code.");
    }

    const brokerProfile = await db.brokerProfile.findUnique({
      where: { userId: brokerId },
    });

    if (!brokerProfile) {
      throw new ApiError(404, "Broker profile not found.");
    }

    if (brokerProfile.referralCode) {
      throw new ApiError(400, "Referral code already exists. It cannot be regenerated.");
    }

    // Generate unique referral code
    let isUnique = false;
    let newCode = "";
    
    // Loop to ensure uniqueness, though collision is highly unlikely
    while (!isUnique) {
      const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars
      newCode = `AXV-BRK-${randomPart}`;

      const existing = await db.brokerProfile.findUnique({
        where: { referralCode: newCode },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    const updatedProfile = await db.$transaction(async (tx) => {
      const profile = await tx.brokerProfile.update({
        where: { userId: brokerId },
        data: { referralCode: newCode },
      });

      await tx.auditLog.create({
        data: {
          userId: brokerId,
          action: "REFERRAL_CODE_GENERATED",
          resource: "BrokerProfile",
          details: {
            referralCode: newCode,
          },
        },
      });

      return profile;
    });

    return NextResponse.json(
      { data: { referralCode: updatedProfile.referralCode } },
      { status: 200 }
    );
  } catch (error: any) {
    return handleApiError(error);
  }
}
