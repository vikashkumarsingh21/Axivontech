import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBroker, apiSuccess, handleApiError } from "@/lib/api/broker";

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile, session } = await requireBroker(req);
    const userId = session.userId;
    const brokerId = brokerProfile.id;

    // 1. Fetch commissions for monthly analytics
    const commissions = await db.commission.findMany({
      where: { brokerProfileId: brokerId },
      include: {
        partnerProject: { select: { requiredService: true, status: true } },
      },
    });

    // Generate array of last 12 calendar months (YYYY-MM)
    const now = new Date();
    const monthlyMap: Record<string, { month: string; paid: number; eligible: number; count: number }> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = d.toLocaleString("default", { month: "short", year: "numeric" });
      monthlyMap[key] = { month: monthLabel, paid: 0, eligible: 0, count: 0 };
    }

    const serviceTypeMap: Record<string, { serviceType: string; count: number; totalEarned: number }> = {};

    for (const c of commissions) {
      const dateToUse = c.paidAt || c.eligibleAt || c.createdAt;
      const d = new Date(dateToUse);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      if (monthlyMap[key]) {
        if (c.status === "PAID") {
          monthlyMap[key].paid += c.commissionAmount;
        } else if (c.status === "ELIGIBLE") {
          monthlyMap[key].eligible += c.commissionAmount;
        }
        monthlyMap[key].count++;
      }

      // Track service types
      const sType = c.partnerProject?.requiredService || "CUSTOM_DEVELOPMENT";

      if (!serviceTypeMap[sType]) {
        serviceTypeMap[sType] = { serviceType: sType, count: 0, totalEarned: 0 };
      }
      serviceTypeMap[sType].count++;
      if (c.status === "PAID") {
        serviceTypeMap[sType].totalEarned += c.commissionAmount;
      }
    }

    // 2. Compute Conversion Funnel
    const [leadsCount, qualifiedLeadsCount, totalProjects, confirmedProjects, completedProjects] =
      await Promise.all([
        db.lead.count({
          where: { ownerId: userId },
        }),
        db.lead.count({
          where: {
            ownerId: userId,
            status: { in: ["QUALIFIED", "PROPOSAL_SENT", "CONVERTED"] },
          },
        }),
        db.partnerProject.count({
          where: { brokerProfileId: brokerId },
        }),
        db.partnerProject.count({
          where: {
            brokerProfileId: brokerId,
            status: { in: ["PROJECT_CONFIRMED", "IN_PROGRESS", "DELIVERED", "COMPLETED"] },
          },
        }),
        db.partnerProject.count({
          where: {
            brokerProfileId: brokerId,
            status: "COMPLETED",
          },
        }),
      ]);

    const funnel = [
      { step: "LEADS_CAPTURED", label: "Leads Captured", count: leadsCount, percentage: 100 },
      {
        step: "LEADS_QUALIFIED",
        label: "Qualified Leads",
        count: qualifiedLeadsCount,
        percentage: leadsCount > 0 ? Math.round((qualifiedLeadsCount / leadsCount) * 100) : 0,
      },
      {
        step: "PROJECTS_SUBMITTED",
        label: "Projects Submitted",
        count: totalProjects,
        percentage: leadsCount > 0 ? Math.round((totalProjects / leadsCount) * 100) : 0,
      },
      {
        step: "PROJECTS_CONFIRMED",
        label: "Projects Confirmed",
        count: confirmedProjects,
        percentage: totalProjects > 0 ? Math.round((confirmedProjects / totalProjects) * 100) : 0,
      },
      {
        step: "PROJECTS_COMPLETED",
        label: "Completed & Settled",
        count: completedProjects,
        percentage: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
      },
    ];

    const topServices = Object.values(serviceTypeMap).sort((a, b) => b.totalEarned - a.totalEarned);

    return apiSuccess({
      monthlyEarnings: Object.values(monthlyMap),
      funnel,
      topServices,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
