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
