import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { proposeWorkflowFromNaturalLanguage } from "@/lib/workflow-engine/ai-workflow-creator";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automation.manage");

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      throw new ApiError(400, "A natural-language prompt is required to propose a workflow.");
    }

    const result = await proposeWorkflowFromNaturalLanguage(prompt.trim(), "ADMIN");

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || "Unable to generate workflow proposal from prompt.",
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      proposal: result.proposal,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
