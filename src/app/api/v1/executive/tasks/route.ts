import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { getExecutiveScope, isDepartmentAllowed } from "@/lib/auth/executive-scope";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const executiveId = req.headers.get("x-user-id");
    await requirePermission(executiveId, "tasks.company.view");
    const scope = await getExecutiveScope(executiveId);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    if (scope.allowedDepartments) {
      where.user = { department: { in: scope.allowedDepartments } };
    }

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, department: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.task.count({ where }),
    ]);

    return NextResponse.json({
      data: tasks,
      meta: { total, page, pages: Math.ceil(total / limit) },
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

export async function POST(req: Request) {
  try {
    const executiveId = req.headers.get("x-user-id");
    const execUser = await requirePermission(executiveId, "tasks:manage");
    const scope = await getExecutiveScope(executiveId);

    const body = await req.json();
    const { title, description, userId, projectId, priority, dueDate } = body;

    if (!title || !userId) {
      throw new ApiError(400, "Task title and assigned userId are required");
    }

    const assignedUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, department: true, status: true },
    });

    if (!assignedUser) {
      throw new ApiError(404, "Assigned employee not found");
    }

    if (assignedUser.status === "INACTIVE") {
      throw new ApiError(400, "Cannot assign tasks to an inactive employee");
    }

    // Check scope if Co-Founder
    if (!scope.isFounder && scope.allowedDepartments) {
      if (!isDepartmentAllowed(scope, assignedUser.department)) {
        throw new ApiError(
          403,
          `Forbidden: Cannot assign tasks to employee outside your department scope (${assignedUser.department || "No Department"})`
        );
      }
    }

    const task = await db.task.create({
      data: {
        title,
        description: description || null,
        userId,
        projectId: projectId || null,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
        project: { select: { id: true, name: true } },
      },
    });

    const dueDateFormatted = dueDate
      ? new Date(dueDate).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "No due date";

    const assignerTitle = scope.isFounder ? "Founder" : "Co-Founder";

    await db.notification.create({
      data: {
        userId,
        type: "TASK_ASSIGNED",
        title: "NEW TASK ASSIGNED",
        message: `Task: ${title}\nAssigned By: ${execUser.name} (${assignerTitle})\nDue: ${dueDateFormatted}`,
        link: "/employee/tasks",
      },
    });

    await db.auditLog.create({
      data: {
        userId: executiveId,
        action: "EXECUTIVE_TASK_ASSIGNED",
        resource: "Task",
        details: {
          taskId: task.id,
          taskTitle: title,
          assignedToUserId: userId,
          assignedToName: assignedUser.name,
          assignedByUserId: executiveId,
          assignedByName: execUser.name,
          assignedByRole: scope.role,
          responsibilityProfile: scope.responsibilityProfile,
          priority: task.priority,
          dueDate: task.dueDate,
        },
      },
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
