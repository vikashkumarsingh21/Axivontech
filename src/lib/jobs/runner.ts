import { db } from "@/lib/db";

export class JobRunner {
  static async enqueue(jobType: string, payload?: any, scheduledAt?: Date) {
    return db.backgroundJob.create({
      data: {
        jobType,
        payload: payload || null,
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
        // Execute job based on jobType
        await db.backgroundJob.update({
          where: { id: job.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        results.push({ id: job.id, status: "COMPLETED" });
      } catch (err: any) {
        const isFailed = job.attempts + 1 >= job.maxAttempts;
        await db.backgroundJob.update({
          where: { id: job.id },
          data: {
            status: isFailed ? "FAILED" : "PENDING",
            error: err.message,
          },
        });
        results.push({ id: job.id, status: isFailed ? "FAILED" : "RETRY" });
      }
    }
    return results;
  }
}
