import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { updateKnowledgeGapStatus } from "@/lib/chatbot/knowledge-gap-logger";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const body = await req.json();
    const { status } = body;

    if (!["ADDRESSED", "IGNORED", "OPEN"].includes(status)) {
      throw new ApiError(400, "Invalid status. Must be ADDRESSED, IGNORED, or OPEN.");
    }

    const success = await updateKnowledgeGapStatus(params.id, status as any);
    if (!success) {
      throw new ApiError(404, "Knowledge gap not found or could not be updated.");
    }

    return NextResponse.json({ success: true, message: `Gap status updated to ${status}.` });
  } catch (error) {
    return handleApiError(error);
  }
}
