import { db } from "@/lib/db";
import { ACTION_REGISTRY } from "./action-registry";
import { logPortalAIAudit } from "@/lib/portal-ai/audit-logger";

export class ApprovalService {
  /**
   * Create a new approval request for a high-impact action
   */
  static async createApproval(opts: {
    workflowId: string;
    workflowName: string;
    triggerEvent: string;
    actionId: string;
    actionParams: Record<string, any>;
    requestedById: string;
    reason?: string;
    requiredRole?: string;
  }) {
    const {
      workflowId,
      workflowName,
      triggerEvent,
      actionId,
      actionParams,
      requestedById,
      reason,
      requiredRole = "ADMIN",
    } = opts;

    const approval = await db.approvalRequest.create({
      data: {
        requestType: `ACTION_EXECUTION::${actionId}`,
        requestedById: requestedById || "system",
        status: "PENDING",
        reason: reason || `Approval required to execute action "${actionId}" in workflow "${workflowName}"`,
        metadata: {
          workflowId,
          workflowName,
          triggerEvent,
          actionId,
          actionParams,
          requiredRole,
          createdAt: new Date().toISOString(),
        },
      },
    });

    return approval;
  }

  /**
   * Decide on a pending approval request (APPROVE or REJECT)
   */
  static async decideApproval(opts: {
    approvalId: string;
    decision: "APPROVED" | "REJECTED";
    decidedById: string;
    reason?: string;
    ipAddress?: string | null;
  }) {
    const { approvalId, decision, decidedById, reason, ipAddress } = opts;

    // 1. Fetch approval record
    const approval = await db.approvalRequest.findUnique({
      where: { id: approvalId },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!approval) {
      throw new Error(`Approval request not found: ${approvalId}`);
    }

    // 2. Prevent replay / double-decision
    if (approval.status !== "PENDING") {
      throw new Error(`Cannot decide approval: Request is already ${approval.status}.`);
    }

    // 3. Verify Decider Permissions (Must be ADMIN, FOUNDER, or CO_FOUNDER)
    const decider = await db.user.findUnique({
      where: { id: decidedById },
      select: {
        id: true,
        name: true,
        status: true,
        userRoles: { include: { role: true } },
      },
    });

    if (!decider || decider.status === "INACTIVE") {
      throw new Error("Deciding user is invalid or inactive.");
    }

    const deciderRoles = decider.userRoles.map((ur) => ur.role.name);
    const hasAdminAuthority = deciderRoles.some((r) =>
      ["FOUNDER", "CO_FOUNDER", "ADMIN"].includes(r)
    );

    if (!hasAdminAuthority) {
      await logPortalAIAudit(
        decidedById,
        "UNAUTHORIZED_APPROVAL_ATTEMPT",
        approvalId,
        { decision, deciderRoles },
        ipAddress
      );
      throw new Error("Security barrier: User lacks administrative authority to decide approval requests.");
    }

    // 4. If approved, execute the held action
    let executionOutput: any = null;
    let executionError: string | null = null;

    if (decision === "APPROVED") {
      const metadata = (approval.metadata as Record<string, any>) || {};
      const actionId = metadata.actionId;
      const actionParams = metadata.actionParams || {};
      const handler = ACTION_REGISTRY[actionId as keyof typeof ACTION_REGISTRY];

      if (handler) {
        try {
          const actionRes = await handler.execute(actionParams, {
            workflowId: metadata.workflowId || "unknown",
            workflowName: metadata.workflowName || "Approved Action",
            triggerEvent: metadata.triggerEvent || "MANUAL_APPROVAL",
            actorId: decidedById,
            actorRole: deciderRoles[0],
            isDryRun: false,
          });

          if (actionRes.success) {
            executionOutput = actionRes.output;
          } else {
            executionError = actionRes.error || "Action execution failed after approval.";
          }
        } catch (err: any) {
          executionError = err.message;
        }
      }
    }

    // 5. Update approval record in database
    const updated = await db.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: executionError ? "EXECUTION_FAILED" : decision,
        decidedById,
        decidedAt: new Date(),
        reason: reason || (decision === "APPROVED" ? "Approved by administrator" : "Rejected by administrator"),
        metadata: {
          ...(approval.metadata as object),
          executionOutput,
          executionError,
          decidedByRole: deciderRoles[0],
        },
      },
    });

    // 6. Audit log
    await logPortalAIAudit(
      decidedById,
      `WORKFLOW_APPROVAL_${decision}`,
      approvalId,
      {
        requestType: approval.requestType,
        decision,
        reason,
        executionError,
      },
      ipAddress
    );

    return {
      approval: updated,
      executed: decision === "APPROVED" && !executionError,
      error: executionError,
    };
  }

  /**
   * List pending or filtered approvals
   */
  static async listApprovals(opts: {
    status?: string;
    take?: number;
    skip?: number;
  } = {}) {
    const { status, take = 50, skip = 0 } = opts;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      db.approvalRequest.findMany({
        where,
        include: {
          requestedBy: { select: { id: true, name: true, email: true } },
          decidedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      db.approvalRequest.count({ where }),
    ]);

    return { items, total };
  }
}
