import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);
    const reports = await db.workReport.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, reports });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);
    const {
      date,
      summary,
      tasksCompleted,
      workPerformed,
      challenges,
      nextSteps,
      hoursWorked,
    } = await req.json();

    if (!summary?.trim() || !workPerformed?.trim()) {
      throw new ApiError(400, "Summary and detailed work performed are required");
    }

    const reportDate = date ? new Date(date) : new Date();
    reportDate.setHours(0, 0, 0, 0);

    const defaultHours = user.requiredDailyMinutes
      ? Math.round(user.requiredDailyMinutes / 60)
      : 8;
    const finalHours =
      hoursWorked !== undefined && hoursWorked !== null
        ? Number(hoursWorked)
        : defaultHours;

    const report = await db.workReport.upsert({
      where: { userId_date: { userId: user.id, date: reportDate } },
      update: {
        summary: summary.trim(),
        tasksCompleted: tasksCompleted?.trim() || null,
        workPerformed: workPerformed.trim(),
        challenges: challenges?.trim() || null,
        nextSteps: nextSteps?.trim() || null,
        hoursWorked: finalHours,
        status: "SUBMITTED",
      },
      create: {
        userId: user.id,
        date: reportDate,
        summary: summary.trim(),
        tasksCompleted: tasksCompleted?.trim() || null,
        workPerformed: workPerformed.trim(),
        challenges: challenges?.trim() || null,
        nextSteps: nextSteps?.trim() || null,
        hoursWorked: finalHours,
        status: "SUBMITTED",
      },
    });

    // Emit platform event to notify supervisors & trigger automations
    try {
      const { EventBus } = await import("@/lib/events/bus");
      await EventBus.emit({
        eventType: "WORK_REPORT_SUBMITTED",
        actorId: user.id,
        entityType: "WORK_REPORT",
        entityId: report.id,
        title: `Work Report: ${user.name}`,
        message: `${user.name} submitted work report for ${reportDate.toLocaleDateString()}. Summary: ${summary.slice(0, 100)}`,
        metadata: { date: reportDate, hoursWorked: report.hoursWorked, reportId: report.id },
      });
    } catch (eventBusErr) {
      console.error("[EventBus] Work report submitted emission failed:", eventBusErr);
    }

    return NextResponse.json({ success: true, report });
  } catch (e) {
    return handleApiError(e);
  }
}
