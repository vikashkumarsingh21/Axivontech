import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser, hasPermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { AttendanceService } from "@/lib/services/attendance.service";
import { getUtcCalendarDate, getUtcDayRange } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    const user = await validateActiveUser(adminId);

    const isExecutiveOrAdmin = user.userRoles.some((ur) =>
      ["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(ur.role.name)
    );
    const hasAttPerm =
      (await hasPermission(user.id, "attendance:manage")) ||
      (await hasPermission(user.id, "attendance.company.view")) ||
      (await hasPermission(user.id, "attendance:read")) ||
      (await hasPermission(user.id, "admin:access"));

    if (!isExecutiveOrAdmin && !hasAttPerm) {
      throw new ApiError(403, "Forbidden: Insufficient permissions to view attendance");
    }

    const policy = await AttendanceService.getPolicy();
    const { searchParams } = new URL(req.url);
    const employeeIdFilter = searchParams.get("employeeId") || searchParams.get("userId") || undefined;
    const departmentFilter = searchParams.get("department") || undefined;
    const statusFilter = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const dateFilterStr = searchParams.get("date") || undefined;
    const startDateParam = searchParams.get("startDate") || undefined;
    const endDateParam = searchParams.get("endDate") || undefined;
    const isHistoryView = searchParams.get("history") === "true";
    const isCompanyHistoryView = (isHistoryView && !employeeIdFilter) || searchParams.get("view") === "history" || (!!startDateParam && !!endDateParam);

    // ─── 1. INDIVIDUAL EMPLOYEE DETAILED HISTORY ──────────────────────────────
    if (employeeIdFilter && isHistoryView) {
      const targetEmp = await db.user.findFirst({
        where: {
          OR: [{ id: employeeIdFilter }, { employeeId: employeeIdFilter }],
        },
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          designation: true,
          employeeId: true,
          requiredDailyMinutes: true,
        },
      });

      if (!targetEmp) {
        throw new ApiError(404, "Employee not found");
      }

      const historyRecords = await db.attendance.findMany({
        where: { userId: targetEmp.id },
        include: {
          breaks: {
            orderBy: { startTime: "asc" },
          },
          regularization: true,
        },
        orderBy: { date: "desc" },
        take: 100,
      });

      const reqMins = targetEmp.requiredDailyMinutes || policy.defaultRequiredMinutes || 480;
      let totalWorkedMinutes = 0;
      let totalCompletedDays = 0;
      let totalBreakMinutes = 0;

      const formattedHistory = historyRecords.map((att) => {
        const calc = AttendanceService.calculateDay({
          checkInAt: att.checkInAt,
          checkOutAt: att.checkOutAt,
          breaks: att.breaks,
          requiredDailyMinutes: reqMins,
          policy,
        });

        if (calc.completionStatus === "COMPLETE") {
          totalCompletedDays++;
        }
        totalWorkedMinutes += calc.netMinutes;
        totalBreakMinutes += calc.breakMinutes;

        return {
          id: att.id,
          date: att.date,
          checkInAt: att.checkInAt,
          checkOutAt: att.checkOutAt,
          grossMinutes: calc.grossMinutes,
          breakMinutes: calc.breakMinutes,
          workedMinutes: calc.netMinutes,
          netMinutes: calc.netMinutes,
          requiredMinutes: reqMins,
          remainingMinutes: calc.remainingMinutes,
          differenceMinutes: calc.netMinutes - reqMins,
          isLate: calc.isLate,
          lateMinutes: calc.lateMinutes,
          isEarlyExit: calc.isEarlyExit,
          status: !att.checkOutAt && !!att.checkInAt ? "IN_PROGRESS" : calc.completionStatus,
          completionStatus: calc.completionStatus,
          emailAlertSent: att.emailAlertSent,
          breaks: att.breaks,
          regularization: att.regularization,
          currentState: calc.isOnBreak ? "ON_BREAK" : calc.isWorking ? "WORKING" : "IDLE",
          notes: att.notes,
        };
      });

      return NextResponse.json({
        success: true,
        policy,
        employee: targetEmp,
        history: formattedHistory,
        stats: {
          totalDays: historyRecords.length,
          totalWorkedMinutes,
          totalBreakMinutes,
          totalCompletedDays,
          averageWorkedMinutes: historyRecords.length ? Math.round(totalWorkedMinutes / historyRecords.length) : 0,
        },
      });
    }

    // ─── 2. DAILY OR FILTERED COMPANY-WIDE VIEW ──────────────────────────────
    const { startOfDay, endOfDay } = getUtcDayRange(dateFilterStr || new Date());

    const employeeWhere: any = {};

    if (departmentFilter) {
      employeeWhere.department = { equals: departmentFilter, mode: "insensitive" };
    }

    if (employeeIdFilter) {
      employeeWhere.OR = [
        { id: employeeIdFilter },
        { employeeId: employeeIdFilter },
      ];
    }

    if (search) {
      employeeWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const employees = await db.user.findMany({
      where: employeeWhere,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        designation: true,
        employeeId: true,
        status: true,
        requiredDailyMinutes: true,
      },
      orderBy: { name: "asc" },
    });

    const empIds = employees.map((e) => e.id);

    // ─── 2. COMPANY-WIDE DETAILED ATTENDANCE HISTORY VIEW ────────────────────
    if (isCompanyHistoryView) {
      const attWhere: any = {};
      if (empIds.length > 0) {
        attWhere.userId = { in: empIds };
      }
      if (startDateParam && endDateParam) {
        const { startOfDay } = getUtcDayRange(startDateParam);
        const { endOfDay } = getUtcDayRange(endDateParam);
        attWhere.OR = [
          { date: { gte: startOfDay, lte: endOfDay } },
          { checkInAt: { gte: startOfDay, lte: endOfDay } },
        ];
      }

      const historyAttendances = await db.attendance.findMany({
        where: attWhere,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeId: true,
              department: true,
              designation: true,
              requiredDailyMinutes: true,
            },
          },
          breaks: {
            orderBy: { startTime: "asc" },
          },
          regularization: true,
        },
        orderBy: [{ date: "desc" }, { checkInAt: "desc" }],
        take: 300,
      });

      let totalWorkedMinutes = 0;
      let totalBreakMinutes = 0;
      let totalCompletedDays = 0;

      const formattedHistory = historyAttendances.map((att) => {
        const reqMins = att.requiredDailyMinutes || att.user?.requiredDailyMinutes || policy.defaultRequiredMinutes || 480;
        const isActive = !att.checkOutAt && !!att.checkInAt;

        const calc = AttendanceService.calculateDay({
          checkInAt: att.checkInAt,
          checkOutAt: att.checkOutAt,
          breaks: att.breaks,
          requiredDailyMinutes: reqMins,
          policy,
          referenceTime: new Date(),
        });

        if (calc.completionStatus === "COMPLETE") {
          totalCompletedDays++;
        }
        totalWorkedMinutes += calc.netMinutes;
        totalBreakMinutes += calc.breakMinutes;

        return {
          id: att.id,
          userId: att.userId,
          employeeName: att.user?.name || "Unknown",
          employeeEmail: att.user?.email || "",
          employeeCode: att.user?.employeeId || null,
          department: att.user?.department || null,
          designation: att.user?.designation || null,
          date: att.date,
          checkInAt: att.checkInAt,
          checkOutAt: att.checkOutAt,
          grossMinutes: calc.grossMinutes,
          breakMinutes: calc.breakMinutes,
          workedMinutes: calc.netMinutes,
          netMinutes: calc.netMinutes,
          requiredMinutes: reqMins,
          remainingMinutes: calc.remainingMinutes,
          differenceMinutes: calc.netMinutes - reqMins,
          isLate: calc.isLate,
          lateMinutes: calc.lateMinutes,
          isEarlyExit: calc.isEarlyExit,
          status: isActive ? "IN_PROGRESS" : calc.completionStatus,
          completionStatus: calc.completionStatus,
          emailAlertSent: att.emailAlertSent,
          breaks: att.breaks,
          regularization: att.regularization,
          currentState: calc.isOnBreak ? "ON_BREAK" : isActive ? "WORKING" : "IDLE",
          notes: att.notes,
        };
      });

      let finalHistory = formattedHistory;
      if (statusFilter) {
        finalHistory = formattedHistory.filter(
          (r) => r.status.toUpperCase() === statusFilter.toUpperCase()
        );
      }

      return NextResponse.json({
        success: true,
        policy,
        history: finalHistory,
        stats: {
          totalRecords: finalHistory.length,
          totalWorkedMinutes,
          totalBreakMinutes,
          totalCompletedDays,
          averageWorkedMinutes: finalHistory.length ? Math.round(totalWorkedMinutes / finalHistory.length) : 0,
        },
      });
    }

    // ─── 3. DAILY COMPANY-WIDE LIVE MONITOR ──────────────────────────────────
    // Fetch attendance records, today's punches, and active unclosed punches
    const attendances = await db.attendance.findMany({
      where: {
        userId: { in: empIds },
        OR: [
          { date: { gte: startOfDay, lte: endOfDay } },
          { checkInAt: { gte: startOfDay, lte: endOfDay } },
          { checkOutAt: null },
        ],
      },
      include: {
        breaks: {
          orderBy: { startTime: "asc" },
        },
        regularization: true,
      },
      orderBy: { checkInAt: "desc" },
    });

    // Check approved leaves for the date
    const leaves = await db.leaveRequest.findMany({
      where: {
        userId: { in: empIds },
        status: "APPROVED",
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
    });
    const leaveMap = new Map(leaves.map((l) => [l.userId, l]));

    // Check holiday (safely handled with try/catch to prevent schema drift crashes)
    let holiday = null;
    try {
      holiday = await db.holiday.findFirst({
        where: { date: startOfDay },
        select: { id: true, name: true, date: true },
      });
    } catch {
      holiday = null;
    }

    const isWeeklyOff = Array.isArray(policy?.weeklyOffDays)
      ? policy.weeklyOffDays.includes(startOfDay.getUTCDay())
      : false;
    const attendanceMap = new Map<string, any>();
    for (const a of attendances) {
      if (!attendanceMap.has(a.userId)) {
        attendanceMap.set(a.userId, a);
      } else {
        const prev = attendanceMap.get(a.userId);
        if (prev.checkOutAt && !a.checkOutAt) {
          attendanceMap.set(a.userId, a);
        }
      }
    }

    let currentlyWorking = 0;
    let currentlyOnBreak = 0;
    let completedToday = 0;
    let incompleteToday = 0;
    let absentToday = 0;
    let onLeaveToday = 0;

    const records = employees.map((emp) => {
      const att = attendanceMap.get(emp.id);
      const leave = leaveMap.get(emp.id);
      const reqMins = emp.requiredDailyMinutes || policy.defaultRequiredMinutes || 480;

      if (!att) {
        if (leave) {
          onLeaveToday++;
          return {
            id: null,
            userId: emp.id,
            employeeName: emp.name,
            employeeEmail: emp.email,
            employeeCode: emp.employeeId,
            department: emp.department,
            designation: emp.designation,
            date: startOfDay,
            checkInAt: null,
            checkOutAt: null,
            grossMinutes: 0,
            breakMinutes: 0,
            workedMinutes: 0,
            netMinutes: 0,
            requiredMinutes: reqMins,
            remainingMinutes: 0,
            differenceMinutes: 0,
            status: "ON_LEAVE",
            completionStatus: "ON_LEAVE",
            currentState: "ON_LEAVE",
            isLate: false,
            lateMinutes: 0,
            isEarlyExit: false,
            emailAlertSent: false,
            breaks: [],
            notes: `Approved Leave: ${leave.leaveType}`,
          };
        }

        if (holiday) {
          return {
            id: null,
            userId: emp.id,
            employeeName: emp.name,
            employeeEmail: emp.email,
            employeeCode: emp.employeeId,
            department: emp.department,
            designation: emp.designation,
            date: startOfDay,
            checkInAt: null,
            checkOutAt: null,
            grossMinutes: 0,
            breakMinutes: 0,
            workedMinutes: 0,
            netMinutes: 0,
            requiredMinutes: reqMins,
            remainingMinutes: 0,
            differenceMinutes: 0,
            status: "HOLIDAY",
            completionStatus: "HOLIDAY",
            currentState: "HOLIDAY",
            isLate: false,
            lateMinutes: 0,
            isEarlyExit: false,
            emailAlertSent: false,
            breaks: [],
            notes: `Holiday: ${holiday.name}`,
          };
        }

        if (isWeeklyOff) {
          return {
            id: null,
            userId: emp.id,
            employeeName: emp.name,
            employeeEmail: emp.email,
            employeeCode: emp.employeeId,
            department: emp.department,
            designation: emp.designation,
            date: startOfDay,
            checkInAt: null,
            checkOutAt: null,
            grossMinutes: 0,
            breakMinutes: 0,
            workedMinutes: 0,
            netMinutes: 0,
            requiredMinutes: reqMins,
            remainingMinutes: 0,
            differenceMinutes: 0,
            status: "WEEKLY_OFF",
            completionStatus: "WEEKLY_OFF",
            currentState: "WEEKLY_OFF",
            isLate: false,
            lateMinutes: 0,
            isEarlyExit: false,
            emailAlertSent: false,
            breaks: [],
            notes: "Weekly Off",
          };
        }

        absentToday++;
        return {
          id: null,
          userId: emp.id,
          employeeName: emp.name,
          employeeEmail: emp.email,
          employeeCode: emp.employeeId,
          department: emp.department,
          designation: emp.designation,
          date: startOfDay,
          checkInAt: null,
          checkOutAt: null,
          grossMinutes: 0,
          breakMinutes: 0,
          workedMinutes: 0,
          netMinutes: 0,
          requiredMinutes: reqMins,
          remainingMinutes: reqMins,
          differenceMinutes: -reqMins,
          status: "ABSENT",
          completionStatus: "INCOMPLETE",
          currentState: "IDLE",
          isLate: false,
          lateMinutes: 0,
          isEarlyExit: false,
          emailAlertSent: false,
          breaks: [],
          notes: null,
        };
      }

      const calc = AttendanceService.calculateDay({
        checkInAt: att.checkInAt,
        checkOutAt: att.checkOutAt,
        breaks: att.breaks,
        requiredDailyMinutes: reqMins,
        policy,
      });

      if (calc.isOnBreak) {
        currentlyOnBreak++;
      } else if (calc.isWorking) {
        currentlyWorking++;
      }

      if (calc.completionStatus === "COMPLETE") {
        completedToday++;
      } else {
        incompleteToday++;
      }

      return {
        id: att.id,
        userId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email,
        employeeCode: emp.employeeId,
        department: emp.department,
        designation: emp.designation,
        date: att.date,
        checkInAt: att.checkInAt,
        checkOutAt: att.checkOutAt,
        grossMinutes: calc.grossMinutes,
        breakMinutes: calc.breakMinutes,
        workedMinutes: calc.netMinutes,
        netMinutes: calc.netMinutes,
        requiredMinutes: reqMins,
        remainingMinutes: calc.remainingMinutes,
        differenceMinutes: calc.netMinutes - reqMins,
        isLate: calc.isLate,
        lateMinutes: calc.lateMinutes,
        isEarlyExit: calc.isEarlyExit,
        earlyExitMinutes: calc.earlyExitMinutes,
        status: !att.checkOutAt && !!att.checkInAt ? "IN_PROGRESS" : calc.completionStatus,
        completionStatus: calc.completionStatus,
        emailAlertSent: att.emailAlertSent,
        currentState: calc.isOnBreak ? "ON_BREAK" : calc.isWorking ? "WORKING" : "IDLE",
        breaks: att.breaks,
        regularization: att.regularization,
        notes: att.notes,
      };
    });

    let filteredRecords = records;
    if (statusFilter) {
      filteredRecords = records.filter(
        (r) => r.status.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    return NextResponse.json({
      success: true,
      policy,
      data: filteredRecords,
      summary: {
        totalEmployees: employees.length,
        currentlyWorking,
        currentlyOnBreak,
        completedToday,
        incompleteToday,
        absentToday,
        onLeaveToday,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    const user = await validateActiveUser(adminId);

    const isExecutiveOrAdmin = user.userRoles.some((ur) =>
      ["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(ur.role.name)
    );
    const hasAttPerm = await hasPermission(user.id, "attendance:manage");

    if (!isExecutiveOrAdmin && !hasAttPerm) {
      throw new ApiError(403, "Forbidden: Only Administrators can create manual punches");
    }

    const body = await req.json();
    const { userId, date, checkInAt, checkOutAt, notes, requiredDailyMinutes } = body;

    if (!userId || !date || !checkInAt) {
      throw new ApiError(400, "userId, date, and checkInAt are required");
    }

    const targetDate = getUtcCalendarDate(date);

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new ApiError(404, "Target employee not found");

    const policy = await AttendanceService.getPolicy();
    const reqMins = requiredDailyMinutes || targetUser.requiredDailyMinutes || policy.defaultRequiredMinutes || 480;

    const calc = AttendanceService.calculateDay({
      checkInAt: new Date(checkInAt),
      checkOutAt: checkOutAt ? new Date(checkOutAt) : null,
      requiredDailyMinutes: reqMins,
      policy,
    });

    const record = await db.attendance.upsert({
      where: { userId_date: { userId, date: targetDate } },
      update: {
        checkInAt: new Date(checkInAt),
        checkOutAt: checkOutAt ? new Date(checkOutAt) : null,
        grossMinutes: calc.grossMinutes,
        breakMinutes: 0,
        netMinutes: calc.netMinutes,
        totalMinutes: calc.netMinutes,
        requiredDailyMinutes: reqMins,
        remainingMinutes: calc.remainingMinutes,
        lateMinutes: calc.lateMinutes,
        earlyExitMinutes: calc.earlyExitMinutes,
        isLate: calc.isLate,
        isEarlyExit: calc.isEarlyExit,
        status: checkOutAt ? calc.completionStatus : "IN_PROGRESS",
        completionStatus: calc.completionStatus,
        notes: notes || "Admin manual punch",
      },
      create: {
        userId,
        date: targetDate,
        checkInAt: new Date(checkInAt),
        checkOutAt: checkOutAt ? new Date(checkOutAt) : null,
        grossMinutes: calc.grossMinutes,
        breakMinutes: 0,
        netMinutes: calc.netMinutes,
        totalMinutes: calc.netMinutes,
        requiredDailyMinutes: reqMins,
        remainingMinutes: calc.remainingMinutes,
        lateMinutes: calc.lateMinutes,
        earlyExitMinutes: calc.earlyExitMinutes,
        isLate: calc.isLate,
        isEarlyExit: calc.isEarlyExit,
        status: checkOutAt ? calc.completionStatus : "IN_PROGRESS",
        completionStatus: calc.completionStatus,
        notes: notes || "Admin manual punch",
      },
    });

    return NextResponse.json({
      success: true,
      data: record,
      message: "Attendance entry updated successfully",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
