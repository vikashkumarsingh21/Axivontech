import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const issues = await db.qaIssue.findMany({
      where: { partnerProjectId: id },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: issues });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    if (!userId) throw new ApiError(401, "Unauthorized");

    const body = await req.json();
    const { title, description, severity, assignedToId } = body;

    if (!title || !description) {
      throw new ApiError(400, "Title and description are required.");
    }

    const issue = await db.$transaction(async (tx) => {
      const project = await tx.partnerProject.findUnique({
        where: { id },
      });
      if (!project) throw new ApiError(404, "Project not found.");

      const qaIssue = await tx.qaIssue.create({
        data: {
          partnerProjectId: id,
          title,
          description,
          severity: severity || "MEDIUM",
          reporterId: userId,
          assignedToId,
        }
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: "QA_ISSUE_CREATED",
          resource: "QaIssue",
          details: { qaId: qaIssue.id, projectId: id, title },
        },
      });

      return qaIssue;
    });

    return NextResponse.json({ success: true, data: issue });
  } catch (error) {
    return handleApiError(error);
  }
}
