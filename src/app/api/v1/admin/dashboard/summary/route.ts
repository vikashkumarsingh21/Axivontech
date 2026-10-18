import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      // 1. Leads
      totalLeads,
      newLeads,
      uncontactedLeads,
      qualifiedLeads,
      convertedLeads,
      followUpDueCount,
      // 2. Business Partner Applications & Partners
      totalApplications,
      pendingApplications,
      activePartners,
      // 3. Clients & Projects
      totalClients,
      activeProjects,
      completedProjects,
      pendingContracts,
      paymentsAwaitingVerification,
      pendingCommissions,
      // 4. Workforce Metrics
      totalEmployees,
      presentToday,
      openTasks,
      pendingLeaves,
      workReportsToday,
      pendingWorkReportsReview,
      upcomingCompanyHolidaysCount,
      activeAnnouncementsCount,
      // 5. Recent Leads (Real Data)
      recentLeads,
      // 6. Lead Aggregations for Charts
      leadsBySourceRaw,
      leadsByStatusRaw,
      appsByStatusRaw,
      // 7. Recent Activities
      recentLeadActivities,
      recentAuditLogs,
    ] = await Promise.all([
      // 1. Leads
      db.lead.count(),
      db.lead.count({ where: { status: "NEW" } }),
      db.lead.count({ where: { status: "NEW", lastContactAt: null } }),
      db.lead.count({ where: { qualificationStatus: "QUALIFIED" } }),
      db.lead.count({ where: { status: "CONVERTED" } }),
      db.followUp.count({
        where: {
          status: { in: ["UPCOMING", "OVERDUE"] },
          dueAt: { lte: todayEnd },
        },
      }),

      // 2. Business Partner Applications & Partners
      db.businessPartnerApplication.count().catch(() => 0),
      db.businessPartnerApplication.count({
        where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      }).catch(() => 0),
      db.brokerProfile.count({
        where: { user: { status: "ACTIVE" } },
      }).catch(() => 0),

      // 3. Clients & Projects
      db.crmClient.count().catch(() => 0),
      db.partnerProject.count({
        where: { status: { notIn: ["COMPLETED", "DELIVERED", "CANCELLED"] } },
      }).catch(() => 0),
      db.partnerProject.count({
        where: { status: { in: ["COMPLETED", "DELIVERED"] } },
      }).catch(() => 0),
      db.partnerContract.count({
        where: { status: { in: ["SENT", "SIGNED_BY_PARTNER"] } },
      }).catch(() => 0),
      db.partnerPayment.count({
        where: { status: "SUBMITTED" },
      }).catch(() => 0),
      db.commission.count({
        where: { status: "PENDING" },
      }).catch(() => 0),

      // 4. Workforce
      db.user.count({
        where: {
          status: "ACTIVE",
          userRoles: { none: { role: { name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER", "BROKER", "CLIENT"] } } } },
        },
      }),
      db.attendance.count({
        where: { date: { gte: todayStart } },
      }).catch(() => 0),
      db.task.count({
        where: { status: { notIn: ["COMPLETED"] } },
      }).catch(() => 0),
      db.leaveRequest.count({
        where: { status: "PENDING" },
      }).catch(() => 0),
      db.workReport.count({
        where: { date: { gte: todayStart } },
      }).catch(() => 0),
      db.workReport.count({
        where: { status: "SUBMITTED" },
      }).catch(() => 0),
      db.holiday.count({
        where: { date: { gte: todayStart }, isCompanyHoliday: true },
      }).catch(() => 0),
      db.announcement.count({
        where: { status: "PUBLISHED" },
      }).catch(() => 0),

      // 5. Recent Leads (Real Data)
      db.lead.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          leadCode: true,
          name: true,
          email: true,
          phone: true,
          companyName: true,
          serviceInterest: true,
          source: true,
          status: true,
          qualificationStatus: true,
          isDuplicate: true,
          createdAt: true,
          owner: {
            select: {
              name: true,
            },
          },
        },
      }),

      // 6. Chart Groupings
      db.lead.groupBy({
        by: ["source"],
        _count: { id: true },
      }),
      db.lead.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      db.businessPartnerApplication.groupBy({
        by: ["status"],
        _count: { id: true },
      }).catch(() => []),

      // 7. Recent Activities
      db.leadActivity.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          title: true,
          notes: true,
          createdAt: true,
          actor: { select: { name: true } },
          lead: { select: { id: true, leadCode: true, name: true } },
        },
      }).catch(() => []),

      db.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          resource: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }).catch(() => []),
    ]);

    // Format chart distributions
    const leadsBySource = leadsBySourceRaw.map((item) => ({
      name: item.source.replace(/_/g, " "),
      count: item._count.id,
    }));

    const leadsByStatus = leadsByStatusRaw.map((item) => ({
      name: item.status.replace(/_/g, " "),
      count: item._count.id,
    }));

    const applicationsByStatus = (appsByStatusRaw as any[]).map((item) => ({
      name: item.status.replace(/_/g, " "),
      count: item._count.id,
    }));

    // Merge activities
    const combinedActivities = [
      ...recentLeadActivities.map((la: any) => ({
        id: la.id,
        category: "LEAD",
        title: la.title,
        description: la.lead ? `${la.lead.name} (${la.lead.leadCode})` : la.notes || "",
        actor: la.actor?.name || "System",
        createdAt: la.createdAt,
      })),
      ...recentAuditLogs.map((al: any) => ({
        id: al.id,
        category: "SECURITY",
        title: al.action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()),
        description: al.resource,
        actor: al.user?.name || "System",
        createdAt: al.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalLeads,
          newLeads,
          uncontactedLeads,
          qualifiedLeads,
          convertedLeads,
          followUpDueCount,
          totalApplications,
          pendingApplications,
          activePartners,
          totalClients,
          activeProjects,
          completedProjects,
          pendingContracts,
          paymentsAwaitingVerification,
          pendingCommissions,
          totalEmployees,
          presentToday,
          openTasks,
          pendingLeaves,
          workReportsToday,
          pendingWorkReportsReview,
          upcomingCompanyHolidaysCount,
          activeAnnouncementsCount,
        },
        recentLeads,
        charts: {
          leadsBySource,
          leadsByStatus,
          applicationsByStatus,
        },
        recentActivity: combinedActivities,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
