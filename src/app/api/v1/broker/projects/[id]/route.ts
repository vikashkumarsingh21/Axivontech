import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function GET(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const brokerId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    if (!brokerId || role !== "BROKER") throw new ApiError(403, "Access denied.");

    const brokerProfile = await db.brokerProfile.findUnique({ where: { userId: brokerId } });
    if (!brokerProfile) throw new ApiError(404, "Broker profile not found.");

    const project = await db.partnerProject.findFirst({
      where: { id: params.id, brokerProfileId: brokerProfile.id },
      include: {
        contract: {
          include: {
            versions: {
              orderBy: { versionNumber: "desc" },
            },
          },
        },
        payment: {
          select: {
            id: true, projectPrice: true, advancePercentage: true, advanceAmount: true, remainingAmount: true,
            currency: true, paymentSettingsSnapshot: true, paymentMethod: true, amountPaid: true,
            transactionId: true, paymentDate: true, proofFileUrl: true, additionalNotes: true,
            status: true, submittedAt: true, verifiedAt: true, rejectionReason: true, rejectedAt: true,
          },
        },
        documents: {
          select: { id: true, title: true, category: true, fileUrl: true, createdAt: true },
        },
      },
    });

    if (!project) throw new ApiError(404, "Project not found or access denied.");

    // Strip admin-only fields
    const { adminNotes, ...safeProject } = project as Record<string, unknown>;

    return NextResponse.json({ data: safeProject });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const brokerId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    if (!brokerId || role !== "BROKER") throw new ApiError(403, "Access denied.");

    const brokerProfile = await db.brokerProfile.findUnique({ where: { userId: brokerId } });
    if (!brokerProfile) throw new ApiError(404, "Broker profile not found.");

    const project = await db.partnerProject.findFirst({
      where: { id: params.id, brokerProfileId: brokerProfile.id },
    });

    if (!project) throw new ApiError(404, "Project not found or access denied.");
    
    // Prevent modifying accepted/in-progress projects via onboarding wizard
    const lockedStatuses = ["PROPOSAL_SENT", "NEGOTIATION", "CONTRACT_SENT", "CONTRACT_SIGNED", "PAYMENT_PENDING", "PAYMENT_SUBMITTED", "PAYMENT_VERIFICATION", "PROJECT_CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REJECTED"];
    
    if (lockedStatuses.includes(project.status)) {
      throw new ApiError(400, "Project is locked and cannot be modified.");
    }

    const body = await req.json().catch(() => ({}));
    
    // Is it a final submit or just saving progress?
    const isSubmit = body.isSubmit === true;
    
    const updateData: any = {
      ...(body.clientName && { clientName: body.clientName }),
      ...(body.clientEmail && { clientEmail: body.clientEmail }),
      ...(body.clientPhone && { clientPhone: body.clientPhone }),
      ...(body.clientWhatsapp !== undefined && { clientWhatsapp: body.clientWhatsapp }),
      ...(body.clientDesignation !== undefined && { clientDesignation: body.clientDesignation }),
      
      ...(body.companyName && { companyName: body.companyName }),
      ...(body.industry && { industry: body.industry }),
      ...(body.businessAddress !== undefined && { businessAddress: body.businessAddress }),
      ...(body.city && { city: body.city }),
      ...(body.state && { state: body.state }),
      ...(body.country && { country: body.country }),
      ...(body.website !== undefined && { website: body.website }),
      ...(body.companySize !== undefined && { companySize: body.companySize }),
      ...(body.gstNumber !== undefined && { gstNumber: body.gstNumber }),
      ...(body.regNumber !== undefined && { regNumber: body.regNumber }),
      
      ...(body.projectName && { projectName: body.projectName }),
      ...(body.requiredService && { requiredService: body.requiredService }),
      ...(body.detailedRequirement && { detailedRequirement: body.detailedRequirement }),
      ...(body.expectedTimeline && { expectedTimeline: body.expectedTimeline }),
      ...(body.projectBudget && { projectBudget: body.projectBudget }),
      ...(body.additionalRequirements !== undefined && { additionalRequirements: body.additionalRequirements }),
      
      ...(body.contactPerson !== undefined && { contactPerson: body.contactPerson }),
      ...(body.contactEmail !== undefined && { contactEmail: body.contactEmail }),
      ...(body.contactPhone !== undefined && { contactPhone: body.contactPhone }),
    };

    if (isSubmit) {
       // Server-side validation of all required fields before moving to SUBMITTED status
       const requiredFields = [
         "clientName", "clientEmail", "clientPhone", 
         "companyName", "industry", "city", "state", "country",
         "projectName", "requiredService", "detailedRequirement", "expectedTimeline"
       ];
       
       const missing = requiredFields.filter(f => !updateData[f] && !(project as any)[f]);
       if (missing.length > 0) {
         throw new ApiError(400, `Missing required fields for submission: ${missing.join(", ")}`);
       }
       
       updateData.status = "SUBMITTED";
    } else {
       // It's a draft update. Keep existing status unless it was returning from revision
       if (project.status === "REVISION_REQUIRED" || project.status === "INFORMATION_REQUIRED") {
          // If they save draft while in revision, leave it in revision until submitted
       }
    }

    const updated = await db.partnerProject.update({
      where: { id: params.id },
      data: updateData,
    });
    
    if (isSubmit) {
      await db.activity.create({
        data: {
          actorId: brokerId,
          action: "SUBMITTED",
          entityType: "PARTNER_PROJECT",
          entityId: project.id,
          summary: `Partner submitted onboarding for project ${project.projectCode}`,
        }
      });
      
      // Notify admins
      const adminRoles = await db.userRole.findMany({
        where: { role: { name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] } } },
        select: { userId: true },
      });
      
      const adminIds = Array.from(new Set(adminRoles.map((ur) => ur.userId)));
      
      if (adminIds.length > 0) {
        await db.notification.createMany({
          data: adminIds.map((uid) => ({
            userId: uid,
            type: "SYSTEM",
            title: `Project Submitted for Review`,
            message: `Partner has submitted onboarding for ${project.projectCode} (${updated.projectName})`,
            link: `/admin/crm/partner-projects/${project.id}`,
          })),
        });
      }
    }

    const { adminNotes, ...safeProject } = updated as Record<string, unknown>;
    return NextResponse.json({ success: true, data: safeProject });
  } catch (error) {
    return handleApiError(error);
  }
}

