import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { syncHolidays } from "@/lib/calendar/holiday-service";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await requirePermission(userId, "admin:access");

    const body = await req.json().catch(() => ({}));
    const year = body.year ? parseInt(body.year) : new Date().getFullYear();

    const result = await syncHolidays(year, user.id);

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${result.total} holidays for ${year}. Added: ${result.added}, Updated: ${result.updated}, Unchanged: ${result.unchanged}.`,
      result,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
