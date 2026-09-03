import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "employee.view").catch(() => {});

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const where = {
      userRoles: { none: { role: { name: { in: ['ADMIN', 'FOUNDER'] } } } },
      OR: [
        { name: { contains: search, mode: 'insensitive' as any } },
        { email: { contains: search, mode: 'insensitive' as any } },
      ]
    };

    const employees = await db.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, employeeId: true, 
        department: true, designation: true, status: true, 
        userRoles: { include: { role: true } }, joiningDate: true
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await db.user.count({ where });

    return NextResponse.json({
      data: employees,
      meta: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
