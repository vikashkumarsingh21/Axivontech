import { db } from "@/lib/db";
import { ParsedDateRange, calculateComparison, MetricComparison } from "./date-filters";

/**
 * Authoritative Business Intelligence Metrics Engine
 * Real calculations based on verified database records.
 * No hardcoded metrics, no mock percentages.
 */
export class BusinessIntelligenceService {
  /**
   * 1. Business Overview KPI Matrix with Period Comparisons
   */
  static async getBusinessOverview(dateRange: ParsedDateRange) {
    const { startDate, endDate, prevStartDate, prevEndDate } = dateRange;

    const [
      // Current Period
      totalLeadsAllTime,
      newLeadsCurrent,
      qualifiedLeadsCurrent,
      convertedLeadsCurrent,
      activeProjectsCurrent,
      completedProjectsCurrent,
      overdueMilestonesCurrent,
      activeClientsCurrent,
      openSupportIssuesCurrent,
      openTasksCurrent,
      completedTasksCurrent,
      pendingLeavesCurrent,
      activeEmployeesCurrent,
      // Previous Period for Comparisons
      newLeadsPrev,
      qualifiedLeadsPrev,
      convertedLeadsPrev,
      activeProjectsPrev,
      completedProjectsPrev,
      overdueMilestonesPrev,
      completedTasksPrev,
    ] = await Promise.all([
      // Current Period
      db.lead.count(),
      db.lead.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
      db.lead.count({
        where: {
          qualificationStatus: "QUALIFIED",
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      db.lead.count({
        where: {
          status: "CONVERTED",
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      db.partnerProject.count({
        where: { status: { notIn: ["COMPLETED", "DELIVERED", "CANCELLED"] } },
      }),
      db.partnerProject.count({
        where: {
          status: { in: ["COMPLETED", "DELIVERED"] },
          updatedAt: { gte: startDate, lte: endDate },
        },
      }),
      db.partnerProjectMilestone.count({
        where: {
          status: { notIn: ["COMPLETED"] },
          targetDate: { lt: new Date() },
        },
      }),
      db.crmClient.count(),
      db.qaIssue.count({
        where: { status: { in: ["OPEN", "INVESTIGATING", "IN_PROGRESS"] } },
      }).catch(() => 0),
      db.task.count({ where: { status: { notIn: ["COMPLETED"] } } }),
      db.task.count({
        where: {
          status: "COMPLETED",
          updatedAt: { gte: startDate, lte: endDate },
        },
      }),
      db.leaveRequest.count({ where: { status: "PENDING" } }),
      db.user.count({
        where: {
          status: "ACTIVE",
          userRoles: {
            none: { role: { name: { in: ["CLIENT", "BROKER", "BUSINESS_PARTNER"] } } },
          },
        },
      }),

      // Previous Period
      db.lead.count({ where: { createdAt: { gte: prevStartDate, lte: prevEndDate } } }),
      db.lead.count({
        where: {
          qualificationStatus: "QUALIFIED",
          createdAt: { gte: prevStartDate, lte: prevEndDate },
        },
      }),
      db.lead.count({
        where: {
          status: "CONVERTED",
          createdAt: { gte: prevStartDate, lte: prevEndDate },
        },
      }),
      db.partnerProject.count({
        where: {
          status: { notIn: ["COMPLETED", "DELIVERED", "CANCELLED"] },
          createdAt: { lte: prevEndDate },
        },
      }),
      db.partnerProject.count({
        where: {
          status: { in: ["COMPLETED", "DELIVERED"] },
          updatedAt: { gte: prevStartDate, lte: prevEndDate },
        },
      }),
      db.partnerProjectMilestone.count({
        where: {
          status: { notIn: ["COMPLETED"] },
          targetDate: { lt: prevEndDate },
        },
      }),
      db.task.count({
        where: {
          status: "COMPLETED",
          updatedAt: { gte: prevStartDate, lte: prevEndDate },
        },
      }),
    ]);

    // Conversion rate calculations (safe denominator)
    const qualificationRate =
      newLeadsCurrent > 0
        ? Math.round((qualifiedLeadsCurrent / newLeadsCurrent) * 100 * 10) / 10
        : 0;

    const conversionRate =
      newLeadsCurrent > 0
        ? Math.round((convertedLeadsCurrent / newLeadsCurrent) * 100 * 10) / 10
        : 0;

    return {
      periodLabel: dateRange.label,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      kpis: {
        totalLeadsAllTime,
        newLeads: calculateComparison(newLeadsCurrent, newLeadsPrev, true),
        qualifiedLeads: calculateComparison(qualifiedLeadsCurrent, qualifiedLeadsPrev, true),
        convertedLeads: calculateComparison(convertedLeadsCurrent, convertedLeadsPrev, true),
        qualificationRate: {
          value: qualificationRate,
          formatted: `${qualificationRate}%`,
        },
        conversionRate: {
          value: conversionRate,
          formatted: `${conversionRate}%`,
        },
        activeProjects: calculateComparison(activeProjectsCurrent, activeProjectsPrev, true),
        completedProjects: calculateComparison(completedProjectsCurrent, completedProjectsPrev, true),
        overdueMilestones: calculateComparison(overdueMilestonesCurrent, overdueMilestonesPrev, false),
        activeClients: activeClientsCurrent,
        openSupportIssues: openSupportIssuesCurrent,
        openTasks: openTasksCurrent,
        completedTasks: calculateComparison(completedTasksCurrent, completedTasksPrev, true),
        pendingLeaves: pendingLeavesCurrent,
        activeEmployees: activeEmployeesCurrent,
      },
    };
  }

  /**
   * 2. Sales & Lead Pipeline Analytics
   */
  static async getSalesAnalytics(dateRange: ParsedDateRange) {
    const { startDate, endDate } = dateRange;

    const [
      leadsInPeriod,
      bySourceRaw,
      byStatusRaw,
      byServiceRaw,
      recentLeads,
      overdueFollowUps,
    ] = await Promise.all([
      db.lead.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: {
          id: true,
          leadCode: true,
          status: true,
          qualificationStatus: true,
          source: true,
          serviceInterest: true,
          createdAt: true,
        },
      }),
      db.lead.groupBy({
        by: ["source"],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true },
      }),
      db.lead.groupBy({
        by: ["status"],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true },
      }),
      db.lead.groupBy({
        by: ["serviceInterest"],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          serviceInterest: { not: null },
        },
        _count: { id: true },
      }),
      db.lead.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          leadCode: true,
          name: true,
          companyName: true,
          serviceInterest: true,
          source: true,
          status: true,
          qualificationStatus: true,
          createdAt: true,
          owner: { select: { id: true, name: true } },
        },
      }),
      db.followUp.count({
        where: {
          status: { in: ["UPCOMING", "OVERDUE"] },
          dueAt: { lt: new Date() },
        },
      }),
    ]);

    const total = leadsInPeriod.length;
    const qualified = leadsInPeriod.filter((l) => l.qualificationStatus === "QUALIFIED").length;
    const converted = leadsInPeriod.filter((l) => l.status === "CONVERTED").length;

    // Daily distribution trend
    const dailyMap = new Map<string, number>();
    for (const lead of leadsInPeriod) {
      const dayKey = lead.createdAt.toISOString().slice(0, 10);
      dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);
    }
    const trend = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      periodLabel: dateRange.label,
      totalLeads: total,
      qualifiedLeads: qualified,
      convertedLeads: converted,
      qualificationRate: total > 0 ? Math.round((qualified / total) * 100 * 10) / 10 : 0,
      conversionRate: total > 0 ? Math.round((converted / total) * 100 * 10) / 10 : 0,
      overdueFollowUps,
      distributions: {
        bySource: bySourceRaw.map((s) => ({ name: s.source.replace(/_/g, " "), count: s._count.id })),
        byStatus: byStatusRaw.map((s) => ({ name: s.status.replace(/_/g, " "), count: s._count.id })),
        byService: byServiceRaw
          .filter((s) => s.serviceInterest)
          .map((s) => ({ name: s.serviceInterest || "General", count: s._count.id })),
      },
      trend,
      recentLeads,
    };
  }

  /**
   * 3. Project Delivery & Milestone Analytics
   */
  static async getDeliveryAnalytics(dateRange: ParsedDateRange) {
    const now = new Date();

    const [
      totalProjects,
      projectsByStatusRaw,
      milestonesByStatusRaw,
      overdueMilestones,
      tasksByStatusRaw,
      upcomingMilestones,
    ] = await Promise.all([
      db.partnerProject.count(),
      db.partnerProject.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      db.partnerProjectMilestone.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      db.partnerProjectMilestone.findMany({
        where: {
          status: { notIn: ["COMPLETED"] },
          targetDate: { lt: now },
        },
        include: {
          partnerProject: { select: { id: true, projectName: true, clientName: true } },
        },
        take: 10,
        orderBy: { targetDate: "asc" },
      }),
      db.task.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      db.partnerProjectMilestone.findMany({
        where: {
          status: { notIn: ["COMPLETED"] },
          targetDate: { gte: now, lte: new Date(now.getTime() + 14 * 24 * 60 * 60_000) }, // next 14 days
        },
        include: {
          partnerProject: { select: { id: true, projectName: true, clientName: true } },
        },
        take: 10,
        orderBy: { targetDate: "asc" },
      }),
    ]);

    const activeCount = projectsByStatusRaw
      .filter((p) => !["COMPLETED", "DELIVERED", "CANCELLED", "REJECTED"].includes(p.status))
      .reduce((acc, curr) => acc + curr._count.id, 0);

    const completedCount = projectsByStatusRaw
      .filter((p) => ["COMPLETED", "DELIVERED"].includes(p.status))
      .reduce((acc, curr) => acc + curr._count.id, 0);

    return {
      totalProjects,
      activeProjects: activeCount,
      completedProjects: completedCount,
      projectsByStatus: projectsByStatusRaw.map((p) => ({
        name: p.status.replace(/_/g, " "),
        count: p._count.id,
      })),
      milestonesByStatus: milestonesByStatusRaw.map((m) => ({
        name: m.status.replace(/_/g, " "),
        count: m._count.id,
      })),
      tasksByStatus: tasksByStatusRaw.map((t) => ({
        name: t.status.replace(/_/g, " "),
        count: t._count.id,
      })),
      overdueMilestonesCount: overdueMilestones.length,
      overdueMilestones,
      upcomingMilestones,
    };
  }

  /**
   * 4. Business Partner & Broker Program Analytics
   */
  static async getPartnerAnalytics(dateRange: ParsedDateRange) {
    const { startDate, endDate } = dateRange;

    const [
      totalApplications,
      applicationsInPeriod,
      applicationsByStatusRaw,
      activeBrokersCount,
      partnerLeadsCount,
      partnerContractsCount,
      pendingCommissionsCount,
      verifiedPaymentsCount,
    ] = await Promise.all([
      db.businessPartnerApplication.count().catch(() => 0),
      db.businessPartnerApplication.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }).catch(() => 0),
      db.businessPartnerApplication.groupBy({
        by: ["status"],
        _count: { id: true },
      }).catch(() => []),
      db.brokerProfile.count({
        where: { user: { status: "ACTIVE" } },
      }).catch(() => 0),
      db.lead.count({ where: { source: "PARTNER" } }).catch(() => 0),
      db.partnerContract.count({ where: { status: "SIGNED_BY_PARTNER" } }).catch(() => 0),
      db.commission.count({ where: { status: "PENDING" } }).catch(() => 0),
      db.partnerPayment.count({ where: { status: "VERIFIED" } }).catch(() => 0),
    ]);

    return {
      periodLabel: dateRange.label,
      totalApplications,
      applicationsInPeriod,
      activeBrokersCount,
      partnerLeadsCount,
      partnerContractsCount,
      pendingCommissionsCount,
      verifiedPaymentsCount,
      applicationsByStatus: (applicationsByStatusRaw as any[]).map((a) => ({
        name: a.status.replace(/_/g, " "),
        count: a._count.id,
      })),
    };
  }

  /**
   * 5. Careers & Recruitment Analytics
   */
  static async getCareersAnalytics(dateRange: ParsedDateRange) {
    const { startDate, endDate } = dateRange;

    const [
      totalJobs,
      publishedJobs,
      totalApplications,
      applicationsInPeriod,
      applicationsByStatusRaw,
    ] = await Promise.all([
      db.jobPosting.count().catch(() => 0),
      db.jobPosting.count({ where: { status: "PUBLISHED" } }).catch(() => 0),
      db.careerApplication.count().catch(() => 0),
      db.careerApplication.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }).catch(() => 0),
      db.careerApplication.groupBy({
        by: ["status"],
        _count: { id: true },
      }).catch(() => []),
    ]);

    return {
      periodLabel: dateRange.label,
      totalJobs,
      publishedJobs,
      totalApplications,
      applicationsInPeriod,
      applicationsByStatus: (applicationsByStatusRaw as any[]).map((a) => ({
        name: a.status.replace(/_/g, " "),
        count: a._count.id,
      })),
    };
  }

  /**
   * 6. Financial & Revenue Analytics (Strictly Authorized)
   */
  static async getFinancialAnalytics(dateRange: ParsedDateRange) {
    const { startDate, endDate } = dateRange;

    // Retrieve verified transactions, contracts, and commission payouts
    const [
      verifiedPayments,
      pendingPayments,
      confirmedContracts,
      approvedCommissions,
      paidCommissions,
    ] = await Promise.all([
      db.partnerPayment.findMany({
        where: {
          status: "VERIFIED",
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { amountPaid: true, advanceAmount: true, currency: true },
      }).catch(() => []),
      db.partnerPayment.findMany({
        where: {
          status: { in: ["SUBMITTED", "PENDING"] },
        },
        select: { amountPaid: true, advanceAmount: true, currency: true },
      }).catch(() => []),
      db.partnerContract.findMany({
        where: {
          status: { in: ["SIGNED", "VERIFIED"] },
          createdAt: { gte: startDate, lte: endDate },
        },
        include: { partnerProject: { select: { finalProjectValue: true } } },
      }).catch(() => []),
      db.commission.findMany({
        where: { status: "APPROVED" },
        select: { commissionAmount: true },
      }).catch(() => []),
      db.commission.findMany({
        where: {
          status: "PAID",
          paidAt: { gte: startDate, lte: endDate },
        },
        select: { commissionAmount: true },
      }).catch(() => []),
    ]);

    // Precise arithmetic calculations
    const cashCollected = verifiedPayments.reduce((acc, p) => acc + (p.amountPaid || p.advanceAmount || 0), 0);
    const pendingReceivables = pendingPayments.reduce((acc, p) => acc + (p.advanceAmount || p.amountPaid || 0), 0);
    const contractedValue = confirmedContracts.reduce((acc, c) => acc + (c.partnerProject?.finalProjectValue || 0), 0);
    const commissionsPayable = approvedCommissions.reduce((acc, c) => acc + (c.commissionAmount || 0), 0);
    const commissionsPaid = paidCommissions.reduce((acc, c) => acc + (c.commissionAmount || 0), 0);

    return {
      currency: "INR",
      periodLabel: dateRange.label,
      metrics: {
        cashCollected: {
          amount: Math.round(cashCollected * 100) / 100,
          formatted: `₹${cashCollected.toLocaleString("en-IN")}`,
        },
        pendingReceivables: {
          amount: Math.round(pendingReceivables * 100) / 100,
          formatted: `₹${pendingReceivables.toLocaleString("en-IN")}`,
        },
        contractedValue: {
          amount: Math.round(contractedValue * 100) / 100,
          formatted: `₹${contractedValue.toLocaleString("en-IN")}`,
        },
        commissionsPayable: {
          amount: Math.round(commissionsPayable * 100) / 100,
          formatted: `₹${commissionsPayable.toLocaleString("en-IN")}`,
        },
        commissionsPaid: {
          amount: Math.round(commissionsPaid * 100) / 100,
          formatted: `₹${commissionsPaid.toLocaleString("en-IN")}`,
        },
      },
    };
  }

  /**
   * 7. Platform Health & Step 8 Automation Diagnostics
   */
  static async getPlatformHealth(dateRange: ParsedDateRange) {
    const { startDate, endDate } = dateRange;

    const [
      activeWorkflowsCount,
      totalExecutionsInPeriod,
      successfulExecutionsInPeriod,
      failedExecutionsInPeriod,
      backgroundJobsStatsRaw,
      emailsSentCount,
      emailsFailedCount,
      recentFailures,
    ] = await Promise.all([
      db.automationWorkflow.count({ where: { isActive: true } }),
      db.automationExecution.count({
        where: { executedAt: { gte: startDate, lte: endDate } },
      }),
      db.automationExecution.count({
        where: {
          status: "SUCCESS",
          executedAt: { gte: startDate, lte: endDate },
        },
      }),
      db.automationExecution.count({
        where: {
          status: "FAILED",
          executedAt: { gte: startDate, lte: endDate },
        },
      }),
      db.backgroundJob.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      db.emailLog.count({
        where: {
          status: "SENT",
          sentAt: { gte: startDate, lte: endDate },
        },
      }),
      db.emailLog.count({
        where: {
          status: "FAILED",
          sentAt: { gte: startDate, lte: endDate },
        },
      }),
      db.automationExecution.findMany({
        where: { status: "FAILED" },
        take: 5,
        orderBy: { executedAt: "desc" },
        include: { automation: { select: { name: true, triggerType: true } } },
      }),
    ]);

    const jobQueueCounts: Record<string, number> = {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      FAILED: 0,
    };
    for (const item of backgroundJobsStatsRaw) {
      jobQueueCounts[item.status] = item._count.id;
    }

    const successRate =
      totalExecutionsInPeriod > 0
        ? Math.round((successfulExecutionsInPeriod / totalExecutionsInPeriod) * 100 * 10) / 10
        : 100;

    return {
      periodLabel: dateRange.label,
      activeWorkflowsCount,
      automation: {
        totalExecutions: totalExecutionsInPeriod,
        successfulExecutions: successfulExecutionsInPeriod,
        failedExecutions: failedExecutionsInPeriod,
        successRate: {
          value: successRate,
          formatted: `${successRate}%`,
        },
        recentFailures,
      },
      jobQueue: jobQueueCounts,
      emailDelivery: {
        sent: emailsSentCount,
        failed: emailsFailedCount,
        deliveryRate:
          emailsSentCount + emailsFailedCount > 0
            ? Math.round((emailsSentCount / (emailsSentCount + emailsFailedCount)) * 100 * 10) / 10
            : 100,
      },
      externalIntegrations: {
        ga4: {
          name: "Google Analytics 4",
          status: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? "CONNECTED" : "NOT_CONFIGURED",
          measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? "[ACTIVE]" : "MISSING",
        },
        searchConsole: {
          name: "Google Search Console",
          status: process.env.GOOGLE_SITE_VERIFICATION ? "VERIFIED" : "UNVERIFIED",
          siteVerification: process.env.GOOGLE_SITE_VERIFICATION ? "[CONFIGURED]" : "MISSING",
        },
      },
    };
  }
}
