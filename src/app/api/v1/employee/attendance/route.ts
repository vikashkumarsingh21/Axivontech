import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  requireEmployee,
  apiSuccess,
  apiError,
  parseBody,
  checkIdempotency,
  checkRateLimit,
  getCompanyCalendarDate,
  getCompanyDateString,
  getCompanyTimezone,
} from "@/lib/api/foundation";
import { AttendanceService } from "@/lib/services/attendance.service";
import { isSameCalendarDay } from "@/lib/date-utils";
import { closeStaleAttendance, getEmployeeUnregularizedMissedCheckouts } from "@/lib/attendance/stale-attendance";

const attendanceActionSchema = z.object({
  action: z.enum(["check-in", "check-out", "break-start", "break-end"]),
  breakType: z.enum(["LUNCH", "TEA", "SHORT_BREAK", "PERSONAL", "OTHER"]).optional().default("LUNCH"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireEmployee(req);
    const timezone = await getCompanyTimezone();
    const policy = await AttendanceService.getPolicy();
    const requiredMinutes = user.requiredDailyMinutes || policy.defaultRequiredMinutes || 480;

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view"); // "live", "monthly", or default "full"
    const now = new Date();
    const todayCalendarDate = getCompanyCalendarDate(now, timezone);

    // ─── Auto-close forgotten open sessions from past days ─────────────
    await closeStaleAttendance(now, { userId: user.id });

    // ─── Fetch unregularized missed checkouts for top alert banner ──────
    const unregularizedMissedCheckouts = await getEmployeeUnregularizedMissedCheckouts(user.id);

    // ─── Fetch 90 days history ──────────────────────────────────────────
    const records = await db.attendance.findMany({
      where: { userId: user.id },
      include: {
        breaks: {
          orderBy: { startTime: "asc" },
        },
        regularization: true,
      },
      orderBy: [{ date: "desc" }, { checkInAt: "desc" }],
      take: 90,
    });

    const todayRecord = records.find(
      (r) => isSameCalendarDay(r.date, todayCalendarDate) || (r.checkInAt && isSameCalendarDay(r.checkInAt, todayCalendarDate))
    );
    const activeSession = todayRecord && !todayRecord.checkOutAt && !!todayRecord.checkInAt ? todayRecord : null;

    // Approved Leave check for today
    let todayLeave = null;
    try {
      todayLeave = await db.leaveRequest.findFirst({
        where: {
          userId: user.id,
          status: "APPROVED",
          startDate: { lte: todayCalendarDate },
          endDate: { gte: todayCalendarDate },
        },
        select: { id: true, leaveType: true },
      });
    } catch {
      todayLeave = null;
    }

    // Company Holiday check for today
    let todayHoliday = null;
    try {
      todayHoliday = await db.holiday.findFirst({
        where: { date: todayCalendarDate },
        select: { id: true, name: true, date: true },
      });
    } catch {
      todayHoliday = null;
    }

    const dayOfWeek = todayCalendarDate.getUTCDay();
    const isWeeklyOff = Array.isArray(policy?.weeklyOffDays)
      ? policy.weeklyOffDays.includes(dayOfWeek)
      : false;

    // Today's live calculation
    const todayCalc = AttendanceService.calculateDay({
      checkInAt: todayRecord?.checkInAt || null,
      checkOutAt: todayRecord?.checkOutAt || null,
      breaks: todayRecord?.breaks || [],
      requiredDailyMinutes: todayRecord?.requiredDailyMinutes || requiredMinutes,
      policy,
      isLeave: !!todayLeave,
      isHoliday: !!todayHoliday,
      isWeeklyOff,
      referenceTime: now,
    });

    // ─── Live State Response (for running timers) ──────────────────────
    const ongoingBreak = todayRecord?.breaks?.find((b) => !b.endTime);
    const liveTimer = {
      isWorking: todayCalc.isWorking,
      isOnBreak: todayCalc.isOnBreak,
      activeBreak: ongoingBreak
        ? {
            id: ongoingBreak.id,
            startTime: ongoingBreak.startTime,
            type: ongoingBreak.type,
            elapsedSeconds: Math.max(0, Math.floor((now.getTime() - new Date(ongoingBreak.startTime).getTime()) / 1000)),
          }
        : null,
      checkInAt: todayRecord?.checkInAt || null,
      checkOutAt: todayRecord?.checkOutAt || null,
      serverTime: now.toISOString(),
      netMinutes: todayCalc.netMinutes,
      breakMinutes: todayCalc.breakMinutes,
      requiredMinutes: todayRecord?.requiredDailyMinutes || requiredMinutes,
      remainingMinutes: todayCalc.remainingMinutes,
      status: todayRecord?.checkInAt ? (activeSession ? "IN_PROGRESS" : todayCalc.completionStatus) : "NOT_STARTED",
    };

    if (view === "live") {
      return apiSuccess(liveTimer, undefined, { live: liveTimer });
    }

    // ─── Format Historical Records & Monthly Summary ───────────────────
    const history = records.map((r) => {
      const reqMins = r.requiredDailyMinutes || requiredMinutes;
      const isToday = isSameCalendarDay(r.date, todayCalendarDate) || (r.checkInAt && isSameCalendarDay(r.checkInAt, todayCalendarDate));
      const isActive = isToday && !r.checkOutAt && !!r.checkInAt;
      const isMissedCheckout = r.status === "MISSED_CHECKOUT" || (!r.checkOutAt && !isToday);

      const rCalc = AttendanceService.calculateDay({
        checkInAt: r.checkInAt,
        checkOutAt: r.checkOutAt,
        breaks: r.breaks || [],
        requiredDailyMinutes: reqMins,
        policy,
        referenceTime: now,
        isMissedCheckout,
        status: r.status,
      });

      const displayStatus = isMissedCheckout
        ? "MISSED_CHECKOUT"
        : (isActive ? "IN_PROGRESS" : rCalc.completionStatus);

      return {
        id: r.id,
        date: r.date,
        checkInAt: r.checkInAt,
        checkOutAt: r.checkOutAt,
        grossMinutes: isMissedCheckout ? null : rCalc.grossMinutes,
        breakMinutes: isMissedCheckout ? 0 : rCalc.breakMinutes,
        workedMinutes: isMissedCheckout ? null : rCalc.netMinutes,
        netMinutes: isMissedCheckout ? null : rCalc.netMinutes,
        requiredMinutes: reqMins,
        remainingMinutes: isMissedCheckout ? null : rCalc.remainingMinutes,
        differenceMinutes: isMissedCheckout ? null : (rCalc.netMinutes - reqMins),
        status: displayStatus,
        completionStatus: displayStatus,
        isLate: isMissedCheckout ? false : rCalc.isLate,
        lateMinutes: isMissedCheckout ? 0 : rCalc.lateMinutes,
        isEarlyExit: isMissedCheckout ? false : rCalc.isEarlyExit,
        autoClosedAt: r.autoClosedAt,
        regularizedAt: r.regularizedAt,
        regularizedById: r.regularizedById,
        breaks: r.breaks,
        regularization: r.regularization,
        notes: r.notes,
      };
    });

    // Monthly summary calculation (current month or requested month)
    const currentMonthPrefix = getCompanyDateString(now, timezone).slice(0, 7); // "YYYY-MM"
    const targetMonthPrefix = searchParams.get("month") || currentMonthPrefix;

    const monthRecords = history.filter((r) => {
      const rDateStr = r.date instanceof Date ? r.date.toISOString().slice(0, 7) : String(r.date).slice(0, 7);
      return rDateStr === targetMonthPrefix;
    });

    let presentDays = 0;
    let lateDays = 0;
    let halfDays = 0;
    let missedCheckoutDays = 0;
    let totalWorkedMinutes = 0;
    let totalRequiredMinutes = 0;

    for (const r of monthRecords) {
      if (r.status === "MISSED_CHECKOUT") {
        missedCheckoutDays += 1;
        // Unregularized missed check-outs are NOT counted as worked days or shortfalls
        continue;
      }
      if (["COMPLETE", "PRESENT", "IN_PROGRESS"].includes(r.status)) presentDays += 1;
      if (r.status === "HALF_DAY") halfDays += 1;
      if (r.isLate) lateDays += 1;
      totalWorkedMinutes += r.netMinutes || 0;
      totalRequiredMinutes += r.requiredMinutes || requiredMinutes;
    }

    const monthlySummary = {
      month: targetMonthPrefix,
      presentDays,
      halfDays,
      lateDays,
      missedCheckoutDays,
      totalWorkedMinutes,
      totalWorkedHours: parseFloat((totalWorkedMinutes / 60).toFixed(1)),
      totalRequiredMinutes,
      totalRequiredHours: parseFloat((totalRequiredMinutes / 60).toFixed(1)),
      overtimeMinutes: Math.max(0, totalWorkedMinutes - totalRequiredMinutes),
      shortfallMinutes: Math.max(0, totalRequiredMinutes - totalWorkedMinutes),
    };

    const responsePayload = {
      policy: {
        workWindowStart: policy.workWindowStart,
        workWindowEnd: policy.workWindowEnd,
        defaultRequiredMinutes: policy.defaultRequiredMinutes,
        graceMinutes: policy.graceMinutes,
        cutoffTime: policy.cutoffTime,
        weeklyOffDays: policy.weeklyOffDays,
      },
      today: {
        id: todayRecord?.id || null,
        isWorking: todayCalc.isWorking,
        isOnBreak: todayCalc.isOnBreak,
        activeBreakStartTime: todayCalc.activeBreakStartTime,
        checkInAt: todayRecord?.checkInAt || null,
        checkOutAt: todayRecord?.checkOutAt || null,
        grossMinutes: todayCalc.grossMinutes,
        breakMinutes: todayCalc.breakMinutes,
        workedMinutes: todayCalc.netMinutes,
        netMinutes: todayCalc.netMinutes,
        requiredMinutes: todayRecord?.requiredDailyMinutes || requiredMinutes,
        remainingMinutes: todayCalc.remainingMinutes,
        differenceMinutes: todayCalc.netMinutes - (todayRecord?.requiredDailyMinutes || requiredMinutes),
        isLate: todayCalc.isLate,
        lateMinutes: todayCalc.lateMinutes,
        isEarlyExit: todayCalc.isEarlyExit,
        earlyExitMinutes: todayCalc.earlyExitMinutes,
        status: todayRecord?.checkInAt ? (activeSession ? "IN_PROGRESS" : todayCalc.completionStatus) : "NOT_STARTED",
        completionStatus: todayCalc.completionStatus,
        breaks: todayRecord?.breaks || [],
        isLeave: !!todayLeave,
        isHoliday: !!todayHoliday,
        isWeeklyOff,
      },
      records: history,
      monthlySummary,
      live: liveTimer,
      unregularizedMissedCheckouts: unregularizedMissedCheckouts.map((r) => ({
        id: r.id,
        date: r.date,
        checkInAt: r.checkInAt,
        autoClosedAt: r.autoClosedAt,
        regularization: r.regularization,
      })),
    };

    return apiSuccess(responsePayload, undefined, {
      policy: responsePayload.policy,
      today: responsePayload.today,
      records: history,
      summary: monthlySummary,
      unregularizedMissedCheckouts: responsePayload.unregularizedMissedCheckouts,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireEmployee(req);
    const timezone = await getCompanyTimezone();
    const policy = await AttendanceService.getPolicy();
    const requiredMinutes = user.requiredDailyMinutes || policy.defaultRequiredMinutes || 480;

    const body = await parseBody(req, attendanceActionSchema);
    const { action, breakType, notes } = body;

    // Double-click idempotency protection (2.5s window per user action)
    checkIdempotency(`${user.id}:attendance:${action}`, 2500);
    // Rate limit: max 25 mutations per minute
    checkRateLimit(`${user.id}:attendance`, 25, 60);

    const now = new Date();
    const todayCalendarDate = getCompanyCalendarDate(now, timezone);

    // Auto-close any stale past days before processing today's mutations
    await closeStaleAttendance(now, { userId: user.id });

    // 1. Locate today's active open session (where checkOutAt is null strictly for today)
    const activeSession = await db.attendance.findFirst({
      where: {
        userId: user.id,
        date: todayCalendarDate,
        checkOutAt: null,
      },
      include: {
        breaks: {
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { checkInAt: "desc" },
    });

    // 2. Locate today's existing attendance record
    const todayRecord =
      activeSession ||
      (await db.attendance.findFirst({
        where: {
          userId: user.id,
          date: todayCalendarDate,
        },
        include: {
          breaks: {
            orderBy: { startTime: "asc" },
          },
        },
        orderBy: { checkInAt: "desc" },
      }));

    // ─── ACTION 1: CHECK-IN ────────────────────────────────────────────────
    if (action === "check-in") {
      // Prevent double check-in if already in an active working session
      if (activeSession && isSameCalendarDay(activeSession.date, todayCalendarDate)) {
        throw new ApiError(400, "You already have an active check-in session for today", undefined, "ALREADY_CHECKED_IN");
      }

      // Check for approved leave or holiday warning (warn, do not crash)
      let leaveWarning: string | null = null;
      const leave = await db.leaveRequest.findFirst({
        where: {
          userId: user.id,
          status: "APPROVED",
          startDate: { lte: todayCalendarDate },
          endDate: { gte: todayCalendarDate },
        },
      });
      if (leave) {
        leaveWarning = `Notice: You have an approved ${leave.leaveType} leave scheduled for today.`;
      }

      const holiday = await db.holiday.findFirst({
        where: { date: todayCalendarDate },
      });
      if (holiday) {
        leaveWarning = `Notice: Today is observed as a company holiday (${holiday.name}).`;
      }

      let record;
      if (todayRecord) {
        // Multi-session in a day (BUG-008 fix):
        // If employee checked out earlier today, record the idle gap as an intermittent break
        if (todayRecord.checkOutAt && todayRecord.checkOutAt < now) {
          const gapMinutes = Math.max(0, Math.round((now.getTime() - todayRecord.checkOutAt.getTime()) / 60000));
          if (gapMinutes > 0) {
            await db.attendanceBreak.create({
              data: {
                attendanceId: todayRecord.id,
                startTime: todayRecord.checkOutAt,
                endTime: now,
                durationMinutes: gapMinutes,
                type: "OTHER",
                notes: "Intermittent logoff between attendance sessions",
              },
            });
          }
        }

        record = await db.attendance.update({
          where: { id: todayRecord.id },
          data: {
            checkInAt: todayRecord.checkInAt || now,
            checkOutAt: null,
            requiredDailyMinutes: requiredMinutes,
            status: "IN_PROGRESS",
            completionStatus: "INCOMPLETE",
            notes: notes ? (todayRecord.notes ? `${todayRecord.notes} | ${notes}` : notes) : todayRecord.notes,
          },
          include: { breaks: true },
        });
      } else {
        record = await db.attendance.create({
          data: {
            userId: user.id,
            date: todayCalendarDate,
            checkInAt: now,
            requiredDailyMinutes: requiredMinutes,
            status: "IN_PROGRESS",
            completionStatus: "INCOMPLETE",
            notes,
          },
          include: { breaks: true },
        });
      }

      const calc = AttendanceService.calculateDay({
        checkInAt: record.checkInAt,
        checkOutAt: record.checkOutAt,
        breaks: record.breaks,
        requiredDailyMinutes: requiredMinutes,
        policy,
      });

      await db.attendance.update({
        where: { id: record.id },
        data: {
          isLate: calc.isLate,
          lateMinutes: calc.lateMinutes,
        },
      });

      const message = leaveWarning
        ? `Checked in successfully. ${leaveWarning}`
        : "Checked in successfully";

      return apiSuccess(
        { record, calc, warning: leaveWarning },
        undefined,
        { record, message },
        200
      );
    }

    const activeTarget = activeSession || (todayRecord && !todayRecord.checkOutAt ? todayRecord : null);

    // ─── ACTION 2: BREAK-START ─────────────────────────────────────────────
    if (action === "break-start") {
      if (!activeTarget) {
        throw new ApiError(400, "You must be checked in before starting a break", undefined, "NOT_CHECKED_IN");
      }

      const ongoingBreak = activeTarget.breaks.find((b) => !b.endTime);
      if (ongoingBreak) {
        throw new ApiError(400, "You already have an active ongoing break", undefined, "BREAK_ALREADY_ACTIVE");
      }

      const newBreak = await db.attendanceBreak.create({
        data: {
          attendanceId: activeTarget.id,
          startTime: now,
          type: breakType || "LUNCH",
          notes,
        },
      });

      return apiSuccess(
        { break: newBreak },
        undefined,
        { break: newBreak, message: `Break (${breakType || "LUNCH"}) started` },
        200
      );
    }

    // ─── ACTION 3: BREAK-END ───────────────────────────────────────────────
    if (action === "break-end") {
      if (!activeTarget) {
        throw new ApiError(400, "No active attendance session found", undefined, "NOT_CHECKED_IN");
      }

      const ongoingBreak = activeTarget.breaks.find((b) => !b.endTime);
      if (!ongoingBreak) {
        throw new ApiError(400, "No active break found to end", undefined, "NO_ACTIVE_BREAK");
      }

      const durationMinutes = Math.max(
        1,
        Math.floor((now.getTime() - new Date(ongoingBreak.startTime).getTime()) / 60000)
      );

      await db.attendanceBreak.update({
        where: { id: ongoingBreak.id },
        data: {
          endTime: now,
          durationMinutes,
        },
      });

      const updatedBreaks = await db.attendanceBreak.findMany({
        where: { attendanceId: activeTarget.id },
      });

      const calc = AttendanceService.calculateDay({
        checkInAt: activeTarget.checkInAt,
        checkOutAt: activeTarget.checkOutAt,
        breaks: updatedBreaks,
        requiredDailyMinutes: activeTarget.requiredDailyMinutes || requiredMinutes,
        policy,
      });

      await db.attendance.update({
        where: { id: activeTarget.id },
        data: {
          breakMinutes: calc.breakMinutes,
          netMinutes: calc.netMinutes,
          totalMinutes: calc.netMinutes,
          remainingMinutes: calc.remainingMinutes,
        },
      });

      return apiSuccess(
        { durationMinutes, calc },
        undefined,
        { message: `Break ended. Duration: ${durationMinutes} minutes` },
        200
      );
    }

    // ─── ACTION 4: CHECK-OUT ───────────────────────────────────────────────
    if (action === "check-out") {
      if (!activeTarget) {
        // Check if employee is attempting to check out a past closed session
        const pastStaleSession = await db.attendance.findFirst({
          where: {
            userId: user.id,
            date: { lt: todayCalendarDate },
            status: "MISSED_CHECKOUT",
          },
          orderBy: { date: "desc" },
        });

        if (pastStaleSession) {
          throw new ApiError(
            400,
            "This day was closed. Please submit a correction request.",
            undefined,
            "DAY_ALREADY_CLOSED"
          );
        }

        throw new ApiError(400, "You are not currently checked in", undefined, "NOT_CHECKED_IN");
      }

      // Auto-close any dangling break upon checkout
      const ongoingBreak = activeTarget.breaks.find((b) => !b.endTime);
      if (ongoingBreak) {
        const breakDuration = Math.max(
          1,
          Math.floor((now.getTime() - new Date(ongoingBreak.startTime).getTime()) / 60000)
        );
        await db.attendanceBreak.update({
          where: { id: ongoingBreak.id },
          data: {
            endTime: now,
            durationMinutes: breakDuration,
          },
        });
      }

      const allBreaks = await db.attendanceBreak.findMany({
        where: { attendanceId: activeTarget.id },
      });

      const targetRequiredMinutes = activeTarget.requiredDailyMinutes || requiredMinutes;
      const calc = AttendanceService.calculateDay({
        checkInAt: activeTarget.checkInAt,
        checkOutAt: now,
        breaks: allBreaks,
        requiredDailyMinutes: targetRequiredMinutes,
        policy,
      });

      const record = await db.attendance.update({
        where: { id: activeTarget.id },
        data: {
          checkOutAt: now,
          grossMinutes: calc.grossMinutes,
          breakMinutes: calc.breakMinutes,
          netMinutes: calc.netMinutes,
          totalMinutes: calc.netMinutes,
          requiredDailyMinutes: targetRequiredMinutes,
          remainingMinutes: calc.remainingMinutes,
          lateMinutes: calc.lateMinutes,
          earlyExitMinutes: calc.earlyExitMinutes,
          isLate: calc.isLate,
          isEarlyExit: calc.isEarlyExit,
          status: calc.completionStatus,
          completionStatus: calc.completionStatus,
          notes: notes ? (activeTarget.notes ? `${activeTarget.notes} | ${notes}` : notes) : activeTarget.notes,
        },
        include: { breaks: true },
      });

      const hours = Math.floor(calc.netMinutes / 60);
      const mins = calc.netMinutes % 60;
      const message = `Checked out. Net worked: ${hours}h ${mins}m (${calc.completionStatus})`;

      return apiSuccess(
        { record, calc },
        undefined,
        { record, calc, message },
        200
      );
    }

    throw new ApiError(400, "Invalid attendance action specified", undefined, "INVALID_ACTION");
  } catch (e) {
    return handleApiError(e);
  }
}
