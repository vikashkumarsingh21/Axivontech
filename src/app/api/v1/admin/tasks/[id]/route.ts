import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "tasks:read");

    const { id } = await props.params;

    const task = await db.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true,
          },
        },
        project: {
          select: { id: true, name: true, status: true },
        },
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    const admin = await requirePermission(adminId, "tasks:manage");

    const { id } = await props.params;
    const body = await req.json();
    const { title, description, userId, projectId, priority, status, dueDate } = body;

    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Task not found");
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (projectId !== undefined) updateData.projectId = projectId || null;

    // Handle reassignment
    let isReassigned = false;
    if (userId !== undefined && userId !== existing.userId) {
      const newUser = await db.user.findUnique({ where: { id: userId } });
      if (!newUser) throw new ApiError(404, "Target employee for reassignment not found");
      if (newUser.status === "INACTIVE") throw new ApiError(400, "Cannot assign tasks to inactive employees");
      updateData.userId = userId;
      isReassigned = true;
    }

    const updated = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
        project: { select: { id: true, name: true } },
        comments: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Notify employee of task updates
    if (isReassigned) {
      await db.notification.create({
        data: {
          userId: updateData.userId,
          type: "TASK_ASSIGNED",
          title: "New Task Assigned",
          message: `Task: ${updated.title}\nAssigned By: ${admin.name}`,
          link: "/employee/tasks",
        },
      });
    } else {
      await db.notification.create({
        data: {
          userId: updated.userId,
          type: "TASK_UPDATED",
          title: "Task Details Updated",
          message: `Task "${updated.title}" has been updated by management.`,
          link: "/employee/tasks",
        },
      });
    }

    // Emit platform event to trigger automations & activity logging
    try {
      const { EventBus } = await import("@/lib/events/bus");
      await EventBus.emit({
        eventType: isReassigned ? "TASK_ASSIGNED" : "TASK_UPDATED",
        actorId: adminId || undefined,
        recipientId: updated.userId,
        entityType: "TASK",
        entityId: updated.id,
        title: isReassigned ? "Task Reassigned" : "Task Updated",
        message: `Task "${updated.title}" updated by ${admin.name}. Status: ${updated.status}`,
        metadata: { taskId: updated.id, status: updated.status, priority: updated.priority },
      });
    } catch (eventBusErr) {
      console.error("[EventBus] Task update emission failed:", eventBusErr);
    }

    return NextResponse.json({ success: true, task: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "tasks:manage");

    const { id } = await props.params;

    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Task not found");
    }

    await db.task.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
