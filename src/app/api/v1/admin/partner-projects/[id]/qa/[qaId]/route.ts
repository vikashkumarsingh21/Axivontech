import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string, qaId: string }> }) {
  const params = await props.params;
  try {
    const { id, qaId } = params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    if (!userId) throw new ApiError(401, "Unauthorized");

    const body = await req.json();
    const { status, resolutionNotes, assignedToId } = body;

    const result = await db.$transaction(async (tx) => {
      const issue = await tx.qaIssue.findUnique({
        where: { id: qaId, partnerProjectId: id },
      });

      if (!issue) throw new ApiError(404, "QA Issue not found.");

      const dataToUpdate: any = {};
      if (status) dataToUpdate.status = status;
      if (resolutionNotes !== undefined) dataToUpdate.resolutionNotes = resolutionNotes;
      if (assignedToId !== undefined) dataToUpdate.assignedToId = assignedToId;
      
      if (status === "FIXED" || status === "CLOSED" || status === "PASSED") {
         if (issue.status !== status && !issue.resolvedAt) {
             dataToUpdate.resolvedAt = new Date();
         }
      }

      const updatedIssue = await tx.qaIssue.update({
        where: { id: qaId },
        data: dataToUpdate,
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: "QA_ISSUE_UPDATED",
          resource: "QaIssue",
          details: { qaId, projectId: id, updates: dataToUpdate },
        },
      });

      return updatedIssue;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
