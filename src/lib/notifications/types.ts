/**
 * Axivon Technologies — Smart Notification & Reminder System Types
 */

export const NOTIFICATION_CATEGORIES = [
  "GENERAL",
  "ANNOUNCEMENT",
  "URGENT",
  "ATTENDANCE",
  "WORK_REPORT",
  "TASK",
  "LEAVE",
  "LEAD",
  "PROJECT",
  "COMMISSION",
  "SECURITY",
  "MAINTENANCE",
  "SYSTEM",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export const NOTIFICATION_TYPES = [
  // Attendance
  "ATTENDANCE_REMINDER",
  "ATTENDANCE_MISSING_MANAGER_ALERT",
  "ATTENDANCE_REGULARIZATION_SUBMITTED",
  "ATTENDANCE_REGULARIZATION_RESOLVED",

  // Work Reports
  "WORK_REPORT_REMINDER",
  "WORK_REPORT_OVERDUE",
  "WORK_REPORT_SUBMITTED",
  "WORK_REPORT_REVIEWED",

  // Tasks
  "TASK_ASSIGNED",
  "TASK_UPDATED",
  "TASK_DEADLINE_APPROACHING",
  "TASK_DUE_TODAY",
  "TASK_OVERDUE",
  "TASK_COMPLETED",

  // Leaves & Approvals
  "LEAVE_SUBMITTED",
  "LEAVE_APPROVED",
  "LEAVE_REJECTED",
  "APPROVAL_REQUESTED",
  "APPROVAL_DECIDED",

  // Partners & Leads
  "PARTNER_APPLICATION_APPROVED",
  "PARTNER_ACCOUNT_ACTIVATED",
  "LEAD_REGISTERED",
  "LEAD_ASSIGNED",
  "LEAD_STATUS_UPDATED",
  "LEAD_CONVERTED",
  "COMMISSION_EARNED",
  "PAYOUT_PROCESSED",

  // Projects & Clients
  "PROJECT_MILESTONE_UPDATED",
  "PROJECT_CONFIRMED",
  "PAYMENT_RECEIVED",
  "DOCUMENT_SHARED",

  // Announcements & Manual
  "ADMIN_ANNOUNCEMENT",
  "DEPARTMENT_ANNOUNCEMENT",
  "ROLE_ANNOUNCEMENT",
  "SECURITY_EVENT",
  "SYSTEM_EVENT",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const RECIPIENT_TYPES = [
  "SPECIFIC_USER",
  "MULTIPLE_USERS",
  "SELECTED_ROLE",
  "SELECTED_DEPARTMENT",
  "ALL_EMPLOYEES",
  "ALL_BROKERS",
  "ALL_MANAGERS",
  "FOUNDERS",
  "ALL_ACTIVE_USERS",
] as const;

export type RecipientType = (typeof RECIPIENT_TYPES)[number];

export interface SendNotificationOptions {
  type: NotificationType;
  title: string;
  message: string;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  link?: string | null;
  actionLabel?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  dedupKey?: string | null;
  channels?: ("IN_APP" | "PUSH" | "EMAIL")[];
  metadata?: Record<string, any>;
  sendEmail?: boolean;
  emailTemplateKey?: string;
  emailVariables?: Record<string, any>;
}

export interface DeviceTokenRecord {
  token: string;
  userId: string;
  platform: "ANDROID" | "IOS" | "WEB";
  deviceInfo?: string | null;
  lastActiveAt: string;
  createdAt: string;
}

export interface NotificationDeliveryResult {
  inApp: boolean;
  push: {
    attempted: boolean;
    sentCount: number;
    failedCount: number;
    errors?: string[];
  };
  email: {
    attempted: boolean;
    sent: boolean;
    error?: string;
  };
}

export interface ReminderScheduleSettings {
  timezone: string;
  attendanceReminderTime: string; // e.g. "10:00"
  attendanceManagerAlertTime: string; // e.g. "11:30"
  workReportReminderTime: string; // e.g. "17:00"
  workReportOverdueTime: string; // e.g. "19:00"
  workDays: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun (default [1,2,3,4,5,6])
  enableAttendanceReminders: boolean;
  enableWorkReportReminders: boolean;
  enableTaskReminders: boolean;
}
