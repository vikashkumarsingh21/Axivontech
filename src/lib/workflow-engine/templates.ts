import { db } from "@/lib/db";
import { WorkflowCategory, TriggerType, ActionConfig, ConditionGroup } from "./types";

export interface WorkflowTemplateBlueprint {
  templateId: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  triggerType: TriggerType;
  conditions?: ConditionGroup;
  actions: ActionConfig[];
  approvalRequired?: boolean;
}

export const BUSINESS_TEMPLATES: WorkflowTemplateBlueprint[] = [
  {
    templateId: "TEMPLATE_A_NEW_LEAD_FOLLOWUP",
    name: "New Inbound Lead Quick Follow-up",
    description: "Automatically schedules a CRM follow-up and notifies sales managers when a new prospect inquires.",
    category: "LEAD_MANAGEMENT",
    triggerType: "NEW_LEAD",
    conditions: {
      combinator: "AND",
      rules: [
        { field: "status", operator: "NOT_EQUALS", value: "CLOSED" },
      ],
    },
    actions: [
      {
        actionId: "CREATE_FOLLOWUP",
        params: { delayHours: 24, notes: "Perform initial discovery call within 24 hours of inquiry." },
      },
      {
        actionId: "CREATE_NOTIFICATION",
        params: {
          title: "New Lead Inbound",
          message: "A new inquiry has landed. Review client requirements and initiate discovery.",
          priority: "HIGH",
        },
      },
    ],
  },
  {
    templateId: "TEMPLATE_B_STALE_LEAD_REMINDER",
    name: "Stale Lead Follow-up Reminder",
    description: "Generates a high-priority reminder when an active lead has had no activity for over 48 hours.",
    category: "LEAD_MANAGEMENT",
    triggerType: "STALE_LEAD_DETECTED",
    conditions: {
      combinator: "AND",
      rules: [
        { field: "status", operator: "IN_LIST", value: ["NEW", "CONTACTED", "PROPOSAL_SENT"] },
      ],
    },
    actions: [
      {
        actionId: "CREATE_REMINDER",
        params: { title: "Follow up on stale lead", type: "TASK" },
      },
      {
        actionId: "CREATE_NOTIFICATION",
        params: {
          title: "Stale Lead Attention Required",
          message: "This prospective client has not received follow-up in over 48 hours.",
          priority: "HIGH",
        },
      },
    ],
  },
  {
    templateId: "TEMPLATE_C_PROJECT_DEADLINE",
    name: "Approaching Project Milestone Alert",
    description: "Notifies project directors and delivery leads when a milestone target date is within 3 days.",
    category: "PROJECT_DELIVERY",
    triggerType: "PROJECT_DEADLINE_APPROACHING",
    conditions: {
      combinator: "AND",
      rules: [
        { field: "status", operator: "NOT_EQUALS", value: "COMPLETED" },
      ],
    },
    actions: [
      {
        actionId: "CREATE_NOTIFICATION",
        params: {
          title: "Milestone Deadline Approaching",
          message: "Project milestone is due within 72 hours. Inspect blockers and verify deliverables.",
          priority: "HIGH",
        },
      },
      {
        actionId: "CREATE_ACTIVITY",
        params: { summary: "Project milestone approaching target delivery date." },
      },
    ],
  },
  {
    templateId: "TEMPLATE_D_OVERDUE_TASK_FOLLOWUP",
    name: "Overdue Task Escalation Notice",
    description: "Detects tasks that passed their deadline and alerts the assignee and engineering leads.",
    category: "WORKFORCE_OPS",
    triggerType: "TASK_OVERDUE",
    conditions: {
      combinator: "AND",
      rules: [
        { field: "status", operator: "NOT_EQUALS", value: "COMPLETED" },
      ],
    },
    actions: [
      {
        actionId: "CREATE_NOTIFICATION",
        params: {
          title: "Task Overdue Notice",
          message: "This assigned task has passed its deadline without being marked completed.",
          priority: "URGENT",
        },
      },
      {
        actionId: "CREATE_ACTIVITY",
        params: { summary: "Task overdue escalation logged." },
      },
    ],
  },
  {
    templateId: "TEMPLATE_E_EMPLOYEE_LEAVE_REQUEST",
    name: "Employee Leave Review & Approval Flow",
    description: "Routes new employee leave applications to HR and department heads for formal managerial approval.",
    category: "WORKFORCE_OPS",
    triggerType: "LEAVE_SUBMITTED",
    approvalRequired: true,
    actions: [
      {
        actionId: "REQUEST_APPROVAL",
        params: { requestType: "LEAVE_APPROVAL", reason: "Managerial leave approval review" },
        requiresApproval: true,
      },
      {
        actionId: "CREATE_NOTIFICATION",
        params: {
          title: "Leave Application Submitted",
          message: "New leave request awaiting managerial review in the approval console.",
          priority: "NORMAL",
        },
      },
    ],
  },
  {
    templateId: "TEMPLATE_F_CLIENT_ONBOARDING",
    name: "Client Onboarding Progression",
    description: "Generates technical architecture and requirements kick-off tasks upon confirmed project onboarding.",
    category: "CLIENT_ONBOARDING",
    triggerType: "CLIENT_ONBOARDING_STAGE",
    actions: [
      {
        actionId: "CREATE_TASK",
        params: {
          title: "Prepare Client Architecture & SOW Scope",
          description: "Initialize client project folder, schedule architecture alignment, and outline sprint milestones.",
          priority: "HIGH",
          dueInHours: 48,
        },
      },
      {
        actionId: "CREATE_NOTIFICATION",
        params: {
          title: "Client Onboarding Progressing",
          message: "Client account confirmed. Initial engineering tasks have been assigned.",
        },
      },
    ],
  },
  {
    templateId: "TEMPLATE_G_PARTNER_LEAD_PROGRESSION",
    name: "Broker Lead Stage Progression Notification",
    description: "Keeps broker partners updated when their referred opportunity advances through sales pipeline.",
    category: "PARTNER_BROKER",
    triggerType: "BROKER_LEAD_CHANGED",
    actions: [
      {
        actionId: "CREATE_NOTIFICATION",
        params: {
          title: "Referred Deal Stage Updated",
          message: "Your referred client deal has advanced to a new stage in the Axivon sales pipeline.",
        },
      },
      {
        actionId: "CREATE_ACTIVITY",
        params: { summary: "Broker referral milestone updated in CRM." },
      },
    ],
  },
  {
    templateId: "TEMPLATE_H_PENDING_APPROVAL_REMINDER",
    name: "Pending Approval SLA Reminder",
    description: "Sends a reminder notice to administrators when an action has been waiting for approval > 24 hours.",
    category: "APPROVALS",
    triggerType: "APPROVAL_PENDING_REMINDER",
    actions: [
      {
        actionId: "CREATE_NOTIFICATION",
        params: {
          title: "Approval Request Pending Decision",
          message: "An operational approval request has been pending for over 24 hours. Please review in the console.",
          priority: "HIGH",
        },
      },
    ],
  },
  {
    templateId: "TEMPLATE_I_FAILED_AUTOMATION_ALERT",
    name: "Failed Automation Terminal Alert",
    description: "Escalates unexpected workflow failures or dead-letter conditions directly to system administrators.",
    category: "SYSTEM",
    triggerType: "AUTOMATION_FAILED",
    actions: [
      {
        actionId: "ALERT_ADMIN_FAILURE",
        params: { errorMessage: "Automation workflow encountered terminal error." },
      },
    ],
  },
  {
    templateId: "TEMPLATE_J_PERIODIC_BUSINESS_SUMMARY",
    name: "Weekly Business Intelligence Digest",
    description: "Executes periodic BI metric calculation and provides leadership with an operational summary.",
    category: "REPORTING",
    triggerType: "SCHEDULE_WEEKLY",
    actions: [
      {
        actionId: "GENERATE_BI_REPORT",
        params: {},
      },
      {
        actionId: "CREATE_NOTIFICATION",
        params: {
          title: "Weekly BI Digest Ready",
          message: "Your weekly operational metrics snapshot has been generated.",
        },
      },
    ],
  },
  {
    templateId: "TEMPLATE_K_KNOWLEDGE_GAP_REVIEW",
    name: "Knowledge Gap Threshold Monitor",
    description: "Flags frequent unanswered customer queries for AI Knowledge Base editorial review.",
    category: "SYSTEM",
    triggerType: "KNOWLEDGE_GAP_THRESHOLD",
    actions: [
      {
        actionId: "FLAG_KNOWLEDGE_GAP",
        params: { notes: "Frequent customer inquiry flagged by threshold rule." },
      },
      {
        actionId: "CREATE_NOTIFICATION",
        params: {
          title: "AI Knowledge Gap Flagged",
          message: "A new recurring visitor question has been added to the review queue for documentation.",
        },
      },
    ],
  },
  {
    templateId: "TEMPLATE_L_CUSTOM_WORKFLOW",
    name: "Custom Trigger-to-Action Automation",
    description: "A clean blueprint for administrators to compose custom event rules and sequential business actions.",
    category: "SYSTEM",
    triggerType: "TASK_ASSIGNED",
    actions: [
      {
        actionId: "CREATE_NOTIFICATION",
        params: { title: "Custom Workflow Notification", message: "Executed successfully." },
      },
    ],
  },
];

/**
 * Idempotently installs a template as a live workflow in the database
 */
export async function installTemplate(templateId: string, createdById?: string | null) {
  const template = BUSINESS_TEMPLATES.find((t) => t.templateId === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  // Idempotency check: see if a workflow with this exact name already exists
  const existing = await db.automationWorkflow.findFirst({
    where: { name: template.name },
  });

  if (existing) {
    return { workflow: existing, isNew: false };
  }

  const workflow = await db.automationWorkflow.create({
    data: {
      name: template.name,
      triggerType: template.triggerType,
      conditions: (template.conditions as any) || {
        category: template.category,
        description: template.description,
        approvalRequired: !!template.approvalRequired,
      },
      actions: template.actions as any,
      isActive: true,
      createdById: createdById || null,
    },
  });

  return { workflow, isNew: true };
}
