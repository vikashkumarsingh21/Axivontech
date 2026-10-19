import { db } from "@/lib/db";
import { WorkflowOrchestrator } from "./orchestrator";
import { ACTION_REGISTRY } from "./action-registry";

const LEASE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes lease duration

export class PersistentScheduler {
  /**
   * Enqueues a scheduled background job into the persistent database table
   */
  static async scheduleJob(opts: {
    jobType: string;
    payload: Record<string, any>;
    scheduledAt?: Date;
    maxAttempts?: number;
  }) {
    const { jobType, payload, scheduledAt = new Date(), maxAttempts = 3 } = opts;

    return db.backgroundJob.create({
      data: {
        jobType,
        status: "PENDING",
        payload,
        scheduledAt,
        maxAttempts,
        attempts: 0,
      },
    });
  }

  /**
   * Processes all due background jobs with atomic claiming and lease protection
   */
  static async processDueJobs(batchSize = 10): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
    recovered: number;
  }> {
    const now = new Date();
    let succeeded = 0;
    let failed = 0;
    let recovered = 0;

    // 1. Recover abandoned or expired leases (stuck in PROCESSING > 15 min)
    const expiredCutoff = new Date(now.getTime() - LEASE_TIMEOUT_MS);
    const expiredJobs = await db.backgroundJob.findMany({
      where: {
        status: "PROCESSING",
        startedAt: { lte: expiredCutoff },
      },
      take: 20,
    });

    for (const ej of expiredJobs) {
      await db.backgroundJob.update({
        where: { id: ej.id },
        data: {
          status: "PENDING",
          startedAt: null,
          error: "Lease timeout expired. Recovered for retry.",
        },
      });
      recovered++;
    }

    // 2. Query due pending jobs
    const dueJobs = await db.backgroundJob.findMany({
      where: {
        status: "PENDING",
        scheduledAt: { lte: now },
      },
      orderBy: { scheduledAt: "asc" },
      take: batchSize,
    });

    for (const job of dueJobs) {
      // 3. Atomic Claiming: update status to PROCESSING
      const claim = await db.backgroundJob.updateMany({
        where: {
          id: job.id,
          status: "PENDING",
        },
        data: {
          status: "PROCESSING",
          startedAt: now,
          attempts: { increment: 1 },
        },
      });

      // If another worker claimed it in the race, skip
      if (claim.count === 0) continue;

      try {
        const payload = (job.payload as Record<string, any>) || {};

        // Dispatch based on job type
        if (job.jobType.startsWith("WORKFLOW_TRIGGER::")) {
          const triggerEvent = job.jobType.replace("WORKFLOW_TRIGGER::", "");
          await WorkflowOrchestrator.dispatchTrigger(triggerEvent, payload);
        } else if (job.jobType === "PERIODIC_BI_SNAPSHOT") {
          await ACTION_REGISTRY.GENERATE_BI_REPORT.execute(payload, {
            workflowId: "system_cron",
            workflowName: "Periodic BI Snapshot",
            triggerEvent: "SCHEDULE_DAILY",
          });
        } else if (job.jobType === "CHECK_OVERDUE_TASKS") {
          await this.scanOverdueTasks();
        } else if (job.jobType === "CHECK_STALE_LEADS") {
          await this.scanStaleLeads();
        }

        // Mark as completed
        await db.backgroundJob.update({
          where: { id: job.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            error: null,
          },
        });
        succeeded++;
      } catch (err: any) {
        failed++;
        const currentAttempts = job.attempts + 1;
        const hasMoreAttempts = currentAttempts < job.maxAttempts;

        if (hasMoreAttempts) {
          // Exponential backoff retry: 2^attempt * 60 seconds
          const delayMs = Math.pow(2, currentAttempts) * 60 * 1000;
          const nextScheduledAt = new Date(Date.now() + delayMs);

          await db.backgroundJob.update({
            where: { id: job.id },
            data: {
              status: "PENDING",
              scheduledAt: nextScheduledAt,
              error: `Attempt ${currentAttempts} failed: ${err.message}`,
            },
          });
        } else {
          // Terminal failure
          await db.backgroundJob.update({
            where: { id: job.id },
            data: {
              status: "FAILED",
              completedAt: new Date(),
              error: `Max attempts reached (${job.maxAttempts}). Terminal error: ${err.message}`,
            },
          });

          // Alert administrator on terminal job failure
          await ACTION_REGISTRY.ALERT_ADMIN_FAILURE.execute(
            {
              errorMessage: `Background job ${job.id} (${job.jobType}) exceeded max retries.`,
              failedWorkflowName: job.jobType,
              executionId: job.id,
            },
            {
              workflowId: "scheduler_terminal",
              workflowName: "Scheduler Watchdog",
              triggerEvent: "JOB_FAILED",
            }
          );
        }
      }
    }

    return {
      processed: dueJobs.length,
      succeeded,
      failed,
      recovered,
    };
  }

  /**
   * System scanner: detects tasks that passed their deadline and triggers TASK_OVERDUE event
   */
  private static async scanOverdueTasks() {
    const overdue = await db.task.findMany({
      where: {
        status: { in: ["TODO", "IN_PROGRESS"] },
        dueDate: { lt: new Date() },
      },
      select: { id: true, title: true, priority: true, dueDate: true, userId: true },
      take: 20,
    });

    for (const t of overdue) {
      await WorkflowOrchestrator.dispatchTrigger("TASK_OVERDUE", {
        entityId: t.id,
        entityType: "TASK",
        userId: t.userId,
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString(),
      });
    }
  }

  /**
   * System scanner: detects uncontacted leads older than 48 hours
   */
  private static async scanStaleLeads() {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const staleLeads = await db.lead.findMany({
      where: {
        status: "NEW",
        createdAt: { lte: cutoff },
      },
      select: { id: true, leadCode: true, name: true, ownerId: true, createdAt: true },
      take: 20,
    });

    for (const l of staleLeads) {
      await WorkflowOrchestrator.dispatchTrigger("STALE_LEAD_DETECTED", {
        entityId: l.id,
        entityType: "LEAD",
        leadId: l.id,
        leadCode: l.leadCode,
        name: l.name,
        assignedToId: l.ownerId,
        createdAt: l.createdAt.toISOString(),
      });
    }
  }
}
