import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { normalizeRole, canAccessPartnerPortal } from "@/lib/auth/roles";
import { logBrokerAudit, notifyAdmins } from "@/lib/api/broker";
import { z } from "zod";

const documentSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().min(1),
  size: z.number().optional().nullable(),
  type: z.string().optional().nullable(),
});

export const createUnifiedLeadSchema = z.object({
  // Client Details
  name: z.string().min(1, "Client or business name is required").max(150),
  contactPerson: z.string().max(150).optional().nullable(),
  email: z.string().email("Valid email address is required").max(150),
  phone: z.string().min(7, "Valid phone number is required").max(30),
  whatsapp: z.string().max(30).optional().nullable(),
  designation: z.string().max(100).optional().nullable(),
  companyName: z.string().max(200).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  companySize: z.string().max(50).optional().nullable(),
  website: z.string().max(200).optional().nullable(),

  // Service Details
  serviceInterest: z.string().min(1, "Interested service is required").max(200),
  otherServiceDetails: z.string().max(1000).optional().nullable(),

  // Project Details
  leadTitle: z.string().max(150).optional().nullable(),
  projectDescription: z.string().max(5000).optional().nullable(),
  clientRequirements: z.string().max(5000).optional().nullable(),
  message: z.string().max(5000).optional().nullable(),
  budget: z.union([z.string(), z.number()]).optional().nullable(),
  timeline: z.string().max(100).optional().nullable(),
  preferredContactMethod: z.string().max(50).optional().nullable(),
  opportunityStage: z.enum(["EARLY_STAGE", "CONFIRMED"]).optional().default("EARLY_STAGE"),
  additionalNotes: z.string().max(2000).optional().nullable(),

  // Supporting Documents
  documents: z.array(documentSchema).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate: Partner only
    const session = await getAuthenticatedSession(req);
    if (!session) {
      throw new ApiError(401, "Authentication required");
    }
    const role = normalizeRole(session.role);

    if (!canAccessPartnerPortal(role)) {
      throw new ApiError(403, "Access denied. Partners only.");
    }
    const userId = session.userId;

    // Resolve BrokerProfile — server-side attribution
    const brokerProfile = await db.brokerProfile.findUnique({
      where: { userId },
      select: { id: true, userId: true, referralCode: true, user: { select: { name: true, email: true } } },
    });
    if (!brokerProfile) {
      throw new ApiError(404, "Partner profile not found.");
    }

    // Parse and validate body
    const body = await req.json().catch(() => ({}));
    const parsed = createUnifiedLeadSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      throw new ApiError(400, firstError.message);
    }

    const data = parsed.data;
    const normalizedEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();

    // Duplicate detection (past 30 days, email or phone match)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const existingLead = await db.lead.findFirst({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        OR: [
          { email: { equals: normalizedEmail, mode: "insensitive" } },
          { phone: cleanPhone },
        ],
      },
      select: {
        id: true,
        leadCode: true,
        ownerId: true,
        createdAt: true,
      },
    });

    if (existingLead) {
      throw new ApiError(
        409,
        `A lead with this contact email or phone was already registered within the last 30 days (${existingLead.leadCode}). Duplicate registration rejected.`
      );
    }

    const isDuplicate = false;
    const duplicateReason: string | null = null;
    const finalOwnerId = userId;

    // Generate unique Lead Code
    const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
    const countToday = await db.lead.count({
      where: { leadCode: { startsWith: `LD-${todayStr}` } },
    });
    const leadCode = `LD-${todayStr}-${String(countToday + 1).padStart(4, "0")}`;

    // Parse budget
    let parsedBudget: number | null = null;
    if (data.budget !== undefined && data.budget !== null) {
      if (typeof data.budget === "string") {
        const bStr = data.budget.replace(/[^0-9]/g, "");
        if (bStr) parsedBudget = parseInt(bStr, 10);
      } else {
        parsedBudget = data.budget;
      }
    }

    // Build synthesized requirement text from project info fields
    const requirementParts: string[] = [];
    if (data.leadTitle?.trim()) {
      requirementParts.push(`Project Title: ${data.leadTitle.trim()}`);
    }
    if (data.projectDescription?.trim()) {
      requirementParts.push(`Description:\n${data.projectDescription.trim()}`);
    }
    if (data.clientRequirements?.trim()) {
      requirementParts.push(`Requirements:\n${data.clientRequirements.trim()}`);
    }
    if (data.message?.trim() && data.message.trim() !== data.clientRequirements?.trim()) {
      requirementParts.push(`Additional Details:\n${data.message.trim()}`);
    }
    const finalMessage = requirementParts.join("\n\n").trim() || "Lead registered via Partner Portal.";

    // Determine resolved service interest
    const finalServiceInterest =
      data.serviceInterest === "Other Services" && data.otherServiceDetails?.trim()
        ? `Other Services: ${data.otherServiceDetails.trim()}`
        : data.serviceInterest.trim();

    // Build structured businessNeed summary
    const businessNeedSummary = [
      `[Opportunity Stage: ${data.opportunityStage === "CONFIRMED" ? "CONFIRMED" : "EARLY_STAGE"}]`,
      data.contactPerson?.trim() ? `Contact Person: ${data.contactPerson.trim()}` : null,
      data.preferredContactMethod?.trim() ? `Preferred Contact: ${data.preferredContactMethod.trim()}` : null,
      data.address?.trim() ? `Location Details: ${data.address.trim()}` : null,
      data.otherServiceDetails?.trim() ? `Other Service Notes: ${data.otherServiceDetails.trim()}` : null,
      data.additionalNotes?.trim() ? `Broker Notes: ${data.additionalNotes.trim()}` : null,
      data.documents && data.documents.length > 0 ? `Documents Attached (${data.documents.length}): ${data.documents.map((d) => d.name).join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const qualificationStatus = data.opportunityStage === "CONFIRMED" ? "QUALIFIED" : "UNQUALIFIED";
    const leadStatus = data.opportunityStage === "CONFIRMED" ? "QUALIFIED" : "NEW";

    // Create Lead + Documents in a transaction
    const [lead] = await db.$transaction(async (tx) => {
      const createdLead = await tx.lead.create({
        data: {
          leadCode,
          name: data.contactPerson?.trim() || data.name.trim(),
          email: normalizedEmail,
          phone: cleanPhone,
          whatsapp: data.whatsapp?.trim() || null,
          designation: data.designation?.trim() || null,
          companyName: data.companyName?.trim() || data.name.trim(),
          industry: data.industry?.trim() || null,
          city: data.city?.trim() || null,
          state: data.state?.trim() || null,
          country: data.country?.trim() || null,
          companySize: data.companySize?.trim() || null,
          website: data.website?.trim() || null,
          serviceInterest: finalServiceInterest,
          message: finalMessage,
          businessNeed: businessNeedSummary || null,
          budget: parsedBudget,
          timeline: data.timeline?.trim() || null,
          source: "PARTNER",
          status: leadStatus,
          qualificationStatus,
          isDuplicate: false,
          duplicateReason: null,
          ownerId: finalOwnerId,
        },
      });

      // Save supporting documents to PartnerDocument linked to broker
      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          await tx.partnerDocument.create({
            data: {
              title: doc.name,
              description: `Attached to Lead ${createdLead.leadCode}: ${data.leadTitle || data.name}`,
              fileUrl: doc.url,
              category: "PROJECT_DOCS",
              brokerProfileId: brokerProfile.id,
              uploadedById: userId,
              sizeBytes: doc.size || null,
              mimeType: doc.type || null,
            },
          });
        }
      }

      // Record Activity
      await tx.leadActivity.create({
        data: {
          leadId: createdLead.id,
          actorId: userId,
          type: "LEAD_CREATED",
          title: data.opportunityStage === "CONFIRMED" 
            ? "New confirmed lead submitted by partner" 
            : "New lead submitted by partner",
          notes: isDuplicate
            ? `Flagged as duplicate. ${duplicateReason}`
            : data.opportunityStage === "CONFIRMED"
            ? "Confirmed opportunity with detailed requirements registered from Partner Portal."
            : "Early-stage opportunity registered from Partner Portal.",
          metadata: {
            source: "PARTNER",
            isDuplicate,
            opportunityStage: data.opportunityStage,
            preferredContactMethod: data.preferredContactMethod,
            documents: data.documents,
            submittedByPartner: userId,
          },
        },
      });

      return [createdLead];
    });

    // Notify Admins & Founders
    await notifyAdmins({
      title: data.opportunityStage === "CONFIRMED"
        ? `New Confirmed Partner Lead: ${lead.name}`
        : `New Partner Lead: ${lead.name}`,
      message: `${lead.companyName ? `${lead.companyName} — ` : ""}${lead.serviceInterest || "General Services"} (${lead.leadCode}) [${data.opportunityStage === "CONFIRMED" ? "Confirmed Opportunity" : "Early Stage"}]`,
      link: `/admin/crm/leads/${lead.id}`,
    });

    // Log Broker Audit Event
    await logBrokerAudit({
      userId,
      action: "BROKER_LEAD_REGISTERED",
      resource: `Lead:${lead.id}`,
      details: {
        leadId: lead.id,
        leadCode: lead.leadCode,
        name: lead.name,
        companyName: lead.companyName,
        serviceInterest: lead.serviceInterest,
        opportunityStage: data.opportunityStage,
        documentsCount: data.documents?.length || 0,
      },
    });

    // Safe response
    const response: Record<string, unknown> = {
      success: true,
      message: "Lead registered successfully.",
      leadCode: lead.leadCode,
      leadId: lead.id,
      lead,
      data: lead,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
