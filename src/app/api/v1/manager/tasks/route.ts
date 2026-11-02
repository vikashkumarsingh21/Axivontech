import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getManagerAuthorizedDepartment } from "@/lib/services/department.service";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().trim().min(2, "Task title is required").max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  userId: z.string().min(1, "Assigned employee ID is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const actorId = req.headers.get("x-user-id");
    if (!actorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const department = await getManagerAuthorizedDepartment(actorId);

    // Get employees in manager's department
    const employees = await db.user.findMany({
      where: { department: { equals: department.name, mode: "insensitive" } },
      select: { id: true },
    });
    const employeeIds = employees.map((e) => e.id);

    const tasks = await db.task.findMany({
      where: {
        userId: { in: employeeIds },
      },
      include: {
        user: { select: { id: true, name: true, email: true, designation: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      department: department.name,
      tasks,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actorId = req.headers.get("x-user-id");
    if (!actorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const department = await getManagerAuthorizedDepartment(actorId);
    const body = await req.json();
    const data = createTaskSchema.parse(body);

    // Verify assigned employee belongs to manager's department
    const targetEmployee = await db.user.findUnique({
      where: { id: data.userId },
      select: { id: true, name: true, department: true, status: true },
    });

    if (!targetEmployee) {
      throw new ApiError(404, "Target employee not found");
    }

    if (
      !targetEmployee.department ||
      targetEmployee.department.toLowerCase() !== department.name.toLowerCase()
    ) {
      throw new ApiError(
        403,
        `Cannot assign tasks across departments. Employee ${targetEmployee.name} belongs to ${targetEmployee.department || "No Department"}, not ${department.name}.`
      );
    }

    const newTask = await db.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        userId: data.userId,
        priority: data.priority,
        status: "TODO",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId: data.projectId || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Audit log
    try {
      await db.auditLog.create({
        data: {
          userId: actorId,
          action: "TASK_ASSIGNED_BY_MANAGER",
          resource: `Task:${newTask.id}`,
          details: {
            taskTitle: newTask.title,
            assignedTo: targetEmployee.name,
            department: department.name,
          },
        },
      });
    } catch (e) {}

    return NextResponse.json(
      {
        success: true,
        message: `Task assigned to ${targetEmployee.name} successfully.`,
        task: newTask,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

