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

    const unreadCount = await db.notification.count({
      where: { userId, isRead: false },
    });

    return NextResponse.json({ success: true, unreadCount });
  } catch (error: any) {
    return handleApiError(error);
  }
}
