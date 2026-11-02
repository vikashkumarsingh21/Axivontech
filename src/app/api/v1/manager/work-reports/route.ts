import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { getManagerAuthorizedDepartment } from "@/lib/services/department.service";

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

    const reports = await db.workReport.findMany({
      where: {
        userId: { in: employeeIds },
      },
      include: {
        user: { select: { id: true, name: true, email: true, designation: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      department: department.name,
      reports,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

