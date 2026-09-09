import { db } from "@/lib/db";
import { EmailService } from "@/lib/email/service";

// -----------------------------------------------------------------------
// SAFE PREDEFINED ACTIONS — only these can be executed by automations.
// Never allow arbitrary code execution.
// -----------------------------------------------------------------------

const SAFE_ACTIONS = {
  CREATE_NOTIFICATION: "CREATE_NOTIFICATION",
  SEND_EMAIL: "SEND_EMAIL",
  CREATE_ACTIVITY: "CREATE_ACTIVITY",
  CREATE_FOLLOWUP: "CREATE_FOLLOWUP",
} as const;

type SafeAction = (typeof SAFE_ACTIONS)[keyof typeof SAFE_ACTIONS];

// Rate-limit: max 10 executions per hour per workflow per entity
const HOURLY_EXECUTION_LIMIT = 10;

export class AutomationEngine {
  static async trigger(triggerEvent: string, payload: Record<string, any>) {
    const workflows = await db.automationWorkflow.findMany({
      where: { triggerType: triggerEvent, isActive: true },
    });

    const executions = [];
    const now = new Date();

    for (const wf of workflows) {
      const entityId = payload.entityId || "global";
      const dedupKey = `${wf.id}_${entityId}`;

      // ── Deduplication: skip if already executed for this entity ──
      const existing = await db.automationExecution.findFirst({
        where: { dedupKey },
      });
      if (existing) continue;

      // ── Rate-limit: max 10 executions/hour per workflow ──────────
      const hourlyCount = await db.automationExecution.count({
        where: {
          automationId: wf.id,
          executedAt: { gte: new Date(now.getTime() - 60 * 60_000) },
        },
      });
      if (hourlyCount >= HOURLY_EXECUTION_LIMIT) {
        console.warn(`[AutomationEngine] Rate limit hit for workflow ${wf.id} (${hourlyCount}/hr)`);
        continue;
      }

      try {
        const actions: SafeAction[] = Array.isArray(wf.actions)
          ? (wf.actions as SafeAction[])
          : [SAFE_ACTIONS.CREATE_NOTIFICATION];

        const results: Record<string, any> = {};

        for (const action of actions) {
          switch (action) {
            // ── Create an in-app notification ──────────────────────────
            case SAFE_ACTIONS.CREATE_NOTIFICATION: {
              if (payload.userId && payload.title) {
                const { NotificationService } = await import("@/lib/events/bus");
                const notif = await NotificationService.create({
                  userId: payload.userId,
                  type: `AUTOMATION::${triggerEvent}`,
                  title: `[Auto] ${payload.title}`,
                  message: payload.message || "Automated workflow executed.",
                  entityType: payload.entityType,
                  entityId: payload.entityId,
                  priority: "NORMAL",
                  dedupKey: `AUTOMATION::${wf.id}::${entityId}`,
                });
                results.notification = notif?.id;
              }
              break;
            }

            // ── Send an email via EmailService ─────────────────────────
            case SAFE_ACTIONS.SEND_EMAIL: {
              const emailTarget = payload.email || payload.actorEmail;
              const templateKey =
                (wf.conditions as any)?.emailTemplateKey ||
                payload.templateKey ||
                "WELCOME_EMAIL";

              if (emailTarget && templateKey) {
                const log = await EmailService.send({
                  to: emailTarget,
                  templateKey,
                  variables: {
                    name: payload.actorName || "Team Member",
                    title: payload.title || triggerEvent,
                    message: payload.message || "",
                  },
                });
                results.emailLogId = log.id;
              }
              break;
            }

            // ── Log an activity record ─────────────────────────────────
            case SAFE_ACTIONS.CREATE_ACTIVITY: {
              const { ActivityService } = await import("@/lib/events/bus");
              const activity = await ActivityService.log({
                actorId: payload.actorId,
                action: `AUTOMATION::${triggerEvent}`,
                entityType: payload.entityType || "SYSTEM",
                entityId: payload.entityId,
                summary: payload.message || payload.title || `Workflow "${wf.name}" executed.`,
                metadata: { workflowId: wf.id, triggerEvent },
              });
              results.activityId = activity.id;
              break;
            }

            // ── Create a CRM follow-up ─────────────────────────────────
            case SAFE_ACTIONS.CREATE_FOLLOWUP: {
              const leadId = payload.leadId || payload.entityId;
              const assignedToId = payload.assignedToId || payload.userId;
              if (leadId && assignedToId) {
                const fu = await db.followUp.create({
                  data: {
                    leadId,
                    assignedToId,
                    notes: payload.followUpSubject || `Follow-up triggered by ${triggerEvent}`,
                    dueAt: new Date(Date.now() + 24 * 60 * 60_000), // 24h from now
                    status: "UPCOMING",
                    type: "GENERAL",
                  },
                });
                results.followUpId = fu.id;
              }
              break;
            }

            default:
              console.warn(`[AutomationEngine] Skipped unsafe action: ${action}`);
          }
        }

        const exec = await db.automationExecution.create({
          data: {
            automationId: wf.id,
            triggerEvent,
            status: "SUCCESS",
            dedupKey,
            result: { executed: true, timestamp: now, results },
          },
        });
        executions.push(exec);
      } catch (err: any) {
        await db.automationExecution.create({
          data: {
            automationId: wf.id,
            triggerEvent,
            status: "FAILED",
            dedupKey,
            result: { error: err.message },
          },
        });
      }
    }
    return executions;
  }
}
