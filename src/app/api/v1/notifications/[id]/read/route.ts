import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";

async function getUserId(req: Request) {
  let userId = req.headers.get("x-user-id");
  if (!userId) {
    try {
      const session = await getAuthenticatedSession(req);
      userId = session.userId;
    } catch {
      // Ignored
    }
  }
  if (!userId) throw new ApiError(401, "Unauthorized");
  return userId;
}

async function markNotificationRead(userId: string, id: string) {
  const notification = await db.notification.findUnique({ where: { id } });
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.userId !== userId) throw new ApiError(403, "Forbidden: IDOR protection");

  const updated = await db.notification.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return updated;
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = await getUserId(req);
    const updated = await markNotificationRead(userId, params.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = await getUserId(req);
    const updated = await markNotificationRead(userId, params.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
