import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateActiveUser } from '@/lib/auth/permissions';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: any = { userId: user.id };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, totalUnread] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      db.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    return NextResponse.json({ success: true, notifications, total: totalUnread });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
    const body = await req.json().catch(() => ({}));
    const { id, markAll } = body;

    if (markAll) {
      await db.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (!id) throw new ApiError(400, 'Notification ID is required');

    const notif = await db.notification.findUnique({ where: { id } });
    if (!notif) throw new ApiError(404, 'Notification not found');
    if (notif.userId !== user.id) throw new ApiError(403, 'Forbidden');

    await db.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
