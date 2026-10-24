import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import {
  requireBroker,
  apiSuccess,
  checkRateLimit,
  logBrokerAudit,
} from "@/lib/api/broker";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { brokerProfile, brokerId, user } = await requireBroker(req);

    checkRateLimit(`broker_referral_gen:${brokerId}`, 10, 60);

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://axivontech.in";

    // 1. Idempotency Check: If referral code already exists, return cleanly (200 OK)
    if (brokerProfile.referralCode) {
      const referralCode = brokerProfile.referralCode;
      return apiSuccess({
        referralCode,
        generated: false,
        leadUrl: `${baseUrl}/lead/${referralCode}`,
        projectUrl: `${baseUrl}/project/start/${referralCode}`,
        shareTemplates: {
          whatsapp: `Hi! Submit your project requirement or software consultation directly to Axivon Technologies via my verified Partner Link: ${baseUrl}/lead/${referralCode}`,
          emailSubject: "Invitation: Start Your Tech Project with Axivon Technologies",
          emailBody: `Hello,\n\nI invite you to submit your software engineering requirements directly to Axivon Technologies using my official partner referral link:\n\n${baseUrl}/project/start/${referralCode}\n\nOur executive team will review your proposal promptly.\n\nBest regards,\n${user.name}`,
        },
      });
    }

    // 2. Generate unique referral code
    const safeName =
      (user.name || "BRK")
        .split(" ")[0]
        .replace(/[^A-Za-z0-9]/g, "")
        .substring(0, 5)
        .toUpperCase() || "BRK";

    let isUnique = false;
    let newCode = "";

    while (!isUnique) {
      const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
      newCode = `AXP-${safeName}-${randomPart}`;

      const existing = await db.brokerProfile.findUnique({
        where: { referralCode: newCode },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    const updatedProfile = await db.$transaction(async (tx) => {
      const profile = await tx.brokerProfile.update({
        where: { id: brokerProfile.id },
        data: { referralCode: newCode },
      });

      return profile;
    });

    await logBrokerAudit({
      userId: brokerId,
      action: "REFERRAL_CODE_GENERATED",
      resource: "BrokerProfile",
      details: { referralCode: newCode },
    });

    return apiSuccess({
      referralCode: updatedProfile.referralCode,
      generated: true,
      leadUrl: `${baseUrl}/lead/${updatedProfile.referralCode}`,
      projectUrl: `${baseUrl}/project/start/${updatedProfile.referralCode}`,
      shareTemplates: {
        whatsapp: `Hi! Submit your project requirement or software consultation directly to Axivon Technologies via my verified Partner Link: ${baseUrl}/lead/${updatedProfile.referralCode}`,
        emailSubject: "Invitation: Start Your Tech Project with Axivon Technologies",
        emailBody: `Hello,\n\nI invite you to submit your software engineering requirements directly to Axivon Technologies using my official partner referral link:\n\n${baseUrl}/project/start/${updatedProfile.referralCode}\n\nOur executive team will review your proposal promptly.\n\nBest regards,\n${user.name}`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
