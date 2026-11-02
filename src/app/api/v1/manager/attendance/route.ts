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

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get employees in manager's department
    const employees = await db.user.findMany({
      where: {
        department: { equals: department.name, mode: "insensitive" },
        status: { not: "DELETED" },
      },
      select: { id: true, name: true, email: true, designation: true },
      orderBy: { name: "asc" },
    });
    const employeeIds = employees.map((e) => e.id);

    const attendances = await db.attendance.findMany({
      where: {
        userId: { in: employeeIds },
        date: { gte: targetDate, lt: nextDay },
      },
      include: {
        user: { select: { id: true, name: true, email: true, designation: true } },
      },
    });

    const presentUserIds = new Set(attendances.map((a) => a.userId));
    const absentEmployees = employees.filter((e) => !presentUserIds.has(e.id));

    return NextResponse.json({
      success: true,
      department: department.name,
      date: targetDate.toISOString(),
      summary: {
        totalEmployees: employees.length,
        present: attendances.length,
        absent: absentEmployees.length,
      },
      attendances,
      absentEmployees,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

