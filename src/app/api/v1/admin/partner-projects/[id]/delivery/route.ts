import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { generateAndPublishDeliveryReport } from "@/lib/reports/project-report-generator";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    if (!userId) throw new ApiError(401, "Unauthorized");

    const project = await db.partnerProject.findUnique({
      where: { id },
      include: {
        brokerProfile: { select: { userId: true } },
      },
    });

    if (!project) throw new ApiError(404, "Project not found.");

    if (project.qaStatus !== "UAT_APPROVED") {
      throw new ApiError(400, "Project UAT must be approved before delivery.");
    }

    let updatedProject = project;
    if (project.status !== "DELIVERED" && project.status !== "COMPLETED") {
      updatedProject = await db.partnerProject.update({
        where: { id },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
        },
        include: {
          brokerProfile: { select: { userId: true } },
        },
      });

      await db.auditLog.create({
        data: {
          userId,
          action: "PROJECT_DELIVERED",
          resource: "PartnerProject",
          details: { projectId: id, projectCode: project.projectCode },
        },
      });
    }

    // Automatically generate and publish the verified delivery report
    const { reportDoc } = await generateAndPublishDeliveryReport(id, userId);

    // Notify client if account exists
    if (project.clientUserId) {
      await db.notification.create({
        data: {
          userId: project.clientUserId,
          type: "SYSTEM",
          title: "Project Delivered & Report Published",
          message: `Your project ${project.projectCode} has officially been delivered! Your verified delivery report is now available for review and download.`,
          link: `/client/projects/${id}`,
        },
      });
    }

    // Notify broker if broker-referred
    if (project.brokerProfile?.userId) {
      await db.notification.create({
        data: {
          userId: project.brokerProfile.userId,
          type: "SYSTEM",
          title: "Project Delivered",
          message: `Project ${project.projectCode} has been delivered and final delivery report published.`,
          link: `/broker/projects/${id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedProject,
      deliveryReport: {
        id: reportDoc.id,
        title: reportDoc.title,
        category: reportDoc.category,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
