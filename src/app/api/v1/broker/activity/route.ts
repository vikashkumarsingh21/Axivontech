import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBroker, getBrokerPagination, apiSuccess, handleApiError } from "@/lib/api/broker";

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile, session } = await requireBroker(req);
    const { page, limit, skip } = getBrokerPagination(req);
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category"); // LEADS, PROJECTS, PAYMENTS, COMMISSIONS, ALL

    // Build resource filter if category specified
    const resourceFilter: Record<string, string[]> = {
      LEADS: ["Lead"],
      PROJECTS: ["PartnerProject", "PartnerContract"],
      PAYMENTS: ["PartnerPayment"],
      COMMISSIONS: ["Commission"],
    };

    const where: any = {
      userId: session.userId,
    };

    if (category && category !== "ALL" && resourceFilter[category]) {
      where.resource = { in: resourceFilter[category] };
    }

    const [activities, totalCount] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    const formattedTimeline = activities.map((act) => {
      let icon = "activity";
      let title = act.action.replace(/_/g, " ").toLowerCase();
      title = title.charAt(0).toUpperCase() + title.slice(1);

      if (act.resource === "PartnerProject") icon = "briefcase";
      else if (act.resource === "PartnerContract") icon = "file-text";
      else if (act.resource === "PartnerPayment") icon = "credit-card";
      else if (act.resource === "Commission") icon = "dollar-sign";
      else if (act.resource === "Lead") icon = "user-plus";

      return {
        id: act.id,
        action: act.action,
        resource: act.resource,
        title,
        icon,
        details: act.details,
        createdAt: act.createdAt,
      };
    });

    return apiSuccess({
      timeline: formattedTimeline,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
