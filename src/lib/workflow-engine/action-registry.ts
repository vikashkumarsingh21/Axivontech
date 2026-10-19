import { db } from "@/lib/db";
import { ActionId } from "./types";
import { EmailService } from "@/lib/email/service";
import { NotificationService, ActivityService } from "@/lib/events/bus";
import { BusinessIntelligenceService } from "@/lib/bi/metrics";

export interface ActionExecutionContext {
  workflowId: string;
  workflowName: string;
  triggerEvent: string;
  actorId?: string | null;
  actorRole?: string | null;
  correlationId?: string | null;
  isDryRun?: boolean;
}

export interface ActionHandlerResponse {
  success: boolean;
  output?: any;
  error?: string;
  auditNote?: string;
  approvalRequestId?: string;
}

export interface RegisteredAction {
  actionId: ActionId;
  name: string;
  description: string;
  category: "COMMUNICATION" | "CRM" | "WORKFORCE" | "GOVERNANCE" | "ANALYTICS";
  isWrite: boolean;
  requiresApprovalByDefault: boolean;
  execute: (
    params: Record<string, any>,
    ctx: ActionExecutionContext
  ) => Promise<ActionHandlerResponse>;
}

export const ACTION_REGISTRY: Record<ActionId, RegisteredAction> = {
  // ───────────────────────────────────────────────────────────────────────────
  // 1. In-App Notification Action
  // ───────────────────────────────────────────────────────────────────────────
  CREATE_NOTIFICATION: {
    actionId: "CREATE_NOTIFICATION",
    name: "Create In-App Notification",
    description: "Delivers an in-app notification to an employee, administrator, or client with deduplication.",
    category: "COMMUNICATION",
    isWrite: true,
    requiresApprovalByDefault: false,
    execute: async (params, ctx) => {
      const { userId, title, message, link, priority = "NORMAL", entityType, entityId } = params;

      if (!userId || !title) {
        return { success: false, error: "userId and title are required for CREATE_NOTIFICATION." };
      }

      if (ctx.isDryRun) {
        return {
          success: true,
          output: { simulated: true, userId, title, message, priority },
          auditNote: `[DRY_RUN] Simulated notification to user ${userId}: "${title}"`,
        };
      }

      const notif = await NotificationService.create({
        userId,
        type: `AUTOMATION::${ctx.triggerEvent}`,
        title: `[Auto] ${title}`,
        message: message || "Automated workflow notification.",
        link,
        entityType,
        entityId,
        priority,
        dedupKey: `WF_${ctx.workflowId}::${entityId || userId}::${title}`,
      });

      return {
        success: true,
        output: { notificationId: notif?.id },
        auditNote: `Created notification "${title}" for user ${userId}`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Email Action (Via Safe EmailService)
  // ───────────────────────────────────────────────────────────────────────────
  SEND_EMAIL: {
    actionId: "SEND_EMAIL",
    name: "Send Email Notification",
    description: "Sends an email template through configured SMTP provider with delivery tracking.",
    category: "COMMUNICATION",
    isWrite: true,
    requiresApprovalByDefault: false,
    execute: async (params, ctx) => {
      const { toEmail, templateKey = "WELCOME_EMAIL", variables = {} } = params;

      if (!toEmail) {
        return { success: false, error: "toEmail parameter is required for SEND_EMAIL." };
      }

      if (ctx.isDryRun) {
        return {
          success: true,
          output: { simulated: true, toEmail, templateKey, variables },
          auditNote: `[DRY_RUN] Simulated email dispatch to ${toEmail} using template ${templateKey}`,
        };
      }

      try {
        const log = await EmailService.send({
          to: toEmail,
          templateKey,
          variables: {
            workflowName: ctx.workflowName,
            ...variables,
          },
        });

        return {
          success: true,
          output: { emailLogId: log.id, status: log.status },
          auditNote: `Dispatched email to ${toEmail} via template ${templateKey}`,
        };
      } catch (err: any) {
        return {
          success: false,
          error: `Email delivery failed: ${err.message}`,
        };
      }
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Operational Activity Logging
  // ───────────────────────────────────────────────────────────────────────────
  CREATE_ACTIVITY: {
    actionId: "CREATE_ACTIVITY",
    name: "Record Operational Activity",
    description: "Appends an entry to the unified company activity feed.",
    category: "GOVERNANCE",
    isWrite: true,
    requiresApprovalByDefault: false,
    execute: async (params, ctx) => {
      const { summary, entityType = "SYSTEM", entityId, metadata } = params;

      if (!summary) {
        return { success: false, error: "summary parameter is required for CREATE_ACTIVITY." };
      }

      if (ctx.isDryRun) {
        return {
          success: true,
          output: { simulated: true, summary, entityType, entityId },
          auditNote: `[DRY_RUN] Simulated activity record: "${summary}"`,
        };
      }

      const activity = await ActivityService.log({
        actorId: ctx.actorId,
        action: `AUTOMATION::${ctx.workflowName}`,
        entityType,
        entityId,
        summary,
        metadata: {
          workflowId: ctx.workflowId,
          correlationId: ctx.correlationId,
          ...metadata,
        },
      });

      return {
        success: true,
        output: { activityId: activity.id },
        auditNote: `Logged operational activity: "${summary}"`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 4. CRM Follow-Up Scheduling
  // ───────────────────────────────────────────────────────────────────────────
  CREATE_FOLLOWUP: {
    actionId: "CREATE_FOLLOWUP",
    name: "Schedule Lead Follow-Up",
    description: "Creates a structured follow-up item in the CRM pipeline for the assigned sales representative.",
    category: "CRM",
    isWrite: true,
    requiresApprovalByDefault: false,
    execute: async (params, ctx) => {
      const { leadId, assignedToId, notes, delayHours = 24, type = "CALL" } = params;

      if (!leadId) {
        return { success: false, error: "leadId is required for CREATE_FOLLOWUP." };
      }

      if (ctx.isDryRun) {
        return {
          success: true,
          output: { simulated: true, leadId, assignedToId, notes, delayHours },
          auditNote: `[DRY_RUN] Simulated follow-up for lead ${leadId} (+${delayHours}h)`,
        };
      }

      // Check lead existence
      const lead = await db.lead.findUnique({
        where: { id: leadId },
        select: { id: true, ownerId: true, leadCode: true },
      });
      if (!lead) {
        return { success: false, error: `Lead not found with id ${leadId}` };
      }

      const targetAssignee = assignedToId || lead.ownerId || ctx.actorId;
      if (!targetAssignee) {
        return { success: false, error: "No target assignee available for lead follow-up." };
      }

      const dueAt = new Date(Date.now() + delayHours * 60 * 60 * 1000);

      const followUp = await db.followUp.create({
        data: {
          leadId,
          assignedToId: targetAssignee,
          notes: notes || `Automated follow-up triggered by ${ctx.workflowName}`,
          dueAt,
          status: "UPCOMING",
          type: type || "CALL",
        },
      });

      return {
        success: true,
        output: { followUpId: followUp.id, dueAt: followUp.dueAt },
        auditNote: `Scheduled follow-up for lead ${lead.leadCode} due at ${dueAt.toISOString()}`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 5. CRM Lead Assignment
  // ───────────────────────────────────────────────────────────────────────────
  ASSIGN_LEAD: {
    actionId: "ASSIGN_LEAD",
    name: "Assign Lead Owner",
    description: "Assigns or reassigns an inbound CRM lead to a verified sales manager or team member.",
    category: "CRM",
    isWrite: true,
    requiresApprovalByDefault: false,
    execute: async (params, ctx) => {
      const { leadId, assigneeId, note } = params;

      if (!leadId || !assigneeId) {
        return { success: false, error: "leadId and assigneeId are required for ASSIGN_LEAD." };
      }

      if (ctx.isDryRun) {
        return {
          success: true,
          output: { simulated: true, leadId, assigneeId, note },
          auditNote: `[DRY_RUN] Simulated lead assignment ${leadId} -> ${assigneeId}`,
        };
      }

      // Verify assignee is active
      const user = await db.user.findUnique({
        where: { id: assigneeId },
        select: { id: true, name: true, email: true, status: true },
      });
      if (!user || user.status === "INACTIVE") {
        return { success: false, error: `Assignee user is invalid or inactive: ${assigneeId}` };
      }

      const updatedLead = await db.lead.update({
        where: { id: leadId },
        data: {
          ownerId: assigneeId,
        },
        select: { id: true, leadCode: true, name: true },
      });

      // Notify the new owner
      await NotificationService.create({
        userId: assigneeId,
        type: "LEAD_ASSIGNED",
        title: `New Lead Assigned: ${updatedLead.leadCode}`,
        message: `${updatedLead.name} was assigned to you by automation workflow "${ctx.workflowName}".`,
        link: `/admin/crm/leads/${updatedLead.id}`,
        priority: "HIGH",
      });

      return {
        success: true,
        output: { leadId: updatedLead.id, leadCode: updatedLead.leadCode, owner: user.name },
        auditNote: `Assigned lead ${updatedLead.leadCode} to ${user.name}`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 6. CRM Lead Status Update
  // ───────────────────────────────────────────────────────────────────────────
  UPDATE_LEAD_STATUS: {
    actionId: "UPDATE_LEAD_STATUS",
    name: "Update Lead Stage",
    description: "Transitions a lead to a new status stage (e.g. CONTACTED, QUALIFIED).",
    category: "CRM",
    isWrite: true,
    requiresApprovalByDefault: false,
    execute: async (params, ctx) => {
      const { leadId, newStatus } = params;

      if (!leadId || !newStatus) {
        return { success: false, error: "leadId and newStatus are required for UPDATE_LEAD_STATUS." };
      }

      if (ctx.isDryRun) {
        return {
          success: true,
          output: { simulated: true, leadId, newStatus },
          auditNote: `[DRY_RUN] Simulated lead stage transition: ${leadId} -> ${newStatus}`,
        };
      }

      const lead = await db.lead.update({
        where: { id: leadId },
        data: { status: newStatus },
        select: { id: true, leadCode: true, status: true },
      });

      return {
        success: true,
        output: { leadId: lead.id, leadCode: lead.leadCode, status: lead.status },
        auditNote: `Updated lead ${lead.leadCode} status to ${newStatus}`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 7. Internal Task Creation
  // ───────────────────────────────────────────────────────────────────────────
  CREATE_TASK: {
    actionId: "CREATE_TASK",
    name: "Create Operational Task",
    description: "Assigns an operational or delivery task to a team member.",
    category: "WORKFORCE",
    isWrite: true,
    requiresApprovalByDefault: false,
    execute: async (params, ctx) => {
      const { userId, title, description, priority = "MEDIUM", dueInHours = 48, partnerProjectId } = params;

      if (!userId || !title) {
        return { success: false, error: "userId and title are required for CREATE_TASK." };
      }

      if (ctx.isDryRun) {
        return {
          success: true,
          output: { simulated: true, userId, title, priority, dueInHours },
          auditNote: `[DRY_RUN] Simulated task creation: "${title}" for user ${userId}`,
        };
      }

      const dueDate = new Date(Date.now() + dueInHours * 60 * 60 * 1000);

      const task = await db.task.create({
        data: {
          userId,
          title,
          description: description || `Created automatically by ${ctx.workflowName}`,
          priority,
          status: "TODO",
          dueDate,
          partnerProjectId: partnerProjectId || null,
        },
      });

      // In-app notification for the assignee
      await NotificationService.create({
        userId,
        type: "TASK_ASSIGNED",
        title: `Task Assigned: ${title}`,
        message: `A new task was assigned to you due on ${dueDate.toLocaleDateString()}.`,
        link: "/employee/tasks",
        priority,
      });

      return {
        success: true,
        output: { taskId: task.id, title: task.title, dueDate: task.dueDate },
        auditNote: `Created task "${title}" for user ${userId}`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 8. Personal / System Reminder
  // ───────────────────────────────────────────────────────────────────────────
  CREATE_REMINDER: {
    actionId: "CREATE_REMINDER",
    name: "Create System Reminder",
    description: "Persists a scheduled reminder for deadlines, audits, or follow-ups.",
    category: "COMMUNICATION",
    isWrite: true,
    requiresApprovalByDefault: false,
    execute: async (params, ctx) => {
      const { userId, title, dueAt, type = "CUSTOM", description } = params;

      if (!userId || !title) {
        return { success: false, error: "userId and title are required for CREATE_REMINDER." };
      }

      const reminderDue = dueAt ? new Date(dueAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);

      if (ctx.isDryRun) {
        return {
          success: true,
          output: { simulated: true, userId, title, dueAt: reminderDue, type },
          auditNote: `[DRY_RUN] Simulated reminder: "${title}" for user ${userId}`,
        };
      }

      const reminder = await db.reminder.create({
        data: {
          userId,
          title,
          description: description || `Reminder set by workflow ${ctx.workflowName}`,
          dueAt: reminderDue,
          type: type || "CUSTOM",
          status: "PENDING",
        },
      });

      return {
        success: true,
        output: { reminderId: reminder.id, dueAt: reminder.dueAt },
        auditNote: `Created reminder "${title}" for ${userId}`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 9. High-Impact Action Approval Request
  // ───────────────────────────────────────────────────────────────────────────
  REQUEST_APPROVAL: {
    actionId: "REQUEST_APPROVAL",
    name: "Request Managerial Approval",
    description: "Pauses the workflow and creates a pending approval record for administrator authorization.",
    category: "GOVERNANCE",
    isWrite: true,
    requiresApprovalByDefault: true,
    execute: async (params, ctx) => {
      const { requestType = "HIGH_IMPACT_ACTION", reason, metadata = {} } = params;

      if (ctx.isDryRun) {
        return {
          success: true,
          output: { simulated: true, requestType, reason, requiresApproval: true },
          auditNote: `[DRY_RUN] Simulated approval request: ${requestType}`,
        };
      }

      const requesterId = ctx.actorId || "system";

      const approval = await db.approvalRequest.create({
        data: {
          requestType,
          requestedById: requesterId,
          status: "PENDING",
          reason: reason || `Approval requested by automated workflow "${ctx.workflowName}"`,
          metadata: {
            workflowId: ctx.workflowId,
            workflowName: ctx.workflowName,
            triggerEvent: ctx.triggerEvent,
            correlationId: ctx.correlationId,
            ...metadata,
          },
        },
      });

      return {
        success: true,
        output: { approvalId: approval.id, status: approval.status },
        approvalRequestId: approval.id,
        auditNote: `Generated approval request ${approval.id} for "${requestType}"`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 10. Generate Business Intelligence Snapshot
  // ───────────────────────────────────────────────────────────────────────────
  GENERATE_BI_REPORT: {
    actionId: "GENERATE_BI_REPORT",
    name: "Generate Periodic BI Snapshot",
    description: "Calculates real business overview metrics and logs a report snapshot.",
    category: "ANALYTICS",
    isWrite: false,
    requiresApprovalByDefault: false,
    execute: async (params, ctx) => {
      const now = new Date();
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const past60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const overview = await BusinessIntelligenceService.getBusinessOverview({
        startDate: past30,
        endDate: now,
        prevStartDate: past60,
        prevEndDate: past30,
        preset: "last_30_days",
        label: "Last 30 Days",
      });

      return {
        success: true,
        output: {
          generatedAt: now.toISOString(),
          kpis: overview.kpis,
          healthSummary: `Pipeline: ${overview.kpis.totalLeadsAllTime} leads, ${overview.kpis.activeProjects.current} active projects`,
        },
        auditNote: "Generated periodic Business Intelligence overview snapshot",
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 11. Flag Knowledge Base Gap
  // ───────────────────────────────────────────────────────────────────────────
  FLAG_KNOWLEDGE_GAP: {
    actionId: "FLAG_KNOWLEDGE_GAP",
    name: "Flag Knowledge Base Gap",
    description: "Logs an unanswered topic or negative visitor feedback to the knowledge console for review.",
    category: "GOVERNANCE",
    isWrite: true,
    requiresApprovalByDefault: false,
    execute: async (params, ctx) => {
      const { userQuery, notes, priority = "MEDIUM" } = params;

      if (!userQuery) {
        return { success: false, error: "userQuery is required for FLAG_KNOWLEDGE_GAP." };
      }

      if (ctx.isDryRun) {
        return {
          success: true,
          output: { simulated: true, userQuery, notes, priority },
          auditNote: `[DRY_RUN] Simulated knowledge gap record: "${userQuery}"`,
        };
      }

      const gap = await db.chatKnowledgeGap.create({
        data: {
          question: userQuery.slice(0, 500),
          intent: "AUTOMATION_FLAG",
          status: "OPEN",
          frequency: 1,
        },
      });

      return {
        success: true,
        output: { gapId: gap.id },
        auditNote: `Flagged knowledge gap for "${userQuery.slice(0, 50)}"`,
      };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 12. Alert Admin on Terminal Automation Failure
  // ───────────────────────────────────────────────────────────────────────────
  ALERT_ADMIN_FAILURE: {
    actionId: "ALERT_ADMIN_FAILURE",
    name: "Alert Administrators on Failure",
    description: "Escalates a terminal automation failure or dead-letter condition to system administrators.",
    category: "GOVERNANCE",
    isWrite: true,
    requiresApprovalByDefault: false,
    execute: async (params, ctx) => {
      const { errorMessage, failedWorkflowName, executionId } = params;

      if (ctx.isDryRun) {
        return {
          success: true,
          output: { simulated: true, errorMessage, failedWorkflowName },
          auditNote: `[DRY_RUN] Simulated admin failure alert: "${errorMessage}"`,
        };
      }

      // Query active administrators
      const admins = await db.user.findMany({
        where: {
          status: "ACTIVE",
          userRoles: {
            some: {
              role: {
                name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] },
              },
            },
          },
        },
        select: { id: true },
        take: 5,
      });

      for (const admin of admins) {
        await NotificationService.create({
          userId: admin.id,
          type: "AUTOMATION_FAILED",
          title: `⚠️ Automation Failure: ${failedWorkflowName || ctx.workflowName}`,
          message: `Execution ${executionId || "N/A"} terminated with error: ${errorMessage || "Unknown error"}`,
          link: "/admin/automations?tab=executions",
          priority: "URGENT",
          dedupKey: `FAILURE_ALERT::${ctx.workflowId}::${executionId}`,
        });
      }

      return {
        success: true,
        output: { alertedAdminCount: admins.length },
        auditNote: `Dispatched failure alert to ${admins.length} administrators`,
      };
    },
  },
};
