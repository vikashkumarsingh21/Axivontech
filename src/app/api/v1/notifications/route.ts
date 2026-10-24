import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";

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

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15")));
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.notification.count({ where: { userId } }),
      db.notification.count({ where: { userId, isRead: false } }),
    ]);

    return NextResponse.json({
      success: true,
      data: notifications,
      meta: { total, unreadCount, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
