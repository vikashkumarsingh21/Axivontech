import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";
import { AttendanceService } from "@/lib/services/attendance.service";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const policy = await AttendanceService.getPolicy();
    const requiredMinutes = user.requiredDailyMinutes || policy.defaultRequiredMinutes || 480;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch up to 60 days history
    const records = await db.attendance.findMany({
      where: { userId: user.id },
      include: {
        breaks: {
          orderBy: { startTime: "asc" },
        },
        regularization: true,
      },
      orderBy: { date: "desc" },
      take: 60,
    });

    const todayRecord = records.find(
      (r) => new Date(r.date).getTime() === today.getTime()
    );

    // Check if user is on approved leave today
    const todayLeave = await db.leaveRequest.findFirst({
      where: {
        userId: user.id,
        status: "APPROVED",
        startDate: { lte: today },
        endDate: { gte: today },
      },
    });

    // Check if today is a holiday
    const todayHoliday = await db.holiday.findFirst({
      where: { date: today },
    });

    const isWeeklyOff = policy.weeklyOffDays.includes(today.getDay());

    let calc = AttendanceService.calculateDay({
      checkInAt: todayRecord?.checkInAt || null,
      checkOutAt: todayRecord?.checkOutAt || null,
      breaks: todayRecord?.breaks || [],
      requiredDailyMinutes: requiredMinutes,
      policy,
      isLeave: !!todayLeave,
      isHoliday: !!todayHoliday,
      isWeeklyOff,
      referenceTime: new Date(),
    });

    // Format historical records
    const history = records.map((r) => {
      const reqMins = r.requiredDailyMinutes || requiredMinutes;
      const rCalc = AttendanceService.calculateDay({
        checkInAt: r.checkInAt,
        checkOutAt: r.checkOutAt,
        breaks: r.breaks || [],
        requiredDailyMinutes: reqMins,
        policy,
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
        status: rCalc.completionStatus,
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
        requiredMinutes,
        remainingMinutes: calc.remainingMinutes,
        differenceMinutes: calc.netMinutes - requiredMinutes,
        isLate: calc.isLate,
        lateMinutes: calc.lateMinutes,
        isEarlyExit: calc.isEarlyExit,
        earlyExitMinutes: calc.earlyExitMinutes,
        status: calc.completionStatus,
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db.attendance.findFirst({
      where: { userId: user.id, date: today },
      include: {
        breaks: {
          orderBy: { startTime: "asc" },
        },
      },
    });

    const now = new Date();

    // ─── 1. CHECK-IN ────────────────────────────────────────────────────────
    if (action === "check-in") {
      if (existing && !existing.checkOutAt) {
        throw new ApiError(400, "You are already checked in for today");
      }

      let record;
      if (existing) {
        // Re-opening / updating check-in
        record = await db.attendance.update({
          where: { id: existing.id },
          data: {
            checkInAt: existing.checkInAt || now,
            checkOutAt: null,
            requiredDailyMinutes: requiredMinutes,
            status: "IN_PROGRESS",
            notes: notes || existing.notes,
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

    // ─── 2. BREAK-START ─────────────────────────────────────────────────────
    if (action === "break-start") {
      if (!existing || existing.checkOutAt) {
        throw new ApiError(400, "You must be checked in to start a break");
      }

      const activeBreak = existing.breaks.find((b) => !b.endTime);
      if (activeBreak) {
        throw new ApiError(400, "You already have an ongoing active break");
      }

      const newBreak = await db.attendanceBreak.create({
        data: {
          attendanceId: existing.id,
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
      if (!existing) {
        throw new ApiError(400, "No active attendance record found");
      }

      const activeBreak = existing.breaks.find((b) => !b.endTime);
      if (!activeBreak) {
        throw new ApiError(400, "No active break found to end");
      }

      const durationMinutes = Math.max(
        1,
        Math.floor((now.getTime() - new Date(activeBreak.startTime).getTime()) / 60000)
      );

      await db.attendanceBreak.update({
        where: { id: activeBreak.id },
        data: {
          endTime: now,
          durationMinutes,
        },
      });

      // Recalculate attendance
      const updatedBreaks = await db.attendanceBreak.findMany({
        where: { attendanceId: existing.id },
      });

      const calc = AttendanceService.calculateDay({
        checkInAt: existing.checkInAt,
        checkOutAt: existing.checkOutAt,
        breaks: updatedBreaks,
        requiredDailyMinutes: requiredMinutes,
        policy,
      });

      await db.attendance.update({
        where: { id: existing.id },
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
      if (!existing || existing.checkOutAt) {
        throw new ApiError(400, "You are not currently checked in");
      }

      // Close any active break automatically upon check-out
      const activeBreak = existing.breaks.find((b) => !b.endTime);
      if (activeBreak) {
        const breakDuration = Math.max(
          1,
          Math.floor((now.getTime() - new Date(activeBreak.startTime).getTime()) / 60000)
        );
        await db.attendanceBreak.update({
          where: { id: activeBreak.id },
          data: {
            endTime: now,
            durationMinutes: breakDuration,
          },
        });
      }

      const allBreaks = await db.attendanceBreak.findMany({
        where: { attendanceId: existing.id },
      });

      const calc = AttendanceService.calculateDay({
        checkInAt: existing.checkInAt,
        checkOutAt: now,
        breaks: allBreaks,
        requiredDailyMinutes: requiredMinutes,
        policy,
      });

      const record = await db.attendance.update({
        where: { id: existing.id },
        data: {
          checkOutAt: now,
          grossMinutes: calc.grossMinutes,
          breakMinutes: calc.breakMinutes,
          netMinutes: calc.netMinutes,
          totalMinutes: calc.netMinutes,
          requiredDailyMinutes: requiredMinutes,
          remainingMinutes: calc.remainingMinutes,
          lateMinutes: calc.lateMinutes,
          earlyExitMinutes: calc.earlyExitMinutes,
          isLate: calc.isLate,
          isEarlyExit: calc.isEarlyExit,
          status: calc.completionStatus,
          completionStatus: calc.completionStatus,
          notes: notes || existing.notes,
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
