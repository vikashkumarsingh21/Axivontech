import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";
import { resolveDateRange, DateRangePreset } from "@/lib/bi/date-filters";
import { BusinessIntelligenceService } from "@/lib/bi/metrics";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    await requirePermission(session.userId, "admin:access");

    const { searchParams } = new URL(req.url);
    const preset = (searchParams.get("preset") as DateRangePreset) || "last_30_days";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const dateRange = resolveDateRange(preset, customStart, customEnd);
    const sales = await BusinessIntelligenceService.getSalesAnalytics(dateRange);

    return NextResponse.json({
      success: true,
      data: sales,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
