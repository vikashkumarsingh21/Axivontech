import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const leaveType = searchParams.get("leaveType") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (leaveType && leaveType !== "ALL") where.leaveType = leaveType;
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { department: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const leaves = await db.leaveRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: leaves, leaves });
  } catch (error: any) {
    return handleApiError(error);
  }
}
