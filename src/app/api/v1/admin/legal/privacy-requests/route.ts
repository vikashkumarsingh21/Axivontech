import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (category && category !== "ALL") where.category = category;

    let requests: any[] = [];
    try {
      requests = await db.privacyRequest.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      requests = [];
    }

    const stats = {
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      underReview: requests.filter((r) => r.status === "UNDER_REVIEW").length,
      fulfilled: requests.filter((r) => r.status === "FULFILLED").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
    };

    return NextResponse.json({ success: true, requests, stats });
  } catch (error) {
    return handleApiError(error);
  }
}
