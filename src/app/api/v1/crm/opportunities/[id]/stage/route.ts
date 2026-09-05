import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.opportunity.stage");

    const { stage } = await req.json();
    if (!stage) throw new ApiError(400, "Target stage is required.");

    const opp = await db.opportunity.findUnique({ where: { id } });
    if (!opp) throw new ApiError(404, "Opportunity not found.");

    if (opp.stage === "WON" || opp.stage === "LOST") {
      throw new ApiError(400, "Closed opportunities cannot be moved without reopening.");
    }

    const pipelineStage = await db.pipelineStage.findUnique({ where: { key: stage } });
    const oldStage = opp.stage;

    const updated = await db.opportunity.update({
      where: { id },
      data: {
        stage,
        stageId: pipelineStage?.id || null,
        probability: pipelineStage?.probability ?? opp.probability,
      },
    });

    // Record activity
    await db.leadActivity.create({
      data: {
        opportunityId: id,
        leadId: opp.leadId,
        clientId: opp.clientId,
        actorId: actor.id,
        type: "STATUS_CHANGED",
        title: `Opportunity stage moved from ${oldStage} → ${stage}`,
        notes: `Updated by ${actor.name}`,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: "CRM_OPPORTUNITY_STAGE_CHANGED",
        resource: `Opportunity:${id}`,
        details: { oldStage, newStage: stage },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
