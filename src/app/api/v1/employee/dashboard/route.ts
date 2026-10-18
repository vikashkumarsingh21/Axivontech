import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateActiveUser } from '@/lib/auth/permissions';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      attendance,
      todayWorkReport,
      allUserTasks,
      pendingLeaveCount,
      upcomingApprovedLeave,
      unreadNotifs,
      recentAnnouncements,
    ] = await Promise.all([
      db.attendance.findFirst({
        where: { userId: user.id, date: today },
        include: { breaks: true },
      }),
      db.workReport.findFirst({
        where: { userId: user.id, date: today },
      }),
      db.task.findMany({
        where: { userId: user.id },
        include: {
          project: { select: { id: true, name: true } },
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      }),
      db.leaveRequest.count({
        where: { userId: user.id, status: 'PENDING' },
      }),
      db.leaveRequest.findFirst({
        where: {
          userId: user.id,
          status: 'APPROVED',
          endDate: { gte: today },
        },
        orderBy: { startDate: 'asc' },
      }),
      db.notification.count({
        where: { userId: user.id, isRead: false },
      }),
      db.announcement.findMany({
        where: {
          status: 'PUBLISHED',
          publishAt: { lte: now },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        orderBy: { publishAt: 'desc' },
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

    // Categorize tasks
    const activeTasks = allUserTasks.filter((t) => ['TODO', 'IN_PROGRESS', 'BLOCKED'].includes(t.status));
    const completedTasks = allUserTasks.filter((t) => t.status === 'COMPLETED');
    const overdueTasks = allUserTasks.filter(
      (t) => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < today
    );
    const dueTodayTasks = allUserTasks.filter(
      (t) =>
        t.status !== 'COMPLETED' &&
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
