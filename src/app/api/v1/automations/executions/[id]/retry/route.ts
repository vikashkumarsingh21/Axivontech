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

    const execution = await db.automationExecution.findUnique({
      where: { id },
      include: { automation: true },
    });

    if (!execution) {
      throw new ApiError(404, "Automation execution not found");
    }

    if (!execution.automation) {
      throw new ApiError(400, "Cannot retry: Associated automation workflow no longer exists");
    }

    // Re-execute workflow with fresh timestamp to bypass hourly dedup key
    const payload = {
      entityId: `retry_${execution.id}`,
      originalExecutionId: execution.id,
      retriedAt: new Date().toISOString(),
      retriedBy: userId,
    };

    const retryResult = await WorkflowOrchestrator.executeWorkflow(
      execution.automationId,
      execution.automation.triggerType || "MANUAL_TRIGGER",
      payload,
      {
        actorId: userId || "admin",
        actorRole: "ADMIN",
        isDryRun: false,
        correlationId: `retry_${execution.id}`,
      }
    );

    return NextResponse.json({
      success: retryResult.status !== "FAILED",
      message: `Execution retry dispatched: ${retryResult.status}`,
      retryResult,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
