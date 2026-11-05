import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { NotificationService } from "@/lib/notifications/service";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  RECIPIENT_TYPES,
} from "@/lib/notifications/types";

const sendNotificationSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000),
  category: z.enum(NOTIFICATION_CATEGORIES).optional().default("ANNOUNCEMENT"),
  priority: z.enum(NOTIFICATION_PRIORITIES).optional().default("NORMAL"),
  recipientType: z.enum(RECIPIENT_TYPES).default("ALL_ACTIVE_USERS"),
  targetUserId: z.string().optional().nullable(),
  targetUserIds: z.array(z.string()).optional().nullable(),
  role: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  link: z.string().max(500).optional().nullable(),
  actionLabel: z.string().max(50).optional().nullable(),
  channels: z.array(z.enum(["IN_APP", "PUSH", "EMAIL"])).optional().default(["IN_APP", "PUSH"]),
  sendEmail: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    let adminId = req.headers.get("x-user-id");
    if (!adminId) {
      try {
        const session = await getAuthenticatedSession(req);
        adminId = session.userId;
      } catch {
        // Handled below
      }
    }

    if (!adminId) {
      throw new ApiError(401, "Authentication required");
    }

    await requirePermission(adminId, "admin:access");

    const sender = await db.user.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, email: true },
    });

    const body = await req.json().catch(() => ({}));
    const parsed = sendNotificationSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid payload");
    }

    const {
      title,
      message,
      category,
      priority,
      recipientType,
      targetUserId,
      targetUserIds,
      role,
      departmentId,
      link,
      actionLabel,
      channels,
      sendEmail,
    } = parsed.data;

    // Resolve audience user IDs
    const audienceUserIds = await NotificationService.resolveAudience(recipientType, {
      userId: targetUserId || undefined,
      userIds: targetUserIds || undefined,
      role: role || undefined,
      departmentId: departmentId || undefined,
    });

    if (audienceUserIds.length === 0) {
      throw new ApiError(400, "No active recipients found for the selected audience criteria");
    }

    // Dispatch notifications
    const dispatchResult = await NotificationService.sendToUsers(audienceUserIds, {
      type: "ADMIN_ANNOUNCEMENT",
      title,
      message,
      category,
      priority,
      link: link || null,
      actionLabel: actionLabel || null,
      channels,
      sendEmail,
    });

    // Record broadcast audit entry
    const broadcastId = `bc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await NotificationService.recordBroadcastHistory({
      id: broadcastId,
      senderId: adminId,
      senderName: sender?.name || "Administrator",
      title,
      message,
      category,
      priority,
      recipientType,
      targetName: role || departmentId || (targetUserId ? "Single User" : undefined),
      recipientUserIds: audienceUserIds,
      sentCount: dispatchResult.sent,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Notification broadcast sent successfully to ${dispatchResult.sent} recipient(s)`,
      data: {
        broadcastId,
        totalAudience: audienceUserIds.length,
        sentCount: dispatchResult.sent,
        failedCount: dispatchResult.failed,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
