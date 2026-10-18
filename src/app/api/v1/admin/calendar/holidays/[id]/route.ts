import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { parseDateString } from "@/lib/calendar/calendar-dates";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { id } = await params;
    const body = await req.json();
    const {
      name,
      date,
      category,
      isCompanyHoliday,
      isOptional,
      description,
      state,
    } = body;

    const existing = await db.holiday.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Holiday not found");
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (date !== undefined) {
      const d = parseDateString(date);
      updateData.date = d;
      updateData.year = d.getFullYear();
    }
    if (category !== undefined) updateData.category = category;
    if (isCompanyHoliday !== undefined) updateData.isCompanyHoliday = Boolean(isCompanyHoliday);
    if (isOptional !== undefined) updateData.isOptional = Boolean(isOptional);
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (state !== undefined) updateData.state = state;

    const updated = await db.holiday.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, holiday: updated });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { id } = await params;
    const existing = await db.holiday.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Holiday not found");
    }

    await db.holiday.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Holiday deleted successfully" });
  } catch (e) {
    return handleApiError(e);
  }
}
