import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { NotificationService } from "@/lib/notifications/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "admin:access");

    const notifications = await db.notification.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    return NextResponse.json({ success: true, data: notifications, notifications });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "admin:access");

    const body = await req.json().catch(() => ({}));
    const { userId, type, title, message, link, priority, category, channels, sendEmail } = body;

    if (!title || !message) {
      throw new ApiError(400, "title and message are required");
    }

    if (userId) {
      // Dispatch via central notification service
      await NotificationService.sendToUser(userId, {
        type: type || "ADMIN_ANNOUNCEMENT",
        title: title.trim(),
        message: message.trim(),
        link: link || null,
        priority: priority || "NORMAL",
        category: category || "ANNOUNCEMENT",
        channels: channels || ["IN_APP", "PUSH"],
        sendEmail: !!sendEmail,
      });

      return NextResponse.json(
        { success: true, message: "Notification sent successfully" },
        { status: 201 }
      );
    }

    // Default to organization-wide if no userId specified
    const result = await NotificationService.sendToOrganization({
      type: type || "ADMIN_ANNOUNCEMENT",
      title: title.trim(),
      message: message.trim(),
      link: link || null,
      priority: priority || "NORMAL",
      category: category || "ANNOUNCEMENT",
      channels: channels || ["IN_APP", "PUSH"],
      sendEmail: !!sendEmail,
    });

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${result.sent} users`,
      data: result,
    }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
