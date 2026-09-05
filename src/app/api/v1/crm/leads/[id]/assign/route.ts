import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.lead.assign");

    const { targetUserId } = await req.json();
    if (!targetUserId) throw new ApiError(400, "targetUserId is required.");

    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) throw new ApiError(404, "Lead not found.");

    const newOwner = await db.user.findUnique({ where: { id: targetUserId } });
    if (!newOwner || newOwner.status === "INACTIVE") {
      throw new ApiError(400, "Target owner user does not exist or is inactive.");
    }

    const previousOwnerId = lead.ownerId;

    const updated = await db.lead.update({
      where: { id },
      data: { ownerId: targetUserId },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    // Record activity
    await db.leadActivity.create({
      data: {
        leadId: id,
        actorId: actor.id,
        type: "LEAD_ASSIGNED",
        title: `Lead assigned to ${newOwner.name}`,
        notes: `Reassigned by ${actor.name}`,
      },
    });

    // Notify new owner
    if (targetUserId !== actor.id) {
      await db.notification.create({
        data: {
          userId: targetUserId,
          type: "SYSTEM",
          title: `Lead Assigned: ${lead.name}`,
          message: `You have been assigned lead ${lead.leadCode} (${lead.name})`,
          link: `/admin/crm/leads/${id}`,
        },
      });
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: "CRM_LEAD_ASSIGNED",
        resource: `Lead:${id}`,
        details: { previousOwnerId, newOwnerId: targetUserId },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
