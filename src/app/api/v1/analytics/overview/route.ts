import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { resolveDateRange, DateRangePreset } from "@/lib/bi/date-filters";
import { BusinessIntelligenceService } from "@/lib/bi/metrics";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { searchParams } = new URL(req.url);
    const preset = (searchParams.get("preset") as DateRangePreset) || "last_30_days";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const dateRange = resolveDateRange(preset, customStart, customEnd);
    const overview = await BusinessIntelligenceService.getBusinessOverview(dateRange);

    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
