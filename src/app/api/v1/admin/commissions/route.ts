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

    const now = Date.now();
    const enriched = commissions.map((c) => {
      let slaStatus: "HEALTHY" | "WARNING" | "BREACHED" | "SETTLED" | "N_A" = "N_A";
      let hoursRemaining: number | null = null;
      let hoursElapsed: number | null = null;

      if (c.status === "PAID") {
        slaStatus = "SETTLED";
      } else if (c.status === "REQUESTED" || c.status === "PROCESSING" || c.status === "APPROVED") {
        if (c.payoutRequestedAt) {
          hoursElapsed = Math.max(0, Math.round((now - new Date(c.payoutRequestedAt).getTime()) / (1000 * 60 * 60)));
        }
        if (c.payoutDueAt) {
          const diffMs = new Date(c.payoutDueAt).getTime() - now;
          hoursRemaining = Math.round(diffMs / (1000 * 60 * 60));
          if (diffMs < 0) {
            slaStatus = "BREACHED";
          } else if (diffMs <= 24 * 60 * 60 * 1000) {
            slaStatus = "WARNING";
          } else {
            slaStatus = "HEALTHY";
          }
        }
      }

      return {
        ...c,
        slaStatus,
        hoursRemaining,
        hoursElapsed,
      };
    });

    return NextResponse.json({ data: enriched });
  } catch (error) {
    return handleApiError(error);
  }
}
