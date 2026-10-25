import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:read");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status")?.trim();
    const priority = searchParams.get("priority")?.trim();
    const search = searchParams.get("search")?.trim().toLowerCase();

    // Fetch all broker support settings
    const settings = await db.organizationSetting.findMany({
      where: {
        key: { startsWith: "broker_support:" },
      },
    });

    let allTickets: any[] = [];
    for (const s of settings) {
      if (Array.isArray(s.value)) {
        allTickets.push(...(s.value as any[]));
      }
    }

    // Filter tickets
    if (status && status !== "ALL") {
      allTickets = allTickets.filter((t) => t.status === status);
    }

    if (priority && priority !== "ALL") {
      allTickets = allTickets.filter((t) => t.priority === priority);
    }

    if (search) {
      allTickets = allTickets.filter(
        (t) =>
          t.id?.toLowerCase().includes(search) ||
          t.subject?.toLowerCase().includes(search) ||
          t.brokerName?.toLowerCase().includes(search) ||
          t.brokerEmail?.toLowerCase().includes(search) ||
          t.category?.toLowerCase().includes(search)
      );
    }

    allTickets.sort(
      (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      tickets: allTickets,
      total: allTickets.length,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
