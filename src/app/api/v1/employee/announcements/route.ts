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
