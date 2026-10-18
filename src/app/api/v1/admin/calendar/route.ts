import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { getCalendarSettings } from "@/lib/calendar/holiday-service";
import { toDateString } from "@/lib/calendar/calendar-dates";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()));
    const search = searchParams.get("search")?.toLowerCase();
    const category = searchParams.get("category");
    const isCompanyHoliday = searchParams.get("isCompanyHoliday");

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const where: any = {
      date: {
        gte: startOfYear,
        lte: endOfYear,
      },
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (isCompanyHoliday !== null && isCompanyHoliday !== undefined && isCompanyHoliday !== "ALL") {
      where.isCompanyHoliday = isCompanyHoliday === "true";
    }

    const [allHolidays, settings] = await Promise.all([
      db.holiday.findMany({
        where,
        orderBy: [{ date: "asc" }, { name: "asc" }],
      }),
      getCalendarSettings(),
    ]);

    let filtered = allHolidays;
    if (search) {
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(search) ||
          (h.description && h.description.toLowerCase().includes(search))
      );
    }

    const todayStr = toDateString(now);

    // Compute metrics for the year
    const stats = {
      totalHolidays: allHolidays.length,
      companyHolidays: allHolidays.filter((h) => h.isCompanyHoliday).length,
      festivalsObservances: allHolidays.filter(
        (h) => h.category === "FESTIVAL_OR_OBSERVANCE" && !h.isCompanyHoliday
      ).length,
      optionalHolidays: allHolidays.filter((h) => h.isOptional).length,
      upcomingCount: allHolidays.filter((h) => toDateString(h.date) >= todayStr).length,
    };

    const formatted = filtered.map((h) => ({
      id: h.id,
      name: h.name,
      date: toDateString(h.date),
      category: h.category,
      isCompanyHoliday: h.isCompanyHoliday,
      isOptional: h.isOptional,
      description: h.description,
      source: h.source,
      state: h.state,
      lastSyncAt: h.lastSyncAt ? h.lastSyncAt.toISOString() : null,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      year,
      stats,
      settings,
      holidays: formatted,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
