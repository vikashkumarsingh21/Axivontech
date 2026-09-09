import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "tasks:read");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

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
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const adminId = req.headers.get("x-user-id");
    const admin = await requirePermission(adminId, "tasks:manage");

    const body = await req.json();
    const { title, description, userId, projectId, priority, dueDate } = body;

    if (!title || !userId) {
      throw new ApiError(400, "Task title and assigned userId are required");
    }

    const assignedUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, status: true },
    });

    if (!assignedUser) {
      throw new ApiError(404, "Assigned employee not found");
    }

    if (assignedUser.status === "INACTIVE") {
      throw new ApiError(400, "Cannot assign tasks to an inactive employee");
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
        user: { select: { id: true, name: true, email: true } },
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

    await db.notification.create({
      data: {
        userId,
        type: "TASK_ASSIGNED",
        title: "NEW TASK ASSIGNED",
        message: `Task: ${title}\nAssigned By: ${admin.name}\nDue: ${dueDateFormatted}`,
        link: "/employee/tasks",
      },
    });

    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "TASK_ASSIGNED",
        resource: "Task",
        details: {
          taskId: task.id,
          taskTitle: title,
          assignedToUserId: userId,
          assignedToName: assignedUser.name,
          assignedByUserId: adminId,
          assignedByName: admin.name,
          priority: task.priority,
          dueDate: task.dueDate,
        },
      },
    });

    // Emit platform event
    const { EventBus } = await import("@/lib/events/bus").catch(() => ({ EventBus: null }));
    if (EventBus) {
      EventBus.emit({
        eventType: "TASK_ASSIGNED",
        actorId: adminId || undefined,
        recipientId: userId,
        entityType: "TASK",
        entityId: task.id,
        title: "NEW TASK ASSIGNED",
        message: `Task: ${title} assigned by ${admin.name}. Due: ${dueDateFormatted}`,
        metadata: { taskId: task.id, priority: task.priority },
      }).catch(() => {});
    }

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
