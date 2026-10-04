import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

const reviewSchema = z.object({
  action: z.enum(["approve", "clarification", "in_review"]),
  notes: z.string().optional(),
});

// BP-0902: Technical Review
export async function POST(req: NextRequest, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "users:write");

    const project = await db.partnerProject.findUnique({
      where: { id },
      include: {
        contract: { select: { status: true } },
        payment: { select: { status: true } },
        brokerProfile: { select: { userId: true } },
      },
    });

    if (!project) throw new ApiError(404, "Project not found.");

    // BP-0901: Hard gate - contract + payment must be VERIFIED
    if (!project.contract || project.contract.status !== "VERIFIED") {
      throw new ApiError(400, "Project contract must be VERIFIED before technical review.");
    }
    if (!project.payment || project.payment.status !== "VERIFIED") {
      throw new ApiError(400, "Project advance payment must be VERIFIED before technical review.");
    }

    const body = await req.json().catch(() => ({}));
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const { action, notes } = parsed.data;

    let technicalReviewStatus: string;
    let projectStatus: string;

    switch (action) {
      case "in_review":
        technicalReviewStatus = "IN_REVIEW";
        projectStatus = "TECHNICAL_REVIEW";
        break;
      case "clarification":
        technicalReviewStatus = "CLARIFICATION_REQUIRED";
        projectStatus = "TECHNICAL_REVIEW";
        break;
      case "approve":
        technicalReviewStatus = "APPROVED";
        projectStatus = "TECHNICAL_APPROVED";
        break;
      default:
        throw new ApiError(400, "Invalid action.");
    }

    // Append technical notes
    let newTechnicalNotes = project.technicalNotes;
    if (notes) {
      const timestamp = new Date().toISOString();
      newTechnicalNotes = `${newTechnicalNotes ? newTechnicalNotes + "\n\n" : ""}--- [${timestamp}] ${actor.name || "Reviewer"} ---\n${notes}`;
    }

    await db.$transaction([
      db.partnerProject.update({
        where: { id },
        data: {
          status: projectStatus,
          technicalReviewStatus,
          technicalReviewedById: userId,
          technicalReviewedAt: action === "approve" ? new Date() : undefined,
          technicalNotes: newTechnicalNotes,
        },
      }),
      db.auditLog.create({
        data: {
          userId,
          action: `TECHNICAL_REVIEW_${action.toUpperCase()}`,
          resource: "PartnerProject",
          details: { projectId: id, projectCode: project.projectCode, technicalReviewStatus },
        },
      }),
      db.notification.create({
        data: {
          userId: project.brokerProfile.userId,
          type: "SYSTEM",
          title: action === "approve"
            ? "Technical Review Approved"
            : action === "clarification"
              ? "Technical Clarification Required"
              : "Technical Review Started",
          message: action === "approve"
            ? `Technical review for project ${project.projectCode} has been approved.`
            : action === "clarification"
              ? `Clarification is needed for project ${project.projectCode}. Please check your project details.`
              : `Technical review has started for project ${project.projectCode}.`,
          link: `/broker/projects/${id}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: `Technical review: ${technicalReviewStatus}` });
  } catch (error) {
    return handleApiError(error);
  }
}
