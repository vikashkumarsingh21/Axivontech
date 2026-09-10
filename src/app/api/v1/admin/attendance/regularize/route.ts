import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser, hasPermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { AttendanceService } from "@/lib/services/attendance.service";
import { NotificationService } from "@/lib/events/bus";

export async function GET(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    const user = await validateActiveUser(adminId);

    const isExecutiveOrAdmin = user.userRoles.some((ur) =>
      ["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(ur.role.name)
    );
    const hasAttPerm =
      (await hasPermission(user.id, "attendance.regularization.review")) ||
      (await hasPermission(user.id, "attendance:manage")) ||
      (await hasPermission(user.id, "admin:access"));

    if (!isExecutiveOrAdmin && !hasAttPerm) {
      throw new ApiError(403, "Forbidden: Insufficient permissions to review regularizations");
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const requests = await db.regularizationRequest.findMany({
      where: status ? { status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            employeeId: true,
            requiredDailyMinutes: true,
          },
        },
        attendance: true,
        reviewedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    const user = await validateActiveUser(adminId);

    const isExecutiveOrAdmin = user.userRoles.some((ur) =>
      ["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(ur.role.name)
    );
    const hasAttPerm =
      (await hasPermission(user.id, "attendance.regularization.review")) ||
      (await hasPermission(user.id, "attendance:manage"));

    if (!isExecutiveOrAdmin && !hasAttPerm) {
      throw new ApiError(403, "Forbidden: Insufficient permissions to review regularizations");
    }

    const body = await req.json();
    const { requestId, action, reviewNotes } = body;

    if (!requestId || !["APPROVED", "REJECTED"].includes(action)) {
      throw new ApiError(400, "requestId and valid action ('APPROVED' | 'REJECTED') are required");
    }

    const reg = await db.regularizationRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!reg) {
      throw new ApiError(404, "Regularization request not found");
    }

    if (reg.status !== "PENDING") {
      throw new ApiError(400, `Request has already been marked as ${reg.status}`);
    }

    const policy = await AttendanceService.getPolicy();
    const reqMins = reg.user.requiredDailyMinutes || policy.defaultRequiredMinutes || 480;

    // Update regularization record
    const updatedReg = await db.regularizationRequest.update({
      where: { id: requestId },
      data: {
        status: action,
        reviewedById: user.id,
        reviewNotes: reviewNotes || null,
        reviewedAt: new Date(),
      },
    });

    // If APPROVED, update/create Attendance record atomically
    if (action === "APPROVED") {
      const calc = AttendanceService.calculateDay({
        checkInAt: reg.requestedCheckIn,
        checkOutAt: reg.requestedCheckOut,
        requiredDailyMinutes: reqMins,
        policy,
      });

      const att = await db.attendance.upsert({
        where: {
          userId_date: {
            userId: reg.userId,
            date: reg.date,
          },
        },
        update: {
          checkInAt: reg.requestedCheckIn,
          checkOutAt: reg.requestedCheckOut,
          grossMinutes: calc.grossMinutes,
          breakMinutes: 0,
          netMinutes: calc.netMinutes,
          totalMinutes: calc.netMinutes,
          requiredDailyMinutes: reqMins,
          remainingMinutes: calc.remainingMinutes,
          lateMinutes: calc.lateMinutes,
          earlyExitMinutes: calc.earlyExitMinutes,
          isLate: calc.isLate,
          isEarlyExit: calc.isEarlyExit,
          status: calc.completionStatus,
          completionStatus: calc.completionStatus,
          notes: `Regularized by Admin (${user.name}): ${reg.reason}`,
        },
        create: {
          userId: reg.userId,
          date: reg.date,
          checkInAt: reg.requestedCheckIn,
          checkOutAt: reg.requestedCheckOut,
          grossMinutes: calc.grossMinutes,
          breakMinutes: 0,
          netMinutes: calc.netMinutes,
          totalMinutes: calc.netMinutes,
          requiredDailyMinutes: reqMins,
          remainingMinutes: calc.remainingMinutes,
          lateMinutes: calc.lateMinutes,
          earlyExitMinutes: calc.earlyExitMinutes,
          isLate: calc.isLate,
          isEarlyExit: calc.isEarlyExit,
          status: calc.completionStatus,
          completionStatus: calc.completionStatus,
          notes: `Regularized by Admin (${user.name}): ${reg.reason}`,
        },
      });

      // Link regularization with attendance
      await db.regularizationRequest.update({
        where: { id: requestId },
        data: { attendanceId: att.id },
      });
    }

    // Send in-app notification to employee
    await NotificationService.create({
      userId: reg.userId,
      type: "REGULARIZATION_UPDATE",
      title: `Attendance Regularization ${action}`,
      message: `Your regularization request for ${reg.date.toISOString().split("T")[0]} has been ${action.toLowerCase()} by ${user.name}. ${reviewNotes ? `Notes: ${reviewNotes}` : ""}`,
      entityType: "REGULARIZATION",
      entityId: reg.id,
      priority: action === "APPROVED" ? "NORMAL" : "HIGH",
    });

    return NextResponse.json({
      success: true,
      data: updatedReg,
      message: `Regularization request has been ${action.toLowerCase()}`,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
