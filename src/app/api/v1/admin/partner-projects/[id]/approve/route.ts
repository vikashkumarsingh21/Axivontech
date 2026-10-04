import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

// BP-0903: Project Approval
export async function POST(req: NextRequest, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    const result = await db.$transaction(async (tx) => {
      const project = await tx.partnerProject.findUnique({
        where: { id },
        include: {
          contract: { select: { status: true } },
          payment: { select: { status: true } },
          brokerProfile: { select: { userId: true } },
        },
      });

      if (!project) throw new ApiError(404, "Project not found.");

      // Idempotency: if already approved/started, return safely
      if (project.status === "APPROVED" || project.status === "IN_PROGRESS") {
        return { alreadyApproved: true, project };
      }

      // BP-0901: Hard gate
      if (!project.contract || project.contract.status !== "VERIFIED") {
        throw new ApiError(400, "Project cannot be approved because the required contract has not been verified.");
      }
      if (!project.payment || project.payment.status !== "VERIFIED") {
        throw new ApiError(400, "Project cannot be approved because the required advance payment has not been verified.");
      }
      if (project.technicalReviewStatus !== "APPROVED") {
        throw new ApiError(400, "Project cannot be approved because the technical review has not been approved.");
      }
      if (!project.finalProjectValue) {
        throw new ApiError(400, "Project cannot be approved because the final project value has not been established.");
      }

      const updated = await tx.partnerProject.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedById: userId,
          approvedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: "PROJECT_APPROVED",
          resource: "PartnerProject",
          details: { projectId: id, projectCode: project.projectCode },
        },
      });

      await tx.notification.create({
        data: {
          userId: project.brokerProfile.userId,
          type: "SYSTEM",
          title: "Project Approved",
          message: `Your project ${project.projectCode} has been approved!`,
          link: `/broker/projects/${id}`,
        },
      });

      return { alreadyApproved: false, project: updated };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
