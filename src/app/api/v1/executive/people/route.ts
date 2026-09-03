import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, hasPermission } from "@/lib/auth/permissions";
import { getExecutiveScope } from "@/lib/auth/executive-scope";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "people.view");
    const scope = await getExecutiveScope(userId);
    const canViewSensitive = userId ? await hasPermission(userId, "people.sensitive.view") : false;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: any = {
      userRoles: { none: { role: { name: { in: ["FOUNDER", "CO_FOUNDER"] } } } },
    };

    if (scope.allowedDepartments) {
      where.department = { in: scope.allowedDepartments };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const [people, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
          department: true,
          designation: true,
          status: true,
          joiningDate: true,
          phone: canViewSensitive,
          address: canViewSensitive,
          emergencyContact: canViewSensitive,
          userRoles: { select: { role: { select: { name: true } } } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      data: people,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
