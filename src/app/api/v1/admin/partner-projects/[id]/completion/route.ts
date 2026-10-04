import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    if (!userId) throw new ApiError(401, "Unauthorized");

    const result = await db.$transaction(async (tx) => {
      const project = await tx.partnerProject.findUnique({
        where: { id },
      });

      if (!project) throw new ApiError(404, "Project not found.");

      if (project.status !== "DELIVERED") {
        throw new ApiError(400, "Project must be DELIVERED before it can be marked as COMPLETED.");
      }

      const updatedProject = await tx.partnerProject.update({
        where: { id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          completedById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: "PROJECT_COMPLETED",
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
