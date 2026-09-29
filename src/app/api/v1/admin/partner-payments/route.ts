import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 15;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.partnerProject = {
        OR: [
          { projectCode: { contains: search, mode: "insensitive" } },
          { clientName: { contains: search, mode: "insensitive" } },
          { companyName: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [payments, total] = await Promise.all([
      db.partnerPayment.findMany({
        where,
        include: {
          partnerProject: {
            select: {
              id: true, projectCode: true, clientName: true, companyName: true, status: true,
              brokerProfile: { select: { user: { select: { name: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.partnerPayment.count({ where }),
    ]);

    return NextResponse.json({ data: payments, meta: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return handleApiError(error);
  }
}
