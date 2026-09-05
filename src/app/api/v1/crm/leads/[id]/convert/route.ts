import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.lead.convert");

    const lead = await db.lead.findUnique({
      where: { id },
      include: { convertedClient: true },
    });

    if (!lead) throw new ApiError(404, "Lead not found.");
    if (lead.status === "CONVERTED" || lead.convertedClientId) {
      throw new ApiError(400, "Lead is already converted to a client.");
    }

    const body = await req.json().catch(() => ({}));
    const { createOpportunity = true, opportunityValue = 0, opportunityName } = body;

    // Check duplicate client by email
    let client = await db.crmClient.findFirst({
      where: { email: { equals: lead.email, mode: "insensitive" } },
    });

    // If client doesn't exist, create Client
    if (!client) {
      const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
      const clientCount = await db.crmClient.count();
      const clientCode = `CL-${todayStr}-${String(clientCount + 1).padStart(4, "0")}`;

      client = await db.crmClient.create({
        data: {
          clientCode,
          companyName: lead.companyName || lead.name,
          contactName: lead.name,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
          industry: lead.serviceInterest,
          ownerId: lead.ownerId || actor.id,
          status: "ACTIVE",
          contacts: {
            create: {
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              isPrimary: true,
              role: "Primary Contact",
            },
          },
        },
      });
    }

    // Optionally create Opportunity
    let opportunity = null;
    if (createOpportunity) {
      const oppCount = await db.opportunity.count();
      const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
      const opportunityCode = `OPP-${todayStr}-${String(oppCount + 1).padStart(4, "0")}`;

      const qualStage = await db.pipelineStage.findUnique({ where: { key: "QUALIFIED" } });

      opportunity = await db.opportunity.create({
        data: {
          opportunityCode,
          leadId: lead.id,
          clientId: client.id,
          name: opportunityName || `${lead.companyName || lead.name} — ${lead.serviceInterest || "Deal"}`,
          value: Number(opportunityValue) || lead.budget || 0,
          currency: "INR",
          stage: "QUALIFIED",
          stageId: qualStage?.id,
          probability: qualStage?.probability || 20,
          ownerId: lead.ownerId || actor.id,
        },
      });
    }

    // Update Lead status to CONVERTED
    const updatedLead = await db.lead.update({
      where: { id },
      data: {
        status: "CONVERTED",
        qualificationStatus: "QUALIFIED",
        convertedClientId: client.id,
      },
    });

    // Record activity
    await db.leadActivity.create({
      data: {
        leadId: id,
        clientId: client.id,
        opportunityId: opportunity?.id,
        actorId: actor.id,
        type: "CLIENT_CONVERTED",
        title: `Lead converted to Client ${client.clientCode}`,
        notes: opportunity ? `Created opportunity ${opportunity.opportunityCode}` : "Converted to client.",
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: "CRM_LEAD_CONVERTED",
        resource: `Lead:${id}`,
        details: { clientId: client.id, opportunityId: opportunity?.id },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        lead: updatedLead,
        client,
        opportunity,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
