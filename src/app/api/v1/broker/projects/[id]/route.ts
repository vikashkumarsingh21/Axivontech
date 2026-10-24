import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  requireBroker,
  apiSuccess,
  apiError,
  checkIdempotency,
  checkRateLimit,
  logBrokerAudit,
  notifyAdmins,
} from "@/lib/api/broker";
import { z } from "zod";

const patchProjectSchema = z.object({
  action: z.enum(["update", "submit", "cancel"]).optional().default("update"),
  cancelReason: z.string().max(500).optional(),

  projectName: z.string().min(2).max(150).optional(),
  requiredService: z.string().min(2).max(100).optional(),
  detailedRequirement: z.string().min(10).max(5000).optional(),
  expectedTimeline: z.string().max(100).optional(),
  projectBudget: z.string().max(100).optional(),
  additionalRequirements: z.string().max(2000).optional().nullable(),

  clientName: z.string().min(2).max(150).optional(),
  clientEmail: z.string().email().max(150).optional(),
  clientPhone: z.string().min(7).max(30).optional(),
  clientWhatsapp: z.string().max(30).optional().nullable(),
  clientDesignation: z.string().max(100).optional().nullable(),

  companyName: z.string().min(2).max(200).optional(),
  industry: z.string().min(2).max(100).optional(),
  businessAddress: z.string().max(300).optional().nullable(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  country: z.string().min(2).max(100).optional(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  companySize: z.string().max(50).optional().nullable(),
  gstNumber: z.string().max(25).optional().nullable(),
  regNumber: z.string().max(50).optional().nullable(),

  contactPerson: z.string().max(150).optional().nullable(),
  contactEmail: z.string().email().max(150).optional().nullable().or(z.literal("")),
  contactPhone: z.string().max(30).optional().nullable(),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ [key: string]: string }> }
) {
  const params = await props.params;

  if (!params.id || params.id === "new") {
    return apiError("INVALID_PROJECT_ID", "Resource not found. 'new' is a reserved action path.", 404);
  }

  try {
    const { brokerProfile } = await requireBroker(req);

    const project = await db.partnerProject.findFirst({
      where: {
        id: params.id,
        brokerProfileId: brokerProfile.id, // Strict IDOR ownership
      },
      include: {
        contract: {
          include: {
            versions: {
              select: {
                id: true,
                versionNumber: true,
                status: true,
                contractFileUrl: true,
                signedFileUrl: true,
                sentAt: true,
                signedAt: true,
                changeNotes: true,
              },
              orderBy: { versionNumber: "desc" },
            },
          },
        },
        payment: {
          select: {
            id: true,
            projectPrice: true,
            advancePercentage: true,
            advanceAmount: true,
            remainingAmount: true,
            currency: true,
            paymentMethod: true,
            amountPaid: true,
            transactionId: true,
            paymentDate: true,
            proofFileUrl: true,
            status: true,
            submittedAt: true,
            verifiedAt: true,
            rejectionReason: true,
            rejectedAt: true,
          },
        },
        commission: {
          select: {
            id: true,
            projectValue: true,
            commissionType: true,
            commissionRate: true,
            commissionAmount: true,
            currency: true,
            status: true,
            eligibleAt: true,
            approvedAt: true,
            paidAt: true,
            payoutReference: true,
            payoutRequestedAt: true,
            payoutDueAt: true,
            rejectionReason: true,
          },
        },
        milestones: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            deliverables: true,
            startDate: true,
            dueDate: true,
            completedAt: true,
            milestoneOrder: true,
          },
          orderBy: { milestoneOrder: "asc" },
        },
        documents: {
          where: { isClientVisible: false }, // Only broker project docs
          select: {
            id: true,
            title: true,
            category: true,
            fileUrl: true,
            createdAt: true,
          },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, "Project not found or access denied.", undefined, "PROJECT_NOT_FOUND");
    }

    // Strip internal admin pricing margins, internal admin notes, and QA team internals
    const {
      adminNotes,
      ...safeProject
    } = project as Record<string, unknown>;

    return apiSuccess(safeProject);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ [key: string]: string }> }
) {
  const params = await props.params;

  if (!params.id || params.id === "new") {
    return apiError("INVALID_PROJECT_ID", "Resource not found. 'new' is a reserved action path.", 404);
  }

  try {
    const { brokerProfile, brokerId, user } = await requireBroker(req);

    checkRateLimit(`broker_proj_patch:${brokerId}`, 10, 60);

    const project = await db.partnerProject.findFirst({
      where: {
        id: params.id,
        brokerProfileId: brokerProfile.id,
      },
    });

    if (!project) {
      throw new ApiError(404, "Project not found or access denied.", undefined, "PROJECT_NOT_FOUND");
    }

    // Locked statuses where broker can no longer modify requirements
    const lockedStatuses = [
      "CONTRACT_SENT",
      "CONTRACT_SIGNED",
      "PAYMENT_PENDING",
      "PAYMENT_SUBMITTED",
      "PAYMENT_VERIFICATION",
      "PROJECT_CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "REJECTED",
    ];

    if (lockedStatuses.includes(project.status)) {
      throw new ApiError(
        400,
        `Project is in '${project.status}' status and can no longer be edited.`,
        undefined,
        "PROJECT_LOCKED"
      );
    }

    const body = await req.json().catch(() => ({}));
    const validated = patchProjectSchema.parse(body);

    checkIdempotency(`patch_${project.id}_${validated.action}`, 2000);

    // 1. Cancellation flow
    if (validated.action === "cancel") {
      if (project.status !== "PROJECT_REQUESTED" && project.status !== "REVIEWING") {
        throw new ApiError(
          400,
          "Projects can only be cancelled while in initial review.",
          undefined,
          "CANCEL_NOT_ALLOWED"
        );
      }

      const cancelled = await db.partnerProject.update({
        where: { id: params.id },
        data: {
          status: "CANCELLED",
          additionalRequirements: validated.cancelReason
            ? `${project.additionalRequirements ? project.additionalRequirements + "\n" : ""}[Cancellation Reason]: ${validated.cancelReason}`
            : project.additionalRequirements,
        },
      });

      await logBrokerAudit({
        userId: brokerId,
        action: "BROKER_PROJECT_CANCELLED",
        resource: `PartnerProject:${project.id}`,
        details: { projectCode: project.projectCode, reason: validated.cancelReason },
      });

      await notifyAdmins({
        title: `Project Referral Cancelled: ${project.projectName}`,
        message: `Partner ${user.name} cancelled project referral ${project.projectCode}.`,
        link: `/admin/crm/partner-projects/${project.id}`,
      });

      const { adminNotes, ...safeProject } = cancelled as Record<string, unknown>;
      return apiSuccess(safeProject, undefined, { message: "Project cancelled successfully." });
    }

    // 2. Update / Submit flow
    const updateData: any = {};
    const allowedKeys = [
      "projectName", "requiredService", "detailedRequirement", "expectedTimeline", "projectBudget", "additionalRequirements",
      "clientName", "clientEmail", "clientPhone", "clientWhatsapp", "clientDesignation",
      "companyName", "industry", "businessAddress", "city", "state", "country", "website", "companySize", "gstNumber", "regNumber",
      "contactPerson", "contactEmail", "contactPhone"
    ];

    for (const key of allowedKeys) {
      if ((validated as any)[key] !== undefined) {
        updateData[key] = (validated as any)[key];
      }
    }

    if (validated.action === "submit") {
      updateData.status = "SUBMITTED";
    }

    const updated = await db.partnerProject.update({
      where: { id: params.id },
      data: updateData,
    });

    await logBrokerAudit({
      userId: brokerId,
      action: validated.action === "submit" ? "BROKER_PROJECT_SUBMITTED" : "BROKER_PROJECT_UPDATED",
      resource: `PartnerProject:${project.id}`,
      details: {
        projectCode: project.projectCode,
        action: validated.action,
        updatedFields: Object.keys(updateData),
      },
    });

    if (validated.action === "submit") {
      await notifyAdmins({
        title: `Project Submitted: ${updated.projectName}`,
        message: `Partner ${user.name} submitted finalized onboarding details for ${project.projectCode}.`,
        link: `/admin/crm/partner-projects/${project.id}`,
      });
    }

    const { adminNotes, ...safeProject } = updated as Record<string, unknown>;
    return apiSuccess(safeProject, undefined, {
      message: validated.action === "submit" ? "Project submitted for review." : "Project updated successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
