import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateActiveUser } from '@/lib/auth/permissions';
import { handleApiError, ApiError } from '@/lib/api-error';

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
    const { leaveType, startDate, endDate, reason } = await req.json();

    if (!startDate || !endDate || !reason?.trim()) {
      throw new ApiError(400, 'Start date, end date, and reason are required');
    }

    if (new Date(startDate) > new Date(endDate)) {
      throw new ApiError(400, 'End date cannot be earlier than start date');
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
