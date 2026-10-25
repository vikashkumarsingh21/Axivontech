import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

const kycReviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(1000).optional(),
});

export async function POST(
  req: Request,
  props: { params: Promise<{ [key: string]: string }> }
) {
  const params = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:write");

    const identifier = params.id;
    const body = await req.json().catch(() => ({}));
    const { action, reason } = kycReviewSchema.parse(body);

    const brokerUser = await db.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { brokerProfile: { id: identifier } },
          { brokerProfile: { partnerId: identifier } },
        ],
        userRoles: { some: { role: { name: { in: ["BUSINESS_PARTNER", "BROKER"] } } } },
      },
      include: { brokerProfile: true },
    });

    if (!brokerUser || !brokerUser.brokerProfile) {
      throw new ApiError(404, "Broker not found.");
    }

    const brokerProfile = brokerUser.brokerProfile;
    const extKey = `broker_ext:${brokerProfile.id}`;

    const setting = await db.organizationSetting.findUnique({ where: { key: extKey } });
    const extData = (setting?.value as Record<string, any>) || {};

    const adminUser = await db.user.findUnique({
      where: { id: adminId },
      select: { name: true, email: true },
    });

    const isApprove = action === "approve";
    const kycStatus = isApprove ? "VERIFIED" : "REJECTED";
    const kycRemarks = reason || (isApprove ? "KYC and payout details approved by administration." : "KYC details rejected. Please verify your tax documents and bank account.");

    extData.kycStatus = kycStatus;
    extData.kycRemarks = kycRemarks;
    extData.kycVerifiedAt = new Date().toISOString();
    extData.kycVerifiedBy = adminUser?.name || adminUser?.email || "Admin";

    await db.organizationSetting.upsert({
      where: { key: extKey },
      update: { value: extData, updatedById: adminId },
      create: { key: extKey, value: extData, updatedById: adminId },
    });

    // Notify broker
    await db.notification.create({
      data: {
        userId: brokerUser.id,
        type: "SYSTEM",
        title: isApprove ? "KYC Verified" : "KYC Action Required",
        message: kycRemarks,
        link: isApprove ? "/broker/dashboard" : "/broker/profile",
      },
    }).catch(() => null);

    // Audit log
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: isApprove ? "BROKER_KYC_APPROVED" : "BROKER_KYC_REJECTED",
        resource: `BrokerProfile:${brokerProfile.id}`,
        details: {
          partnerId: brokerProfile.partnerId,
          kycStatus,
          remarks: kycRemarks,
        },
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      data: {
        kycStatus,
        kycRemarks,
        verifiedAt: extData.kycVerifiedAt,
        verifiedBy: extData.kycVerifiedBy,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
