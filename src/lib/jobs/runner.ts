import { db } from "@/lib/db";
import { cleanupInactiveUsers } from "./cleanup-inactive-users";

export class JobRunner {
  static async enqueue(jobType: string, payload?: unknown, scheduledAt?: Date) {
    return db.backgroundJob.create({
      data: {
        jobType,
        payload: (payload as Record<string, unknown>) || null,
        scheduledAt: scheduledAt || new Date(),
        status: "PENDING",
      },
    });
  }

  static async processPending() {
    const pendingJobs = await db.backgroundJob.findMany({
      where: {
        status: "PENDING",
        scheduledAt: { lte: new Date() },
      },
      take: 10,
    });

    const results = [];
    for (const job of pendingJobs) {
      await db.backgroundJob.update({
        where: { id: job.id },
        data: { status: "PROCESSING", startedAt: new Date(), attempts: job.attempts + 1 },
      });

      try {
        if (job.jobType === "INACTIVE_USER_CLEANUP") {
          await cleanupInactiveUsers();
        }

        await db.backgroundJob.update({
          where: { id: job.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        results.push({ id: job.id, status: "COMPLETED" });
      } catch (err: unknown) {
        const isFailed = job.attempts + 1 >= job.maxAttempts;
        const msg = err instanceof Error ? err.message : String(err);
        await db.backgroundJob.update({
          where: { id: job.id },
          data: {
            status: isFailed ? "FAILED" : "PENDING",
            error: msg,
          },
        });
        results.push({ id: job.id, status: isFailed ? "FAILED" : "RETRY" });
      }
    }
    return results;
  }
}
