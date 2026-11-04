import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";

const unreadCountCache = new Map<string, { count: number; expiresAt: number }>();

export function invalidateUnreadCountCache(userId?: string) {
  if (userId) unreadCountCache.delete(userId);
  else unreadCountCache.clear();
}

export async function GET(req: Request) {
  try {
    let userId = req.headers.get("x-user-id");
    if (!userId) {
      try {
        const session = await getAuthenticatedSession(req);
        userId = session.userId;
      } catch {
        // Ignored, check follows
      }
    }
    if (!userId) throw new ApiError(401, "Unauthorized");

    const now = Date.now();
    const cached = unreadCountCache.get(userId);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json({ success: true, unreadCount: cached.count });
    }

    const unreadCount = await db.notification.count({
      where: { userId, isRead: false },
    });

    unreadCountCache.set(userId, { count: unreadCount, expiresAt: now + 15_000 });

    return NextResponse.json({ success: true, unreadCount });
  } catch (error: any) {
    return handleApiError(error);
  }
}
