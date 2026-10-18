import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const milestones = await db.partnerProjectMilestone.findMany({
      where: { partnerProjectId: params.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: milestones });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:manage");

    const project = await db.partnerProject.findUnique({
      where: { id: params.id },
    });
    if (!project) throw new ApiError(404, "Partner project not found.");

    const body = await req.json().catch(() => ({}));
    const {
      title,
      description,
      status = "NOT_STARTED",
      startDate,
      targetDate,
      completionDate,
      order = 0,
      isClientVisible = true,
    } = body;

    if (!title?.trim()) {
      throw new ApiError(400, "Milestone title is required.");
    }

    const milestone = await db.partnerProjectMilestone.create({
      data: {
        partnerProjectId: params.id,
        title: title.trim(),
        description: description?.trim() || null,
        status: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"].includes(status)
          ? status
          : "NOT_STARTED",
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        completionDate: completionDate ? new Date(completionDate) : null,
        order: Number(order) || 0,
        isClientVisible: Boolean(isClientVisible),
      },
    });

    // Notify client if visible
    if (project.clientUserId && isClientVisible) {
      await db.notification.create({
        data: {
          userId: project.clientUserId,
          type: "INFO",
          title: `New Milestone: ${milestone.title}`,
          message: `A new milestone has been added to ${project.projectName}: ${milestone.title}`,
          link: `/client/projects/${project.id}`,
        },
      });
    }

    return NextResponse.json({ success: true, data: milestone }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
