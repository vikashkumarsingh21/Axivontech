import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requireEmployee } from "@/lib/api/foundation";
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
    const user = await requireEmployee(req);

    const { searchParams } = new URL(req.url);
    const now = new Date();

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let startOfGrid: Date;
    let endOfGrid: Date;
    let queryYear: number;
    let queryMonth: number;

    if (startDateParam && endDateParam) {
      startOfGrid = new Date(startDateParam);
      endOfGrid = new Date(endDateParam);

      if (isNaN(startOfGrid.getTime()) || isNaN(endOfGrid.getTime())) {
        throw new ApiError(400, "Invalid startDate or endDate format");
      }
      if (startOfGrid > endOfGrid) {
        throw new ApiError(400, "startDate cannot be later than endDate");
      }

      // Max 62 days range safety check
      const diffDays = Math.ceil(
        (endOfGrid.getTime() - startOfGrid.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 62) {
        throw new ApiError(
          400,
          "Date range cannot exceed 62 days for calendar queries"
        );
      }

      queryYear = startOfGrid.getFullYear();
      queryMonth = startOfGrid.getMonth() + 1;
    } else {
      queryYear = parseInt(
        searchParams.get("year") || String(now.getFullYear()),
        10
      );
      queryMonth = parseInt(
        searchParams.get("month") || String(now.getMonth() + 1),
        10
      );

      if (queryMonth < 1 || queryMonth > 12) {
        throw new ApiError(400, "Month must be between 1 and 12");
      }

      // Calculate boundary dates for month grid padding (7 days prior, 14 days after)
      startOfGrid = new Date(queryYear, queryMonth - 1, -7);
      endOfGrid = new Date(queryYear, queryMonth, 14);
    }

    // 1. Get calendar settings
    const settings = await getCalendarSettings();

    // 2. Fetch holidays; auto-sync once if empty
    let holidays: any[] = [];
    try {
      holidays = await db.holiday.findMany({
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
    } catch (holErr) {
      console.warn("[Calendar API] Holiday query skipped:", holErr);
      holidays = [];
    }

    // 3. Parallel fetch of user leaves, tasks, announcements, and attendance
    const [leaves, tasks, announcements, attendanceRecords] = await Promise.all([
      db.leaveRequest.findMany({
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
          isHalfDay: true,
          halfDayType: true,
          status: true,
          reason: true,
        },
        orderBy: { startDate: "asc" },
      }),
      db.task.findMany({
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
          partnerProject: { select: { id: true, projectName: true } },
        },
        orderBy: { dueDate: "asc" },
      }),
      db.announcement.findMany({
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
      }),
      db.attendance.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startOfGrid,
            lte: endOfGrid,
          },
        },
        select: {
          id: true,
          date: true,
          status: true,
          checkIn: true,
          checkOut: true,
          totalWorkedMinutes: true,
          isLate: true,
        },
        orderBy: { date: "asc" },
      }),
    ]);

    // Format for client
    const formattedHolidays = holidays.map((h) => ({
      id: h.id,
      name: h.name,
      date: toDateString(h.date),
      category: h.category,
      isCompanyHoliday: h.isCompanyHoliday,
      isOptional: h.isOptional,
      description: h.description,
      source: h.source,
      state: h.state,
    }));

    const formattedLeaves = leaves.map((l) => ({
      id: l.id,
      leaveType: l.leaveType,
      startDate: toDateString(l.startDate),
      endDate: toDateString(l.endDate),
      isHalfDay: l.isHalfDay,
      halfDayType: l.halfDayType,
      status: l.status,
      reason: l.reason,
    }));

    const formattedTasks = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate ? toDateString(t.dueDate) : null,
      projectName: t.project?.name || t.partnerProject?.projectName || null,
    }));

    const formattedAnnouncements = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      priority: a.priority,
      publishAt: toDateString(a.publishAt),
    }));

    const formattedAttendance = attendanceRecords.map((a) => ({
      id: a.id,
      date: toDateString(a.date),
      status: a.status,
      checkIn: a.checkIn?.toISOString() || null,
      checkOut: a.checkOut?.toISOString() || null,
      totalWorkedMinutes: a.totalWorkedMinutes,
      isLate: a.isLate,
    }));

    // Today's summary calculations
    const todayStr = toDateString(now);
    const weeklyOffToday = checkWeeklyOff(now, settings);
    const todayHolidays = formattedHolidays.filter((h) => h.date === todayStr);

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
      attendance: formattedAttendance,
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
