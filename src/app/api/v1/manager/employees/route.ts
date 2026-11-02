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

    const employees = await db.user.findMany({
      where: {
        department: { equals: department.name, mode: "insensitive" },
        status: { not: "DELETED" },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        designation: true,
        department: true,
        status: true,
        avatarUrl: true,
        joiningDate: true,
        _count: {
          select: {
            tasks: true,
            workReports: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      department: {
        id: department.id,
        name: department.name,
        code: department.code,
      },
      employees,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

