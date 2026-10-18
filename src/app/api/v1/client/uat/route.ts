import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "CLIENT") {
      throw new ApiError(403, "Access denied. Client account required.");
    }

    await validateActiveUser(userId);

    // Fetch projects and deliverables awaiting or under UAT review
    const projects = await db.partnerProject.findMany({
      where: {
        clientUserId: userId,
      },
      select: {
        id: true,
        projectCode: true,
        projectName: true,
        status: true,
        qaStatus: true,
        progressPercentage: true,
        expectedDeliveryDate: true,
        deliveredAt: true,
        completedAt: true,
        documents: {
          where: {
            isClientVisible: true,
            category: "CLIENT_DELIVERABLE",
          },
          select: {
            id: true,
            title: true,
            description: true,
            fileUrl: true,
            mimeType: true,
            sizeBytes: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        milestones: {
          where: {
            isClientVisible: true,
          },
          select: {
            id: true,
            title: true,
            status: true,
            targetDate: true,
            completionDate: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return handleApiError(error);
  }
}
