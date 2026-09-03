import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "projects.company.view");

    const projects = await db.project.findMany({
      include: {
        members: { include: { user: { select: { name: true, email: true } } } },
        tasks: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === "COMPLETED").length;
      const blockedTasks = p.tasks.filter((t) => t.status === "BLOCKED").length;

      let health = "Healthy";
      if (blockedTasks > 0) health = "Blocked";
      else if (p.status === "ON_HOLD") health = "Needs Attention";

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        health,
        memberCount: p.members.length,
        taskProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };
    });

    return NextResponse.json({ data: formatted });
  } catch (error: any) {
    return handleApiError(error);
  }
}
