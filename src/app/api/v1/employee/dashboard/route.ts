import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { getUtcCalendarDate, getUtcDayRange, isSameCalendarDay } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const now = new Date();
    const today = getUtcCalendarDate(now);
    const { startOfDay, endOfDay } = getUtcDayRange(now);

    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const [
      attendances,
      workReports,
      allUserTasksRaw,
      pendingLeaveCount,
      upcomingApprovedLeave,
      unreadNotifs,
      recentAnnouncements,
    ] = await Promise.all([
      db.attendance.findMany({
        where: {
          userId: user.id,
          OR: [
            { date: { gte: yesterday, lte: tomorrow } },
            { checkInAt: { gte: yesterday, lte: tomorrow } },
          ],
        },
        include: { breaks: true },
        orderBy: { date: "desc" },
      }),
      db.workReport.findMany({
        where: {
          userId: user.id,
          OR: [
            { date: { gte: yesterday, lte: tomorrow } },
            { createdAt: { gte: startOfDay, lte: endOfDay } },
          ],
        },
        orderBy: { date: "desc" },
      }),
      db.task.findMany({
        where: { userId: user.id },
        include: {
          project: { select: { id: true, name: true } },
          partnerProject: { select: { id: true, projectName: true, projectCode: true } },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      }),
      db.leaveRequest.count({
        where: { userId: user.id, status: "PENDING" },
      }),
      db.leaveRequest.findFirst({
        where: {
          userId: user.id,
          status: "APPROVED",
          endDate: { gte: today },
        },
        orderBy: { startDate: "asc" },
      }),
      db.notification.count({
        where: { userId: user.id, isRead: false },
      }),
      db.announcement.findMany({
        where: {
          status: "PUBLISHED",
          publishAt: { lte: now },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        orderBy: { publishAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          content: true,
          priority: true,
          publishAt: true,
        },
      }),
    ]);

    // Prioritize active open attendance session, fallback to calendar day match
    const activeAttendance = attendances.find((r) => !r.checkOutAt && !!r.checkInAt);
    const rawAttendance =
      activeAttendance ||
      attendances.find(
        (r) => isSameCalendarDay(r.date, today) || (r.checkInAt && isSameCalendarDay(r.checkInAt, today))
      ) ||
      null;

    // Calculate live worked time if session is actively ongoing
    let attendance: any = rawAttendance;
    if (rawAttendance && rawAttendance.checkInAt && !rawAttendance.checkOutAt) {
      const grossMs = Math.max(0, now.getTime() - new Date(rawAttendance.checkInAt).getTime());
      const grossMins = Math.floor(grossMs / 60000);
      let breakMins = rawAttendance.breakMinutes || 0;
      if (rawAttendance.breaks && Array.isArray(rawAttendance.breaks)) {
        breakMins = rawAttendance.breaks.reduce((acc: number, b: any) => {
          if (b.endTime) {
            const bMs = Math.max(0, new Date(b.endTime).getTime() - new Date(b.startTime).getTime());
            return acc + Math.floor(bMs / 60000);
          } else {
            const bMs = Math.max(0, now.getTime() - new Date(b.startTime).getTime());
            return acc + Math.floor(bMs / 60000);
          }
        }, 0);
      }
      const netMins = Math.max(0, grossMins - breakMins);
      attendance = {
        ...rawAttendance,
        grossMinutes: grossMins,
        workedMinutes: netMins,
        netMinutes: netMins,
        breakMinutes: breakMins,
        requiredDailyMinutes: user.requiredDailyMinutes || 480,
      };
    } else if (rawAttendance) {
      attendance = {
        ...rawAttendance,
        requiredDailyMinutes: user.requiredDailyMinutes || 480,
      };
    }

    // Find work report matching today's calendar day
    const todayWorkReport =
      workReports.find(
        (r) => isSameCalendarDay(r.date, today) || isSameCalendarDay(r.createdAt, today)
      ) || null;

    // Normalize task project naming across regular and partner projects
    const allUserTasks = allUserTasksRaw.map((t) => ({
      ...t,
      project:
        t.project ||
        (t.partnerProject
          ? { id: t.partnerProject.id, name: t.partnerProject.projectName }
          : null),
    }));

    // Categorize tasks
    const activeTasks = allUserTasks.filter((t) => ["TODO", "IN_PROGRESS", "BLOCKED"].includes(t.status));
    const completedTasks = allUserTasks.filter((t) => t.status === "COMPLETED");
    const overdueTasks = allUserTasks.filter(
      (t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < today
    );
    const dueTodayTasks = allUserTasks.filter(
      (t) =>
        t.status !== "COMPLETED" &&
        t.dueDate &&
        new Date(t.dueDate) >= today &&
        new Date(t.dueDate) < tomorrow
    );

    return NextResponse.json({
      success: true,
      data: {
        attendance,
        todayWorkReport,
        hasReportToday: !!todayWorkReport,
        taskStats: {
          total: allUserTasks.length,
          active: activeTasks.length,
          completed: completedTasks.length,
          overdue: overdueTasks.length,
          dueToday: dueTodayTasks.length,
        },
        recentTasks: allUserTasks.slice(0, 6),
        dueTodayTasks,
        overdueTasks,
        leaveStats: {
          pendingCount: pendingLeaveCount,
          upcomingApproved: upcomingApprovedLeave,
        },
        unreadNotifs,
        recentAnnouncements,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
