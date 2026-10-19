import { db } from "@/lib/db";
import { PortalContext, ToolDefinition, PortalRole } from "./types";
import { searchKnowledge } from "@/lib/chatbot/knowledge-base";
import { logPortalAIAudit } from "./audit-logger";
import { BusinessIntelligenceService } from "@/lib/bi/metrics";
import { resolveDateRange } from "@/lib/bi/date-filters";

export const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  // ───────────────────────────────────────────────────────────────────────────
  // 1. GENERAL & SHARED TOOLS (All Roles)
  // ───────────────────────────────────────────────────────────────────────────
  search_published_knowledge: {
    name: "search_published_knowledge",
    description: "Search approved company services, policies, FAQs, and leadership documentation.",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN", "EMPLOYEE", "CLIENT", "BROKER", "PARTNER"],
    isWrite: false,
    handler: async ({ query }: { query: string }, ctx: PortalContext) => {
      if (!query || typeof query !== "string") {
        return { success: false, error: "Query parameter is required." };
      }
      const docs = await db.knowledgeDocument.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, title: true, category: true, content: true, tags: true, sourceReference: true, version: true },
        take: 30,
      });
      const results = searchKnowledge(query, docs as any, 4);
      return {
        success: true,
        data: results.map((r) => ({
          title: r.entry.title,
          category: r.entry.category,
          content: r.entry.content,
          reference: r.entry.sourceReference,
          confidence: r.confidence,
        })),
        auditNote: `Searched knowledge for "${query.slice(0, 50)}"`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2. EXECUTIVE & FOUNDER TOOLS (Founder / Co-Founder Only)
  // ───────────────────────────────────────────────────────────────────────────
  get_executive_overview: {
    name: "get_executive_overview",
    description: "Summarize strategic operational indicators across CRM pipeline, active deliverables, workforce, and pending approvals.",
    allowedRoles: ["FOUNDER", "CO_FOUNDER"],
    isWrite: false,
    handler: async (_params: any, ctx: PortalContext) => {
      const [leadsCount, wonLeadsCount, activeProjectsCount, pendingLeavesCount, activeEmployeesCount] =
        await Promise.all([
          db.lead.count(),
          db.lead.count({ where: { status: "WON" } }),
          db.partnerProject.count({ where: { status: { in: ["ACTIVE", "IN_PROGRESS", "REVIEW"] } } }),
          db.leaveRequest.count({ where: { status: "PENDING" } }),
          db.user.count({ where: { status: "ACTIVE" } }),
        ]);

      return {
        success: true,
        data: {
          pipeline: {
            totalLeads: leadsCount,
            wonDeals: wonLeadsCount,
            conversionRate: leadsCount > 0 ? `${Math.round((wonLeadsCount / leadsCount) * 100)}%` : "0%",
          },
          delivery: {
            activeProjects: activeProjectsCount,
          },
          workforce: {
            activeEmployees: activeEmployeesCount,
            pendingLeaveApprovals: pendingLeavesCount,
          },
        },
        auditNote: "Retrieved executive platform summary",
      };
    },
  },

  get_lead_pipeline_summary: {
    name: "get_lead_pipeline_summary",
    description: "Retrieve CRM lead pipeline breakdown by stage and high-priority prospects.",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    isWrite: false,
    handler: async (_params: any, ctx: PortalContext) => {
      const leads = await db.lead.findMany({
        select: { id: true, leadCode: true, name: true, companyName: true, status: true, budget: true, serviceInterest: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 15,
      });

      const countsByStatus: Record<string, number> = {};
      for (const l of leads) {
        countsByStatus[l.status] = (countsByStatus[l.status] || 0) + 1;
      }

      return {
        success: true,
        data: {
          recentLeads: leads.slice(0, 8),
          distribution: countsByStatus,
          totalRecentSampled: leads.length,
        },
        auditNote: "Retrieved lead pipeline summary",
      };
    },
  },

  get_project_health_summary: {
    name: "get_project_health_summary",
    description: "Retrieve project health, overdue milestones, and delivery status.",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    isWrite: false,
    handler: async (_params: any, ctx: PortalContext) => {
      const projects = await db.partnerProject.findMany({
        where: { status: { in: ["PROJECT_CONFIRMED", "TECHNICAL_APPROVED", "APPROVED", "IN_PROGRESS", "REVIEWING"] } },
        select: {
          id: true,
          projectName: true,
          status: true,
          projectBudget: true,
          expectedDeliveryDate: true,
          milestones: {
            select: { id: true, title: true, status: true, targetDate: true },
          },
        },
        take: 10,
      });

      const now = new Date();
      const formatted = projects.map((p) => {
        const overdueMilestones = p.milestones.filter(
          (m) => m.targetDate && new Date(m.targetDate) < now && m.status !== "COMPLETED"
        );
        return {
          title: p.projectName,
          status: p.status,
          totalMilestones: p.milestones.length,
          overdueCount: overdueMilestones.length,
          hasRisk: overdueMilestones.length > 0,
        };
      });

      return {
        success: true,
        data: { projects: formatted, highRiskCount: formatted.filter((f) => f.hasRisk).length },
        auditNote: "Retrieved project health overview",
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 3. ADMIN & OPERATIONS TOOLS (Admin / Founder / Co-Founder)
  // ───────────────────────────────────────────────────────────────────────────
  get_pending_leave_approvals: {
    name: "get_pending_leave_approvals",
    description: "List employee leave requests currently awaiting managerial review and approval.",
    allowedRoles: ["ADMIN", "FOUNDER", "CO_FOUNDER"],
    isWrite: false,
    handler: async (_params: any, ctx: PortalContext) => {
      const leaves = await db.leaveRequest.findMany({
        where: { status: "PENDING" },
        include: {
          user: { select: { id: true, name: true, email: true, department: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      return {
        success: true,
        data: leaves.map((l) => ({
          id: l.id,
          employeeName: l.user.name,
          department: l.user.department,
          type: l.leaveType,
          startDate: l.startDate.toISOString().split("T")[0],
          endDate: l.endDate.toISOString().split("T")[0],
          reason: l.reason,
        })),
        auditNote: `Retrieved ${leaves.length} pending leave requests`,
      };
    },
  },

  draft_cms_content: {
    name: "draft_cms_content",
    description: "Formulate a structured CMS article or service draft without publishing.",
    allowedRoles: ["ADMIN", "FOUNDER", "CO_FOUNDER"],
    isWrite: false,
    handler: async (
      { title, category, keyPoints }: { title: string; category?: string; keyPoints?: string[] },
      ctx: PortalContext
    ) => {
      if (!title) return { success: false, error: "Title is required for drafting CMS content." };
      return {
        success: true,
        data: {
          title,
          category: category || "SERVICES",
          suggestedTags: ["enterprise", "software", "axivon", (category || "services").toLowerCase()],
          keyPoints: keyPoints || [],
          status: "DRAFT_PROPOSED",
          disclaimer: "This draft is a recommendation and has NOT been published to the database or public site.",
        },
        auditNote: `Drafted CMS proposal for "${title}"`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 4. EMPLOYEE TOOLS (Personal Data Only — Strictly Isolated)
  // ───────────────────────────────────────────────────────────────────────────
  get_my_assigned_tasks: {
    name: "get_my_assigned_tasks",
    description: "Retrieve tasks specifically assigned to the authenticated user.",
    allowedRoles: ["EMPLOYEE", "ADMIN", "FOUNDER", "CO_FOUNDER"],
    isWrite: false,
    handler: async (_params: any, ctx: PortalContext) => {
      // Enforce strict user isolation: Employee can ONLY query their own tasks
      const tasks = await db.task.findMany({
        where: { userId: ctx.userId },
        select: { id: true, title: true, priority: true, status: true, dueDate: true },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        take: 15,
      });

      return {
        success: true,
        data: {
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            status: t.status,
            dueDate: t.dueDate ? t.dueDate.toISOString().split("T")[0] : "No deadline",
          })),
          totalAssigned: tasks.length,
        },
        auditNote: `Retrieved personal tasks (${tasks.length} items)`,
      };
    },
  },

  get_my_leaves_and_holidays: {
    name: "get_my_leaves_and_holidays",
    description: "Retrieve personal leave history and upcoming company holidays.",
    allowedRoles: ["EMPLOYEE", "ADMIN", "FOUNDER", "CO_FOUNDER"],
    isWrite: false,
    handler: async (_params: any, ctx: PortalContext) => {
      // Query personal leaves for calling user only
      const currentYear = new Date().getFullYear();
      const [leaves, holidays] = await Promise.all([
        db.leaveRequest.findMany({
          where: { userId: ctx.userId },
          select: { id: true, leaveType: true, startDate: true, endDate: true, status: true },
          orderBy: { startDate: "desc" },
          take: 5,
        }),
        db.holiday.findMany({
          where: { isCompanyHoliday: true, year: currentYear },
          select: { name: true, date: true, category: true },
          orderBy: { date: "asc" },
          take: 8,
        }),
      ]);

      return {
        success: true,
        data: {
          myLeaves: leaves.map((l) => {
            const start = l.startDate.toISOString().split("T")[0];
            const end = l.endDate.toISOString().split("T")[0];
            const daysDiff = Math.max(1, Math.round((l.endDate.getTime() - l.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
            return {
              type: l.leaveType,
              dates: `${start} to ${end}`,
              days: daysDiff,
              status: l.status,
            };
          }),
          upcomingHolidays: holidays.map((h) => ({
            name: h.name,
            date: h.date.toISOString().split("T")[0],
            category: h.category,
          })),
        },
        auditNote: "Retrieved personal leave balance and holiday schedule",
      };
    },
  },

  draft_leave_request: {
    name: "draft_leave_request",
    description: "Structure a personal leave application draft with duration calculation.",
    allowedRoles: ["EMPLOYEE"],
    isWrite: false,
    handler: async (
      { type, startDate, endDate, reason }: { type: string; startDate: string; endDate: string; reason: string },
      ctx: PortalContext
    ) => {
      if (!startDate || !endDate || !reason) {
        return { success: false, error: "Start date, end date, and reason are required to draft a leave request." };
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

      return {
        success: true,
        data: {
          applicantName: ctx.name,
          type: type || "CASUAL",
          startDate,
          endDate,
          calculatedDays: diffDays,
          reason,
          status: "DRAFT_READY_FOR_SUBMISSION",
          submissionInstructions: "Review details and click Submit in the Leave Management portal to confirm.",
        },
        auditNote: `Drafted leave application for ${diffDays} days (${startDate} to ${endDate})`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 5. CLIENT TOOLS (Client Organization Only — Strictly Isolated)
  // ───────────────────────────────────────────────────────────────────────────
  get_my_client_projects: {
    name: "get_my_client_projects",
    description: "Retrieve projects and active milestones for the authenticated client organization.",
    allowedRoles: ["CLIENT", "ADMIN", "FOUNDER", "CO_FOUNDER"],
    isWrite: false,
    handler: async (_params: any, ctx: PortalContext) => {
      // For CLIENT role, enforce strict tenant isolation via clientUserId
      const where: any = { status: { not: "CANCELLED" } };
      if (ctx.role === "CLIENT") {
        where.clientUserId = ctx.userId;
      }

      const projects = await db.partnerProject.findMany({
        where,
        select: {
          id: true,
          projectName: true,
          status: true,
          expectedDeliveryDate: true,
          milestones: {
            select: { id: true, title: true, status: true, targetDate: true },
          },
        },
        take: 10,
      });

      return {
        success: true,
        data: {
          projects: projects.map((p) => ({
            id: p.id,
            title: p.projectName,
            status: p.status,
            targetEndDate: p.expectedDeliveryDate ? p.expectedDeliveryDate.toISOString().split("T")[0] : "TBD",
            milestoneCount: p.milestones.length,
            completedMilestones: p.milestones.filter((m) => m.status === "COMPLETED").length,
          })),
        },
        auditNote: `Client retrieved ${projects.length} authorized projects`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 6. BROKER & PARTNER TOOLS (Strictly Isolated by Broker Profile / OwnerId)
  // ───────────────────────────────────────────────────────────────────────────
  get_my_broker_leads: {
    name: "get_my_broker_leads",
    description: "Retrieve deals and leads specifically attributed to the authenticated broker.",
    allowedRoles: ["BROKER", "ADMIN", "FOUNDER", "CO_FOUNDER"],
    isWrite: false,
    handler: async (_params: any, ctx: PortalContext) => {
      const where: any = {};
      if (ctx.role === "BROKER") {
        where.ownerId = ctx.userId;
      }

      const leads = await db.lead.findMany({
        where,
        select: {
          id: true,
          leadCode: true,
          name: true,
          companyName: true,
          status: true,
          qualificationStatus: true,
          serviceInterest: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      });

      return {
        success: true,
        data: {
          leads: leads.map((l) => ({
            code: l.leadCode,
            name: l.name,
            company: l.companyName || "N/A",
            status: l.status,
            service: l.serviceInterest,
            date: l.createdAt.toISOString().split("T")[0],
          })),
          totalLeads: leads.length,
        },
        auditNote: `Broker retrieved ${leads.length} personal leads`,
      };
    },
  },

  get_my_commission_summary: {
    name: "get_my_commission_summary",
    description: "Retrieve personal commission structure, referral code, and earnings.",
    allowedRoles: ["BROKER", "PARTNER", "ADMIN", "FOUNDER", "CO_FOUNDER"],
    isWrite: false,
    handler: async (_params: any, ctx: PortalContext) => {
      const brokerProfile = await db.brokerProfile.findUnique({
        where: { userId: ctx.userId },
        select: {
          referralCode: true,
          commissions: {
            select: {
              commissionAmount: true,
              commissionRate: true,
              status: true,
            },
          },
        },
      });

      if (!brokerProfile) {
        return {
          success: true,
          data: {
            referralCode: "UNASSIGNED",
            commissionRate: "10%",
            totalEarnings: "₹0",
            pendingPayout: "₹0",
            tier: "STANDARD",
            note: "Standard partner rate applied.",
          },
        };
      }

      let totalEarnings = 0;
      let pendingPayout = 0;
      let avgRate = 10;
      for (const c of brokerProfile.commissions) {
        if (c.status === "PAID") totalEarnings += c.commissionAmount;
        if (["PENDING", "ELIGIBLE", "APPROVED"].includes(c.status)) pendingPayout += c.commissionAmount;
        if (c.commissionRate) avgRate = c.commissionRate;
      }

      return {
        success: true,
        data: {
          referralCode: brokerProfile.referralCode || "UNASSIGNED",
          commissionRate: `${avgRate}%`,
          totalEarnings: `₹${totalEarnings.toLocaleString("en-IN")}`,
          pendingPayout: `₹${pendingPayout.toLocaleString("en-IN")}`,
          tier: "PARTNER",
        },
        auditNote: "Retrieved personal commission earnings summary",
      };
    },
  },

  draft_support_inquiry: {
    name: "draft_support_inquiry",
    description: "Prepare a validated inquiry or support ticket payload for project/broker support.",
    allowedRoles: ["CLIENT", "BROKER", "PARTNER", "EMPLOYEE"],
    isWrite: false,
    handler: async (
      { subject, details, priority }: { subject: string; details: string; priority?: string },
      ctx: PortalContext
    ) => {
      if (!subject || !details) {
        return { success: false, error: "Subject and details are required to formulate an inquiry." };
      }
      return {
        success: true,
        data: {
          sender: ctx.name,
          email: ctx.email,
          role: ctx.role,
          subject: subject.trim(),
          details: details.trim(),
          priority: priority || "NORMAL",
          status: "DRAFT_READY",
          actionHint: "Click Confirm to submit this inquiry to the dedicated engineering desk.",
        },
        auditNote: `Drafted inquiry for "${subject.slice(0, 40)}"`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 6. BUSINESS INTELLIGENCE & ANALYTICS TOOLS (Role-Governed)
  // ───────────────────────────────────────────────────────────────────────────
  query_business_overview_kpis: {
    name: "query_business_overview_kpis",
    description: "Query authoritative high-level business KPIs (lead qualification, project status, task velocity, team capacity) with period comparison.",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    isWrite: false,
    handler: async (params: any, ctx: PortalContext) => {
      const range = resolveDateRange(params?.preset || "last_30_days", params?.customStart, params?.customEnd);
      const overview = await BusinessIntelligenceService.getBusinessOverview(range);
      return {
        success: true,
        data: {
          periodLabel: overview.periodLabel,
          dateRange: overview.dateRange,
          kpis: overview.kpis,
        },
        auditNote: `Queried business overview KPIs for range: ${range.label}`,
      };
    },
  },

  query_sales_crm_metrics: {
    name: "query_sales_crm_metrics",
    description: "Query CRM lead volume, conversion funnel stages, qualification rates, and channel distribution.",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    isWrite: false,
    handler: async (params: any, ctx: PortalContext) => {
      const range = resolveDateRange(params?.preset || "last_30_days", params?.customStart, params?.customEnd);
      const sales = await BusinessIntelligenceService.getSalesAnalytics(range);
      return {
        success: true,
        data: sales,
        auditNote: `Queried sales CRM analytics for range: ${range.label}`,
      };
    },
  },

  query_project_delivery_metrics: {
    name: "query_project_delivery_metrics",
    description: "Query project delivery velocity, milestone health, on-time delivery percentages, and active client initiatives.",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN", "EMPLOYEE"],
    isWrite: false,
    handler: async (params: any, ctx: PortalContext) => {
      const range = resolveDateRange(params?.preset || "last_30_days", params?.customStart, params?.customEnd);
      const delivery = await BusinessIntelligenceService.getDeliveryAnalytics(range);
      return {
        success: true,
        data: delivery,
        auditNote: `Queried project delivery analytics for range: ${range.label}`,
      };
    },
  },

  query_automation_health_metrics: {
    name: "query_automation_health_metrics",
    description: "Query workflow automation health, execution success rates, failure clusters, and background job queue status.",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    isWrite: false,
    handler: async (params: any, ctx: PortalContext) => {
      const range = resolveDateRange(params?.preset || "last_30_days", params?.customStart, params?.customEnd);
      const health = await BusinessIntelligenceService.getPlatformHealth(range);
      return {
        success: true,
        data: health,
        auditNote: `Queried platform automation health for range: ${range.label}`,
      };
    },
  },
};

/**
 * Execute an authorized tool by name with strict role-based access control (RBAC).
 */
export async function executeTool(
  toolName: string,
  params: any,
  ctx: PortalContext,
  ipAddress?: string | null
): Promise<{ success: boolean; data?: any; error?: string }> {
  const tool = TOOL_REGISTRY[toolName];
  if (!tool) {
    return { success: false, error: `Tool '${toolName}' is not registered.` };
  }

  // 1. Enforce Role Authorization
  if (!tool.allowedRoles.includes(ctx.role)) {
    // Record security audit event for denied tool execution
    await logPortalAIAudit(
      ctx.userId,
      "ACCESS_DENIED",
      toolName,
      { attemptedRole: ctx.role, allowedRoles: tool.allowedRoles },
      ipAddress
    );
    return {
      success: false,
      error: `Security Barrier: Role '${ctx.role}' is not authorized to execute tool '${toolName}'.`,
    };
  }

  // 2. Execute tool handler
  try {
    const result = await tool.handler(params, ctx);

    // 3. Record audit event upon execution
    if (result.success && result.auditNote) {
      await logPortalAIAudit(
        ctx.userId,
        "TOOL_EXECUTE",
        toolName,
        { auditNote: result.auditNote, isWrite: tool.isWrite },
        ipAddress
      );
    }

    return result;
  } catch (error) {
    console.error(`[ToolRegistry] Error executing ${toolName}:`, error);
    return { success: false, error: `Tool execution error: ${(error as Error).message}` };
  }
}
