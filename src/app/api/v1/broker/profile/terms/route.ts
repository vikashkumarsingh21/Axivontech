import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  requireBroker,
  apiSuccess,
  logBrokerAudit,
} from "@/lib/api/broker";
import { z } from "zod";

const termsSchema = z.object({
  version: z.string().optional().default("1.0.0"),
  termsVersion: z.string().optional(),
  accepted: z.boolean().optional(),
  agreed: z.boolean().optional(),
}).refine((data) => data.accepted === true || data.agreed === true, {
  message: "You must accept the partner terms to proceed.",
});

export async function POST(req: NextRequest) {
  try {
    const { brokerProfile, brokerId } = await requireBroker(req);

    const body = await req.json().catch(() => ({}));
    const { version } = termsSchema.parse(body);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const acceptedAt = new Date().toISOString();

    const settingKey = `broker_ext:${brokerProfile.id}`;
    const existing = await db.organizationSetting.findUnique({
      where: { key: settingKey },
    });
    const currentVal = (existing?.value as Record<string, any>) || {};

    const updatedVal = {
      ...currentVal,
      termsAccepted: true,
      termsVersion: version,
      termsAcceptedAt: acceptedAt,
      termsAcceptedIp: ip,
    };

    await db.organizationSetting.upsert({
      where: { key: settingKey },
      update: {
        value: updatedVal as any,
        updatedById: brokerId,
      },
      create: {
        key: settingKey,
        value: updatedVal as any,
        updatedById: brokerId,
      },
    });

    await logBrokerAudit({
      userId: brokerId,
      action: "BROKER_TERMS_ACCEPTED",
      resource: `BrokerProfile:${brokerProfile.id}`,
      details: { version, ip, acceptedAt },
    });

    return apiSuccess({
      termsAccepted: true,
      version,
      acceptedAt,
      message: "Partner terms accepted successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
