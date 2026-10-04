import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const params = await props.params;
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "CLIENT") throw new ApiError(403, "Access denied.");
    await validateActiveUser(userId);

    const { id: projectId, docId } = params;

    const document = await db.partnerDocument.findFirst({
      where: {
        id: docId,
        partnerProjectId: projectId,
        isClientVisible: true,
        partnerProject: {
          clientUserId: userId,
        }
      }
    });

    if (!document) throw new ApiError(404, "Document not found or access denied.");

    return NextResponse.json({ success: true, fileUrl: document.fileUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
