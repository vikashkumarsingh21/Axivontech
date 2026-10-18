import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automation.view");

    const { searchParams } = new URL(req.url);
    const automationId = searchParams.get("automationId");
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const where: any = {};
    if (automationId) where.automationId = automationId;
    if (status) where.status = status;

    const executions = await db.automationExecution.findMany({
      where,
      include: {
        automation: {
          select: { id: true, name: true, triggerType: true },
        },
      },
      orderBy: { executedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      executions,
      count: executions.length,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
