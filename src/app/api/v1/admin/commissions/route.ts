import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const url = new URL(req.url);
    const brokerId = url.searchParams.get("brokerId");
    const status = url.searchParams.get("status");

    const where: any = {};
    if (brokerId) where.brokerProfileId = brokerId;
    if (status) where.status = status;

    const commissions = await db.commission.findMany({
      where,
      include: {
        partnerProject: { select: { projectCode: true, projectName: true } },
        brokerProfile: { select: { user: { select: { name: true, email: true } } } },
        commissionRule: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ data: commissions });
  } catch (error) {
    return handleApiError(error);
  }
}
