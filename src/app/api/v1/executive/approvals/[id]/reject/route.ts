import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "governance.role_changes.approve");

    const body = await req.json();
    if (!body.reason) throw new ApiError(400, "Rejection reason is required");

    const approval = await db.approvalRequest.findUnique({ where: { id } });
    if (!approval) throw new ApiError(404, "Approval request not found");
    if (approval.status !== "PENDING") throw new ApiError(400, "Request already processed");

    const updated = await db.approvalRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        reason: body.reason,
        decidedById: adminId,
        decidedAt: new Date(),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
