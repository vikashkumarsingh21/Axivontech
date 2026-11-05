import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { calculateLeaveDays } from "@/lib/leave/balance";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "admin:access");

    const body = await req.json().catch(() => ({}));
    const reason = body.reason?.trim() || "Your leave request was not approved at this time.";

    const leave = await db.leaveRequest.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!leave) throw new ApiError(404, "Leave request not found");
    if (leave.status !== "PENDING") throw new ApiError(400, "This leave request has already been processed");

    const days = calculateLeaveDays(leave.startDate, leave.endDate, leave.isHalfDay);
    const leaveYear = leave.startDate.getFullYear();

    const [updated] = await db.$transaction(async (tx) => {
      const updatedLeave = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason: reason,
        },
      });

      if (leave.leaveType !== "UNPAID") {
        await tx.leaveBalance.updateMany({
          where: {
            userId: leave.userId,
            year: leaveYear,
            leaveType: leave.leaveType,
          },
          data: {
            pendingDays: { decrement: days },
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: leave.userId,
          type: "LEAVE_UPDATED",
          title: "Leave Request Rejected",
          message: reason,
          link: "/employee/leave",
        },
      });

      return [updatedLeave];
    });

    try {
      const { notifyLeaveDecided } = await import("@/lib/notifications/reminders");
      await notifyLeaveDecided({
        leaveId: leave.id,
        employeeUserId: leave.userId,
        status: "REJECTED",
        approverName: "Administration",
        rejectionReason: reason,
      });
    } catch (e) {
      console.warn("[LeaveReject] Push notification warning:", e);
    }

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

    if (leave.user?.email) {
      try {
        const { sendTransactionalEmail } = await import("@/lib/email/service");
        await sendTransactionalEmail({
          to: leave.user.email,
          templateKey: "LEAVE_REJECTED",
          eventKey: `leave_rejected:${leave.id}`,
          variables: {
            employeeName: leave.user.name,
            leaveType: leave.leaveType,
            startDate: new Date(leave.startDate).toLocaleDateString(),
            endDate: new Date(leave.endDate).toLocaleDateString(),
            managerName: "Administrator",
            reason,
          },
          metadata: {
            leaveId: leave.id,
            userId: leave.userId,
            action: "REJECTED",
          },
        });
      } catch (e) {
        console.warn("[LeaveReject] Failed to dispatch leave rejection email:", e);
      }
    }

    return NextResponse.json({ success: true, leave: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
