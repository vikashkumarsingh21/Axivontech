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
