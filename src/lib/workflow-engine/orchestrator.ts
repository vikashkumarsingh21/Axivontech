import { db } from "@/lib/db";
import { evaluateConditionGroup } from "./condition-evaluator";
import { ACTION_REGISTRY, ActionExecutionContext } from "./action-registry";
import { ApprovalService } from "./approval-service";
import {
  WorkflowDefinition,
  ExecutionStatus,
  ExecutionStepResult,
  DryRunSimulationResult,
  ActionConfig,
} from "./types";
import { logPortalAIAudit } from "@/lib/portal-ai/audit-logger";

export class WorkflowOrchestrator {
  /**
   * Dispatches an event-driven or manual trigger to all matching active workflows
   */
  static async dispatchTrigger(
    triggerEvent: string,
    payload: Record<string, any>,
    options: { actorId?: string; isDryRun?: boolean } = {}
  ) {
    const workflows = await db.automationWorkflow.findMany({
      where: {
        triggerType: triggerEvent,
        isActive: true,
      },
    });

    const results = [];
    for (const wf of workflows) {
      const res = await this.executeWorkflow(wf.id, triggerEvent, payload, options);
      results.push(res);
    }

    return results;
  }

  /**
   * Executes a specific workflow by ID against contextual payload
   */
  static async executeWorkflow(
    workflowId: string,
    triggerEvent: string,
    payload: Record<string, any>,
    options: {
      actorId?: string;
      actorRole?: string;
      isDryRun?: boolean;
      correlationId?: string;
    } = {}
  ): Promise<{
    executionId?: string;
    status: ExecutionStatus;
    actionsExecuted: ExecutionStepResult[];
    durationMs: number;
    error?: string;
  }> {
    const startTime = Date.now();
    const isDryRun = !!options.isDryRun;

    // 1. Fetch workflow definition
    const wf = await db.automationWorkflow.findUnique({
      where: { id: workflowId },
    });

    if (!wf) {
      return {
        status: "FAILED",
        actionsExecuted: [],
        durationMs: Date.now() - startTime,
        error: `Workflow not found: ${workflowId}`,
      };
    }

    if (!wf.isActive && !isDryRun) {
      return {
        status: "SKIPPED",
        actionsExecuted: [],
        durationMs: Date.now() - startTime,
        error: "Workflow is deactivated.",
      };
    }

    const entityId = payload.entityId || payload.id || "global";
    // Construct stable idempotency dedup key (hourly window)
    const timeSlot = new Date().toISOString().slice(0, 13); // e.g. "2026-10-19T11"
    const dedupKey = `WF_${wf.id}::${triggerEvent}::${entityId}::${timeSlot}`;

    // 2. Idempotency Check (skip duplicates unless dry run)
    if (!isDryRun) {
      const existing = await db.automationExecution.findFirst({
        where: { dedupKey },
      });
      if (existing) {
        return {
          executionId: existing.id,
          status: "SKIPPED",
          actionsExecuted: [],
          durationMs: Date.now() - startTime,
          error: "Idempotent execution skipped: Already processed for this entity in the active time window.",
        };
      }
    }

    // 3. Condition Evaluation
    const conditions = (wf.conditions as any) || null;
    const conditionsPassed = evaluateConditionGroup(conditions, payload);

    if (!conditionsPassed) {
      if (!isDryRun) {
        await db.automationExecution.create({
          data: {
            automationId: wf.id,
            triggerEvent,
            status: "SKIPPED",
            dedupKey,
            result: {
              executed: false,
              reason: "Conditions not met",
              payloadSummary: { entityId, triggerEvent },
            },
          },
        });
      }

      return {
        status: "SKIPPED",
        actionsExecuted: [],
        durationMs: Date.now() - startTime,
        error: "Workflow conditions not satisfied by payload.",
      };
    }

    // 4. Action Execution Loop
    const rawActions = Array.isArray(wf.actions) ? wf.actions : [];
    const actionConfigs: ActionConfig[] = rawActions.map((a: any) =>
      typeof a === "string" ? { actionId: a as any, params: {} } : a
    );

    const stepResults: ExecutionStepResult[] = [];
    let workflowStatus: ExecutionStatus = isDryRun ? "DRY_RUN" : "SUCCEEDED";
    let executionError: string | null = null;
    let approvalRequestId: string | undefined = undefined;

    const actionCtx: ActionExecutionContext = {
      workflowId: wf.id,
      workflowName: wf.name,
      triggerEvent,
      actorId: options.actorId || wf.createdById,
      actorRole: options.actorRole,
      correlationId: options.correlationId || `corr_${Date.now()}`,
      isDryRun,
    };

    for (const config of actionConfigs) {
      const handler = ACTION_REGISTRY[config.actionId];
      if (!handler) {
        stepResults.push({
          actionId: config.actionId,
          success: false,
          error: `Unregistered action: ${config.actionId}`,
        });
        workflowStatus = "FAILED";
        executionError = `Unregistered action '${config.actionId}'`;
        break;
      }

      // Check Approval Requirement
      const requiresApproval =
        config.requiresApproval ||
        handler.requiresApprovalByDefault ||
        (conditions as any)?.approvalRequired;

      if (requiresApproval && !isDryRun) {
        // Pause execution and create approval request
        const approval = await ApprovalService.createApproval({
          workflowId: wf.id,
          workflowName: wf.name,
          triggerEvent,
          actionId: config.actionId,
          actionParams: { ...payload, ...config.params },
          requestedById: options.actorId || wf.createdById || "system",
          reason: `High-impact action "${handler.name}" awaiting authorization.`,
        });

        approvalRequestId = approval.id;
        stepResults.push({
          actionId: config.actionId,
          success: true,
          output: { pausedForApproval: true, approvalRequestId: approval.id },
          approvalRequestId: approval.id,
        });

        workflowStatus = "WAITING_FOR_APPROVAL";
        break; // Stop further immediate actions until approved
      }

      // Execute Action
      try {
        const mergedParams = { ...payload, ...config.params };
        const actionRes = await handler.execute(mergedParams, actionCtx);

        stepResults.push({
          actionId: config.actionId,
          success: actionRes.success,
          output: actionRes.output,
          error: actionRes.error,
        });

        if (!actionRes.success) {
          workflowStatus = "FAILED";
          executionError = actionRes.error || "Action execution error";
          break; // Stop execution chain on error
        }
      } catch (err: any) {
        stepResults.push({
          actionId: config.actionId,
          success: false,
          error: err.message,
        });
        workflowStatus = "FAILED";
        executionError = err.message;
        break;
      }
    }

    const durationMs = Date.now() - startTime;

    // 5. Persist Durable Execution Record
    let executionRecord: any = null;
    if (!isDryRun) {
      executionRecord = await db.automationExecution.create({
        data: {
          automationId: wf.id,
          triggerEvent,
          status: workflowStatus,
          dedupKey,
          result: {
            executed: workflowStatus === "SUCCEEDED",
            durationMs,
            stepResults,
            approvalRequestId,
            error: executionError,
            executedAt: new Date().toISOString(),
          } as any,
        },
      });

      // Audit Log
      await logPortalAIAudit(
        options.actorId || wf.createdById || null,
        `WORKFLOW_${workflowStatus}`,
        wf.id,
        {
          workflowName: wf.name,
          triggerEvent,
          durationMs,
          stepsCount: stepResults.length,
          approvalRequestId,
          error: executionError,
        }
      );
    }

    return {
      executionId: executionRecord?.id,
      status: workflowStatus,
      actionsExecuted: stepResults,
      durationMs,
      error: executionError || undefined,
    };
  }

  /**
   * Performs a safe dry-run simulation without persistent changes
   */
  static async simulateWorkflow(
    workflowId: string,
    payload: Record<string, any>
  ): Promise<DryRunSimulationResult> {
    const wf = await db.automationWorkflow.findUnique({
      where: { id: workflowId },
    });

    if (!wf) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const conditions = (wf.conditions as any) || null;
    const conditionsPassed = evaluateConditionGroup(conditions, payload);

    const rawActions = Array.isArray(wf.actions) ? wf.actions : [];
    const actionConfigs: ActionConfig[] = rawActions.map((a: any) =>
      typeof a === "string" ? { actionId: a as any, params: {} } : a
    );

    const plannedActions = actionConfigs.map((cfg) => {
      const handler = ACTION_REGISTRY[cfg.actionId];
      return {
        actionId: cfg.actionId,
        parameters: { ...payload, ...cfg.params },
        requiresApproval: cfg.requiresApproval || handler?.requiresApprovalByDefault || false,
        preview: handler
          ? `${handler.name}: ${handler.description}`
          : `Custom action: ${cfg.actionId}`,
      };
    });

    return {
      workflowId: wf.id,
      workflowName: wf.name,
      isSimulated: true,
      triggerEvaluated: true,
      conditionsPassed,
      actionsPlanned: plannedActions,
      simulatedAuditNote: `Simulated run for "${wf.name}" with ${plannedActions.length} planned actions. Conditions passed: ${conditionsPassed}.`,
    };
  }
}
