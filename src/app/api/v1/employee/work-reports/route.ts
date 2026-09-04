import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateActiveUser } from '@/lib/auth/permissions';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
    const reports = await db.workReport.findMany({ where: { userId }, orderBy: { date: 'desc' } });
    return NextResponse.json({ success: true, reports });
  } catch(e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
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
