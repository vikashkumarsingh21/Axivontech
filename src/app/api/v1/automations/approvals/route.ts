import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { ApprovalService } from "@/lib/workflow-engine/approval-service";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automation.view");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const take = Math.min(parseInt(searchParams.get("take") || "50", 10), 100);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    const { items, total } = await ApprovalService.listApprovals({ status, take, skip });

    return NextResponse.json({
      success: true,
      approvals: items,
      total,
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
    const { approvalId, decision, reason } = body;

    if (!approvalId || !decision) {
      throw new ApiError(400, "approvalId and decision are required.");
    }

    if (!["APPROVED", "REJECTED"].includes(decision)) {
      throw new ApiError(400, "Decision must be either 'APPROVED' or 'REJECTED'.");
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    const result = await ApprovalService.decideApproval({
      approvalId,
      decision,
      decidedById: userId!,
      reason,
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
