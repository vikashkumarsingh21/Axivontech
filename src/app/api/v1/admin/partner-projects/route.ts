import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:read");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 15;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { clientEmail: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { projectCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const [projects, total] = await Promise.all([
      db.partnerProject.findMany({
        where,
        select: {
          id: true,
          projectCode: true,
          clientName: true,
          clientEmail: true,
          companyName: true,
          status: true,
          createdAt: true,
          brokerProfile: { 
            select: { user: { select: { name: true } } } 
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.partnerProject.count({ where }),
    ]);

    return NextResponse.json({
      data: projects,
      meta: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
