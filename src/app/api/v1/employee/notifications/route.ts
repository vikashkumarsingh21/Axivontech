import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requireEmployee, getPagination } from "@/lib/api/foundation";

const patchNotificationSchema = z.object({
  id: z.string().optional(),
  markAll: z.boolean().optional(),
});

const deleteNotificationSchema = z.object({
  id: z.string().optional(),
  clearAllRead: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const { searchParams } = new URL(req.url);

    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = searchParams.get("type");
    const hasPagination = searchParams.has("page") || searchParams.has("limit");

    const where: any = { userId: user.id };
    if (unreadOnly) {
      where.isRead = false;
    }
    if (type && type !== "ALL") {
      where.type = type;
    }

    const [notifications, totalUnread, totalCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...(hasPagination
          ? {
              skip: getPagination(req, 50, 100).skip,
              take: getPagination(req, 50, 100).limit,
            }
          : { take: 100 }),
      }),
      db.notification.count({
        where: { userId: user.id, isRead: false },
      }),
      db.notification.count({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      total: totalUnread, // Backward compatible with legacy UI
      unreadCount: totalUnread,
      meta: {
        total: totalCount,
        unreadCount: totalUnread,
        readCount: totalCount - totalUnread,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const parsed = patchNotificationSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid payload",
        "VALIDATION_ERROR"
      );
    }

    const { id, markAll } = parsed.data;

    if (markAll) {
      await db.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (!id) {
      throw new ApiError(400, "Notification ID is required");
    }

    const notif = await db.notification.findUnique({ where: { id } });
    if (!notif) throw new ApiError(404, "Notification not found");
    if (notif.userId !== user.id) {
      throw new ApiError(403, "You can only update your own notifications");
    }

    const updated = await db.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      notification: updated,
      message: "Notification marked as read",
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);

    const id = body.id || searchParams.get("id");
    const clearAllRead =
      body.clearAllRead || searchParams.get("clearAllRead") === "true";

    if (clearAllRead) {
      const result = await db.notification.deleteMany({
        where: { userId: user.id, isRead: true },
      });
      return NextResponse.json({
        success: true,
        count: result.count,
        message: `Cleared ${result.count} read notification(s).`,
      });
    }

    if (!id) {
      throw new ApiError(400, "Notification ID or clearAllRead flag is required");
    }

    const notif = await db.notification.findUnique({ where: { id } });
    if (!notif) throw new ApiError(404, "Notification not found");
    if (notif.userId !== user.id) {
      throw new ApiError(403, "You can only delete your own notifications");
    }

    await db.notification.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
