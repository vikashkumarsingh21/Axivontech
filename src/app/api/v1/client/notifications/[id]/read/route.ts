import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "CLIENT") throw new ApiError(403, "Access denied.");
    await validateActiveUser(userId);

    const notificationId = params.id;

    // Check ownership
    const notification = await db.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== userId) {
      throw new ApiError(404, "Notification not found or access denied.");
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    return handleApiError(error);
  }
}
