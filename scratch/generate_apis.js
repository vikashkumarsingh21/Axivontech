const fs = require('fs');
const path = require('path');
const baseDir = 'c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies';
function writeFile(relPath, content) {
    const fp = path.join(baseDir, relPath);
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, content.trim() + '\n');
    console.log('Created: ' + relPath);
}

// 1. Dashboard API
writeFile('src/app/api/v1/employee/dashboard/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    
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
`);

// 2. Attendance Route
writeFile('src/app/api/v1/employee/attendance/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const records = await db.attendance.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 30 });
    return NextResponse.json({ success: true, records });
  } catch(e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const { action, notes } = await req.json();
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (action === 'check-in') {
      const existing = await db.attendance.findFirst({ where: { userId, date: today } });
      if (existing) throw new ApiError(400, 'Already checked in today');
      const record = await db.attendance.create({
        data: { userId, date: today, checkInAt: new Date(), notes }
      });
      return NextResponse.json({ success: true, record });
    } else if (action === 'check-out') {
      const existing = await db.attendance.findFirst({ where: { userId, date: today } });
      if (!existing) throw new ApiError(400, 'Not checked in today');
      if (existing.checkOutAt) throw new ApiError(400, 'Already checked out');
      
      const checkOutAt = new Date();
      const diffMs = checkOutAt.getTime() - existing.checkInAt.getTime();
      const totalMinutes = Math.floor(diffMs / 60000);
      
      const record = await db.attendance.update({
        where: { id: existing.id },
        data: { checkOutAt, totalMinutes, notes: notes || existing.notes }
      });
      return NextResponse.json({ success: true, record });
    }
    throw new ApiError(400, 'Invalid action');
  } catch(e) { return handleApiError(e); }
}
`);

// 3. Tasks Route
writeFile('src/app/api/v1/employee/tasks/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const tasks = await db.task.findMany({ where: { userId }, orderBy: { dueDate: 'asc' } });
    return NextResponse.json({ success: true, tasks });
  } catch(e) { return handleApiError(e); }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const { taskId, status } = await req.json();
    
    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError(404, 'Task not found');
    if (task.userId !== userId) throw new ApiError(403, 'Forbidden');
    
    const updated = await db.task.update({
      where: { id: taskId },
      data: { status }
    });
    return NextResponse.json({ success: true, task: updated });
  } catch(e) { return handleApiError(e); }
}
`);

// 4. Leave Route
writeFile('src/app/api/v1/employee/leave/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const requests = await db.leaveRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, requests });
  } catch(e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const { leaveType, startDate, endDate, reason } = await req.json();
    
    if (new Date(startDate) > new Date(endDate)) throw new ApiError(400, 'Invalid date range');
    
    const request = await db.leaveRequest.create({
      data: { userId, leaveType, startDate: new Date(startDate), endDate: new Date(endDate), reason }
    });
    return NextResponse.json({ success: true, request });
  } catch(e) { return handleApiError(e); }
}
`);

// 5. Work Reports Route
writeFile('src/app/api/v1/employee/work-reports/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const reports = await db.workReport.findMany({ where: { userId }, orderBy: { date: 'desc' } });
    return NextResponse.json({ success: true, reports });
  } catch(e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const { date, summary, tasksCompleted, workPerformed, hoursWorked } = await req.json();
    
    const reportDate = new Date(date);
    reportDate.setHours(0,0,0,0);
    
    const report = await db.workReport.upsert({
      where: { userId_date: { userId, date: reportDate } },
      update: { summary, tasksCompleted, workPerformed, hoursWorked: Number(hoursWorked) },
      create: { userId, date: reportDate, summary, tasksCompleted, workPerformed, hoursWorked: Number(hoursWorked) }
    });
    return NextResponse.json({ success: true, report });
  } catch(e) { return handleApiError(e); }
}
`);

// 6. Notifications Route
writeFile('src/app/api/v1/employee/notifications/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const notifications = await db.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, notifications });
  } catch(e) { return handleApiError(e); }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const { id } = await req.json();
    
    const notif = await db.notification.findUnique({ where: { id } });
    if (!notif) throw new ApiError(404, 'Not found');
    if (notif.userId !== userId) throw new ApiError(403, 'Forbidden');
    
    await db.notification.update({ where: { id }, data: { isRead: true } });
    return NextResponse.json({ success: true });
  } catch(e) { return handleApiError(e); }
}
`);

// 7. Announcements Route
writeFile('src/app/api/v1/employee/announcements/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const announcements = await db.announcement.findMany({ orderBy: { publishedAt: 'desc' } });
    return NextResponse.json({ success: true, announcements });
  } catch(e) { return handleApiError(e); }
}
`);

// 8. Documents Route
writeFile('src/app/api/v1/employee/documents/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new ApiError(401, 'Unauthorized');
    const documents = await db.document.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, documents });
  } catch(e) { return handleApiError(e); }
}
`);
