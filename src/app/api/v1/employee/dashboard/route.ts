import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateActiveUser } from '@/lib/auth/permissions';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const [attendance, activeTasks, pendingReports, unreadNotifs, todayTasks] = await Promise.all([
      db.attendance.findFirst({ where: { userId, date: today } }),
      db.task.count({ where: { userId, status: { in: ['TODO', 'IN_PROGRESS'] } } }),
      db.workReport.count({ where: { userId, status: 'SUBMITTED' } }),
      db.notification.count({ where: { userId, isRead: false } }),
      db.task.findMany({ where: { userId, dueDate: { gte: today } }, take: 5, orderBy: { dueDate: 'asc' } })
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        attendance,
        activeTasks,
        pendingReports,
        unreadNotifs,
        todayTasks
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
