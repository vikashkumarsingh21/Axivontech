import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

const UpdateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  userId: z.string().optional(), // assignedTo
  dueDate: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:write");
    
    const { id, taskId } = await props.params;

    const body = await req.json();
    const parsed = UpdateTaskSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, "Invalid payload");

    const { title, description, status, priority, userId, dueDate } = parsed.data;

    const taskExists = await db.task.findFirst({
      where: { id: taskId, partnerProjectId: id }
    });
    if (!taskExists) throw new ApiError(404, "Task not found in this project");

    const task = await db.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(userId !== undefined && { userId }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    if (adminId) {
      await db.auditLog.create({
        data: {
          userId: adminId,
          action: "PARTNER_PROJECT_TASK_UPDATED",
          resource: "Task",
          details: { taskId, partnerProjectId: id, updates: parsed.data },
        }
      });
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    return handleApiError(error);
  }
}
