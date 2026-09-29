import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function PATCH(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    const { id } = await params;

    const reminder = await db.reminder.findUnique({ where: { id } });
    if (!reminder) throw new ApiError(404, "Reminder not found");
    if (reminder.userId !== userId) throw new ApiError(403, "Forbidden: IDOR protection");

    const body = await req.json();
    const updated = await db.reminder.update({
      where: { id },
      data: {
        status: body.status || "COMPLETED",
        completedAt: body.status === "COMPLETED" ? new Date() : null,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    const { id } = await params;

    const reminder = await db.reminder.findUnique({ where: { id } });
    if (!reminder) throw new ApiError(404, "Reminder not found");
    if (reminder.userId !== userId) throw new ApiError(403, "Forbidden: IDOR protection");

    await db.reminder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}
