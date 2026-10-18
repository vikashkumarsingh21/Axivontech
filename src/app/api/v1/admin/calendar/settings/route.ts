import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { updateCalendarSettings, getCalendarSettings } from "@/lib/calendar/holiday-service";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const settings = await getCalendarSettings();
    return NextResponse.json({ success: true, settings });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await requirePermission(userId, "admin:access");

    const body = await req.json();
    const {
      weeklyOffDays,
      workingDays,
      saturdayRule,
      timezone,
      country,
      state,
      holidaySource,
    } = body;

    const updated = await updateCalendarSettings(
      {
        ...(weeklyOffDays !== undefined && { weeklyOffDays }),
        ...(workingDays !== undefined && { workingDays }),
        ...(saturdayRule !== undefined && { saturdayRule }),
        ...(timezone !== undefined && { timezone }),
        ...(country !== undefined && { country }),
        ...(state !== undefined && { state }),
        ...(holidaySource !== undefined && { holidaySource }),
      },
      user.id
    );

    return NextResponse.json({
      success: true,
      message: "Calendar and weekly schedule settings updated successfully",
      settings: updated,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
