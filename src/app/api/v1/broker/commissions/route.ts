import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBroker, getBrokerPagination, apiSuccess, handleApiError } from "@/lib/api/broker";

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile } = await requireBroker(req);
    const { page, limit, skip } = getBrokerPagination(req);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    // 1. Fetch all commissions for this broker to compute accurate overall summary stats
    const allBrokerCommissions = await db.commission.findMany({
      where: { brokerProfileId: brokerProfile.id },
      select: {
        id: true,
        commissionAmount: true,
        status: true,
        paidAt: true,
        eligibleAt: true,
        createdAt: true,
      },
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let totalEarned = 0;
    let pendingAmount = 0;
    let eligibleAmount = 0;
    let requestedAmount = 0;
    let processingAmount = 0;
    let paidAmount = 0;
    let thisMonthEarned = 0;

    for (const c of allBrokerCommissions) {
      const amt = c.commissionAmount || 0;
      if (c.status === "PAID") {
        totalEarned += amt;
        paidAmount += amt;

        if (c.paidAt) {
          const pDate = new Date(c.paidAt);
          if (pDate.getFullYear() === currentYear && pDate.getMonth() === currentMonth) {
            thisMonthEarned += amt;
          }
        }
      } else if (c.status === "PENDING") {
        pendingAmount += amt;
      } else if (c.status === "ELIGIBLE") {
        eligibleAmount += amt;
      } else if (c.status === "REQUESTED") {
        requestedAmount += amt;
      } else if (c.status === "PROCESSING" || c.status === "APPROVED") {
        processingAmount += amt;
      }
    }

    const summary = {
      totalEarned,
      pending: pendingAmount,
      eligible: eligibleAmount,
      requested: requestedAmount,
      processing: processingAmount,
      paid: paidAmount,
      thisMonth: thisMonthEarned,
      totalCommissionsCount: allBrokerCommissions.length,
    };

    // 2. Build filtered where clause for paginated list
    const where: any = {
      brokerProfileId: brokerProfile.id,
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.partnerProject = {
        OR: [
          { projectCode: { contains: search, mode: "insensitive" } },
          { projectName: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [commissions, filteredCount] = await Promise.all([
      db.commission.findMany({
        where,
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
          payoutRequestedAt: true,
          payoutDueAt: true,
          payoutMethod: true,
          payoutDetails: true,
          payoutNotes: true,
          rejectionReason: true,
          createdAt: true,
          updatedAt: true,
          partnerProject: {
            select: {
              projectCode: true,
              projectName: true,
              status: true,
            },
          },
          commissionRule: {
            select: {
              name: true,
              type: true,
              value: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.commission.count({ where }),
    ]);

    return apiSuccess({
      commissions,
      summary,
      pagination: {
        page,
        limit,
        total: filteredCount,
        totalPages: Math.ceil(filteredCount / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
