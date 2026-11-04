import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getManagerAuthorizedDepartment } from "@/lib/services/department.service";
import { z } from "zod";

const actionLeaveSchema = z.object({
  leaveId: z.string().min(1, "Leave request ID is required"),
  action: z.enum(["APPROVE", "REJECT"]),
  comment: z.string().trim().max(500).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const actorId = req.headers.get("x-user-id");
    if (!actorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const department = await getManagerAuthorizedDepartment(actorId);

    // Get employees in manager's department
    const employees = await db.user.findMany({
      where: { department: { equals: department.name, mode: "insensitive" } },
      select: { id: true },
    });
    const employeeIds = employees.map((e) => e.id);

    const leaves = await db.leaveRequest.findMany({
      where: {
        userId: { in: employeeIds },
      },
      include: {
        user: { select: { id: true, name: true, email: true, designation: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      department: department.name,
      leaves,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const actorId = req.headers.get("x-user-id");
    if (!actorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const department = await getManagerAuthorizedDepartment(actorId);
    const body = await req.json();
    const { leaveId, action, comment } = actionLeaveSchema.parse(body);

    const leave = await db.leaveRequest.findUnique({
      where: { id: leaveId },
      include: {
        user: { select: { id: true, name: true, department: true } },
      },
    });

    if (!leave) {
      throw new ApiError(404, "Leave request not found");
    }

    // Verify employee belongs to manager's department
    if (
      !leave.user.department ||
      leave.user.department.toLowerCase() !== department.name.toLowerCase()
    ) {
      throw new ApiError(
        403,
        `Cannot action leave requests across departments. Employee ${leave.user.name} is in ${leave.user.department || "No Department"}, not ${department.name}.`
      );
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    const updated = await db.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: newStatus,
        rejectionReason: action === "REJECT" ? comment || "Rejected by manager" : null,
        approvedById: actorId,
        approvedAt: new Date(),
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // Audit log
    try {
      await db.auditLog.create({
        data: {
          userId: actorId,
          action: `LEAVE_${newStatus}_BY_MANAGER`,
          resource: `LeaveRequest:${leaveId}`,
          details: {
            employeeName: leave.user.name,
            department: department.name,
            action: newStatus,
          },
        },
      });
    } catch (e) {}

    // Dispatch Transactional Email Decision to Employee
    if (updated.user?.email) {
      try {
        const { sendTransactionalEmail } = await import("@/lib/email/service");
        await sendTransactionalEmail({
          to: updated.user.email,
          templateKey: newStatus === "APPROVED" ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
          eventKey: `leave_manager_decision:${leaveId}:${newStatus}`,
          variables: {
            employeeName: updated.user.name,
            leaveType: updated.leaveType,
            startDate: new Date(updated.startDate).toLocaleDateString(),
            endDate: new Date(updated.endDate).toLocaleDateString(),
            managerName: `${department.name} Department Leadership`,
            reason: comment || undefined,
          },
          metadata: {
            leaveId,
            action: newStatus,
            department: department.name,
          },
        });
      } catch (leaveEmailErr) {
        console.warn("[ManagerLeave] Failed to dispatch leave decision email:", leaveEmailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Leave request for ${leave.user.name} has been ${newStatus.toLowerCase()}.`,
      leave: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
