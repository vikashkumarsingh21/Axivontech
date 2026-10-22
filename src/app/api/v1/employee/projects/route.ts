import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    // Query projects where user is a project member OR has assigned tasks
    const assignedProjects = await db.project.findMany({
      where: {
        status: { in: ["ACTIVE", "ON_HOLD", "COMPLETED"] },
        OR: [
          { members: { some: { userId: user.id } } },
          { tasks: { some: { userId: user.id } } },
        ],
      },
      include: {
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // If employee is assigned to specific projects, return those.
    // If not assigned to any specific project yet, return active organization projects.
    const projects =
      assignedProjects.length > 0
        ? assignedProjects
        : await db.project.findMany({
            where: { status: "ACTIVE" },
            include: {
              _count: { select: { tasks: true, members: true } },
            },
            orderBy: { createdAt: "desc" },
          });

    return NextResponse.json({ success: true, data: projects, projects });
  } catch (error: any) {
    return handleApiError(error);
  }
}
