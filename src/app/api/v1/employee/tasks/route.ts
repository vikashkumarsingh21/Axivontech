import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const where: any = { userId: user.id };
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    const tasksRaw = await db.task.findMany({
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
    });

    const tasks = tasksRaw.map((t) => ({
      ...t,
      project:
        t.project ||
        (t.partnerProject
          ? { id: t.partnerProject.id, name: t.partnerProject.projectName, status: "ACTIVE" }
          : null),
    }));

    return NextResponse.json({ success: true, tasks });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);
    const { taskId, status } = await req.json();

    const validStatuses = ["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError(404, "Task not found");
    if (task.userId !== user.id) throw new ApiError(403, "Forbidden");

    const updated = await db.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        project: { select: { id: true, name: true } },
        partnerProject: { select: { id: true, projectName: true, projectCode: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const normalizedTask = {
      ...updated,
      project:
        updated.project ||
        (updated.partnerProject
          ? { id: updated.partnerProject.id, name: updated.partnerProject.projectName }
          : null),
    };

    return NextResponse.json({ success: true, task: normalizedTask });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);
    const { taskId, content } = await req.json();

    if (!taskId || !content || !content.trim()) {
      throw new ApiError(400, "Task ID and comment content are required");
    }

    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError(404, "Task not found");
    if (task.userId !== user.id) throw new ApiError(403, "Forbidden");

    const comment = await db.taskComment.create({
      data: {
        taskId,
        userId: user.id,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (e) {
    return handleApiError(e);
  }
}
