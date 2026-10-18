import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "admin:access");

    const body = await req.json().catch(() => ({}));
    const reason = body.reason?.trim() || "Your leave request was not approved at this time.";

    const leave = await db.leaveRequest.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!leave) throw new ApiError(404, "Leave request not found");
    if (leave.status !== "PENDING") throw new ApiError(400, "This leave request has already been processed");

    const updated = await db.leaveRequest.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    await db.notification.create({
      data: {
        userId: leave.userId,
        type: "LEAVE_UPDATED",
        title: "Leave Request Rejected",
        message: reason,
        link: "/employee/leave",
      },
    });

    const { EventBus } = await import("@/lib/events/bus").catch(() => ({ EventBus: null }));
    if (EventBus) {
      EventBus.emit({
        eventType: "LEAVE_UPDATED",
        actorId: adminId || undefined,
        recipientId: leave.userId,
        entityType: "LEAVE",
        entityId: id,
        title: "Leave Request Rejected",
        message: reason,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, leave: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
