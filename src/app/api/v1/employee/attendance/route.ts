import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";
import { AttendanceService } from "@/lib/services/attendance.service";
import { getUtcCalendarDate, isSameCalendarDay } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const policy = await AttendanceService.getPolicy();
    const requiredMinutes = user.requiredDailyMinutes || policy.defaultRequiredMinutes || 480;

    const today = getUtcCalendarDate();

    // Fetch up to 90 days history
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

    // Locate ongoing active session (where checkOutAt is null)
    const activeSession = records.find((r) => !r.checkOutAt && !!r.checkInAt);

    // Today's record is either the active session or today's calendar day record
    const todayRecord =
      activeSession ||
      records.find(
        (r) => isSameCalendarDay(r.date, today) || (r.checkInAt && isSameCalendarDay(r.checkInAt, today))
      );

    // Check if user is on approved leave today (safely handled with try/catch)
    let todayLeave = null;
    try {
      todayLeave = await db.leaveRequest.findFirst({
        where: {
          userId: user.id,
          status: "APPROVED",
          startDate: { lte: today },
          endDate: { gte: today },
        },
        select: { id: true, leaveType: true },
      });
    } catch {
      todayLeave = null;
    }

    // Check if today is a holiday (safe query preventing P2022 column mismatch crashes)
    let todayHoliday = null;
    try {
      todayHoliday = await db.holiday.findFirst({
        where: { date: today },
        select: { id: true, name: true, date: true },
      });
    } catch {
      todayHoliday = null;
    }

    const isWeeklyOff = Array.isArray(policy?.weeklyOffDays)
      ? policy.weeklyOffDays.includes(today.getDay())
      : false;

    const calc = AttendanceService.calculateDay({
      checkInAt: todayRecord?.checkInAt || null,
      checkOutAt: todayRecord?.checkOutAt || null,
      breaks: todayRecord?.breaks || [],
      requiredDailyMinutes: todayRecord?.requiredDailyMinutes || requiredMinutes,
      policy,
      isLeave: !!todayLeave,
      isHoliday: !!todayHoliday,
      isWeeklyOff,
      referenceTime: new Date(),
    });

    // Format historical records
    const history = records.map((r) => {
      const reqMins = r.requiredDailyMinutes || requiredMinutes;
      const isActive = !r.checkOutAt && !!r.checkInAt;

      const rCalc = AttendanceService.calculateDay({
        checkInAt: r.checkInAt,
        checkOutAt: r.checkOutAt,
        breaks: r.breaks || [],
        requiredDailyMinutes: reqMins,
        policy,
        referenceTime: new Date(),
      });

      return {
        id: r.id,
        date: r.date,
        checkInAt: r.checkInAt,
        checkOutAt: r.checkOutAt,
        grossMinutes: rCalc.grossMinutes,
        breakMinutes: rCalc.breakMinutes,
        workedMinutes: rCalc.netMinutes,
        netMinutes: rCalc.netMinutes,
        requiredMinutes: reqMins,
        remainingMinutes: rCalc.remainingMinutes,
        differenceMinutes: rCalc.netMinutes - reqMins,
        status: isActive ? "IN_PROGRESS" : rCalc.completionStatus,
        completionStatus: rCalc.completionStatus,
        isLate: rCalc.isLate,
        lateMinutes: rCalc.lateMinutes,
        isEarlyExit: rCalc.isEarlyExit,
        breaks: r.breaks,
        regularization: r.regularization,
        notes: r.notes,
      };
    });

    return NextResponse.json({
      success: true,
      policy: {
        workWindowStart: policy.workWindowStart,
        workWindowEnd: policy.workWindowEnd,
        defaultRequiredMinutes: policy.defaultRequiredMinutes,
        graceMinutes: policy.graceMinutes,
        cutoffTime: policy.cutoffTime,
      },
      today: {
        id: todayRecord?.id || null,
        isWorking: calc.isWorking,
        isOnBreak: calc.isOnBreak,
        activeBreakStartTime: calc.activeBreakStartTime,
        checkInAt: todayRecord?.checkInAt || null,
        checkOutAt: todayRecord?.checkOutAt || null,
        grossMinutes: calc.grossMinutes,
        breakMinutes: calc.breakMinutes,
        workedMinutes: calc.netMinutes,
        netMinutes: calc.netMinutes,
        requiredMinutes: todayRecord?.requiredDailyMinutes || requiredMinutes,
        remainingMinutes: calc.remainingMinutes,
        differenceMinutes: calc.netMinutes - (todayRecord?.requiredDailyMinutes || requiredMinutes),
        isLate: calc.isLate,
        lateMinutes: calc.lateMinutes,
        isEarlyExit: calc.isEarlyExit,
        earlyExitMinutes: calc.earlyExitMinutes,
        status: todayRecord?.checkInAt ? (activeSession ? "IN_PROGRESS" : calc.completionStatus) : "NOT_STARTED",
        completionStatus: calc.completionStatus,
        breaks: todayRecord?.breaks || [],
        isLeave: !!todayLeave,
        isHoliday: !!todayHoliday,
        isWeeklyOff,
      },
      records: history,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const body = await req.json();
    const { action, breakType, notes } = body;

    const policy = await AttendanceService.getPolicy();
    const requiredMinutes = user.requiredDailyMinutes || policy.defaultRequiredMinutes || 480;

    const today = getUtcCalendarDate();
    const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
    const now = new Date();

    // 1. Locate any ongoing active session for this user (where checkOutAt is null)
    const activeSession = await db.attendance.findFirst({
      where: {
        userId: user.id,
        checkOutAt: null,
      },
      include: {
        breaks: {
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { checkInAt: "desc" },
    });

    // 2. Locate today's record (may already have checkOutAt set)
    const todayRecord =
      (activeSession && (isSameCalendarDay(activeSession.date, today) || (activeSession.checkInAt && isSameCalendarDay(activeSession.checkInAt, today))))
        ? activeSession
        : await db.attendance.findFirst({
            where: {
              userId: user.id,
              OR: [
                { date: today },
                { checkInAt: { gte: today, lte: endOfToday } },
              ],
            },
            include: {
              breaks: {
                orderBy: { startTime: "asc" },
              },
            },
            orderBy: { checkInAt: "desc" },
          });

    // ─── 1. CHECK-IN ────────────────────────────────────────────────────────
    if (action === "check-in") {
      // If there is already an active session for today
      if (activeSession && (isSameCalendarDay(activeSession.date, today) || (activeSession.checkInAt && isSameCalendarDay(activeSession.checkInAt, today)))) {
        throw new ApiError(400, "You already have an active check-in session for today");
      }

      // If there was an active session from a previous day left open, cleanly close it first
      if (activeSession) {
        const danglingBreak = activeSession.breaks.find((b) => !b.endTime);
        if (danglingBreak) {
          const bDuration = Math.max(1, Math.floor((now.getTime() - new Date(danglingBreak.startTime).getTime()) / 60000));
          await db.attendanceBreak.update({
            where: { id: danglingBreak.id },
            data: { endTime: now, durationMinutes: bDuration },
          });
        }
        const updatedBreaks = await db.attendanceBreak.findMany({ where: { attendanceId: activeSession.id } });
        const prevCalc = AttendanceService.calculateDay({
          checkInAt: activeSession.checkInAt,
          checkOutAt: now,
          breaks: updatedBreaks,
          requiredDailyMinutes: activeSession.requiredDailyMinutes || requiredMinutes,
          policy,
        });
        await db.attendance.update({
          where: { id: activeSession.id },
          data: {
            checkOutAt: now,
            grossMinutes: prevCalc.grossMinutes,
            breakMinutes: prevCalc.breakMinutes,
            netMinutes: prevCalc.netMinutes,
            totalMinutes: prevCalc.netMinutes,
            status: prevCalc.completionStatus,
            completionStatus: prevCalc.completionStatus,
          },
        });
      }

      let record;
      if (todayRecord) {
        // If the record was previously checked out, record the idle gap as an intermittent break
        if (todayRecord.checkOutAt && todayRecord.checkOutAt < now) {
          const gapMinutes = Math.max(0, Math.round((now.getTime() - todayRecord.checkOutAt.getTime()) / (1000 * 60)));
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

        // Re-opening / updating today's attendance record
        record = await db.attendance.update({
          where: { id: todayRecord.id },
          data: {
            checkInAt: todayRecord.checkInAt || now,
            checkOutAt: null,
            requiredDailyMinutes: requiredMinutes,
            status: "IN_PROGRESS",
            completionStatus: "INCOMPLETE",
            notes: notes || todayRecord.notes,
          },
          include: { breaks: true },
        });
      } else {
        record = await db.attendance.create({
          data: {
            userId: user.id,
            date: today,
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

      return NextResponse.json({
        success: true,
        record,
        message: "Checked in successfully",
      });
    }

    // Target active session for break or checkout
    const activeTarget = activeSession || (todayRecord && !todayRecord.checkOutAt ? todayRecord : null);

    // ─── 2. BREAK-START ─────────────────────────────────────────────────────
    if (action === "break-start") {
      if (!activeTarget) {
        throw new ApiError(400, "You must be checked in to start a break");
      }

      const ongoingBreak = activeTarget.breaks.find((b) => !b.endTime);
      if (ongoingBreak) {
        throw new ApiError(400, "You already have an ongoing active break");
      }

      const newBreak = await db.attendanceBreak.create({
        data: {
          attendanceId: activeTarget.id,
          startTime: now,
          type: breakType || "LUNCH",
          notes,
        },
      });

      return NextResponse.json({
        success: true,
        break: newBreak,
        message: `Break (${breakType || "LUNCH"}) started`,
      });
    }

    // ─── 3. BREAK-END ───────────────────────────────────────────────────────
    if (action === "break-end") {
      if (!activeTarget) {
        throw new ApiError(400, "No active attendance record found");
      }

      const ongoingBreak = activeTarget.breaks.find((b) => !b.endTime);
      if (!ongoingBreak) {
        throw new ApiError(400, "No active break found to end");
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

      // Recalculate attendance
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

      return NextResponse.json({
        success: true,
        message: `Break ended. Duration: ${durationMinutes} minutes`,
      });
    }

    // ─── 4. CHECK-OUT ───────────────────────────────────────────────────────
    if (action === "check-out") {
      if (!activeTarget) {
        throw new ApiError(400, "You are not currently checked in");
      }

      // Close any active break automatically upon check-out
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
          notes: notes || activeTarget.notes,
        },
        include: {
          breaks: true,
        },
      });

      return NextResponse.json({
        success: true,
        record,
        calc,
        message: `Checked out. Net work time: ${Math.floor(calc.netMinutes / 60)}h ${calc.netMinutes % 60}m (${calc.completionStatus})`,
      });
    }

    throw new ApiError(400, "Invalid attendance action specified");
  } catch (e) {
    return handleApiError(e);
  }
}
