import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.lead.convert");

    const body = await req.json().catch(() => ({}));
    const { createOpportunity = true, opportunityValue = 0, opportunityName } = body;

    const result = await db.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({
        where: { id },
        include: { convertedClient: true, convertedProject: true },
      });

      if (!lead) throw new ApiError(404, "Lead not found.");
      if (lead.status !== "QUALIFIED" && lead.qualificationStatus !== "QUALIFIED") {
        throw new ApiError(400, "Only qualified leads can be converted.");
      }
      if (lead.status === "CONVERTED" || lead.convertedClientId || lead.convertedAt) {
        throw new ApiError(400, "Lead is already converted.");
      }

      // Check duplicate client by email
      let client = await tx.crmClient.findFirst({
        where: { email: { equals: lead.email, mode: "insensitive" } },
      });

      // If client doesn't exist, create Client
      if (!client) {
        const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
        const clientCount = await tx.crmClient.count();
        const clientCode = `CL-${todayStr}-${String(clientCount + 1).padStart(4, "0")}`;

        client = await tx.crmClient.create({
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
        const oppCount = await tx.opportunity.count();
        const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
        const opportunityCode = `OPP-${todayStr}-${String(oppCount + 1).padStart(4, "0")}`;

        const qualStage = await tx.pipelineStage.findUnique({ where: { key: "QUALIFIED" } });

        opportunity = await tx.opportunity.create({
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

      let partnerProject = null;
      
      // Phase 5: Create Confirmed Project onboarding record if lead is from a Partner
      if (lead.source === "PARTNER" && lead.ownerId) {
        const brokerProfile = await tx.brokerProfile.findUnique({
          where: { userId: lead.ownerId },
        });

        if (brokerProfile) {
          const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
          const projectCount = await tx.partnerProject.count();
          const projectCode = `PRJ-${todayStr}-${String(projectCount + 1).padStart(4, "0")}`;

          partnerProject = await tx.partnerProject.create({
            data: {
              projectCode,
              brokerProfileId: brokerProfile.id,
              clientName: lead.name,
              clientEmail: lead.email,
              clientPhone: lead.phone || "",
              clientWhatsapp: lead.whatsapp,
              clientDesignation: lead.designation,
              companyName: lead.companyName || lead.name,
              industry: lead.industry || "Other",
              city: lead.city || "",
              state: lead.state || "",
              country: lead.country || "",
              website: lead.website,
              companySize: lead.companySize,
              projectName: opportunityName || `${lead.companyName || lead.name} — Project`,
              requiredService: lead.serviceInterest || "General Services",
              detailedRequirement: lead.message || "Details to be gathered during onboarding",
              expectedTimeline: lead.timeline || "TBD",
              projectBudget: lead.budget ? String(lead.budget) : "TBD",
              status: "PROJECT_REQUESTED", // Starting status for Partner Project lifecycle
              leadId: lead.id,
              opportunityId: opportunity?.id,
            },
          });
        }
      }

      // Update Lead status to CONVERTED and preserve attribution
      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          status: "CONVERTED",
          qualificationStatus: "QUALIFIED",
          convertedClientId: client.id,
          convertedAt: new Date(),
          convertedByUserId: actor.id,
        },
      });

      // Record activity
      await tx.leadActivity.create({
        data: {
          leadId: id,
          clientId: client.id,
          opportunityId: opportunity?.id,
          actorId: actor.id,
          type: "CLIENT_CONVERTED",
          title: `Lead converted to Client ${client.clientCode}`,
          notes: opportunity 
            ? `Created opportunity ${opportunity.opportunityCode}${partnerProject ? ` and Partner Project ${partnerProject.projectCode}` : ""}` 
            : `Converted to client.${partnerProject ? ` Created Partner Project ${partnerProject.projectCode}` : ""}`,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: actor.id,
          action: "CRM_LEAD_CONVERTED",
          resource: `Lead:${id}`,
          details: { 
            clientId: client.id, 
            opportunityId: opportunity?.id,
            partnerProjectId: partnerProject?.id,
            partnerId: partnerProject?.brokerProfileId,
          },
        },
      });
      
      // Notify Partner if applicable
      if (partnerProject && lead.ownerId) {
         await tx.notification.create({
           data: {
             userId: lead.ownerId,
             type: "SYSTEM",
             title: "Lead Converted to Project",
             message: `Your lead ${lead.name} has been successfully qualified and converted to Project ${partnerProject.projectCode}.`,
             link: `/broker/projects/${partnerProject.id}`,
           }
         });
      }

      return { lead: updatedLead, client, opportunity, partnerProject };
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

