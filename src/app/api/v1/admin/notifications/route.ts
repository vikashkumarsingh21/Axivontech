import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "admin:access");

    const notifications = await db.notification.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
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

    const body = await req.json();
    const { userId, type, title, message, link } = body;
    if (!userId || !title || !message) {
      throw new ApiError(400, "userId, title, and message are required");
    }

    const notification = await db.notification.create({
      data: {
        userId,
        type: type || "SYSTEM",
        title: title.trim(),
        message: message.trim(),
        link: link || null,
      },
    });

    return NextResponse.json({ success: true, data: notification, notification }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
