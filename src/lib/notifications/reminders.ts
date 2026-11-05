import { db } from "@/lib/db";
import { NotificationService } from "./service";
import { getReminderScheduleSettings } from "./settings";
import { ReminderScheduleSettings } from "./types";
import { getUtcCalendarDate, toCalendarDateString } from "@/lib/date-utils";

/**
 * Extracts zoned time and date components in the configured timezone (e.g. Asia/Kolkata).
 */
export function getZonedTimeParts(date: Date, timezone: string = "Asia/Kolkata") {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });

  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;

  const yyyy = map.year;
  const mm = map.month;
  const dd = map.day;
  const hour = parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);
  const timeMinutes = hour * 60 + minute;
  const timeStr = `${map.hour}:${map.minute}`;
  const dateStr = `${yyyy}-${mm}-${dd}`;

  // Map weekday to 0=Sun, 1=Mon, ..., 6=Sat
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayOfWeek = weekdayMap[map.weekday] ?? date.getDay();

  // Create start and end of day dates in UTC for queries
  const startOfDay = new Date(Date.UTC(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10), 23, 59, 59, 999));

  return {
    year: parseInt(yyyy, 10),
    month: parseInt(mm, 10),
    day: parseInt(dd, 10),
    hour,
    minute,
    timeMinutes,
    timeStr,
    dateStr,
    dayOfWeek,
    startOfDay,
    endOfDay,
  };
}

/**
 * Parses "HH:MM" string into minutes from midnight.
 */
function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Checks whether the given date is a working day and not a company holiday.
 */
export async function isWorkingDay(
  dateParts: ReturnType<typeof getZonedTimeParts>,
  settings: ReminderScheduleSettings
): Promise<{ isWorkDay: boolean; reason?: string }> {
  // Check day of week (e.g. Sunday)
  if (!settings.workDays.includes(dateParts.dayOfWeek)) {
    return { isWorkDay: false, reason: "Weekly Off / Non-working day" };
  }

  // Check company holiday
  try {
    const holiday = await db.holiday.findFirst({
      where: {
        date: { gte: dateParts.startOfDay, lte: dateParts.endOfDay },
        isCompanyHoliday: true,
      },
    });

    if (holiday) {
      return { isWorkDay: false, reason: `Company Holiday: ${holiday.name}` };
    }
  } catch (err) {
    console.warn("[Reminders] Holiday check error:", err);
  }

  return { isWorkDay: true };
}

/**
 * Resolves the department managers or fallback platform admins for a given user.
 */
export async function getDepartmentManagersForUser(userId: string): Promise<string[]> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { department: true },
    });

    if (user?.department) {
      const dept = await db.department.findFirst({
        where: {
          OR: [
            { id: user.department },
            { name: user.department },
            { code: user.department },
          ],
        },
        include: {
          managers: true,
        },
      });

      const managerIds: string[] = [];
      if (dept?.managerId) managerIds.push(dept.managerId);
      if (dept?.managers) {
        for (const m of dept.managers) {
          managerIds.push(m.userId);
        }
      }

      if (managerIds.length > 0) {
        return Array.from(new Set(managerIds));
      }
    }

    // Fallback: Administrators & Founders
    const admins = await db.user.findMany({
      where: {
        status: "ACTIVE",
        userRoles: {
          some: {
            role: { name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] } },
          },
        },
      },
      select: { id: true },
    });

    return admins.map((a) => a.id);
  } catch (err) {
    console.error("[Reminders] Error resolving department managers:", err);
    return [];
  }
}

/**
 * Automated Attendance Reminders:
 * - 10:00 AM check-in reminder to employees who have not marked attendance.
 * - Exempts approved leaves, holidays, non-working days, and already checked-in employees.
 * - After cutoff (11:30 AM), alerts Department Managers with missing attendance list.
 */
export async function runAttendanceReminders(options: { now?: Date; dryRun?: boolean } = {}) {
  const now = options.now || new Date();
  const settings = await getReminderScheduleSettings();

  if (!settings.enableAttendanceReminders) {
    return { executed: false, reason: "Attendance reminders disabled in settings" };
  }

  const parts = getZonedTimeParts(now, settings.timezone);
  const workDayCheck = await isWorkingDay(parts, settings);

  if (!workDayCheck.isWorkDay) {
    return { executed: false, reason: workDayCheck.reason };
  }

  const reminderMinutes = parseTimeToMinutes(settings.attendanceReminderTime);
  const cutoffMinutes = parseTimeToMinutes(settings.attendanceManagerAlertTime);
  const currentMinutes = parts.timeMinutes;

  const result = {
    executed: true,
    time: parts.timeStr,
    employeesEvaluated: 0,
    checkInRemindersSent: 0,
    managerAlertsSent: 0,
    exemptedOnLeave: 0,
    alreadyCheckedIn: 0,
    dryRun: !!options.dryRun,
  };

  // 1. Fetch active employees
  const employees = await db.user.findMany({
    where: {
      status: "ACTIVE",
      userRoles: {
        some: {
          role: { name: { in: ["EMPLOYEE", "DEPARTMENT_MANAGER"] } },
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
    },
  });

  result.employeesEvaluated = employees.length;

  const missingEmployees: typeof employees = [];

  for (const emp of employees) {
    // Check if employee has approved leave covering today
    const approvedLeave = await db.leaveRequest.findFirst({
      where: {
        userId: emp.id,
        status: "APPROVED",
        startDate: { lte: parts.endOfDay },
        endDate: { gte: parts.startOfDay },
      },
    });

    if (approvedLeave) {
      result.exemptedOnLeave++;
      continue;
    }

    // Check if employee has already marked attendance today
    const todayAttendance = await db.attendance.findFirst({
      where: {
        userId: emp.id,
        OR: [
          { date: { gte: parts.startOfDay, lte: parts.endOfDay } },
          { checkInAt: { gte: parts.startOfDay, lte: parts.endOfDay } },
        ],
      },
    });

    if (todayAttendance) {
      result.alreadyCheckedIn++;
      continue;
    }

    missingEmployees.push(emp);

    // Send check-in reminder to employee if past reminder time
    if (currentMinutes >= reminderMinutes && currentMinutes < cutoffMinutes + 120) {
      const dedupKey = `attendance_reminder:${emp.id}:${parts.dateStr}`;
      if (!options.dryRun) {
        await NotificationService.sendToUser(emp.id, {
          type: "ATTENDANCE_REMINDER",
          title: "Attendance Check-In Reminder",
          message: "Good morning! Please mark your daily attendance to start your work session.",
          category: "ATTENDANCE",
          priority: "HIGH",
          link: "/employee/attendance",
          actionLabel: "Mark Attendance",
          dedupKey,
          channels: ["IN_APP", "PUSH"],
        });
      }
      result.checkInRemindersSent++;
    }
  }

  // 2. Cutoff alert to Department Managers
  if (currentMinutes >= cutoffMinutes && missingEmployees.length > 0) {
    // Group missing employees by department
    const deptGroups = new Map<string, typeof employees>();
    for (const emp of missingEmployees) {
      const deptKey = emp.department || "General";
      const list = deptGroups.get(deptKey) || [];
      list.push(emp);
      deptGroups.set(deptKey, list);
    }

    for (const [deptName, missingInDept] of deptGroups.entries()) {
      // Find managers of this department
      const managers = await getDepartmentManagersForUser(missingInDept[0].id);

      for (const mgrId of managers) {
        const dedupKey = `attendance_missing_alert:${mgrId}:${deptName}:${parts.dateStr}`;
        const namesPreview = missingInDept.slice(0, 3).map((e) => e.name).join(", ");
        const extraCount = missingInDept.length > 3 ? ` and ${missingInDept.length - 3} others` : "";

        if (!options.dryRun) {
          await NotificationService.sendToUser(mgrId, {
            type: "ATTENDANCE_MISSING_MANAGER_ALERT",
            title: `Missing Attendance: ${deptName}`,
            message: `${missingInDept.length} team member(s) have not marked attendance today (${namesPreview}${extraCount}).`,
            category: "ATTENDANCE",
            priority: "HIGH",
            link: "/admin/attendance",
            actionLabel: "View Attendance",
            dedupKey,
            channels: ["IN_APP", "PUSH", "EMAIL"],
          });
        }
        result.managerAlertsSent++;
      }
    }
  }

  return result;
}

/**
 * Automated Work Report Reminders:
 * - 5:00 PM pre-deadline reminder to employees who haven't submitted their daily work report.
 * - 7:00 PM overdue alert to employees if still unsubmitted.
 * - Auto-stops reminders once work report is submitted.
 * - Exempts approved leaves, non-working days, and holidays.
 */
export async function runWorkReportReminders(options: { now?: Date; dryRun?: boolean } = {}) {
  const now = options.now || new Date();
  const settings = await getReminderScheduleSettings();

  if (!settings.enableWorkReportReminders) {
    return { executed: false, reason: "Work report reminders disabled in settings" };
  }

  const parts = getZonedTimeParts(now, settings.timezone);
  const workDayCheck = await isWorkingDay(parts, settings);

  if (!workDayCheck.isWorkDay) {
    return { executed: false, reason: workDayCheck.reason };
  }

  const reminderMinutes = parseTimeToMinutes(settings.workReportReminderTime);
  const overdueMinutes = parseTimeToMinutes(settings.workReportOverdueTime);
  const currentMinutes = parts.timeMinutes;

  const result = {
    executed: true,
    time: parts.timeStr,
    employeesEvaluated: 0,
    regularRemindersSent: 0,
    overdueAlertsSent: 0,
    alreadySubmitted: 0,
    exemptedOnLeave: 0,
    dryRun: !!options.dryRun,
  };

  const employees = await db.user.findMany({
    where: {
      status: "ACTIVE",
      userRoles: {
        some: {
          role: { name: { in: ["EMPLOYEE", "DEPARTMENT_MANAGER"] } },
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  result.employeesEvaluated = employees.length;

  for (const emp of employees) {
    // Check if on full-day approved leave
    const approvedLeave = await db.leaveRequest.findFirst({
      where: {
        userId: emp.id,
        status: "APPROVED",
        isHalfDay: false,
        startDate: { lte: parts.endOfDay },
        endDate: { gte: parts.startOfDay },
      },
    });

    if (approvedLeave) {
      result.exemptedOnLeave++;
      continue;
    }

    // Check if work report already submitted for today
    const reportToday = await db.workReport.findFirst({
      where: {
        userId: emp.id,
        date: { gte: parts.startOfDay, lte: parts.endOfDay },
        status: "SUBMITTED",
      },
    });

    if (reportToday) {
      result.alreadySubmitted++;
      // Auto-stop reminders!
      continue;
    }

    // 1. Overdue Alert (after 7:00 PM)
    if (currentMinutes >= overdueMinutes) {
      const dedupKey = `work_report_overdue:${emp.id}:${parts.dateStr}`;
      if (!options.dryRun) {
        await NotificationService.sendToUser(emp.id, {
          type: "WORK_REPORT_OVERDUE",
          title: "Action Required: Daily Work Report Overdue",
          message: "Your daily work report for today has not been submitted. Please submit it now before cutoff.",
          category: "WORK_REPORT",
          priority: "URGENT",
          link: "/employee/work-reports",
          actionLabel: "Submit Report Now",
          dedupKey,
          channels: ["IN_APP", "PUSH", "EMAIL"],
        });
      }
      result.overdueAlertsSent++;
    }
    // 2. Pre-deadline Reminder (5:00 PM to 7:00 PM)
    else if (currentMinutes >= reminderMinutes) {
      const dedupKey = `work_report_reminder:${emp.id}:${parts.dateStr}`;
      if (!options.dryRun) {
        await NotificationService.sendToUser(emp.id, {
          type: "WORK_REPORT_REMINDER",
          title: "Daily Work Report Reminder",
          message: "Please remember to submit your daily work report and log your tasks for today.",
          category: "WORK_REPORT",
          priority: "NORMAL",
          link: "/employee/work-reports",
          actionLabel: "Submit Report",
          dedupKey,
          channels: ["IN_APP", "PUSH"],
        });
      }
      result.regularRemindersSent++;
    }
  }

  return result;
}

/**
 * Automated Task Deadline Reminders:
 * - 1-day before deadline: Approaching alert.
 * - Due today alert.
 * - Overdue alert if past due date.
 * - Automatically stops reminders once task is completed.
 */
export async function runTaskDeadlineReminders(options: { now?: Date; dryRun?: boolean } = {}) {
  const now = options.now || new Date();
  const settings = await getReminderScheduleSettings();

  if (!settings.enableTaskReminders) {
    return { executed: false, reason: "Task reminders disabled in settings" };
  }

  const parts = getZonedTimeParts(now, settings.timezone);

  const result = {
    executed: true,
    tasksEvaluated: 0,
    dueTomorrowSent: 0,
    dueTodaySent: 0,
    overdueSent: 0,
    dryRun: !!options.dryRun,
  };

  // Find non-completed tasks with assigned users and due dates
  const tasks = await db.task.findMany({
    where: {
      status: { notIn: ["COMPLETED", "DONE", "CANCELLED"] },
      dueDate: { not: null },
    },
    select: {
      id: true,
      title: true,
      userId: true,
      dueDate: true,
      priority: true,
      status: true,
    },
  });

  result.tasksEvaluated = tasks.length;

  for (const task of tasks) {
    if (!task.userId || !task.dueDate) continue;

    const taskDueDate = new Date(task.dueDate);
    const taskZoned = getZonedTimeParts(taskDueDate, settings.timezone);

    // Calculate days difference
    const diffMs = taskDueDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // 1. Task Overdue (dueDate is strictly in the past and before today's start)
    if (taskDueDate < parts.startOfDay) {
      const dedupKey = `task_overdue:${task.id}:${parts.dateStr}`;
      if (!options.dryRun) {
        await NotificationService.sendToUser(task.userId, {
          type: "TASK_OVERDUE",
          title: `Task Overdue: "${task.title}"`,
          message: `The deadline for task "${task.title}" has passed. Please complete or update it immediately.`,
          category: "TASK",
          priority: "URGENT",
          link: "/employee/tasks",
          actionLabel: "View Task",
          entityType: "TASK",
          entityId: task.id,
          dedupKey,
          channels: ["IN_APP", "PUSH", "EMAIL"],
        });
      }
      result.overdueSent++;
    }
    // 2. Task Due Today (due date matches today's calendar date)
    else if (taskZoned.dateStr === parts.dateStr) {
      const dedupKey = `task_due_today:${task.id}:${parts.dateStr}`;
      if (!options.dryRun) {
        await NotificationService.sendToUser(task.userId, {
          type: "TASK_DUE_TODAY",
          title: `Task Due Today: "${task.title}"`,
          message: `Your assigned task "${task.title}" is due today. Please finalize and submit your progress.`,
          category: "TASK",
          priority: "HIGH",
          link: "/employee/tasks",
          actionLabel: "View Task",
          entityType: "TASK",
          entityId: task.id,
          dedupKey,
          channels: ["IN_APP", "PUSH"],
        });
      }
      result.dueTodaySent++;
    }
    // 3. Task Approaching Deadline (due tomorrow, ~18-42 hours away)
    else if (diffHours > 12 && diffHours <= 36) {
      const dedupKey = `task_due_tomorrow:${task.id}:${parts.dateStr}`;
      if (!options.dryRun) {
        await NotificationService.sendToUser(task.userId, {
          type: "TASK_DEADLINE_APPROACHING",
          title: `Task Due Tomorrow: "${task.title}"`,
          message: `Reminder: Task "${task.title}" is due tomorrow. Please plan accordingly.`,
          category: "TASK",
          priority: "NORMAL",
          link: "/employee/tasks",
          actionLabel: "View Task",
          entityType: "TASK",
          entityId: task.id,
          dedupKey,
          channels: ["IN_APP", "PUSH"],
        });
      }
      result.dueTomorrowSent++;
    }
  }

  return result;
}

/**
 * Business Event Trigger: Daily Work Report Submitted
 * Notifies the assigned Department Manager(s) and platform administrators.
 */
export async function notifyWorkReportSubmitted(params: {
  reportId: string;
  employeeUserId: string;
  date: Date;
  hoursWorked: number;
  summary: string;
}) {
  try {
    const employee = await db.user.findUnique({
      where: { id: params.employeeUserId },
      select: { id: true, name: true, department: true },
    });

    if (!employee) return;

    const managerIds = await getDepartmentManagersForUser(employee.id);
    const dateFormatted = params.date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    for (const managerId of managerIds) {
      // Avoid notifying the employee if they happen to be their own manager
      if (managerId === employee.id) continue;

      await NotificationService.sendToUser(managerId, {
        type: "WORK_REPORT_SUBMITTED",
        title: `Work Report Submitted: ${employee.name}`,
        message: `${employee.name} submitted work report for ${dateFormatted} (${params.hoursWorked} hrs). Summary: ${params.summary.slice(0, 90)}...`,
        category: "WORK_REPORT",
        priority: "NORMAL",
        link: "/admin/work-reports",
        actionLabel: "Review Report",
        entityType: "WORK_REPORT",
        entityId: params.reportId,
        channels: ["IN_APP", "PUSH"],
      });
    }
  } catch (err) {
    console.error("[Reminders] Error notifying work report submission:", err);
  }
}

/**
 * Business Event Trigger: Leave Request Submitted
 * Notifies Department Managers of a pending leave request.
 */
export async function notifyLeaveSubmitted(params: {
  leaveId: string;
  employeeUserId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason?: string | null;
}) {
  try {
    const employee = await db.user.findUnique({
      where: { id: params.employeeUserId },
      select: { id: true, name: true, department: true },
    });

    if (!employee) return;

    const managerIds = await getDepartmentManagersForUser(employee.id);
    const startStr = toCalendarDateString(params.startDate);
    const endStr = toCalendarDateString(params.endDate);
    const durationStr = startStr === endStr ? startStr : `${startStr} to ${endStr}`;

    for (const managerId of managerIds) {
      if (managerId === employee.id) continue;

      await NotificationService.sendToUser(managerId, {
        type: "LEAVE_SUBMITTED",
        title: `Leave Request: ${employee.name}`,
        message: `${employee.name} requested ${params.leaveType} leave for ${durationStr}. Reason: ${params.reason || "Not specified"}`,
        category: "LEAVE",
        priority: "HIGH",
        link: "/admin/leaves",
        actionLabel: "Review Leave",
        entityType: "LEAVE_REQUEST",
        entityId: params.leaveId,
        channels: ["IN_APP", "PUSH", "EMAIL"],
      });
    }
  } catch (err) {
    console.error("[Reminders] Error notifying leave submission:", err);
  }
}

/**
 * Business Event Trigger: Leave Request Approved or Rejected
 * Notifies the requesting employee of the manager's decision.
 */
export async function notifyLeaveDecided(params: {
  leaveId: string;
  employeeUserId: string;
  status: "APPROVED" | "REJECTED";
  approverName?: string | null;
  rejectionReason?: string | null;
}) {
  try {
    const isApproved = params.status === "APPROVED";
    const title = isApproved ? "Leave Request Approved ✅" : "Leave Request Rejected ❌";
    const approverStr = params.approverName ? ` by ${params.approverName}` : "";
    const detailStr = !isApproved && params.rejectionReason ? ` Reason: ${params.rejectionReason}` : "";

    await NotificationService.sendToUser(params.employeeUserId, {
      type: isApproved ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
      title,
      message: `Your leave request has been ${params.status.toLowerCase()}${approverStr}.${detailStr}`,
      category: "LEAVE",
      priority: isApproved ? "NORMAL" : "HIGH",
      link: "/employee/leaves",
      actionLabel: "View Leaves",
      entityType: "LEAVE_REQUEST",
      entityId: params.leaveId,
      channels: ["IN_APP", "PUSH", "EMAIL"],
    });
  } catch (err) {
    console.error("[Reminders] Error notifying leave decision:", err);
  }
}

/**
 * Business Event Trigger: Task Assigned
 * Notifies assignee of new task assignment.
 */
export async function notifyTaskAssigned(params: {
  taskId: string;
  assigneeUserId: string;
  taskTitle: string;
  assignerName?: string | null;
  dueDate?: Date | null;
}) {
  try {
    const assignerStr = params.assignerName ? ` by ${params.assignerName}` : "";
    const dueStr = params.dueDate
      ? ` Due: ${toCalendarDateString(params.dueDate)}`
      : "";

    await NotificationService.sendToUser(params.assigneeUserId, {
      type: "TASK_ASSIGNED",
      title: "New Task Assigned",
      message: `You were assigned task "${params.taskTitle}"${assignerStr}.${dueStr}`,
      category: "TASK",
      priority: "NORMAL",
      link: "/employee/tasks",
      actionLabel: "Open Task",
      entityType: "TASK",
      entityId: params.taskId,
      channels: ["IN_APP", "PUSH"],
    });
  } catch (err) {
    console.error("[Reminders] Error notifying task assignment:", err);
  }
}

/**
 * Automated Reminders for Pending Approvals & Requests:
 * - High-impact executive approval requests pending > 24 hours
 * - Employee leave requests pending > 24 hours
 * - Attendance regularization requests pending > 24 hours
 * - Idempotent with daily dedupKey per request ID.
 */
export async function runPendingApprovalReminders(options: { now?: Date; dryRun?: boolean } = {}) {
  const now = options.now || new Date();
  const settings = await getReminderScheduleSettings();
  const parts = getZonedTimeParts(now, settings.timezone);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const result = {
    executed: true,
    approvalsEvaluated: 0,
    remindersSent: 0,
    dryRun: !!options.dryRun,
  };

  // 1. Pending Approval Requests (Executive / Admin)
  try {
    const pendingApprovals = await db.approvalRequest.findMany({
      where: {
        status: "PENDING",
        createdAt: { lte: oneDayAgo },
      },
      include: {
        requestedBy: { select: { id: true, name: true } },
      },
      take: 20,
    });

    result.approvalsEvaluated += pendingApprovals.length;

    if (pendingApprovals.length > 0) {
      const executiveUserIds = await NotificationService.resolveAudience("FOUNDERS");
      for (const req of pendingApprovals) {
        const dedupKey = `pending_approval_reminder:${req.id}:${parts.dateStr}`;
        for (const execId of executiveUserIds) {
          if (!options.dryRun) {
            await NotificationService.sendToUser(execId, {
              type: "APPROVAL_REQUESTED",
              title: "Pending Approval Reminder",
              message: `Approval request "${req.requestType.replace(/_/g, " ")}" requested by ${req.requestedBy?.name || "a user"} is awaiting your review.`,
              category: "GENERAL",
              priority: "HIGH",
              link: "/executive/approvals",
              actionLabel: "Review Approval",
              entityType: "APPROVAL_REQUEST",
              entityId: req.id,
              dedupKey,
              channels: ["IN_APP", "PUSH"],
            });
          }
          result.remindersSent++;
        }
      }
    }
  } catch (err) {
    console.warn("[Reminders] Pending approval requests check error:", err);
  }

  // 2. Pending Leave Requests > 24 hours
  try {
    const pendingLeaves = await db.leaveRequest.findMany({
      where: {
        status: "PENDING",
        createdAt: { lte: oneDayAgo },
      },
      include: {
        user: { select: { id: true, name: true, department: true } },
      },
      take: 20,
    });

    result.approvalsEvaluated += pendingLeaves.length;

    for (const leave of pendingLeaves) {
      const managers = await getDepartmentManagersForUser(leave.user.id);
      const dedupKey = `pending_leave_escalation:${leave.id}:${parts.dateStr}`;

      for (const mgrId of managers) {
        if (!options.dryRun) {
          await NotificationService.sendToUser(mgrId, {
            type: "LEAVE_SUBMITTED",
            title: `Pending Leave Reminder: ${leave.user.name}`,
            message: `Leave request for ${leave.user.name} (${leave.leaveType}) has been awaiting action for over 24 hours.`,
            category: "LEAVE",
            priority: "NORMAL",
            link: "/admin/leaves",
            actionLabel: "Review Request",
            entityType: "LEAVE_REQUEST",
            entityId: leave.id,
            dedupKey,
            channels: ["IN_APP", "PUSH"],
          });
        }
        result.remindersSent++;
      }
    }
  } catch (err) {
    console.warn("[Reminders] Pending leave reminders check error:", err);
  }

  // 3. Pending Attendance Regularizations > 24 hours
  try {
    const pendingRegs = await db.regularizationRequest.findMany({
      where: {
        status: "PENDING",
        createdAt: { lte: oneDayAgo },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
      take: 20,
    });

    result.approvalsEvaluated += pendingRegs.length;

    for (const reg of pendingRegs) {
      const managers = await getDepartmentManagersForUser(reg.user.id);
      const dedupKey = `pending_regularization_escalation:${reg.id}:${parts.dateStr}`;

      for (const mgrId of managers) {
        if (!options.dryRun) {
          await NotificationService.sendToUser(mgrId, {
            type: "ATTENDANCE_REGULARIZATION_SUBMITTED",
            title: `Pending Regularization: ${reg.user.name}`,
            message: `Attendance regularization submitted by ${reg.user.name} is awaiting review.`,
            category: "ATTENDANCE",
            priority: "NORMAL",
            link: "/admin/attendance",
            actionLabel: "Review",
            entityType: "REGULARIZATION_REQUEST",
            entityId: reg.id,
            dedupKey,
            channels: ["IN_APP", "PUSH"],
          });
        }
        result.remindersSent++;
      }
    }
  } catch (err) {
    console.warn("[Reminders] Pending regularization check error:", err);
  }

  return result;
}
