import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "CLIENT") {
      throw new ApiError(401, "Unauthorized");
    }

    await validateActiveUser(userId);

    const projectId = params.id;

    const project = await db.partnerProject.findFirst({
      where: {
        id: projectId,
        clientUserId: userId,
      },
      select: {
        id: true,
        projectCode: true,
        projectName: true,
        requiredService: true,
        detailedRequirement: true,
        expectedTimeline: true,
        projectBudget: true,
        status: true,
        progressPercentage: true,
        expectedDeliveryDate: true,
        companyName: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        createdAt: true,
        updatedAt: true,
        milestones: {
          where: {
            isClientVisible: true,
          },
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            startDate: true,
            targetDate: true,
            completionDate: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, "Project not found or access denied");
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    return handleApiError(error);
  }
}
