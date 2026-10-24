import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function POST(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "governance.role_changes.approve");

    const approval = await db.approvalRequest.findUnique({ where: { id } });
    if (!approval) throw new ApiError(404, "Approval request not found");
    if (approval.status !== "PENDING") throw new ApiError(400, "Request already processed");

    // Self-approval prevention
    if (approval.requestedById === adminId) {
      throw new ApiError(403, "Forbidden: Self-approval is strictly prohibited by security policy.");
    }

    // Apply role change to database in transaction if request is role change
    const meta = (approval.metadata || {}) as any;
    const targetUserId = meta.targetUserId || meta.userId;
    const targetRoleName = meta.newRole || meta.roleName || meta.role;
    let targetRoleId = meta.newRoleId || meta.roleId;

    let updatedApproval;
    await db.$transaction(async (tx) => {
      if ((approval.requestType === "HIGH_PRIVILEGE_ROLE_ASSIGNMENT" || approval.requestType === "ROLE_CHANGE") && targetUserId) {
        if (!targetRoleId && targetRoleName) {
          const roleRecord = await tx.role.findUnique({ where: { name: targetRoleName } });
          if (roleRecord) targetRoleId = roleRecord.id;
        }

        if (targetRoleId) {
          await tx.userRole.deleteMany({ where: { userId: targetUserId } });
          await tx.userRole.create({
            data: { userId: targetUserId, roleId: targetRoleId },
          });
          // Invalidate existing sessions so target user is forced to re-authenticate with new role JWT
          await tx.session.deleteMany({ where: { userId: targetUserId } });
        }
      }

      updatedApproval = await tx.approvalRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          decidedById: adminId,
          decidedAt: new Date(),
        },
      });

      await tx.securityEvent.create({
        data: {
          userId: adminId,
          eventType: "ROLE_CHANGED",
          details: { approvalId: id, requestType: approval.requestType, decision: "APPROVED", targetUserId, targetRoleId },
        },
      });
    });

    return NextResponse.json({ data: updatedApproval });
  } catch (error: any) {
    return handleApiError(error);
  }
}
