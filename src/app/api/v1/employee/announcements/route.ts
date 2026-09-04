import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateActiveUser } from '@/lib/auth/permissions';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
    const announcements = await db.announcement.findMany({ orderBy: { publishedAt: 'desc' } });
    return NextResponse.json({ success: true, announcements });
  } catch(e) { return handleApiError(e); }
}
