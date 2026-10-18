import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { resolveDateRange, DateRangePreset } from "@/lib/bi/date-filters";
import { BusinessIntelligenceService } from "@/lib/bi/metrics";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!user || user.status === "INACTIVE") {
      throw new ApiError(401, "Unauthorized");
    }

    // Strict Role Validation: Founder, Co-Founder, or explicit reports.finance.view permission
    const isFounder = user.userRoles.some((ur) =>
      ["FOUNDER", "CO_FOUNDER"].includes(ur.role.name)
    );
    const hasFinancePerm = user.userRoles.some((ur) =>
      ur.role.rolePermissions.some((rp) => rp.permission.name === "reports.finance.view")
    );

    if (!isFounder && !hasFinancePerm) {
      throw new ApiError(
        403,
        "Forbidden: Financial analytics and revenue data require Founder or Finance authorization."
      );
    }

    const { searchParams } = new URL(req.url);
    const preset = (searchParams.get("preset") as DateRangePreset) || "last_30_days";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const dateRange = resolveDateRange(preset, customStart, customEnd);
    const finance = await BusinessIntelligenceService.getFinancialAnalytics(dateRange);

    return NextResponse.json({
      success: true,
      data: finance,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
