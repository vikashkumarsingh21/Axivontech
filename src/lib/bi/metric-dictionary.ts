/**
 * AXIVON ONE: Central Business Intelligence Engine
 * Phase 3 Metric Dictionary & Access Governance Specification
 *
 * Defines the canonical source of truth for all system metrics, their formula,
 * backing Prisma models, calculation method, refresh frequency, and role access tiers.
 */

export interface MetricDefinition {
  metricId: string;
  name: string;
  category: "OVERVIEW" | "SALES_CRM" | "PROJECTS" | "OPERATIONS" | "FINANCE" | "AUTOMATION";
  description: string;
  formula: string;
  backingModels: string[];
  unit: "COUNT" | "CURRENCY" | "PERCENTAGE" | "DAYS" | "HOURS" | "RATIO";
  refreshCadence: "REAL_TIME" | "HOURLY" | "DAILY";
  allowedRoles: string[];
  csvExportable: boolean;
}

export const BI_METRIC_DICTIONARY: Record<string, MetricDefinition> = {
  // 1. Business Overview KPIs
  TOTAL_LEADS_VOLUME: {
    metricId: "TOTAL_LEADS_VOLUME",
    name: "Total Lead Volume",
    category: "OVERVIEW",
    description: "Total inbound leads captured across all public and referral channels.",
    formula: "COUNT(Lead.id)",
    backingModels: ["Lead"],
    unit: "COUNT",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    csvExportable: true,
  },
  LEAD_QUALIFICATION_RATE: {
    metricId: "LEAD_QUALIFICATION_RATE",
    name: "Lead Qualification Rate",
    category: "OVERVIEW",
    description: "Percentage of newly registered leads scored as QUALIFIED within the selected period.",
    formula: "(COUNT(Lead[qualificationStatus == 'QUALIFIED']) / COUNT(Lead)) * 100",
    backingModels: ["Lead"],
    unit: "PERCENTAGE",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    csvExportable: true,
  },
  CONVERSION_RATE: {
    metricId: "CONVERSION_RATE",
    name: "Sales Conversion Rate",
    category: "OVERVIEW",
    description: "Percentage of leads that transitioned to active paying clients or converted projects.",
    formula: "(COUNT(Lead[status == 'CONVERTED']) / COUNT(Lead)) * 100",
    backingModels: ["Lead", "CrmClient"],
    unit: "PERCENTAGE",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    csvExportable: true,
  },
  ACTIVE_PROJECT_COUNT: {
    metricId: "ACTIVE_PROJECT_COUNT",
    name: "Active Projects",
    category: "PROJECTS",
    description: "Number of client and internal projects currently under active development.",
    formula: "COUNT(PartnerProject[status NOT IN ('COMPLETED', 'DELIVERED', 'CANCELLED')])",
    backingModels: ["PartnerProject"],
    unit: "COUNT",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN", "EMPLOYEE"],
    csvExportable: true,
  },
  OVERDUE_MILESTONES: {
    metricId: "OVERDUE_MILESTONES",
    name: "Overdue Delivery Milestones",
    category: "PROJECTS",
    description: "Count of project milestones with targetDate < NOW and status != 'COMPLETED'.",
    formula: "COUNT(PartnerProjectMilestone[targetDate < NOW AND status != 'COMPLETED'])",
    backingModels: ["PartnerProjectMilestone"],
    unit: "COUNT",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    csvExportable: true,
  },
  TASK_COMPLETION_VELOCITY: {
    metricId: "TASK_COMPLETION_VELOCITY",
    name: "Task Completion Velocity",
    category: "OPERATIONS",
    description: "Count of operational and development tasks closed within the period window.",
    formula: "COUNT(Task[status == 'COMPLETED' AND updatedAt BETWEEN (start, end)])",
    backingModels: ["Task"],
    unit: "COUNT",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN", "EMPLOYEE"],
    csvExportable: true,
  },
  TEAM_CAPACITY_HEADCOUNT: {
    metricId: "TEAM_CAPACITY_HEADCOUNT",
    name: "Active Staff Headcount",
    category: "OPERATIONS",
    description: "Active staff members available for operational execution.",
    formula: "COUNT(User[status == 'ACTIVE' AND userRoles NONE ('CLIENT', 'BROKER')])",
    backingModels: ["User", "UserRole"],
    unit: "COUNT",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    csvExportable: true,
  },

  // 2. Financial & Revenue
  GROSS_PIPELINE_VALUE: {
    metricId: "GROSS_PIPELINE_VALUE",
    name: "Gross Pipeline Value",
    category: "FINANCE",
    description: "Aggregated estimated budget values of all active non-rejected leads.",
    formula: "SUM(Lead.estimatedBudget WHERE status NOT IN ('LOST', 'ARCHIVED'))",
    backingModels: ["Lead"],
    unit: "CURRENCY",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    csvExportable: true,
  },
  RECORDED_CONTRACT_VALUE: {
    metricId: "RECORDED_CONTRACT_VALUE",
    name: "Contracted Revenue Total",
    category: "FINANCE",
    description: "Sum of contracted project totals across active and delivered partner projects.",
    formula: "SUM(PartnerProject.contractValue WHERE status != 'CANCELLED')",
    backingModels: ["PartnerProject"],
    unit: "CURRENCY",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER"],
    csvExportable: true,
  },
  BROKER_COMMISSION_LIABILITY: {
    metricId: "BROKER_COMMISSION_LIABILITY",
    name: "Pending Commission Liability",
    category: "FINANCE",
    description: "Sum of approved broker commissions awaiting payout disbursement.",
    formula: "SUM(BrokerCommission.amount WHERE status == 'APPROVED')",
    backingModels: ["BrokerCommission"],
    unit: "CURRENCY",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    csvExportable: true,
  },

  // 3. Workflow & Automation Health
  AUTOMATION_EXECUTION_TOTAL: {
    metricId: "AUTOMATION_EXECUTION_TOTAL",
    name: "Automation Execution Total",
    category: "AUTOMATION",
    description: "Total automated workflow runs executed across event, schedule, and manual triggers.",
    formula: "COUNT(AutomationExecution.id WHERE createdAt BETWEEN (start, end))",
    backingModels: ["AutomationExecution"],
    unit: "COUNT",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    csvExportable: true,
  },
  AUTOMATION_SUCCESS_RATE: {
    metricId: "AUTOMATION_SUCCESS_RATE",
    name: "Automation Success Rate",
    category: "AUTOMATION",
    description: "Ratio of successful automated workflow runs against terminal failures.",
    formula: "(COUNT(AutomationExecution[status == 'SUCCESS']) / COUNT(AutomationExecution)) * 100",
    backingModels: ["AutomationExecution"],
    unit: "PERCENTAGE",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    csvExportable: true,
  },
  PENDING_APPROVAL_VOLUME: {
    metricId: "PENDING_APPROVAL_VOLUME",
    name: "Pending Human Approvals",
    category: "AUTOMATION",
    description: "Count of sensitive or high-impact actions currently queued for human review.",
    formula: "COUNT(ApprovalRequest[status == 'PENDING'])",
    backingModels: ["ApprovalRequest"],
    unit: "COUNT",
    refreshCadence: "REAL_TIME",
    allowedRoles: ["FOUNDER", "CO_FOUNDER", "ADMIN"],
    csvExportable: true,
  },
};

/**
 * Validates whether a specific role has authorization to query or view a metric
 */
export function isRoleAuthorizedForMetric(role: string, metricId: string): boolean {
  const metric = BI_METRIC_DICTIONARY[metricId];
  if (!metric) return false;
  return metric.allowedRoles.includes(role);
}

/**
 * Returns all metrics accessible to the specified user role
 */
export function getMetricsForRole(role: string): MetricDefinition[] {
  return Object.values(BI_METRIC_DICTIONARY).filter((m) => m.allowedRoles.includes(role));
}
