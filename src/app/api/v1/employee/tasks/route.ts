import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requireEmployee, getPagination, getPlatformAdmins } from "@/lib/api/foundation";

const patchTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"]),
});

const postCommentSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  content: z.string().trim().min(1, "Comment content cannot be empty").max(2000, "Comment cannot exceed 2000 characters"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search")?.trim();
    const hasPagination = searchParams.has("page") || searchParams.has("limit");

    const where: any = { userId: user.id };

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (priority && priority !== "ALL") {
      where.priority = priority;
    }
    if (projectId && projectId !== "ALL") {
      where.OR = [{ projectId }, { partnerProjectId: projectId }];
    }
    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const now = new Date();
    const fortyEightHoursAhead = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const [tasksRaw, allUserTasks] = await Promise.all([
      db.task.findMany({
        where,
        include: {
          project: {
            select: { id: true, name: true, status: true },
          },
          partnerProject: {
            select: { id: true, projectName: true, projectCode: true },
          },
          comments: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        ...(hasPagination ? {
          skip: getPagination(req, 50, 100).skip,
          take: getPagination(req, 50, 100).limit,
        } : {}),
      }),
      db.task.findMany({
        where: { userId: user.id },
        select: { status: true, dueDate: true },
      }),
    ]);

    const counts = {
      total: allUserTasks.length,
      todo: allUserTasks.filter((t) => t.status === "TODO").length,
      inProgress: allUserTasks.filter((t) => t.status === "IN_PROGRESS").length,
      blocked: allUserTasks.filter((t) => t.status === "BLOCKED").length,
      completed: allUserTasks.filter((t) => t.status === "COMPLETED").length,
      overdue: allUserTasks.filter(
        (t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < now
      ).length,
      dueSoon: allUserTasks.filter(
        (t) =>
          t.status !== "COMPLETED" &&
          t.dueDate &&
          new Date(t.dueDate) >= now &&
          new Date(t.dueDate) <= fortyEightHoursAhead
      ).length,
    };

    const tasks = tasksRaw.map((t) => ({
      ...t,
      project:
        t.project ||
        (t.partnerProject
          ? {
              id: t.partnerProject.id,
              name: t.partnerProject.projectName,
              status: "ACTIVE",
            }
          : null),
      isOverdue:
        t.status !== "COMPLETED" && t.dueDate
          ? new Date(t.dueDate) < now
          : false,
    }));

    return NextResponse.json({
      success: true,
      tasks,
      meta: {
        counts,
        filteredCount: tasks.length,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const parsed = patchTaskSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid status update payload",
        "VALIDATION_ERROR"
      );
    }

    const { taskId, status } = parsed.data;

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { id: true, name: true } },
        partnerProject: { select: { id: true, projectName: true, projectCode: true } },
      },
    });

    if (!task) throw new ApiError(404, "Task not found");
    if (task.userId !== user.id) {
      throw new ApiError(403, "You can only update tasks assigned to you");
    }

    const previousStatus = task.status;
    const updated = await db.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        project: { select: { id: true, name: true, status: true } },
        partnerProject: { select: { id: true, projectName: true, projectCode: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Notify admins if task was completed or blocked
    if (status === "COMPLETED" || status === "BLOCKED") {
      try {
        const admins = await getPlatformAdmins();

        if (admins.length > 0) {
          const actionWord = status === "COMPLETED" ? "completed" : "marked as blocked";
          await db.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.id,
              type: "TASK_UPDATED",
              title: `Task ${status === "COMPLETED" ? "Completed" : "Blocked"}: ${task.title}`,
              message: `${user.name} has ${actionWord} the task "${task.title}".`,
              link: `/admin/tasks`,
            })),
          });
        }
      } catch (notifyErr) {
        console.error("[Task Notification Error]:", notifyErr);
      }
    }

    // Platform event emission
    try {
      const { EventBus } = await import("@/lib/events/bus").catch(() => ({ EventBus: null }));
      if (EventBus) {
        await EventBus.emit({
          eventType: "TASK_UPDATED",
          actorId: user.id,
          entityType: "TASK",
          entityId: taskId,
          title: `Task Status Changed: ${task.title}`,
          message: `${user.name} changed status from ${previousStatus} to ${status}.`,
          metadata: { taskId, previousStatus, newStatus: status },
        }).catch(() => {});
      }
    } catch {}

    const normalizedTask = {
      ...updated,
      project:
        updated.project ||
        (updated.partnerProject
          ? { id: updated.partnerProject.id, name: updated.partnerProject.projectName, status: "ACTIVE" }
          : null),
    };

    return NextResponse.json({
      success: true,
      task: normalizedTask,
      message: `Task status updated to ${status}`,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const parsed = postCommentSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid comment payload",
        "VALIDATION_ERROR"
      );
    }

    const { taskId, content } = parsed.data;

    const task = await db.task.findUnique({
      where: { id: taskId },
      select: { id: true, userId: true, title: true },
    });

    if (!task) throw new ApiError(404, "Task not found");
    if (task.userId !== user.id) {
      throw new ApiError(403, "You can only comment on tasks assigned to you");
    }

    const comment = await db.taskComment.create({
      data: {
        taskId,
        userId: user.id,
        content,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Notify admins / platform event
    try {
      const { EventBus } = await import("@/lib/events/bus").catch(() => ({ EventBus: null }));
      if (EventBus) {
        await EventBus.emit({
          eventType: "TASK_UPDATED",
          actorId: user.id,
          entityType: "TASK",
          entityId: taskId,
          title: `New Comment on Task: ${task.title}`,
          message: `${user.name}: "${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"`,
          metadata: { taskId, commentId: comment.id },
        }).catch(() => {});
      }
    } catch {}

    return NextResponse.json(
      {
        success: true,
        comment,
        message: "Comment added successfully",
      },
      { status: 201 }
    );
  } catch (e) {
    return handleApiError(e);
  }
}
