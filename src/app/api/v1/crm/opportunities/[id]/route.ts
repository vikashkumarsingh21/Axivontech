import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.opportunity.view");

    const opp = await db.opportunity.findUnique({
      where: { id },
      include: {
        lead: true,
        client: true,
        owner: { select: { id: true, name: true, email: true } },
        pipelineStage: true,
        proposals: { orderBy: { createdAt: "desc" } },
        activities: {
          include: { actor: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
        followUps: {
          include: { assignedTo: { select: { id: true, name: true, email: true } } },
          orderBy: { dueAt: "asc" },
        },
      },
    });

    if (!opp) throw new ApiError(404, "Opportunity not found.");

    return NextResponse.json({ success: true, data: opp });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.opportunity.update");

    const opp = await db.opportunity.findUnique({ where: { id } });
    if (!opp) throw new ApiError(404, "Opportunity not found.");

    const body = await req.json();
    const { name, value, currency, expectedCloseDate, description, ownerId } = body;

    const updated = await db.opportunity.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(value !== undefined && { value: Number(value) }),
        ...(currency && { currency }),
        ...(expectedCloseDate !== undefined && { expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null }),
        ...(description !== undefined && { description }),
        ...(ownerId && { ownerId }),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: "CRM_OPPORTUNITY_UPDATED",
        resource: `Opportunity:${id}`,
        details: { updatedFields: Object.keys(body) },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
