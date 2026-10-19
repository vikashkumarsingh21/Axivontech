import { sanitizeUserInput } from "@/lib/chatbot/ai-engine";
import { WorkflowCategory, TriggerType, ActionId, ConditionGroup, ActionConfig } from "./types";
import { ACTION_REGISTRY } from "./action-registry";

export interface AIWorkflowProposal {
  name: string;
  description: string;
  category: WorkflowCategory;
  triggerType: TriggerType;
  conditions?: ConditionGroup;
  actions: ActionConfig[];
  approvalRequired: boolean;
  approvalRole?: string;
  rationale: string;
  warnings: string[];
  isDraft: true;
}

const ALLOWED_TRIGGERS: TriggerType[] = [
  "NEW_LEAD",
  "LEAD_STATUS_CHANGED",
  "STALE_LEAD_DETECTED",
  "PROJECT_CREATED",
  "PROJECT_DEADLINE_APPROACHING",
  "TASK_ASSIGNED",
  "TASK_OVERDUE",
  "LEAVE_SUBMITTED",
  "LEAVE_REVIEWED",
  "CLIENT_ONBOARDING_STAGE",
  "BROKER_LEAD_CHANGED",
  "APPROVAL_PENDING_REMINDER",
  "AUTOMATION_FAILED",
  "KNOWLEDGE_GAP_THRESHOLD",
  "SCHEDULE_HOURLY",
  "SCHEDULE_DAILY",
  "SCHEDULE_WEEKLY",
  "MANUAL_TRIGGER",
];

const ALLOWED_ACTIONS: ActionId[] = Object.keys(ACTION_REGISTRY) as ActionId[];

/**
 * Generates a structured, validated workflow proposal from natural language prompt
 */
export async function proposeWorkflowFromNaturalLanguage(
  prompt: string,
  userRole = "ADMIN"
): Promise<{ success: boolean; proposal?: AIWorkflowProposal; error?: string }> {
  // 1. Sanitize input against prompt injection
  const { safe, sanitized } = sanitizeUserInput(prompt, 800);
  if (!safe) {
    return {
      success: false,
      error: "Your request contained instruction overrides or unsafe tokens. Workflow generation stopped.",
    };
  }

  const p = sanitized.toLowerCase();
  const warnings: string[] = [];

  // 2. Identify Matching Trigger
  let triggerType: TriggerType = "NEW_LEAD";
  let category: WorkflowCategory = "LEAD_MANAGEMENT";
  let name = "Automated Business Process";
  let description = "AI-assisted workflow draft.";
  let actions: ActionConfig[] = [];
  let approvalRequired = false;

  if (p.includes("lead") || p.includes("prospect") || p.includes("crm")) {
    category = "LEAD_MANAGEMENT";
    if (p.includes("stale") || p.includes("inactive") || p.includes("uncontacted")) {
      triggerType = "STALE_LEAD_DETECTED";
      name = "Stale Lead Follow-up Alert";
      description = "Monitors leads without updates for 48 hours and creates reminders.";
      actions = [
        { actionId: "CREATE_REMINDER", params: { title: "Follow up on stale lead", type: "TASK" } },
        { actionId: "CREATE_NOTIFICATION", params: { title: "Lead Inactivity Notice", priority: "HIGH" } },
      ];
    } else {
      triggerType = "NEW_LEAD";
      name = "Inbound Lead Triage & Follow-up";
      description = "Assigns incoming leads and schedules timely discovery follow-up.";
      actions = [
        { actionId: "CREATE_FOLLOWUP", params: { delayHours: 24, notes: "Automated discovery follow-up" } },
        { actionId: "CREATE_NOTIFICATION", params: { title: "New Inbound Lead", priority: "HIGH" } },
      ];
    }
  } else if (p.includes("task") || p.includes("overdue") || p.includes("assign")) {
    category = "WORKFORCE_OPS";
    triggerType = p.includes("overdue") ? "TASK_OVERDUE" : "TASK_ASSIGNED";
    name = p.includes("overdue") ? "Overdue Task Escalation" : "Task Assignment Notification";
    description = "Tracks task progression and alerts team members.";
    actions = [
      { actionId: "CREATE_NOTIFICATION", params: { title: "Task Status Notice", priority: "URGENT" } },
      { actionId: "CREATE_ACTIVITY", params: { summary: "Task status notification logged" } },
    ];
  } else if (p.includes("project") || p.includes("milestone") || p.includes("deadline")) {
    category = "PROJECT_DELIVERY";
    triggerType = "PROJECT_DEADLINE_APPROACHING";
    name = "Project Milestone Proximity Warning";
    description = "Alerts project teams when deadlines fall within 72 hours.";
    actions = [
      { actionId: "CREATE_NOTIFICATION", params: { title: "Milestone Deadline Alert", priority: "HIGH" } },
      { actionId: "CREATE_ACTIVITY", params: { summary: "Project delivery proximity logged" } },
    ];
  } else if (p.includes("leave") || p.includes("vacation") || p.includes("holiday")) {
    category = "WORKFORCE_OPS";
    triggerType = "LEAVE_SUBMITTED";
    name = "Employee Leave Approval Routing";
    description = "Submits leave requests for administrative sign-off.";
    approvalRequired = true;
    actions = [
      { actionId: "REQUEST_APPROVAL", params: { requestType: "LEAVE_APPROVAL" }, requiresApproval: true },
      { actionId: "CREATE_NOTIFICATION", params: { title: "Leave Application Pending Decision" } },
    ];
  } else if (p.includes("report") || p.includes("summary") || p.includes("bi") || p.includes("digest")) {
    category = "REPORTING";
    triggerType = "SCHEDULE_WEEKLY";
    name = "Periodic Business Intelligence Digest";
    description = "Computes periodic analytics overview and dispatches notification.";
    actions = [
      { actionId: "GENERATE_BI_REPORT", params: {} },
      { actionId: "CREATE_NOTIFICATION", params: { title: "Weekly BI Digest Available" } },
    ];
  } else {
    // Default custom
    triggerType = "MANUAL_TRIGGER";
    category = "SYSTEM";
    name = "Custom Workflow Draft";
    description = `Proposed workflow for prompt: "${prompt.slice(0, 60)}"`;
    actions = [{ actionId: "CREATE_NOTIFICATION", params: { title: "Workflow Execution Notice" } }];
  }

  // High-impact protection check
  if (p.includes("delete") || p.includes("payment") || p.includes("commission") || p.includes("payout")) {
    approvalRequired = true;
    warnings.push("High-impact action detected. Human administrator approval has been enforced on this workflow.");
  }

  // 3. Strict Validation against allowlists
  if (!ALLOWED_TRIGGERS.includes(triggerType)) {
    return {
      success: false,
      error: `Unsupported trigger '${triggerType}'. Must be an approved platform trigger.`,
    };
  }

  const validatedActions: ActionConfig[] = [];
  for (const a of actions) {
    if (ALLOWED_ACTIONS.includes(a.actionId)) {
      validatedActions.push(a);
    } else {
      warnings.push(`Skipped unsupported action '${a.actionId}'.`);
    }
  }

  if (validatedActions.length === 0) {
    validatedActions.push({
      actionId: "CREATE_NOTIFICATION",
      params: { title: "Workflow Notice" },
    });
  }

  const proposal: AIWorkflowProposal = {
    name,
    description,
    category,
    triggerType,
    actions: validatedActions,
    approvalRequired,
    approvalRole: approvalRequired ? "ADMIN" : undefined,
    rationale: `Derived from prompt: "${prompt}". Mapped to trigger "${triggerType}" with ${validatedActions.length} safe allowlisted action(s).`,
    warnings,
    isDraft: true,
  };

  return { success: true, proposal };
}
