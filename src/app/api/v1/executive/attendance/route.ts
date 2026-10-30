import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { getExecutiveScope, isDepartmentAllowed } from "@/lib/auth/executive-scope";
import { handleApiError } from "@/lib/api-error";
import { getUtcCalendarDate, getUtcDayRange, isSameCalendarDay } from "@/lib/date-utils";
import { closeStaleAttendance } from "@/lib/attendance/stale-attendance";

export async function GET(req: Request) {
  try {
    const executiveId = req.headers.get("x-user-id");
    await requirePermission(executiveId, "attendance.company.view");
    const scope = await getExecutiveScope(executiveId);

    // Auto-close stale past unclosed records
    await closeStaleAttendance(new Date());

    const { searchParams } = new URL(req.url);
    const dateFilterStr = searchParams.get("date") || undefined;
    const departmentFilter = searchParams.get("department") || undefined;

    const targetDate = getUtcCalendarDate(dateFilterStr || new Date());
    const { startOfDay, endOfDay } = getUtcDayRange(targetDate);

    const employeeWhere: any = {
      userRoles: { none: { role: { name: { in: ["FOUNDER", "CO_FOUNDER"] } } } },
    };

    if (scope.allowedDepartments) {
      employeeWhere.department = { in: scope.allowedDepartments };
    }

    if (departmentFilter) {
      if (!isDepartmentAllowed(scope, departmentFilter)) {
        return NextResponse.json({
          data: [],
          summary: { totalEmployees: 0, currentlyWorking: 0, completedToday: 0, incompleteToday: 0, absentToday: 0 },
        });
      }
      employeeWhere.department = { equals: departmentFilter, mode: "insensitive" };
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
    });

    const empIds = employees.map((e) => e.id);

    const attendances = await db.attendance.findMany({
      where: {
        userId: { in: empIds },
        OR: [
          { date: { gte: startOfDay, lte: endOfDay } },
          { checkInAt: { gte: startOfDay, lte: endOfDay } },
        ],
      },
      orderBy: { checkInAt: "desc" },
    });

    const attendanceMap = new Map<string, (typeof attendances)[0]>();
    for (const a of attendances) {
      if (!attendanceMap.has(a.userId)) {
        attendanceMap.set(a.userId, a);
      }
    }

    let currentlyWorking = 0;
    let completedToday = 0;
    let incompleteToday = 0;
    let absentToday = 0;

    const records = employees.map((emp) => {
      const att = attendanceMap.get(emp.id);
      const reqMins = emp.requiredDailyMinutes || 480;

      if (!att) {
        absentToday++;
        return {
          id: null,
          userId: emp.id,
          employeeName: emp.name,
          employeeEmail: emp.email,
          employeeCode: emp.employeeId,
          department: emp.department,
          designation: emp.designation,
          date: targetDate,
          checkInAt: null,
          checkOutAt: null,
          workedMinutes: 0,
          requiredMinutes: reqMins,
          differenceMinutes: -reqMins,
          status: "ABSENT",
          currentState: "IDLE",
        };
      }

      let isWorking = false;
      let workedMins = att.totalMinutes || 0;
      let status = att.status;

      if (att.status === "MISSED_CHECKOUT") {
        isWorking = false;
        workedMins = 0;
        status = "MISSED_CHECKOUT";
      } else if (!att.checkOutAt) {
        const isToday =
          isSameCalendarDay(att.date, new Date()) ||
          (att.checkInAt && isSameCalendarDay(att.checkInAt, new Date()));
        if (isToday) {
          isWorking = true;
          currentlyWorking++;
          const elapsedMs = Math.max(0, Date.now() - new Date(att.checkInAt).getTime());
          workedMins += Math.floor(elapsedMs / 60000);
          status = "IN_PROGRESS";
        } else {
          isWorking = false;
          workedMins = 0;
          status = "MISSED_CHECKOUT";
        }
      } else {
        if (workedMins >= reqMins) {
          completedToday++;
          status = "COMPLETE";
        } else {
          incompleteToday++;
          status = "INCOMPLETE";
        }
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
        workedMinutes: workedMins,
        requiredMinutes: reqMins,
        differenceMinutes: workedMins - reqMins,
        status,
        currentState: isWorking ? "WORKING" : "IDLE",
        notes: att.notes,
      };
    });

    return NextResponse.json({
      data: records,
      summary: {
        totalEmployees: employees.length,
        currentlyWorking,
        completedToday,
        incompleteToday,
        absentToday,
      },
      scope: {
        role: scope.role,
        responsibilityProfile: scope.responsibilityProfile,
        allowedDepartments: scope.allowedDepartments,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
