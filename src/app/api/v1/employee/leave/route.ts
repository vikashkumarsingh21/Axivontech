import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  requireEmployee,
  checkIdempotency,
  getCompanyDateString,
  getPlatformAdmins,
} from "@/lib/api/foundation";
import {
  calculateLeaveDays,
  ensureLeaveBalances,
  getLeaveBalancesSummary,
} from "@/lib/leave/balance";

const createLeaveSchema = z.object({
  leaveType: z.enum(["CASUAL", "SICK", "PAID", "REMOTE", "UNPAID"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().trim().min(5, "Reason must be at least 5 characters").max(500),
  isHalfDay: z.boolean().optional().default(false),
  halfDayType: z.enum(["FIRST_HALF", "SECOND_HALF"]).optional().nullable(),
});

const patchLeaveSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  action: z.enum(["CANCEL"]),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const { searchParams } = new URL(req.url);

    const statusParam = searchParams.get("status");
    const yearParam = searchParams.get("year");

    const currentYear = yearParam
      ? parseInt(yearParam, 10)
      : new Date().getFullYear();

    const where: any = { userId: user.id };
    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam;
    }

    if (yearParam) {
      const yearStart = new Date(`${currentYear}-01-01T00:00:00.000Z`);
      const yearEnd = new Date(`${currentYear}-12-31T23:59:59.999Z`);
      where.startDate = { gte: yearStart, lte: yearEnd };
    }

    const [requests, balancesSummary] = await Promise.all([
      db.leaveRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          approvedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      getLeaveBalancesSummary(user.id, currentYear),
    ]);

    const stats = {
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
      cancelled: requests.filter((r) => r.status === "CANCELLED").length,
    };

    return NextResponse.json({
      success: true,
      requests,
      balances: balancesSummary,
      meta: { stats, year: currentYear },
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const parsed = createLeaveSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid leave request data",
        "VALIDATION_ERROR"
      );
    }

    const { leaveType, startDate, endDate, reason, isHalfDay, halfDayType } =
      parsed.data;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(400, "Invalid start date or end date format");
    }

    // Date boundary checks
    if (start > end) {
      throw new ApiError(400, "End date cannot be earlier than start date");
    }

    if (isHalfDay) {
      const startDayStr = start.toISOString().split("T")[0];
      const endDayStr = end.toISOString().split("T")[0];
      if (startDayStr !== endDayStr) {
        throw new ApiError(
          400,
          "Half-day leave must start and end on the exact same date"
        );
      }
    }

    // Idempotency check (prevent double submit within 5 seconds)
    const idempotencyKey = `leave:create:${user.id}:${startDate}:${endDate}:${leaveType}`;
    checkIdempotency(idempotencyKey, 5000);

    // Retroactive leave check (max 30 days past)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const startMidnight = new Date(start);
    startMidnight.setHours(0, 0, 0, 0);

    if (startMidnight < thirtyDaysAgo) {
      throw new ApiError(
        400,
        "Retroactive leave requests older than 30 days are prohibited"
      );
    }

    // Overlap validation: cannot overlap with another pending or approved leave
    const existingOverlap = await db.leaveRequest.findFirst({
      where: {
        userId: user.id,
        status: { in: ["PENDING", "APPROVED"] },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } },
        ],
      },
    });

    if (existingOverlap) {
      throw new ApiError(
        400,
        `You already have a ${existingOverlap.status.toLowerCase()} leave request covering these dates (${new Date(
          existingOverlap.startDate
        ).toLocaleDateString()} - ${new Date(
          existingOverlap.endDate
        ).toLocaleDateString()})`
      );
    }

    // Calculate requested duration
    const requestedDays = calculateLeaveDays(start, end, isHalfDay);
    const requestYear = start.getFullYear();

    // Balance check for non-UNPAID leave
    if (leaveType !== "UNPAID") {
      const balances = await ensureLeaveBalances(user.id, requestYear);
      const balanceRecord = balances.find((b) => b.leaveType === leaveType);
      const availableDays = balanceRecord
        ? balanceRecord.remainingDays - balanceRecord.pendingDays
        : 0;

      if (availableDays < requestedDays) {
        throw new ApiError(
          400,
          `Insufficient leave balance for ${leaveType}. Available: ${availableDays} days, requested: ${requestedDays} day(s).`
        );
      }
    }

    // Execute transaction: create leave and update pending balance
    const [request] = await db.$transaction(async (tx) => {
      const newLeave = await tx.leaveRequest.create({
        data: {
          userId: user.id,
          leaveType,
          startDate: start,
          endDate: end,
          reason: reason.trim(),
          isHalfDay: !!isHalfDay,
          halfDayType: isHalfDay ? halfDayType || "FIRST_HALF" : null,
          status: "PENDING",
        },
      });

      if (leaveType !== "UNPAID") {
        await tx.leaveBalance.upsert({
          where: {
            userId_year_leaveType: {
              userId: user.id,
              year: requestYear,
              leaveType,
            },
          },
          update: {
            pendingDays: { increment: requestedDays },
          },
          create: {
            userId: user.id,
            year: requestYear,
            leaveType,
            totalDays: 12,
            usedDays: 0,
            pendingDays: requestedDays,
            remainingDays: 12,
          },
        });
      }

      return [newLeave];
    });

    // Notify admins / platform event
    try {
      const admins = await getPlatformAdmins();

      if (admins.length > 0) {
        await db.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: "LEAVE_SUBMITTED",
            title: `New Leave Request: ${user.name}`,
            message: `${user.name} submitted a ${leaveType} leave request for ${requestedDays} day(s) from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`,
            link: "/admin/leaves",
          })),
        });
      }

      const { EventBus } = await import("@/lib/events/bus").catch(() => ({
        EventBus: null,
      }));
      if (EventBus) {
        await EventBus.emit({
          eventType: "LEAVE_SUBMITTED",
          actorId: user.id,
          entityType: "LEAVE_REQUEST",
          entityId: request.id,
          title: `Leave Request: ${user.name}`,
          message: `${user.name} submitted a ${leaveType} leave request for ${requestedDays} day(s).`,
          metadata: {
            leaveType,
            startDate,
            endDate,
            requestedDays,
            leaveId: request.id,
          },
        }).catch(() => {});
      }
    } catch (eventErr) {
      console.error("[Leave] Notification dispatch error:", eventErr);
    }

    const updatedBalances = await getLeaveBalancesSummary(user.id, requestYear);

    return NextResponse.json(
      {
        success: true,
        request,
        balances: updatedBalances,
        message: "Leave request submitted successfully for approval.",
      },
      { status: 201 }
    );
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const parsed = patchLeaveSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid request payload",
        "VALIDATION_ERROR"
      );
    }

    const { requestId, action } = parsed.data;

    const leave = await db.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!leave) throw new ApiError(404, "Leave request not found");
    if (leave.userId !== user.id) {
      throw new ApiError(403, "You can only modify your own leave requests");
    }

    if (action === "CANCEL") {
      const todayStr = getCompanyDateString();
      const todayMidnight = new Date(`${todayStr}T00:00:00.000Z`);
      const leaveStartMidnight = new Date(leave.startDate);
      leaveStartMidnight.setHours(0, 0, 0, 0);

      const days = calculateLeaveDays(
        leave.startDate,
        leave.endDate,
        leave.isHalfDay
      );
      const leaveYear = leave.startDate.getFullYear();

      if (leave.status === "PENDING") {
        // Pending cancellation: decrement pendingDays
        const [updated] = await db.$transaction(async (tx) => {
          const req = await tx.leaveRequest.update({
            where: { id: requestId },
            data: { status: "CANCELLED" },
          });

          if (leave.leaveType !== "UNPAID") {
            await tx.leaveBalance.updateMany({
              where: {
                userId: user.id,
                year: leaveYear,
                leaveType: leave.leaveType,
              },
              data: {
                pendingDays: { decrement: days },
              },
            });
          }
          return [req];
        });

        return NextResponse.json({
          success: true,
          request: updated,
          message: "Pending leave request cancelled successfully.",
        });
      } else if (leave.status === "APPROVED") {
        // Can only cancel approved leave if start date is strictly in the future
        if (leaveStartMidnight <= todayMidnight) {
          throw new ApiError(
            400,
            "Cannot cancel leave that has already started or passed. Please contact HR / Admin."
          );
        }

        // Approved future cancellation: decrement usedDays, increment remainingDays
        const [updated] = await db.$transaction(async (tx) => {
          const req = await tx.leaveRequest.update({
            where: { id: requestId },
            data: { status: "CANCELLED" },
          });

          if (leave.leaveType !== "UNPAID") {
            await tx.leaveBalance.updateMany({
              where: {
                userId: user.id,
                year: leaveYear,
                leaveType: leave.leaveType,
              },
              data: {
                usedDays: { decrement: days },
                remainingDays: { increment: days },
              },
            });
          }
          return [req];
        });

        // Notify admins that an approved leave was cancelled by employee
        const admins = await getPlatformAdmins();

        if (admins.length > 0) {
          await db.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.id,
              type: "LEAVE_CANCELLED",
              title: `Approved Leave Cancelled: ${user.name}`,
              message: `${user.name} cancelled their approved ${leave.leaveType} leave scheduled for ${leave.startDate.toLocaleDateString()}.`,
              link: "/admin/leaves",
            })),
          });
        }

        return NextResponse.json({
          success: true,
          request: updated,
          message: "Approved future leave request cancelled successfully.",
        });
      } else {
        throw new ApiError(
          400,
          `Cannot cancel a leave request that is already ${leave.status.toLowerCase()}.`
        );
      }
    }

    throw new ApiError(400, "Unsupported action");
  } catch (e) {
    return handleApiError(e);
  }
}
