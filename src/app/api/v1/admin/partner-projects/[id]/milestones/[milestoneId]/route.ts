import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const params = await props.params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:manage");

    const existing = await db.partnerProjectMilestone.findFirst({
      where: {
        id: params.milestoneId,
        partnerProjectId: params.id,
      },
      include: {
        partnerProject: {
          select: {
            id: true,
            projectName: true,
            clientUserId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new ApiError(404, "Milestone not found.");
    }

    const body = await req.json().catch(() => ({}));
    const {
      title,
      description,
      status,
      startDate,
      targetDate,
      completionDate,
      order,
      isClientVisible,
    } = body;

    const updated = await db.partnerProjectMilestone.update({
      where: { id: params.milestoneId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status !== undefined && {
          status: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"].includes(status)
            ? status
            : existing.status,
          completionDate: status === "COMPLETED" && !completionDate ? new Date() : (completionDate ? new Date(completionDate) : existing.completionDate),
        }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
        ...(completionDate !== undefined && { completionDate: completionDate ? new Date(completionDate) : null }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isClientVisible !== undefined && { isClientVisible: Boolean(isClientVisible) }),
      },
    });

    // Notify client if milestone completed or status changed
    if (
      existing.partnerProject.clientUserId &&
      updated.isClientVisible &&
      status &&
      status !== existing.status
    ) {
      await db.notification.create({
        data: {
          userId: existing.partnerProject.clientUserId,
          type: status === "COMPLETED" ? "SUCCESS" : "INFO",
          title: `Milestone Update: ${updated.title}`,
          message: `Milestone "${updated.title}" in ${existing.partnerProject.projectName} is now ${status.replace("_", " ")}.`,
          link: `/client/projects/${existing.partnerProject.id}`,
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const params = await props.params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:manage");

    const existing = await db.partnerProjectMilestone.findFirst({
      where: {
        id: params.milestoneId,
        partnerProjectId: params.id,
      },
    });

    if (!existing) {
      throw new ApiError(404, "Milestone not found.");
    }

    await db.partnerProjectMilestone.delete({
      where: { id: params.milestoneId },
    });

    return NextResponse.json({ success: true, message: "Milestone deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
