import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { getExecutiveScope, isDepartmentAllowed } from "@/lib/auth/executive-scope";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const executiveId = req.headers.get("x-user-id");
    await requirePermission(executiveId, "attendance.company.view");
    const scope = await getExecutiveScope(executiveId);

    const { searchParams } = new URL(req.url);
    const dateFilterStr = searchParams.get("date") || undefined;
    const departmentFilter = searchParams.get("department") || undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = dateFilterStr ? new Date(dateFilterStr) : today;
    targetDate.setHours(0, 0, 0, 0);

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
        date: targetDate,
      },
    });

    const attendanceMap = new Map(attendances.map((a) => [a.userId, a]));

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

      if (!att.checkOutAt) {
        isWorking = true;
        currentlyWorking++;
        const elapsedMs = Math.max(0, Date.now() - new Date(att.checkInAt).getTime());
        workedMins += Math.floor(elapsedMs / 60000);
        status = "IN_PROGRESS";
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
