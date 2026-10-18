import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    const admin = await requirePermission(adminId, "tasks:manage");

    const { id } = await props.params;
    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      throw new ApiError(400, "Comment content is required");
    }

    const task = await db.task.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    const comment = await db.taskComment.create({
      data: {
        taskId: id,
        userId: adminId!,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify the assigned employee of the manager's comment
    if (task.userId !== adminId) {
      await db.notification.create({
        data: {
          userId: task.userId,
          type: "TASK_UPDATED",
          title: "New Comment on Task",
          message: `${admin.name} commented on "${task.title}": ${content.trim().slice(0, 80)}`,
          link: "/employee/tasks",
        },
      });
    }

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
