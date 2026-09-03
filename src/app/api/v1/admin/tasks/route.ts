import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } }, project: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.task.count({ where }),
    ]);

    return NextResponse.json({ data: tasks, meta: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, userId, projectId, priority, dueDate } = body;

    if (!title || !userId) {
      return NextResponse.json({ error: "title and userId are required" }, { status: 400 });
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
    });

    // Create notification for assigned user
    await db.notification.create({
      data: {
        userId,
        type: "TASK_ASSIGNED",
        title: "New Task Assigned",
        message: "You have been assigned: " + title,
        link: "/employee/tasks",
      },
    });

    // Audit
    const adminId = req.headers.get("x-user-id");
    await db.auditLog.create({
      data: { userId: adminId, action: "TASK_CREATED", resource: "Task", details: { taskId: task.id, title } },
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
