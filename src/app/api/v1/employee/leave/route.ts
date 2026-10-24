import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { validateActiveUser } from '@/lib/auth/permissions';
import { handleApiError, ApiError } from '@/lib/api-error';

const leaveSchema = z.object({
  leaveType: z.enum(["CASUAL", "SICK", "PAID", "REMOTE", "UNPAID"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().trim().min(5, "Reason must be at least 5 characters").max(500),
});

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
    const requests = await db.leaveRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, requests });
  } catch(e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
    const body = await req.json().catch(() => ({}));

    const parsed = leaveSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const { leaveType, startDate, endDate, reason } = parsed.data;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(400, "Invalid start date or end date format");
    }

    if (start > end) {
      throw new ApiError(400, "End date cannot be earlier than start date");
    }

    // Prohibit retroactive leave older than 30 days without special administrative exception
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (start < thirtyDaysAgo) {
      throw new ApiError(400, "Retroactive leave requests older than 30 days are prohibited");
    }

    const request = await db.leaveRequest.create({
      data: {
        userId: user.id,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason.trim(),
        status: 'PENDING',
      },
    });

    // Emit platform event to notify managers/admins & trigger automations
    try {
      const { EventBus } = await import("@/lib/events/bus");
      await EventBus.emit({
        eventType: "LEAVE_SUBMITTED",
        actorId: user.id,
        entityType: "LEAVE_REQUEST",
        entityId: request.id,
        title: `Leave Request: ${user.name}`,
        message: `${user.name} submitted a ${leaveType} leave request from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
        metadata: { leaveType, startDate, endDate, leaveId: request.id },
      });
    } catch (eventBusErr) {
      console.error("[EventBus] Leave submitted emission failed:", eventBusErr);
    }

    return NextResponse.json({ success: true, request });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const user = await validateActiveUser(userId);
    const { requestId, action } = await req.json();

    if (!requestId) throw new ApiError(400, 'Request ID is required');

    const leave = await db.leaveRequest.findUnique({ where: { id: requestId } });
    if (!leave) throw new ApiError(404, 'Leave request not found');
    if (leave.userId !== user.id) throw new ApiError(403, 'Forbidden');

    if (action === 'CANCEL') {
      if (leave.status !== 'PENDING') {
        throw new ApiError(400, 'Only pending leave requests can be cancelled');
      }

      const updated = await db.leaveRequest.update({
        where: { id: requestId },
        data: { status: 'CANCELLED' },
      });

      return NextResponse.json({ success: true, request: updated, message: 'Leave request cancelled' });
    }

    throw new ApiError(400, 'Unsupported action');
  } catch (e) {
    return handleApiError(e);
  }
}
