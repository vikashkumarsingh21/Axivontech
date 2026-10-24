import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  requireEmployee,
  apiSuccess,
  apiError,
  parseBody,
  checkIdempotency,
  checkRateLimit,
  getCompanyCalendarDate,
  getCompanyTimezone,
} from "@/lib/api/foundation";

const regularizeSchema = z.object({
  date: z.string().min(1, "Date is required"),
  requestedCheckIn: z.string().min(1, "Requested check-in timestamp is required"),
  requestedCheckOut: z.string().min(1, "Requested check-out timestamp is required"),
  reason: z.string().trim().min(5, "Reason must be at least 5 characters").max(500, "Reason cannot exceed 500 characters"),
  attendanceId: z.string().optional(),
  requestedBreaks: z.any().optional(),
});

const cancelRegularizeSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  action: z.literal("CANCEL"),
});

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireEmployee(req);

    const regularizations = await db.regularizationRequest.findMany({
      where: { userId: user.id },
      include: {
        attendance: true,
        reviewedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(regularizations, undefined, { data: regularizations, requests: regularizations });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireEmployee(req);
    const timezone = await getCompanyTimezone();

    // Idempotency & Rate Limiting
    checkIdempotency(`${user.id}:regularize:submit`, 2000);
    checkRateLimit(`${user.id}:regularize`, 10, 60);

    const body = await parseBody(req, regularizeSchema);
    const { date, requestedCheckIn, requestedCheckOut, reason, attendanceId, requestedBreaks } = body;

    const targetDate = getCompanyCalendarDate(new Date(date), timezone);
    const today = getCompanyCalendarDate(new Date(), timezone);

    // 1. Regularization is only allowed for past dates (cannot regularize today or future)
    if (targetDate >= today) {
      throw new ApiError(
        400,
        "Regularization requests can only be submitted for past dates. Use live Check-In for today.",
        undefined,
        "INVALID_DATE_RANGE"
      );
    }

    // 2. Regularization window: strictly within the past 30 days
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (targetDate < thirtyDaysAgo) {
      throw new ApiError(
        400,
        "Regularization requests cannot be submitted for dates older than 30 days.",
        undefined,
        "REGULARIZATION_WINDOW_EXPIRED"
      );
    }

    const checkInDate = new Date(requestedCheckIn);
    const checkOutDate = new Date(requestedCheckOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new ApiError(400, "Invalid check-in or check-out date format", undefined, "INVALID_DATE_FORMAT");
    }

    if (checkOutDate <= checkInDate) {
      throw new ApiError(400, "Check-out time must be later than check-in time", undefined, "INVALID_TIME_ORDER");
    }

    // 3. Prevent duplicate pending requests for the same date
    const existingPending = await db.regularizationRequest.findFirst({
      where: {
        userId: user.id,
        date: targetDate,
        status: "PENDING",
      },
    });

    if (existingPending) {
      throw new ApiError(
        400,
        "A pending regularization request already exists for this date. You may cancel it if you wish to resubmit.",
        undefined,
        "DUPLICATE_PENDING_REQUEST"
      );
    }

    // 4. IDOR Protection: If attendanceId is supplied, verify ownership
    if (attendanceId) {
      const targetAttendance = await db.attendance.findUnique({
        where: { id: attendanceId },
        select: { userId: true },
      });
      if (!targetAttendance || targetAttendance.userId !== user.id) {
        throw new ApiError(
          403,
          "Forbidden: You can only regularize your own attendance records",
          undefined,
          "FORBIDDEN"
        );
      }
    }

    const regularization = await db.regularizationRequest.create({
      data: {
        userId: user.id,
        date: targetDate,
        attendanceId: attendanceId || undefined,
        requestedCheckIn: checkInDate,
        requestedCheckOut: checkOutDate,
        requestedBreaks: requestedBreaks || undefined,
        reason: reason.trim(),
        status: "PENDING",
      },
    });

    // 5. Notify Admins and HR
    try {
      const adminRoles = await db.userRole.findMany({
        where: { role: { name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] } } },
        select: { userId: true },
      });
      const adminIds = Array.from(new Set(adminRoles.map((r) => r.userId))).filter((id) => id !== user.id);

      if (adminIds.length > 0) {
        await db.notification.createMany({
          data: adminIds.map((adminId) => ({
            userId: adminId,
            type: "ATTENDANCE_REGULARIZATION_SUBMITTED",
            title: `Attendance Regularization: ${user.name}`,
            message: `${user.name} submitted a regularization request for ${targetDate.toISOString().split("T")[0]}: "${reason.trim()}"`,
            priority: "NORMAL",
            link: "/admin/attendance",
            entityType: "REGULARIZATION_REQUEST",
            entityId: regularization.id,
          })),
        });
      }
    } catch (notifErr) {
      console.error("[Notification] Regularization submission notification failed:", notifErr);
    }

    return apiSuccess(
      regularization,
      undefined,
      {
        data: regularization,
        message: "Attendance regularization request submitted for admin review",
      },
      201
    );
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await requireEmployee(req);
    const body = await parseBody(req, cancelRegularizeSchema);
    const { requestId, action } = body;

    const request = await db.regularizationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new ApiError(404, "Regularization request not found", undefined, "NOT_FOUND");
    }

    if (request.userId !== user.id) {
      throw new ApiError(403, "Forbidden: You cannot modify another employee's request", undefined, "FORBIDDEN");
    }

    if (action === "CANCEL") {
      if (request.status !== "PENDING") {
        throw new ApiError(
          400,
          `Cannot cancel a request that has already been ${request.status.toLowerCase()}`,
          undefined,
          "CANNOT_CANCEL"
        );
      }

      const updated = await db.regularizationRequest.update({
        where: { id: requestId },
        data: { status: "CANCELLED" },
      });

      return apiSuccess(
        updated,
        undefined,
        { data: updated, message: "Regularization request cancelled successfully" }
      );
    }

    throw new ApiError(400, "Unsupported action", undefined, "INVALID_ACTION");
  } catch (e) {
    return handleApiError(e);
  }
}
