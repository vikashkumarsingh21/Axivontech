import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import {
  requireEmployee,
  getCompanyDateString,
  getCompanyCalendarDate,
} from "@/lib/api/foundation";
import { getLeaveBalancesSummary } from "@/lib/leave/balance";

export async function GET(req: NextRequest) {
  try {
    const user = await requireEmployee(req);

    const now = new Date();
    const todayStr = getCompanyDateString();
    const today = getCompanyCalendarDate();

    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const fourteenDaysAhead = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Start of current week (Monday)
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(monday.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const [
      attendances,
      workReports,
      weekWorkReports,
      allUserTasksRaw,
      pendingLeaveCount,
      upcomingApprovedLeave,
      unreadNotifs,
      recentAnnouncements,
      upcomingHolidays,
      leaveBalances,
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
          date: { gte: yesterday, lte: tomorrow },
        },
        orderBy: { date: "desc" },
      }),
      db.workReport.findMany({
        where: {
          userId: user.id,
          date: { gte: monday, lte: tomorrow },
          status: "SUBMITTED",
        },
        select: { hoursWorked: true },
      }),
      db.task.findMany({
        where: { userId: user.id },
        include: {
          project: { select: { id: true, name: true, status: true } },
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
      db.holiday.findMany({
        where: {
          date: { gte: today, lte: fourteenDaysAhead },
        },
        orderBy: { date: "asc" },
        take: 3,
        select: {
          id: true,
          name: true,
          date: true,
          isCompanyHoliday: true,
          category: true,
        },
      }),
      getLeaveBalancesSummary(user.id, now.getFullYear()).catch(() => null),
    ]);

    // Total hours logged this week
    const weeklyHoursLogged = weekWorkReports.reduce(
      (sum, r) => sum + (r.hoursWorked || 0),
      0
    );

    // Prioritize active open attendance session, fallback to today's date match
    const activeAttendance = attendances.find((r) => !r.checkOutAt && !!r.checkInAt);
    const rawAttendance =
      activeAttendance ||
      attendances.find((r) => r.date.toISOString().split("T")[0] === todayStr) ||
      attendances[0] ||
      null;

    // Calculate live worked time if session is actively ongoing
    let attendance: any = rawAttendance;
    if (rawAttendance && rawAttendance.checkInAt && !rawAttendance.checkOutAt) {
      const grossMs = Math.max(0, now.getTime() - new Date(rawAttendance.checkInAt).getTime());
      const grossMins = Math.floor(grossMs / 60000);
      let breakMins = rawAttendance.breakMinutes || 0;
      let onBreak = false;

      if (rawAttendance.breaks && Array.isArray(rawAttendance.breaks)) {
        breakMins = rawAttendance.breaks.reduce((acc: number, b: any) => {
          if (b.endTime) {
            const bMs = Math.max(0, new Date(b.endTime).getTime() - new Date(b.startTime).getTime());
            return acc + Math.floor(bMs / 60000);
          } else {
            onBreak = true;
            const bMs = Math.max(0, now.getTime() - new Date(b.startTime).getTime());
            return acc + Math.floor(bMs / 60000);
          }
        }, 0);
      }
      const netMins = Math.max(0, grossMins - breakMins);
      attendance = {
        ...rawAttendance,
        isOnBreak: onBreak,
        grossMinutes: grossMins,
        workedMinutes: netMins,
        netMinutes: netMins,
        breakMinutes: breakMins,
        requiredDailyMinutes: user.requiredDailyMinutes || 480,
      };
    } else if (rawAttendance) {
      attendance = {
        ...rawAttendance,
        isOnBreak: false,
        requiredDailyMinutes: user.requiredDailyMinutes || 480,
      };
    }

    // Find work report matching today's calendar day
    const todayWorkReport =
      workReports.find((r) => r.date.toISOString().split("T")[0] === todayStr) || null;

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
    const activeTasks = allUserTasks.filter((t) =>
      ["TODO", "IN_PROGRESS", "BLOCKED"].includes(t.status)
    );
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
        weeklyHoursLogged: Math.round(weeklyHoursLogged * 10) / 10,
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
          balances: leaveBalances,
        },
        unreadNotifs,
        recentAnnouncements,
        upcomingHolidays: upcomingHolidays.map((h) => ({
          ...h,
          date: h.date.toISOString().split("T")[0],
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
