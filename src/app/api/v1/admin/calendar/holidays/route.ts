import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { parseDateString } from "@/lib/calendar/calendar-dates";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await requirePermission(userId, "admin:access");

    const body = await req.json();
    const {
      name,
      date,
      category = "COMPANY_HOLIDAY",
      isCompanyHoliday = true,
      isOptional = false,
      description,
      state = "ALL",
    } = body;

    if (!name?.trim() || !date) {
      throw new ApiError(400, "Holiday name and date are required");
    }

    const parsedDate = parseDateString(date);
    const year = parsedDate.getFullYear();

    // Check if identical holiday already exists on this date
    const existing = await db.holiday.findFirst({
      where: {
        date: parsedDate,
        name: name.trim(),
      },
    });

    if (existing) {
      throw new ApiError(409, "A holiday with this name already exists on this date");
    }

    const holiday = await db.holiday.create({
      data: {
        name: name.trim(),
        date: parsedDate,
        category,
        isCompanyHoliday: Boolean(isCompanyHoliday),
        isOptional: Boolean(isOptional),
        description: description?.trim() || null,
        source: "MANUAL",
        country: "IN",
        state: state || "ALL",
        allDay: true,
        year,
        createdById: user.id,
      },
    });

    return NextResponse.json({ success: true, holiday }, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
