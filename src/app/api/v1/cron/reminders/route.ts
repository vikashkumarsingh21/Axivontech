import { NextRequest, NextResponse } from "next/server";
import {
  runAttendanceReminders,
  runWorkReportReminders,
  runTaskDeadlineReminders,
} from "@/lib/notifications/reminders";

export const dynamic = "force-dynamic";

/**
 * Axivon Technologies — Central Automated Reminder Engine Cron Endpoint
 *
 * Runs scheduled checks for:
 * 1. Morning Attendance Check-In Reminders & Cutoff Manager Alerts
 * 2. Daily Work Report Pre-Deadline & Overdue Reminders
 * 3. Task Approaching, Due Today, and Overdue Deadlines
 *
 * Parameters:
 * - ?type=all|attendance|work_report|tasks
 * - ?dryRun=true (simulates without dispatching)
 * - ?now=2026-11-05T10:05:00Z (timestamp override for testing)
 */
async function handleRemindersCron(req: NextRequest) {
  try {
    // 1. Authorization Check
    const authHeader = req.headers.get("authorization");
    const cronSecretHeader = req.headers.get("x-cron-secret");
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get("secret");

    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret) {
      const isAuthorized =
        cronSecretHeader === expectedSecret ||
        querySecret === expectedSecret ||
        authHeader === `Bearer ${expectedSecret}`;

      if (!isAuthorized) {
        return NextResponse.json(
          { success: false, error: "Unauthorized cron execution request" },
          { status: 401 }
        );
      }
    }

    // 2. Parse Options
    const type = searchParams.get("type") || "all";
    const dryRun = searchParams.get("dryRun") === "true";
    const nowParam = searchParams.get("now");
    const now = nowParam ? new Date(nowParam) : new Date();

    if (isNaN(now.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid 'now' ISO timestamp parameter" },
        { status: 400 }
      );
    }

    const report: Record<string, any> = {
      timestamp: now.toISOString(),
      dryRun,
      type,
    };

    // 3. Execute Reminders
    if (type === "all" || type === "attendance") {
      report.attendance = await runAttendanceReminders({ now, dryRun });
    }

    if (type === "all" || type === "work_report") {
      report.workReport = await runWorkReportReminders({ now, dryRun });
    }

    if (type === "all" || type === "tasks") {
      report.tasks = await runTaskDeadlineReminders({ now, dryRun });
    }

    return NextResponse.json({
      success: true,
      message: "Automated reminder engine completed successfully",
      report,
    });
  } catch (error: any) {
    console.error("[CronReminders] Execution failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRemindersCron(req);
}

export async function POST(req: NextRequest) {
  return handleRemindersCron(req);
}
