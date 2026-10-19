import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { WorkflowOrchestrator } from "@/lib/workflow-engine/orchestrator";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automation.manage");

    const { id } = await props.params;

    const workflow = await db.automationWorkflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      throw new ApiError(404, "Workflow not found");
    }

    const body = await req.json().catch(() => ({}));
    const isDryRun = !!body.isDryRun;
    const payload = body.payload || { entityId: "manual_run", timestamp: new Date().toISOString() };

    const result = await WorkflowOrchestrator.executeWorkflow(
      workflow.id,
      workflow.triggerType || "MANUAL_TRIGGER",
      payload,
      {
        actorId: userId || "admin",
        actorRole: "ADMIN",
        isDryRun,
      }
    );

    return NextResponse.json({
      success: result.status !== "FAILED",
      result,
      isDryRun,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
