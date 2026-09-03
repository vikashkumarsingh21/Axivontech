import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    const { id } = await params;

    const notification = await db.notification.findUnique({ where: { id } });
    if (!notification) throw new ApiError(404, "Notification not found");
    if (notification.userId !== userId) throw new ApiError(403, "Forbidden: IDOR protection");

    const updated = await db.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
