import { db } from "@/lib/db";
import { EmailService } from "@/lib/email/service";

export class AutomationEngine {
  static async trigger(triggerEvent: string, payload: Record<string, any>) {
    const workflows = await db.automationWorkflow.findMany({
      where: { triggerType: triggerEvent, isActive: true },
    });

    const executions = [];
    for (const wf of workflows) {
      const dedupKey = `${wf.id}_${payload.entityId || Date.now()}`;
      const existing = await db.automationExecution.findFirst({ where: { dedupKey } });
      if (existing) continue;

      try {
        // Execute actions
        if (payload.userId && payload.title) {
          await db.notification.create({
            data: {
              userId: payload.userId,
              type: "SYSTEM_ALERT",
              title: `[Automation] ${payload.title}`,
              message: payload.message || "Automated trigger executed.",
            },
          });
        }

        const exec = await db.automationExecution.create({
          data: {
            automationId: wf.id,
            triggerEvent,
            status: "SUCCESS",
            dedupKey,
            result: { executed: true, timestamp: new Date() },
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
