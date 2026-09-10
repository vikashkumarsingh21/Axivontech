import { db } from "@/lib/db";
import { EmailService } from "@/lib/email/service";
import { NotificationService } from "@/lib/events/bus";

export interface AttendancePolicyConfig {
  workWindowStart: string; // e.g. "08:00"
  workWindowEnd: string;   // e.g. "19:00"
  defaultRequiredMinutes: number; // e.g. 480
  graceMinutes: number;    // e.g. 15
  cutoffTime: string;      // e.g. "19:00"
  weeklyOffDays: number[]; // [0] = Sunday, [0, 6] = Sun, Sat
  enableIncompleteAlerts: boolean;
  allowRemoteRegularization: boolean;
}

export const DEFAULT_ATTENDANCE_POLICY: AttendancePolicyConfig = {
  workWindowStart: "08:00",
  workWindowEnd: "19:00",
  defaultRequiredMinutes: 480,
  graceMinutes: 15,
  cutoffTime: "19:00",
  weeklyOffDays: [0], // Sunday
  enableIncompleteAlerts: true,
  allowRemoteRegularization: true,
};

export interface DailyCalculationResult {
  grossMinutes: number;
  breakMinutes: number;
  netMinutes: number;
  remainingMinutes: number;
  lateMinutes: number;
  earlyExitMinutes: number;
  isLate: boolean;
  isEarlyExit: boolean;
  completionStatus: "COMPLETE" | "INCOMPLETE" | "HALF_DAY" | "ON_LEAVE" | "HOLIDAY" | "WEEKLY_OFF";
  isWorking: boolean;
  isOnBreak: boolean;
  activeBreakStartTime: Date | null;
}

export class AttendanceService {
  /**
   * Retrieve active organization attendance policy or fallback to standard default
   */
  static async getPolicy(): Promise<AttendancePolicyConfig> {
    try {
      const policy = await db.attendancePolicy.findFirst({
        orderBy: { updatedAt: "desc" },
      });

      if (!policy) {
        return DEFAULT_ATTENDANCE_POLICY;
      }

      return {
        workWindowStart: policy.workWindowStart || DEFAULT_ATTENDANCE_POLICY.workWindowStart,
        workWindowEnd: policy.workWindowEnd || DEFAULT_ATTENDANCE_POLICY.workWindowEnd,
        defaultRequiredMinutes: policy.defaultRequiredMinutes || DEFAULT_ATTENDANCE_POLICY.defaultRequiredMinutes,
        graceMinutes: policy.graceMinutes ?? DEFAULT_ATTENDANCE_POLICY.graceMinutes,
        cutoffTime: policy.cutoffTime || DEFAULT_ATTENDANCE_POLICY.cutoffTime,
        weeklyOffDays: Array.isArray(policy.weeklyOffDays)
          ? (policy.weeklyOffDays as number[])
          : DEFAULT_ATTENDANCE_POLICY.weeklyOffDays,
        enableIncompleteAlerts: policy.enableIncompleteAlerts ?? true,
        allowRemoteRegularization: policy.allowRemoteRegularization ?? true,
      };
    } catch {
      return DEFAULT_ATTENDANCE_POLICY;
    }
  }

  /**
   * Pure calculation helper for an attendance record
   */
  static calculateDay(params: {
    checkInAt: Date | null;
    checkOutAt: Date | null;
    breaks?: Array<{ startTime: Date; endTime: Date | null; durationMinutes?: number | null }>;
    requiredDailyMinutes: number;
    policy?: AttendancePolicyConfig;
    isLeave?: boolean;
    isHoliday?: boolean;
    isWeeklyOff?: boolean;
    referenceTime?: Date;
  }): DailyCalculationResult {
    const {
      checkInAt,
      checkOutAt,
      breaks = [],
      requiredDailyMinutes,
      policy = DEFAULT_ATTENDANCE_POLICY,
      isLeave = false,
      isHoliday = false,
      isWeeklyOff = false,
      referenceTime = new Date(),
    } = params;

    if (isLeave) {
      return {
        grossMinutes: 0,
        breakMinutes: 0,
        netMinutes: 0,
        remainingMinutes: 0,
        lateMinutes: 0,
        earlyExitMinutes: 0,
        isLate: false,
        isEarlyExit: false,
        completionStatus: "ON_LEAVE",
        isWorking: false,
        isOnBreak: false,
        activeBreakStartTime: null,
      };
    }

    if (isHoliday) {
      return {
        grossMinutes: 0,
        breakMinutes: 0,
        netMinutes: 0,
        remainingMinutes: 0,
        lateMinutes: 0,
        earlyExitMinutes: 0,
        isLate: false,
        isEarlyExit: false,
        completionStatus: "HOLIDAY",
        isWorking: false,
        isOnBreak: false,
        activeBreakStartTime: null,
      };
    }

    if (isWeeklyOff && !checkInAt) {
      return {
        grossMinutes: 0,
        breakMinutes: 0,
        netMinutes: 0,
        remainingMinutes: 0,
        lateMinutes: 0,
        earlyExitMinutes: 0,
        isLate: false,
        isEarlyExit: false,
        completionStatus: "WEEKLY_OFF",
        isWorking: false,
        isOnBreak: false,
        activeBreakStartTime: null,
      };
    }

    if (!checkInAt) {
      return {
        grossMinutes: 0,
        breakMinutes: 0,
        netMinutes: 0,
        remainingMinutes: requiredDailyMinutes,
        lateMinutes: 0,
        earlyExitMinutes: 0,
        isLate: false,
        isEarlyExit: false,
        completionStatus: "INCOMPLETE",
        isWorking: false,
        isOnBreak: false,
        activeBreakStartTime: null,
      };
    }

    const effectiveEnd = checkOutAt ? new Date(checkOutAt) : referenceTime;
    const grossMs = Math.max(0, effectiveEnd.getTime() - new Date(checkInAt).getTime());
    const grossMinutes = Math.floor(grossMs / 60000);

    let breakMinutes = 0;
    let isOnBreak = false;
    let activeBreakStartTime: Date | null = null;

    for (const b of breaks) {
      const bStart = new Date(b.startTime);
      if (b.endTime) {
        const bEnd = new Date(b.endTime);
        const bDuration = b.durationMinutes ?? Math.max(0, Math.floor((bEnd.getTime() - bStart.getTime()) / 60000));
        breakMinutes += bDuration;
      } else {
        // Active ongoing break
        isOnBreak = true;
        activeBreakStartTime = bStart;
        const bDuration = Math.max(0, Math.floor((effectiveEnd.getTime() - bStart.getTime()) / 60000));
        breakMinutes += bDuration;
      }
    }

    const netMinutes = Math.max(0, grossMinutes - breakMinutes);
    const remainingMinutes = Math.max(0, requiredDailyMinutes - netMinutes);

    // Calculate Lateness based on Company Work Window Start (08:00 AM) + grace period
    let lateMinutes = 0;
    let isLate = false;

    const [startH, startM] = policy.workWindowStart.split(":").map(Number);
    const checkInDateObj = new Date(checkInAt);
    
    // Set UTC hours if checkInAt is given in UTC, else local hours
    const windowStartTime = new Date(checkInDateObj);
    windowStartTime.setUTCHours(startH, startM, 0, 0);

    const graceStartTime = new Date(windowStartTime.getTime() + (policy.graceMinutes || 0) * 60000);
    if (checkInDateObj.getTime() > graceStartTime.getTime()) {
      lateMinutes = Math.floor((checkInDateObj.getTime() - windowStartTime.getTime()) / 60000);
      isLate = true;
    }

    // Early exit calculation
    let earlyExitMinutes = 0;
    let isEarlyExit = false;

    if (checkOutAt) {
      if (netMinutes < requiredDailyMinutes) {
        isEarlyExit = true;
        earlyExitMinutes = remainingMinutes;
      }
    }

    let completionStatus: DailyCalculationResult["completionStatus"] = "INCOMPLETE";
    if (netMinutes >= requiredDailyMinutes) {
      completionStatus = "COMPLETE";
    } else {
      completionStatus = "INCOMPLETE";
    }

    return {
      grossMinutes,
      breakMinutes,
      netMinutes,
      remainingMinutes,
      lateMinutes,
      earlyExitMinutes,
      isLate,
      isEarlyExit,
      completionStatus,
      isWorking: !checkOutAt && !isOnBreak,
      isOnBreak,
      activeBreakStartTime,
    };
  }

  /**
   * Run the end-of-day cutoff check (07:00 PM cutoff) to identify incomplete hours and dispatch alerts
   */
  static async processCutoffAlerts(targetDate?: Date): Promise<{
    date: string;
    totalEmployees: number;
    alertsSent: number;
    completed: number;
    incomplete: number;
    exempted: number;
  }> {
    const policy = await this.getPolicy();
    if (!policy.enableIncompleteAlerts) {
      return { date: (targetDate || new Date()).toISOString(), totalEmployees: 0, alertsSent: 0, completed: 0, incomplete: 0, exempted: 0 };
    }

    const dateToProcess = targetDate ? new Date(targetDate) : new Date();
    dateToProcess.setHours(0, 0, 0, 0);

    const dateStr = dateToProcess.toISOString().split("T")[0];
    const dayOfWeek = dateToProcess.getDay();

    // Check if whole day is weekly off
    const isWeeklyOffDay = policy.weeklyOffDays.includes(dayOfWeek);

    // Check if whole day is company holiday
    const holiday = await db.holiday.findFirst({
      where: { date: dateToProcess },
    });

    const employees = await db.user.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        employeeId: true,
        requiredDailyMinutes: true,
      },
    });

    let alertsSent = 0;
    let completed = 0;
    let incomplete = 0;
    let exempted = 0;

    for (const emp of employees) {
      // 1. Check approved leave
      const leave = await db.leaveRequest.findFirst({
        where: {
          userId: emp.id,
          status: "APPROVED",
          startDate: { lte: dateToProcess },
          endDate: { gte: dateToProcess },
        },
      });

      if (leave || holiday || (isWeeklyOffDay && !leave)) {
        exempted++;
        continue;
      }

      // 2. Fetch employee attendance for target date
      const attendance = await db.attendance.findFirst({
        where: {
          userId: emp.id,
          date: dateToProcess,
        },
        include: {
          breaks: true,
        },
      });

      const requiredMins = emp.requiredDailyMinutes || policy.defaultRequiredMinutes || 480;

      const calc = this.calculateDay({
        checkInAt: attendance ? attendance.checkInAt : null,
        checkOutAt: attendance ? attendance.checkOutAt : null,
        breaks: attendance?.breaks || [],
        requiredDailyMinutes: requiredMins,
        policy,
        isLeave: !!leave,
        isHoliday: !!holiday,
        isWeeklyOff: isWeeklyOffDay,
      });

      // Update Attendance record with latest calculations
      if (attendance) {
        await db.attendance.update({
          where: { id: attendance.id },
          data: {
            grossMinutes: calc.grossMinutes,
            breakMinutes: calc.breakMinutes,
            netMinutes: calc.netMinutes,
            totalMinutes: calc.netMinutes,
            remainingMinutes: calc.remainingMinutes,
            lateMinutes: calc.lateMinutes,
            earlyExitMinutes: calc.earlyExitMinutes,
            isLate: calc.isLate,
            isEarlyExit: calc.isEarlyExit,
            completionStatus: calc.completionStatus,
            status: calc.completionStatus,
          },
        });
      }

      if (calc.completionStatus === "COMPLETE") {
        completed++;
      } else {
        incomplete++;

        // Dispatch Email Alert if not already sent for this specific date
        if (!attendance?.emailAlertSent) {
          const reqHours = (requiredMins / 60).toFixed(1);
          const workedHours = (calc.netMinutes / 60).toFixed(1);
          const shortfallHours = (calc.remainingMinutes / 60).toFixed(1);
          const checkInFormatted = attendance?.checkInAt
            ? new Date(attendance.checkInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
            : "No Check-in";
          const checkOutFormatted = attendance?.checkOutAt
            ? new Date(attendance.checkOutAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
            : "No Check-out";

          try {
            await EmailService.send({
              to: emp.email,
              templateKey: "ATTENDANCE_INCOMPLETE_ALERT",
              variables: {
                employeeName: emp.name,
                employeeId: emp.employeeId || emp.id,
                date: dateStr,
                companyWindow: `${policy.workWindowStart} - ${policy.workWindowEnd}`,
                requiredHours: `${reqHours} Hours (${requiredMins} mins)`,
                workedHours: `${workedHours} Hours (${calc.netMinutes} mins)`,
                breakHours: `${(calc.breakMinutes / 60).toFixed(1)} Hours`,
                shortfallHours: `${shortfallHours} Hours (${calc.remainingMinutes} mins)`,
                checkInTime: checkInFormatted,
                checkOutTime: checkOutFormatted,
                status: calc.completionStatus,
              },
              metadata: {
                idempotencyKey: `ATTENDANCE_INCOMPLETE::${emp.id}::${dateStr}`,
                userId: emp.id,
                date: dateStr,
              },
            });

            // Also dispatch in-app notification
            await NotificationService.create({
              userId: emp.id,
              type: "ATTENDANCE_ALERT",
              title: "Attendance Notice: Required Working Hours Not Met",
              message: `Your attendance record for ${dateStr} shows ${workedHours}h of ${reqHours}h completed (${shortfallHours}h shortfall). Please submit regularization if needed.`,
              entityType: "ATTENDANCE",
              entityId: attendance?.id || emp.id,
              priority: "HIGH",
              dedupKey: `ATTENDANCE_NOTIF::${emp.id}::${dateStr}`,
            });

            if (attendance) {
              await db.attendance.update({
                where: { id: attendance.id },
                data: { emailAlertSent: true },
              });
            }

            alertsSent++;
          } catch (err: any) {
            console.error(`[AttendanceService] Failed sending incomplete hours alert to ${emp.email}:`, err.message);
          }
        }
      }
    }

    return {
      date: dateStr,
      totalEmployees: employees.length,
      alertsSent,
      completed,
      incomplete,
      exempted,
    };
  }
}
