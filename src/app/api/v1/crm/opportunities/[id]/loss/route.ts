import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.opportunity.close");

    const { lossReason } = await req.json();
    if (!lossReason || typeof lossReason !== "string" || lossReason.trim().length === 0) {
      throw new ApiError(400, "A valid lossReason is required to close an opportunity as Lost.");
    }

    const opp = await db.opportunity.findUnique({ where: { id } });
    if (!opp) throw new ApiError(404, "Opportunity not found.");

    const lostStage = await db.pipelineStage.findUnique({ where: { key: "LOST" } });

    const updated = await db.opportunity.update({
      where: { id },
      data: {
        stage: "LOST",
        stageId: lostStage?.id || null,
        probability: 0,
        lossReason: lossReason.trim(),
      },
    });

    // Record activity
    await db.leadActivity.create({
      data: {
        opportunityId: id,
        leadId: opp.leadId,
        clientId: opp.clientId,
        actorId: actor.id,
        type: "DEAL_LOST",
        title: `Deal Lost: ${opp.name}`,
        notes: `Reason: ${lossReason.trim()}`,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: "CRM_OPPORTUNITY_LOST",
        resource: `Opportunity:${id}`,
        details: { lossReason: lossReason.trim(), value: opp.value },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
