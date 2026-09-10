import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

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

    return NextResponse.json({
      success: true,
      data: regularizations,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const body = await req.json();
    const { date, requestedCheckIn, requestedCheckOut, reason, attendanceId, requestedBreaks } = body;

    if (!date || !requestedCheckIn || !requestedCheckOut || !reason) {
      throw new ApiError(400, "Date, requested check-in time, check-out time, and reason are required");
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const checkInDate = new Date(requestedCheckIn);
    const checkOutDate = new Date(requestedCheckOut);

    if (checkOutDate <= checkInDate) {
      throw new ApiError(400, "Check-out time must be after check-in time");
    }

    const existingPending = await db.regularizationRequest.findFirst({
      where: {
        userId: user.id,
        date: targetDate,
        status: "PENDING",
      },
    });

    if (existingPending) {
      throw new ApiError(400, "A pending regularization request already exists for this date");
    }

    const regularization = await db.regularizationRequest.create({
      data: {
        userId: user.id,
        date: targetDate,
        attendanceId: attendanceId || undefined,
        requestedCheckIn: checkInDate,
        requestedCheckOut: checkOutDate,
        requestedBreaks: requestedBreaks || undefined,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: regularization,
      message: "Attendance regularization request submitted for admin/manager approval",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
