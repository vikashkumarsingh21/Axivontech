import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getExecutiveScope, isDepartmentAllowed } from "@/lib/auth/executive-scope";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "executive.dashboard.view");
    const scope = await getExecutiveScope(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employeeWhere: any = {
      userRoles: { none: { role: { name: { in: ["FOUNDER", "CO_FOUNDER"] } } } },
    };

    if (scope.allowedDepartments) {
      employeeWhere.department = { in: scope.allowedDepartments };
    }

    const [
      totalEmployees,
      activeEmployees,
      presentToday,
      activeProjects,
      openTasks,
      overdueTasks,
      pendingLeave,
      pendingApprovals,
    ] = await Promise.all([
      db.user.count({ where: employeeWhere }),
      db.user.count({ where: { ...employeeWhere, status: "ACTIVE" } }),
      db.attendance.count({
        where: {
          date: { gte: today },
          user: employeeWhere,
        },
      }),
      db.project.count({ where: { status: "ACTIVE" } }),
      db.task.count({ where: { status: { notIn: ["COMPLETED"] } } }),
      db.task.count({
        where: {
          status: { notIn: ["COMPLETED"] },
          dueDate: { lt: new Date() },
        },
      }),
      db.leaveRequest.count({ where: { status: "PENDING" } }),
      db.approvalRequest.count({ where: { status: "PENDING" } }),
    ]);

    return NextResponse.json({
      data: {
        scope: {
          role: scope.role,
          responsibilityProfile: scope.responsibilityProfile,
          allowedDepartments: scope.allowedDepartments,
        },
        kpis: {
          totalEmployees,
          activeEmployees,
          presentToday,
          activeProjects,
          openTasks,
          overdueTasks,
          pendingLeave,
          pendingApprovals,
        },
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
