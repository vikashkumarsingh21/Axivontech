import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.opportunity.close");

    const opp = await db.opportunity.findUnique({
      where: { id },
      include: { lead: true, client: true },
    });
    if (!opp) throw new ApiError(404, "Opportunity not found.");

    const wonStage = await db.pipelineStage.findUnique({ where: { key: "WON" } });

    // Ensure client exists or create one
    let client = opp.client;
    if (!client && opp.lead) {
      const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
      const clientCount = await db.crmClient.count();
      const clientCode = `CL-${todayStr}-${String(clientCount + 1).padStart(4, "0")}`;

      client = await db.crmClient.create({
        data: {
          clientCode,
          companyName: opp.lead.companyName || opp.lead.name,
          contactName: opp.lead.name,
          email: opp.lead.email,
          phone: opp.lead.phone,
          website: opp.lead.website,
          industry: opp.lead.serviceInterest,
          ownerId: opp.ownerId || actor.id,
          status: "ACTIVE",
        },
      });
    }

    const updated = await db.opportunity.update({
      where: { id },
      data: {
        stage: "WON",
        stageId: wonStage?.id || null,
        probability: 100,
        clientId: client?.id || opp.clientId,
      },
    });

    // Record activity
    await db.leadActivity.create({
      data: {
        opportunityId: id,
        leadId: opp.leadId,
        clientId: client?.id,
        actorId: actor.id,
        type: "DEAL_WON",
        title: `🎉 Deal Won: ${opp.name} (₹${opp.value})`,
        notes: `Marked as Won by ${actor.name}`,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: "CRM_OPPORTUNITY_WON",
        resource: `Opportunity:${id}`,
        details: { value: opp.value, opportunityCode: opp.opportunityCode },
      },
    });

    return NextResponse.json({ success: true, data: updated, client });
  } catch (error) {
    return handleApiError(error);
  }
}
