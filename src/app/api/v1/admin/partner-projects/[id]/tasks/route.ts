import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:read");
    const { id } = await props.params;

    const tasks = await db.task.findMany({
      where: { partnerProjectId: id },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ data: tasks });
  } catch (error) {
    return handleApiError(error);
  }
}

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
  dueDate: z.string().optional(),
  userId: z.string().min(1), // Assigned To
});

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:write");
    const { id } = await props.params;

    const body = await req.json();
    const parsed = CreateTaskSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, "Invalid payload");

    const { title, description, priority, dueDate, userId } = parsed.data;

    const project = await db.partnerProject.findUnique({ where: { id } });
    if (!project) throw new ApiError(404, "Project not found");

    const task = await db.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        partnerProjectId: id,
        userId,
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    if (adminId) {
      await db.auditLog.create({
        data: {
          userId: adminId,
          action: "PARTNER_PROJECT_TASK_CREATED",
          resource: "Task",
          details: { taskId: task.id, partnerProjectId: id, title, assignedTo: userId },
        }
      });
    }

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
