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

    if (!userId || role !== "CLIENT") throw new ApiError(403, "Access denied.");
    await validateActiveUser(userId);

    const projectId = params.id;

    // Verify project belongs to client
    const project = await db.partnerProject.findFirst({
      where: { id: projectId, clientUserId: userId }
    });
    if (!project) throw new ApiError(404, "Project not found or access denied.");

    const documents = await db.partnerDocument.findMany({
      where: {
        partnerProjectId: projectId,
        isClientVisible: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        mimeType: true,
        sizeBytes: true,
        isImportant: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    return handleApiError(error);
  }
}
