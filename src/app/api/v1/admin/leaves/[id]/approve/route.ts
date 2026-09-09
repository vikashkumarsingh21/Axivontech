import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-user-id");

    const leave = await db.leaveRequest.findUnique({ where: { id } });
    if (!leave) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (leave.status !== "PENDING") return NextResponse.json({ error: "Already processed" }, { status: 400 });

    await db.leaveRequest.update({ where: { id }, data: { status: "APPROVED" } });

    await db.notification.create({
      data: { userId: leave.userId, type: "LEAVE_APPROVED", title: "Leave Approved", message: "Your leave request has been approved.", link: "/employee/leave" },
    });

    const { EventBus } = await import("@/lib/events/bus").catch(() => ({ EventBus: null }));
    if (EventBus) {
      EventBus.emit({
        eventType: "LEAVE_UPDATED",
        actorId: adminId || undefined,
        recipientId: leave.userId,
        entityType: "LEAVE",
        entityId: id,
        title: "Leave Approved",
        message: "Your leave request has been approved.",
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
