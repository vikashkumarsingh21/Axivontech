import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { requireEmployee } from "@/lib/api/foundation";

export async function GET(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const { searchParams } = new URL(req.url);

    const statusParam = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const where: any = {
      OR: [
        { members: { some: { userId: user.id } } },
        { tasks: { some: { userId: user.id } } },
      ],
    };

    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam;
    }

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    // Strictly fetch projects where the employee is actually a member or assignee
    // Resolves data leak of unassigned company-wide projects
    const rawProjects = await db.project.findMany({
      where,
      include: {
        _count: { select: { tasks: true, members: true } },
        members: {
          where: { userId: user.id },
          select: { role: true },
        },
        tasks: {
          where: { userId: user.id },
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const projects = rawProjects.map((p) => {
      const myTasks = p.tasks || [];
      const completedMyTasks = myTasks.filter((t) => t.status === "COMPLETED").length;
      const myRole = p.members[0]?.role || "CONTRIBUTOR";

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        myRole,
        myTaskStats: {
          total: myTasks.length,
          completed: completedMyTasks,
          pending: myTasks.length - completedMyTasks,
          completionPercentage:
            myTasks.length > 0 ? Math.round((completedMyTasks / myTasks.length) * 100) : 0,
        },
        _count: p._count,
      };
    });

    return NextResponse.json({
      success: true,
      data: projects,
      projects,
      meta: {
        total: projects.length,
        active: projects.filter((p) => p.status === "ACTIVE").length,
        completed: projects.filter((p) => p.status === "COMPLETED").length,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
