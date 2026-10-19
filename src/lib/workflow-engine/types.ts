/**
 * AXIVON ONE: Central Workflow Automation & Intelligence Engine
 * Phase 3 Architecture: Core Types & Contracts
 */

export type WorkflowCategory =
  | "LEAD_MANAGEMENT"
  | "PROJECT_DELIVERY"
  | "WORKFORCE_OPS"
  | "CLIENT_ONBOARDING"
  | "PARTNER_BROKER"
  | "APPROVALS"
  | "REPORTING"
  | "SYSTEM";

export type TriggerCategory = "EVENT" | "SCHEDULE" | "MANUAL";

export type EventTriggerType =
  | "NEW_LEAD"
  | "LEAD_STATUS_CHANGED"
  | "STALE_LEAD_DETECTED"
  | "PROJECT_CREATED"
  | "PROJECT_DEADLINE_APPROACHING"
  | "TASK_ASSIGNED"
  | "TASK_OVERDUE"
  | "LEAVE_SUBMITTED"
  | "LEAVE_REVIEWED"
  | "CLIENT_ONBOARDING_STAGE"
  | "BROKER_LEAD_CHANGED"
  | "APPROVAL_PENDING_REMINDER"
  | "AUTOMATION_FAILED"
  | "KNOWLEDGE_GAP_THRESHOLD";

export type ScheduleTriggerType =
  | "SCHEDULE_HOURLY"
  | "SCHEDULE_DAILY"
  | "SCHEDULE_WEEKLY"
  | "SCHEDULE_MONTHLY"
  | "SCHEDULE_CRON";

export type ManualTriggerType = "MANUAL_TRIGGER";

export type TriggerType = EventTriggerType | ScheduleTriggerType | ManualTriggerType | string;

export type ConditionOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "GREATER_THAN_OR_EQUAL"
  | "LESS_THAN_OR_EQUAL"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "IS_EMPTY"
  | "IS_NOT_EMPTY"
  | "DATE_BEFORE"
  | "DATE_AFTER"
  | "IN_LIST";

export interface ConditionRule {
  field: string;
  operator: ConditionOperator;
  value?: any;
}

export interface ConditionGroup {
  combinator: "AND" | "OR";
  rules: (ConditionRule | ConditionGroup)[];
}

export type ActionId =
  | "CREATE_NOTIFICATION"
  | "SEND_EMAIL"
  | "CREATE_ACTIVITY"
  | "CREATE_FOLLOWUP"
  | "ASSIGN_LEAD"
  | "UPDATE_LEAD_STATUS"
  | "CREATE_TASK"
  | "CREATE_REMINDER"
  | "REQUEST_APPROVAL"
  | "GENERATE_BI_REPORT"
  | "FLAG_KNOWLEDGE_GAP"
  | "ALERT_ADMIN_FAILURE";

export interface ActionConfig {
  actionId: ActionId;
  params: Record<string, any>;
  order?: number;
  requiresApproval?: boolean;
}

export interface ExecutionPolicy {
  maxRetries: number;
  timeoutMs: number;
  backoffMs: number;
  rateLimitPerHour: number;
  idempotencyWindowHours: number;
}

export interface TriggerConfig {
  scheduleTimezone?: string;
  cronExpression?: string;
  filterSource?: string;
  thresholdHours?: number;
  eventFilters?: Record<string, any>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string | null;
  category: WorkflowCategory;
  triggerType: TriggerType;
  triggerConfig?: TriggerConfig;
  conditions?: ConditionGroup | null;
  actions: ActionConfig[];
  executionPolicy: ExecutionPolicy;
  isActive: boolean;
  approvalRequired: boolean;
  approvalRole?: string | null;
  version: number;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  lastExecution?: {
    status: string;
    executedAt: string;
    durationMs?: number;
  } | null;
}

export type ExecutionStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "WAITING_FOR_APPROVAL"
  | "RETRY_SCHEDULED"
  | "CANCELLED"
  | "SKIPPED"
  | "DRY_RUN";

export interface ExecutionStepResult {
  actionId: ActionId;
  success: boolean;
  output?: any;
  error?: string;
  skipped?: boolean;
  approvalRequestId?: string;
}

export interface WorkflowExecutionRecord {
  id: string;
  automationId: string;
  triggerEvent: string;
  status: ExecutionStatus;
  dedupKey?: string | null;
  executedAt: string;
  durationMs?: number;
  actionsExecuted?: ExecutionStepResult[];
  approvalStatus?: string | null;
  error?: string | null;
  result?: Record<string, any> | null;
}

export interface ApprovalDecision {
  approvalId: string;
  decision: "APPROVED" | "REJECTED";
  decidedById: string;
  reason?: string;
}

export interface DryRunSimulationResult {
  workflowId: string;
  workflowName: string;
  isSimulated: true;
  triggerEvaluated: boolean;
  conditionsPassed: boolean;
  conditionDetails?: Record<string, any>;
  actionsPlanned: Array<{
    actionId: ActionId;
    parameters: Record<string, any>;
    requiresApproval: boolean;
    preview: string;
  }>;
  simulatedAuditNote: string;
}
