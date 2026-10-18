import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import {
  getCalendarSettings,
  syncHolidays,
} from "@/lib/calendar/holiday-service";
import {
  toDateString,
  checkWeeklyOff,
  getRelativeDateLabel,
} from "@/lib/calendar/calendar-dates";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const queryYear = parseInt(searchParams.get("year") || String(now.getFullYear()));
    const queryMonth = parseInt(searchParams.get("month") || String(now.getMonth() + 1)); // 1-12

    // Calculate boundary dates for query (extending 7 days before and after for month grid padding)
    const startOfGrid = new Date(queryYear, queryMonth - 1, -7);
    const endOfGrid = new Date(queryYear, queryMonth, 14);

    // 1. Get calendar settings (weekly off rules, timezone, etc.)
    const settings = await getCalendarSettings();

    // 2. Fetch holidays from database; if none exist for queryYear, auto-sync once!
    let holidays = await db.holiday.findMany({
      where: {
        date: {
          gte: startOfGrid,
          lte: endOfGrid,
        },
      },
      orderBy: { date: "asc" },
    });

    if (holidays.length === 0) {
      await syncHolidays(queryYear);
      holidays = await db.holiday.findMany({
        where: {
          date: {
            gte: startOfGrid,
            lte: endOfGrid,
          },
        },
        orderBy: { date: "asc" },
      });
    }

    // 3. Fetch current employee's leaves (strictly isolated to user.id for privacy)
    const leaves = await db.leaveRequest.findMany({
      where: {
        userId: user.id,
        status: { in: ["APPROVED", "PENDING"] },
        OR: [
          {
            startDate: { lte: endOfGrid },
            endDate: { gte: startOfGrid },
          },
        ],
      },
      select: {
        id: true,
        leaveType: true,
        startDate: true,
        endDate: true,
        status: true,
        reason: true,
      },
      orderBy: { startDate: "asc" },
    });

    // 4. Fetch current employee's tasks with due dates in range
    const tasks = await db.task.findMany({
      where: {
        userId: user.id,
        dueDate: {
          gte: startOfGrid,
          lte: endOfGrid,
        },
      },
      select: {
        id: true,
        title: true,
        priority: true,
        status: true,
        dueDate: true,
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    // 5. Fetch published announcements within range
    const announcements = await db.announcement.findMany({
      where: {
        status: "PUBLISHED",
        publishAt: {
          gte: startOfGrid,
          lte: endOfGrid,
        },
      },
      select: {
        id: true,
        title: true,
        priority: true,
        publishAt: true,
      },
      orderBy: { publishAt: "desc" },
    });

    // Format holidays for client
    const formattedHolidays = holidays.map((h) => {
      const dateStr = toDateString(h.date);
      return {
        id: h.id,
        name: h.name,
        date: dateStr,
        category: h.category,
        isCompanyHoliday: h.isCompanyHoliday,
        isOptional: h.isOptional,
        description: h.description,
        source: h.source,
        state: h.state,
      };
    });

    // Format leaves
    const formattedLeaves = leaves.map((l) => ({
      id: l.id,
      leaveType: l.leaveType,
      startDate: toDateString(l.startDate),
      endDate: toDateString(l.endDate),
      status: l.status,
      reason: l.reason,
    }));

    // Format tasks
    const formattedTasks = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate ? toDateString(t.dueDate) : null,
      projectName: t.project?.name || null,
    }));

    // Format announcements
    const formattedAnnouncements = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      priority: a.priority,
      publishAt: toDateString(a.publishAt),
    }));

    // Today's summary calculations
    const todayStr = toDateString(now);
    const weeklyOffToday = checkWeeklyOff(now, settings);
    const todayHolidays = formattedHolidays.filter((h) => h.date === todayStr);

    // Upcoming holidays (next 5)
    const upcomingHolidays = formattedHolidays
      .filter((h) => h.date >= todayStr)
      .slice(0, 5)
      .map((h) => ({
        ...h,
        relativeTime: getRelativeDateLabel(h.date, todayStr),
      }));

    return NextResponse.json({
      success: true,
      query: { year: queryYear, month: queryMonth },
      settings,
      holidays: formattedHolidays,
      leaves: formattedLeaves,
      tasks: formattedTasks,
      announcements: formattedAnnouncements,
      summary: {
        todayDate: todayStr,
        isWeeklyOffToday: weeklyOffToday.isOff,
        weeklyOffReason: weeklyOffToday.reason,
        isCompanyHolidayToday: todayHolidays.some((h) => h.isCompanyHoliday),
        todayHolidays,
        upcomingHolidays,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
