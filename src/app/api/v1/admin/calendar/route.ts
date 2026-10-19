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

    const monthParam = searchParams.get("month");
    const queryMonth = monthParam ? parseInt(monthParam) : null;

    const startOfRange = queryMonth !== null
      ? new Date(year, queryMonth - 1, -7)
      : new Date(year, 0, 1);
    const endOfRange = queryMonth !== null
      ? new Date(year, queryMonth, 14)
      : new Date(year, 11, 31, 23, 59, 59, 999);

    const where: any = {
      date: {
        gte: startOfRange,
        lte: endOfRange,
      },
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (isCompanyHoliday !== null && isCompanyHoliday !== undefined && isCompanyHoliday !== "ALL") {
      where.isCompanyHoliday = isCompanyHoliday === "true";
    }

    const [allHolidays, settings, leaves, tasks, milestones, announcements] = await Promise.all([
      db.holiday.findMany({
        where,
        orderBy: [{ date: "asc" }, { name: "asc" }],
      }),
      getCalendarSettings(),
      db.leaveRequest.findMany({
        where: {
          status: { in: ["APPROVED", "PENDING"] },
          OR: [
            {
              startDate: { lte: endOfRange },
              endDate: { gte: startOfRange },
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
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { startDate: "asc" },
      }).catch(() => []),
      db.task.findMany({
        where: {
          dueDate: {
            gte: startOfRange,
            lte: endOfRange,
          },
        },
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          dueDate: true,
          project: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { dueDate: "asc" },
      }).catch(() => []),
      db.partnerProjectMilestone.findMany({
        where: {
          targetDate: {
            gte: startOfRange,
            lte: endOfRange,
          },
        },
        select: {
          id: true,
          title: true,
          status: true,
          targetDate: true,
          startDate: true,
          completionDate: true,
          partnerProject: { select: { id: true, projectName: true, clientName: true } },
        },
        orderBy: { targetDate: "asc" },
      }).catch(() => []),
      db.announcement.findMany({
        where: {
          status: "PUBLISHED",
          publishAt: {
            gte: startOfRange,
            lte: endOfRange,
          },
        },
        select: {
          id: true,
          title: true,
          priority: true,
          publishAt: true,
        },
        orderBy: { publishAt: "desc" },
      }).catch(() => []),
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

    const formattedHolidays = filtered.map((h) => ({
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

    const formattedLeaves = leaves.map((l: any) => ({
      id: l.id,
      leaveType: l.leaveType,
      startDate: toDateString(l.startDate),
      endDate: toDateString(l.endDate),
      status: l.status,
      reason: l.reason,
      userName: l.user?.name || "Team Member",
      userEmail: l.user?.email || null,
    }));

    const formattedTasks = tasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate ? toDateString(t.dueDate) : null,
      projectName: t.project?.name || null,
      assigneeName: t.user?.name || null,
    }));

    const formattedMilestones = milestones.map((m: any) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      targetDate: m.targetDate ? toDateString(m.targetDate) : null,
      projectName: m.partnerProject?.projectName || "Client Project",
      clientName: m.partnerProject?.clientName || null,
    }));

    const formattedAnnouncements = announcements.map((a: any) => ({
      id: a.id,
      title: a.title,
      priority: a.priority,
      publishAt: toDateString(a.publishAt),
    }));

    return NextResponse.json({
      success: true,
      year,
      stats,
      settings,
      holidays: formattedHolidays,
      leaves: formattedLeaves,
      tasks: formattedTasks,
      milestones: formattedMilestones,
      announcements: formattedAnnouncements,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
