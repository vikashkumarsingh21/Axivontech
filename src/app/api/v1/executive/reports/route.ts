import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "reports.executive.view");

    const [totalEmployees, activeProjects, openTasks, completedTasks] = await Promise.all([
      db.user.count(),
      db.project.count({ where: { status: "ACTIVE" } }),
      db.task.count({ where: { status: { notIn: ["COMPLETED"] } } }),
      db.task.count({ where: { status: "COMPLETED" } }),
    ]);

    return NextResponse.json({
      data: {
        summary: { totalEmployees, activeProjects, openTasks, completedTasks },
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
