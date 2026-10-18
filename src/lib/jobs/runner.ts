import { db } from "@/lib/db";
import { cleanupInactiveUsers } from "./cleanup-inactive-users";
import { Prisma } from "@prisma/client";

export class JobRunner {
  static async enqueue(jobType: string, payload?: unknown, scheduledAt?: Date) {
    return db.backgroundJob.create({
      data: {
        jobType,
        payload: (payload as Prisma.InputJsonValue) ?? Prisma.JsonNull,
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
      orderBy: { scheduledAt: "asc" },
      take: 20,
    });

    const results = [];
    for (const job of pendingJobs) {
      await db.backgroundJob.update({
        where: { id: job.id },
        data: { status: "PROCESSING", startedAt: new Date(), attempts: job.attempts + 1 },
      });

      try {
        switch (job.jobType) {
          // ─── Existing ──────────────────────────────────────────────────
          case "INACTIVE_USER_CLEANUP":
            await cleanupInactiveUsers();
            break;

          // ─── Phase 6: Email retry ───────────────────────────────────────
          case "EMAIL_RETRY": {
            const p = job.payload as any;
            if (p?.to && p?.templateKey) {
              const { EmailService } = await import("@/lib/email/service");
              await EmailService.send({
                to: p.to,
                templateKey: p.templateKey,
                variables: p.variables,
                metadata: { ...p.metadata, retried: true },
              });
            }
            break;
          }

          // ─── Phase 6: Reminder check ────────────────────────────────────
          case "REMINDER_CHECK": {
            const now = new Date();
            const upcomingReminders = await db.reminder.findMany({
              where: {
                dueAt: { gte: now, lte: new Date(now.getTime() + 60 * 60_000) },
                status: "PENDING",
              },
              include: { user: true },
            });

            for (const reminder of upcomingReminders) {
              try {
                const { NotificationService } = await import("@/lib/events/bus");
                await NotificationService.create({
                  userId: reminder.userId,
                  type: "REMINDER",
                  title: `Reminder: ${reminder.title}`,
                  message: reminder.description || reminder.title,
                  entityType: "REMINDER",
                  entityId: reminder.id,
                  dedupKey: `REMINDER::${reminder.id}::${now.toISOString().slice(0, 13)}`,
                });
              } catch (e: unknown) {
                console.error(`[JobRunner] REMINDER_CHECK failed for ${reminder.id}:`, (e as Error).message);
              }
            }
            break;
          }

          // ─── Phase 6: Publish scheduled announcements ───────────────────
          case "ANNOUNCEMENT_PUBLISH": {
            const now = new Date();
            const toPublish = await db.announcement.findMany({
              where: {
                status: "SCHEDULED",
                publishAt: { lte: now },
              },
            });

            for (const ann of toPublish) {
              await db.announcement.update({
                where: { id: ann.id },
                data: { status: "PUBLISHED" },
              });
            }

            // Expire overdue announcements
            await db.announcement.updateMany({
              where: {
                status: "PUBLISHED",
                expiresAt: { not: null, lte: now },
              },
              data: { status: "EXPIRED" },
            });
            break;
          }

          // ─── Phase 6: Follow-up reminders ───────────────────────────────
          case "FOLLOWUP_REMINDER": {
            const now = new Date();
            const overdueFollowUps = await db.followUp.findMany({
              where: {
                dueAt: { lte: now },
                status: { in: ["UPCOMING", "DUE"] },
              },
              include: { assignedTo: true, lead: true },
            });

            for (const fu of overdueFollowUps) {
              if (!fu.assignedToId) continue;
              try {
                const { NotificationService } = await import("@/lib/events/bus");
                await NotificationService.create({
                  userId: fu.assignedToId,
                  type: "FOLLOW_UP_DUE",
                  title: `Follow-up Due: ${fu.type}`,
                  message: fu.lead
                    ? `Follow-up with ${fu.lead.name} is due.`
                    : "Your scheduled follow-up is now due.",
                  entityType: "FOLLOW_UP",
                  entityId: fu.id,
                  priority: "HIGH",
                  dedupKey: `FOLLOWUP::${fu.id}::${now.toISOString().slice(0, 10)}`,
                });
              } catch (e: unknown) {
                console.error(`[JobRunner] FOLLOWUP_REMINDER failed for ${fu.id}:`, (e as Error).message);
              }
            }
            break;
          }

          // ─── Attendance: EOD Incomplete Hours Reconciliation & Alerts ───
          case "ATTENDANCE_CUTOFF_CHECK": {
            const p = job.payload as any;
            const targetDate = p?.date ? new Date(p.date) : new Date();
            const { AttendanceService } = await import("@/lib/services/attendance.service");
            await AttendanceService.processCutoffAlerts(targetDate);
            break;
          }

          // ─── Task Deadline Reminders ────────────────────────────────────
          case "TASK_DEADLINE_CHECK": {
            const now = new Date();
            const next24h = new Date(now.getTime() + 24 * 60 * 60_000);
            const dueTasks = await db.task.findMany({
              where: {
                dueDate: { gte: now, lte: next24h },
                status: { in: ["TODO", "IN_PROGRESS", "BLOCKED"] },
              },
              include: { user: true, project: true },
            });

            for (const task of dueTasks) {
              if (!task.userId) continue;
              try {
                const { NotificationService } = await import("@/lib/events/bus");
                await NotificationService.create({
                  userId: task.userId,
                  type: "TASK_DEADLINE_APPROACHING",
                  title: `Task Due Soon: ${task.title}`,
                  message: `Task "${task.title}" is due on ${task.dueDate?.toLocaleDateString() || "today"}.`,
                  link: "/employee/tasks",
                  entityType: "TASK",
                  entityId: task.id,
                  priority: "HIGH",
                  dedupKey: `TASK_DUE::${task.id}::${now.toISOString().slice(0, 10)}`,
                });
              } catch (e: unknown) {
                console.error(`[JobRunner] TASK_DEADLINE_CHECK failed for task ${task.id}:`, (e as Error).message);
              }
            }
            break;
          }

          // ─── Milestone Deadline Reminders ────────────────────────────────
          case "MILESTONE_DEADLINE_CHECK": {
            const now = new Date();
            const next48h = new Date(now.getTime() + 48 * 60 * 60_000);
            const dueMilestones = await db.partnerProjectMilestone.findMany({
              where: {
                targetDate: { gte: now, lte: next48h },
                status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
              },
              include: { partnerProject: true },
            });

            for (const m of dueMilestones) {
              try {
                const members = await db.partnerProjectMember.findMany({
                  where: { partnerProjectId: m.partnerProjectId },
                });
                const { NotificationService } = await import("@/lib/events/bus");
                for (const member of members) {
                  await NotificationService.create({
                    userId: member.userId,
                    type: "MILESTONE_DEADLINE_APPROACHING",
                    title: `Milestone Due Soon: ${m.title}`,
                    message: `Milestone "${m.title}" for ${m.partnerProject?.projectName || "project"} is due on ${m.targetDate?.toLocaleDateString() || "soon"}.`,
                    link: `/client/projects/${m.partnerProjectId}`,
                    entityType: "MILESTONE",
                    entityId: m.id,
                    priority: "HIGH",
                    dedupKey: `MILESTONE_DUE::${m.id}::${member.userId}::${now.toISOString().slice(0, 10)}`,
                  });
                }
              } catch (e: unknown) {
                console.error(`[JobRunner] MILESTONE_DEADLINE_CHECK failed for milestone ${m.id}:`, (e as Error).message);
              }
            }
            break;
          }

          default:
            console.warn(`[JobRunner] Unknown job type: ${job.jobType}`);
        }

        await db.backgroundJob.update({
          where: { id: job.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        results.push({ id: job.id, status: "COMPLETED", jobType: job.jobType });
      } catch (err: unknown) {
        const isFailed = job.attempts + 1 >= job.maxAttempts;
        const msg = err instanceof Error ? (err as Error).message : String(err);
        await db.backgroundJob.update({
          where: { id: job.id },
          data: {
            status: isFailed ? "FAILED" : "PENDING",
            error: msg,
            scheduledAt: isFailed ? undefined : new Date(Date.now() + 2 * 60_000),
          },
        });
        results.push({ id: job.id, status: isFailed ? "FAILED" : "RETRY", jobType: job.jobType, error: msg });
      }
    }
    return results;
  }
}
