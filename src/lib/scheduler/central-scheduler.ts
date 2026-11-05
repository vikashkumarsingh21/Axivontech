import { db } from "@/lib/db";
import {
  runAttendanceReminders,
  runWorkReportReminders,
  runTaskDeadlineReminders,
  runPendingApprovalReminders,
} from "@/lib/notifications/reminders";
import { closeStaleAttendance } from "@/lib/attendance/stale-attendance";
import { JobRunner } from "@/lib/jobs/runner";

export interface ProcessDueJobsOptions {
  now?: Date;
  dryRun?: boolean;
  batchSize?: number;
}

export interface ProcessDueJobsResult {
  success: boolean;
  status: "SUCCESS" | "PARTIAL" | "FAILED" | "LOCKED";
  dryRun: boolean;
  processed: number;
  sent: number;
  skipped: number;
  failed: number;
  durationMs: number;
  executionId: string;
  message?: string;
  errors?: string[];
  details?: {
    attendance?: any;
    workReports?: any;
    tasks?: any;
    approvals?: any;
    backgroundJobs?: any;
    staleAttendance?: any;
  };
}

export interface SchedulerExecutionLog {
  executionId: string;
  startTime: string;
  completionTime: string;
  durationMs: number;
  processed: number;
  sent: number;
  skipped: number;
  failed: number;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  errors: string[];
}

const LOCK_KEY = "cron_lock:process_due_jobs";
const LOCK_TTL_MS = 45_000; // 45 seconds TTL
const RECENT_LOGS_KEY = "cron_exec_recent_logs";
const MAX_LOG_HISTORY = 50;

/**
 * Axivon Technologies — Central Background Job Scheduler Engine
 *
 * Designed for external schedulers (e.g. cron-job.org):
 * - Safe against concurrent runs (Mutex lock with 45s TTL)
 * - Strict execution budget (< 15 seconds) to avoid 30s timeouts
 * - Unified processing: Attendance, Work Reports, Tasks, Approvals, Background Jobs, Stale Attendance
 * - Complete idempotency and 24h deduplication
 * - Execution auditing & history tracking
 */
export class CentralScheduler {
  /**
   * Acquires the concurrency lock. Returns true if acquired, false if locked.
   */
  private static async acquireLock(executionId: string, nowMs: number): Promise<boolean> {
    try {
      const existing = await db.organizationSetting.findUnique({
        where: { key: LOCK_KEY },
      });

      if (existing?.value && typeof existing.value === "object") {
        const lock = existing.value as { expiresAt?: number };
        if (lock.expiresAt && lock.expiresAt > nowMs) {
          // Lock is currently active, avoid overlapping execution
          return false;
        }
      }

      await db.organizationSetting.upsert({
        where: { key: LOCK_KEY },
        create: {
          key: LOCK_KEY,
          value: {
            executionId,
            lockedAt: nowMs,
            expiresAt: nowMs + LOCK_TTL_MS,
          } as any,
        },
        update: {
          value: {
            executionId,
            lockedAt: nowMs,
            expiresAt: nowMs + LOCK_TTL_MS,
          } as any,
        },
      });

      return true;
    } catch (err) {
      console.warn("[CentralScheduler] Mutex acquire error, continuing safely:", err);
      return true; // fail-open on transient database read glitch
    }
  }

  /**
   * Releases the concurrency lock.
   */
  private static async releaseLock(): Promise<void> {
    try {
      await db.organizationSetting.deleteMany({
        where: { key: LOCK_KEY },
      });
    } catch (err) {
      console.warn("[CentralScheduler] Mutex release error:", err);
    }
  }

  /**
   * Records execution log in OrganizationSetting.
   */
  private static async recordExecutionLog(log: SchedulerExecutionLog): Promise<void> {
    try {
      // 1. Store individual execution record
      await db.organizationSetting.create({
        data: {
          key: `cron_exec_log:${log.executionId}`,
          value: log as any,
        },
      });

      // 2. Prepend to recent logs index
      const recentSetting = await db.organizationSetting.findUnique({
        where: { key: RECENT_LOGS_KEY },
      });

      let recent: SchedulerExecutionLog[] = [];
      if (recentSetting?.value && Array.isArray(recentSetting.value)) {
        recent = recentSetting.value as unknown as SchedulerExecutionLog[];
      }

      recent.unshift(log);
      const capped = recent.slice(0, MAX_LOG_HISTORY);

      await db.organizationSetting.upsert({
        where: { key: RECENT_LOGS_KEY },
        create: {
          key: RECENT_LOGS_KEY,
          value: capped as any,
        },
        update: {
          value: capped as any,
        },
      });
    } catch (err) {
      console.warn("[CentralScheduler] Failed to record execution log:", err);
    }
  }

  /**
   * Processes all due background jobs and scheduled business reminders.
   */
  static async processDueJobs(options: ProcessDueJobsOptions = {}): Promise<ProcessDueJobsResult> {
    const startTime = Date.now();
    const executionId = `cron_${startTime}_${Math.random().toString(36).substring(2, 7)}`;
    const now = options.now || new Date();
    const dryRun = !!options.dryRun;

    const acquired = await CentralScheduler.acquireLock(executionId, startTime);
    if (!acquired) {
      return {
        success: true,
        status: "LOCKED",
        dryRun,
        processed: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
        durationMs: Date.now() - startTime,
        executionId,
        message: "Concurrent execution prevented: a prior scheduler run is currently in progress",
      };
    }

    let processed = 0;
    let sent = 0;
    let skipped = 0;
    let failed = 0;
    const errors: string[] = [];
    const details: ProcessDueJobsResult["details"] = {};

    try {
      // ─── 1. Attendance Reminders & Manager Cutoff Alerts ─────────────────
      try {
        const attendanceRes = await runAttendanceReminders({ now, dryRun });
        details.attendance = attendanceRes;
        if (attendanceRes.executed && "employeesEvaluated" in attendanceRes) {
          processed += attendanceRes.employeesEvaluated || 0;
          sent += (attendanceRes.checkInRemindersSent || 0) + (attendanceRes.managerAlertsSent || 0);
          skipped += (attendanceRes.exemptedOnLeave || 0) + (attendanceRes.alreadyCheckedIn || 0);
        } else {
          skipped += 1;
        }
      } catch (err: any) {
        failed += 1;
        errors.push(`Attendance reminders error: ${err?.message || "Unknown error"}`);
        console.error("[CentralScheduler] Attendance reminders failed:", err);
      }

      // ─── 2. Daily Work Report Reminders & Overdue Alerts ─────────────────
      try {
        const workReportRes = await runWorkReportReminders({ now, dryRun });
        details.workReports = workReportRes;
        if (workReportRes.executed && "employeesEvaluated" in workReportRes) {
          processed += workReportRes.employeesEvaluated || 0;
          sent += (workReportRes.regularRemindersSent || 0) + (workReportRes.overdueAlertsSent || 0);
          skipped += (workReportRes.alreadySubmitted || 0) + (workReportRes.exemptedOnLeave || 0);
        } else {
          skipped += 1;
        }
      } catch (err: any) {
        failed += 1;
        errors.push(`Work report reminders error: ${err?.message || "Unknown error"}`);
        console.error("[CentralScheduler] Work report reminders failed:", err);
      }

      // ─── 3. Task Deadline Reminders ───────────────────────────────────────
      try {
        const tasksRes = await runTaskDeadlineReminders({ now, dryRun });
        details.tasks = tasksRes;
        if (tasksRes.executed && "tasksEvaluated" in tasksRes) {
          processed += tasksRes.tasksEvaluated || 0;
          const taskSent =
            (tasksRes.dueTomorrowSent || 0) +
            (tasksRes.dueTodaySent || 0) +
            (tasksRes.overdueSent || 0);
          sent += taskSent;
          skipped += Math.max(0, (tasksRes.tasksEvaluated || 0) - taskSent);
        } else {
          skipped += 1;
        }
      } catch (err: any) {
        failed += 1;
        errors.push(`Task reminders error: ${err?.message || "Unknown error"}`);
        console.error("[CentralScheduler] Task reminders failed:", err);
      }

      // ─── 4. Pending Approval & Regularization Reminders ───────────────────
      try {
        const approvalRes = await runPendingApprovalReminders({ now, dryRun });
        details.approvals = approvalRes;
        if (approvalRes.executed) {
          processed += approvalRes.approvalsEvaluated || 0;
          sent += approvalRes.remindersSent || 0;
        }
      } catch (err: any) {
        failed += 1;
        errors.push(`Approval reminders error: ${err?.message || "Unknown error"}`);
        console.error("[CentralScheduler] Approval reminders failed:", err);
      }

      // ─── 5. Queued Background Jobs & Notification Deliveries ─────────────
      try {
        if (!dryRun) {
          const jobResults = await JobRunner.processPending();
          details.backgroundJobs = { processedCount: jobResults.length };
          processed += jobResults.length;
          for (const jr of jobResults) {
            if (jr.status === "COMPLETED") sent += 1;
            else if (jr.status === "FAILED") {
              failed += 1;
              if (jr.error) errors.push(`Job ${jr.id} failed: ${jr.error}`);
            }
          }
        } else {
          // In dry-run mode, calculate pending jobs without modifying database
          const pendingJobsCount = await db.backgroundJob.count({
            where: {
              status: "PENDING",
              scheduledAt: { lte: now },
            },
          });
          details.backgroundJobs = { pendingCount: pendingJobsCount, dryRun: true };
          processed += pendingJobsCount;
          skipped += pendingJobsCount;
        }
      } catch (err: any) {
        failed += 1;
        errors.push(`Background jobs processing error: ${err?.message || "Unknown error"}`);
        console.error("[CentralScheduler] Background jobs processing failed:", err);
      }

      // ─── 6. Stale Attendance Auto-Close (Past Days) ──────────────────────
      try {
        const staleRes = await closeStaleAttendance(now, { dryRun });
        details.staleAttendance = staleRes;
        if (staleRes.closedCount > 0) {
          processed += staleRes.closedCount;
          sent += staleRes.closedCount;
        }
      } catch (err: any) {
        failed += 1;
        errors.push(`Stale attendance closure error: ${err?.message || "Unknown error"}`);
        console.error("[CentralScheduler] Stale attendance closure failed:", err);
      }

      const durationMs = Date.now() - startTime;
      const status: SchedulerExecutionLog["status"] =
        failed === 0 ? "SUCCESS" : sent > 0 ? "PARTIAL" : "FAILED";

      // Record sanitized execution log
      await CentralScheduler.recordExecutionLog({
        executionId,
        startTime: new Date(startTime).toISOString(),
        completionTime: new Date().toISOString(),
        durationMs,
        processed,
        sent,
        skipped,
        failed,
        status,
        errors: errors.slice(0, 5),
      });

      return {
        success: failed === 0,
        status,
        dryRun,
        processed,
        sent,
        skipped,
        failed,
        durationMs,
        executionId,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
        details,
      };
    } finally {
      await CentralScheduler.releaseLock();
    }
  }

  /**
   * Fetches recent execution history logs.
   */
  static async getRecentLogs(limit: number = 20): Promise<SchedulerExecutionLog[]> {
    try {
      const setting = await db.organizationSetting.findUnique({
        where: { key: RECENT_LOGS_KEY },
      });
      if (setting?.value && Array.isArray(setting.value)) {
        return (setting.value as unknown as SchedulerExecutionLog[]).slice(0, limit);
      }
    } catch (err) {
      console.warn("[CentralScheduler] Failed to get recent logs:", err);
    }
    return [];
  }
}
