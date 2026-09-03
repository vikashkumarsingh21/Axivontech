import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { getExecutiveScope } from "@/lib/auth/executive-scope";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "executive.company.view");
    const scope = await getExecutiveScope(userId);

    const employeeWhere: any = {
      userRoles: { none: { role: { name: { in: ["FOUNDER", "CO_FOUNDER"] } } } },
    };

    if (scope.allowedDepartments) {
      employeeWhere.department = { in: scope.allowedDepartments };
    }

    const employees = await db.user.findMany({
      where: employeeWhere,
      select: { department: true, designation: true, status: true },
    });

    const departmentCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = { ACTIVE: 0, INACTIVE: 0 };

    for (const emp of employees) {
      const dept = emp.department || "Unassigned";
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      const st = emp.status || "ACTIVE";
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    }

    return NextResponse.json({
      data: {
        total: employees.length,
        statusCounts,
        departmentBreakdown: Object.entries(departmentCounts).map(([department, count]) => ({
          department,
          count,
        })),
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
