import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.proposal.send");

    const proposal = await db.proposal.findUnique({
      where: { id },
      include: { opportunity: true },
    });
    if (!proposal) throw new ApiError(404, "Proposal not found.");

    const updated = await db.proposal.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    // Move opportunity to PROPOSAL stage if not already further along
    const propStage = await db.pipelineStage.findUnique({ where: { key: "PROPOSAL" } });
    if (proposal.opportunity && ["QUALIFIED", "DISCOVERY"].includes(proposal.opportunity.stage)) {
      await db.opportunity.update({
        where: { id: proposal.opportunityId },
        data: {
          stage: "PROPOSAL",
          stageId: propStage?.id || null,
          probability: propStage?.probability || 60,
        },
      });
    }

    // Activity log
    await db.leadActivity.create({
      data: {
        opportunityId: proposal.opportunityId,
        actorId: actor.id,
        type: "PROPOSAL_SENT",
        title: `Proposal ${proposal.proposalNumber} sent to client`,
        notes: `Amount: ₹${proposal.amount}`,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: "CRM_PROPOSAL_SENT",
        resource: `Proposal:${id}`,
        details: { proposalNumber: proposal.proposalNumber, amount: proposal.amount },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
