import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateActiveUser } from '@/lib/auth/permissions';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
    const requests = await db.leaveRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, requests });
  } catch(e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
    const { leaveType, startDate, endDate, reason } = await req.json();
    
    if (new Date(startDate) > new Date(endDate)) throw new ApiError(400, 'Invalid date range');
    
    const request = await db.leaveRequest.create({
      data: { userId, leaveType, startDate: new Date(startDate), endDate: new Date(endDate), reason }
    });
    return NextResponse.json({ success: true, request });
  } catch(e) { return handleApiError(e); }
}
