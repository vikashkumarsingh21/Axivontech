import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-user-id");
    const body = await req.json();

    const leave = await db.leaveRequest.findUnique({ where: { id } });
    if (!leave) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (leave.status !== "PENDING") return NextResponse.json({ error: "Already processed" }, { status: 400 });

    await db.leaveRequest.update({ where: { id }, data: { status: "REJECTED" } });

    await db.notification.create({
      data: { userId: leave.userId, type: "SYSTEM", title: "Leave Rejected", message: body.reason || "Your leave request has been rejected.", link: "/employee/leave" },
    });

    await db.auditLog.create({
      data: { userId: adminId, action: "LEAVE_REJECTED", resource: "LeaveRequest", details: { leaveId: id, reason: body.reason } },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
