import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const brokerId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    if (!brokerId || role !== "BROKER") throw new ApiError(403, "Access denied.");

    const brokerProfile = await db.brokerProfile.findUnique({ where: { userId: brokerId } });
    if (!brokerProfile) throw new ApiError(404, "Broker profile not found.");

    const commissions = await db.commission.findMany({
      where: { brokerProfileId: brokerProfile.id },
      select: {
        id: true,
        partnerProjectId: true,
        projectValue: true,
        commissionType: true,
        commissionRate: true,
        commissionAmount: true,
        currency: true,
        status: true,
        eligibleAt: true,
        approvedAt: true,
        paidAt: true,
        payoutReference: true,
        createdAt: true,
        updatedAt: true,
        partnerProject: { select: { projectCode: true, projectName: true } },
        commissionRule: { select: { name: true, type: true, value: true } },
      },
      orderBy: { createdAt: "desc" }
    });

    // Calculate stats
    const stats = {
      total: commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
      pending: commissions.filter(c => c.status === "PENDING" || c.status === "ELIGIBLE").reduce((sum, c) => sum + c.commissionAmount, 0),
      approved: commissions.filter(c => c.status === "APPROVED").reduce((sum, c) => sum + c.commissionAmount, 0),
      paid: commissions.filter(c => c.status === "PAID").reduce((sum, c) => sum + c.commissionAmount, 0),
    };

    return NextResponse.json({ data: commissions, stats });
  } catch (error) {
    return handleApiError(error);
  }
}
