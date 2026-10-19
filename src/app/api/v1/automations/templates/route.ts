import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { BUSINESS_TEMPLATES, installTemplate } from "@/lib/workflow-engine/templates";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automation.view");

    return NextResponse.json({
      success: true,
      templates: BUSINESS_TEMPLATES,
      count: BUSINESS_TEMPLATES.length,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automation.manage");

    const body = await req.json();
    const { templateId } = body;

    if (!templateId) {
      throw new ApiError(400, "templateId is required.");
    }

    const result = await installTemplate(templateId, userId || undefined);

    return NextResponse.json({
      success: true,
      message: `Template "${templateId}" installed successfully.`,
      workflow: result,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
