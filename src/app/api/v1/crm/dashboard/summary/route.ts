import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.dashboard.view");

    const now = new Date();

    const [
      totalLeads,
      newLeads,
      qualifiedLeads,
      openOpportunities,
      pipelineValueAgg,
      wonDealsAgg,
      lostDealsCount,
      pendingFollowupsCount,
      overdueFollowupsCount,
      recentLeads,
      stageBreakdown,
    ] = await Promise.all([
      db.lead.count(),
      db.lead.count({ where: { status: "NEW" } }),
      db.lead.count({ where: { qualificationStatus: "QUALIFIED" } }),
      db.opportunity.count({ where: { stage: { notIn: ["WON", "LOST"] } } }),
      db.opportunity.aggregate({
        where: { stage: { notIn: ["WON", "LOST"] } },
        _sum: { value: true },
      }),
      db.opportunity.aggregate({
        where: { stage: "WON" },
        _sum: { value: true },
        _count: { id: true },
      }),
      db.opportunity.count({ where: { stage: "LOST" } }),
      db.followUp.count({ where: { status: "UPCOMING", dueAt: { gte: now } } }),
      db.followUp.count({ where: { OR: [{ status: "OVERDUE" }, { status: "UPCOMING", dueAt: { lt: now } }] } }),
      db.lead.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, leadCode: true, name: true, companyName: true, status: true, source: true, createdAt: true },
      }),
      db.opportunity.groupBy({
        by: ["stage"],
        _count: { id: true },
        _sum: { value: true },
      }),
    ]);

    const pipelineValue = pipelineValueAgg._sum.value || 0;
    const wonValue = wonDealsAgg._sum.value || 0;
    const wonCount = wonDealsAgg._count.id || 0;
    const closedCount = wonCount + lostDealsCount;
    const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;
    const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;

    // Weighted pipeline calculation
    const stages = await db.pipelineStage.findMany();
    const stageProbMap = new Map(stages.map((s) => [s.key, s.probability]));

    let weightedPipeline = 0;
    stageBreakdown.forEach((group) => {
      if (group.stage !== "WON" && group.stage !== "LOST") {
        const prob = stageProbMap.get(group.stage) || 50;
        const val = group._sum.value || 0;
        weightedPipeline += (val * prob) / 100;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        qualifiedLeads,
        openOpportunities,
        pipelineValue,
        weightedPipeline: Math.round(weightedPipeline),
        wonDealsCount: wonCount,
        wonDealsValue: wonValue,
        lostDealsCount,
        winRate,
        conversionRate,
        pendingFollowupsCount,
        overdueFollowupsCount,
        recentLeads,
        stageBreakdown: stageBreakdown.map((s) => ({
          stage: s.stage,
          count: s._count.id,
          value: s._sum.value || 0,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
