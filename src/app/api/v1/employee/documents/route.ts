import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateActiveUser } from '@/lib/auth/permissions';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
    const documents = await db.document.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, documents });
  } catch(e) { return handleApiError(e); }
}
