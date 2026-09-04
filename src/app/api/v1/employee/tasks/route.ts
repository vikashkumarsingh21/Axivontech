import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateActiveUser } from '@/lib/auth/permissions';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
    const tasks = await db.task.findMany({ where: { userId: user.id }, orderBy: { dueDate: 'asc' } });
    return NextResponse.json({ success: true, tasks });
  } catch(e) { return handleApiError(e); }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
    const { taskId, status } = await req.json();
    
    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError(404, 'Task not found');
    if (task.userId !== user.id) throw new ApiError(403, 'Forbidden');
    
    const updated = await db.task.update({
      where: { id: taskId },
      data: { status }
    });
    return NextResponse.json({ success: true, task: updated });
  } catch(e) { return handleApiError(e); }
}
