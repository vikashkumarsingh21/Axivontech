import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    
    const clientUserId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    
    if (!clientUserId || userRole !== "CLIENT") {
      throw new ApiError(403, "Forbidden. Client access only.");
    }

    const result = await db.$transaction(async (tx) => {
      const project = await tx.partnerProject.findUnique({
        where: { id },
      });

      if (!project) throw new ApiError(404, "Project not found.");
      if (project.clientUserId !== clientUserId) {
        throw new ApiError(403, "You do not have access to this project.");
      }

      if (project.qaStatus === "UAT_APPROVED") {
         return project;
      }

      const updatedProject = await tx.partnerProject.update({
        where: { id },
        data: {
          qaStatus: "UAT_APPROVED",
        },
      });

      await tx.auditLog.create({
        data: {
          userId: clientUserId,
          action: "UAT_APPROVED",
          resource: "PartnerProject",
          details: { projectId: id, projectCode: project.projectCode },
        },
      });

      return updatedProject;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
