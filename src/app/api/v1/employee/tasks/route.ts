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
