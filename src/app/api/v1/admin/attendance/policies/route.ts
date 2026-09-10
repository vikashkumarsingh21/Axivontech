import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser, hasPermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { AttendanceService } from "@/lib/services/attendance.service";

export async function GET(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    const user = await validateActiveUser(adminId);

    const isExecutiveOrAdmin = user.userRoles.some((ur) =>
      ["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(ur.role.name)
    );
    const hasAttPerm =
      (await hasPermission(user.id, "attendance.policy.manage")) ||
      (await hasPermission(user.id, "attendance:manage")) ||
      (await hasPermission(user.id, "admin:access"));

    if (!isExecutiveOrAdmin && !hasAttPerm) {
      throw new ApiError(403, "Forbidden: Insufficient permissions to view attendance policies");
    }

    const policy = await AttendanceService.getPolicy();
    return NextResponse.json({ success: true, policy });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    const user = await validateActiveUser(adminId);

    const isExecutiveOrAdmin = user.userRoles.some((ur) =>
      ["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(ur.role.name)
    );
    const hasAttPerm =
      (await hasPermission(user.id, "attendance.policy.manage")) ||
      (await hasPermission(user.id, "attendance:manage")) ||
      (await hasPermission(user.id, "admin:settings"));

    if (!isExecutiveOrAdmin && !hasAttPerm) {
      throw new ApiError(403, "Forbidden: Only Administrators can update attendance policy");
    }

    const body = await req.json();
    const {
      workWindowStart,
      workWindowEnd,
      defaultRequiredMinutes,
      graceMinutes,
      cutoffTime,
      weeklyOffDays,
      enableIncompleteAlerts,
      allowRemoteRegularization,
    } = body;

    const existingPolicy = await db.attendancePolicy.findFirst();

    let updatedPolicy;
    if (existingPolicy) {
      updatedPolicy = await db.attendancePolicy.update({
        where: { id: existingPolicy.id },
        data: {
          workWindowStart: workWindowStart ?? existingPolicy.workWindowStart,
          workWindowEnd: workWindowEnd ?? existingPolicy.workWindowEnd,
          defaultRequiredMinutes: defaultRequiredMinutes ?? existingPolicy.defaultRequiredMinutes,
          graceMinutes: graceMinutes ?? existingPolicy.graceMinutes,
          cutoffTime: cutoffTime ?? existingPolicy.cutoffTime,
          weeklyOffDays: weeklyOffDays ?? existingPolicy.weeklyOffDays,
          enableIncompleteAlerts: enableIncompleteAlerts ?? existingPolicy.enableIncompleteAlerts,
          allowRemoteRegularization: allowRemoteRegularization ?? existingPolicy.allowRemoteRegularization,
          updatedById: user.id,
        },
      });
    } else {
      updatedPolicy = await db.attendancePolicy.create({
        data: {
          workWindowStart: workWindowStart || "08:00",
          workWindowEnd: workWindowEnd || "19:00",
          defaultRequiredMinutes: defaultRequiredMinutes || 480,
          graceMinutes: graceMinutes ?? 15,
          cutoffTime: cutoffTime || "19:00",
          weeklyOffDays: weeklyOffDays || [0],
          enableIncompleteAlerts: enableIncompleteAlerts ?? true,
          allowRemoteRegularization: allowRemoteRegularization ?? true,
          updatedById: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      policy: updatedPolicy,
      message: "Attendance policy updated successfully",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
