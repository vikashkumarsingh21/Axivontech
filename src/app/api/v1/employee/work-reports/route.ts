import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  requireEmployee,
  checkIdempotency,
  getCompanyDateString,
  getCompanyCalendarDate,
  getPlatformAdmins,
} from "@/lib/api/foundation";

const createWorkReportSchema = z.object({
  date: z.string().optional().nullable(),
  summary: z
    .string()
    .trim()
    .min(5, "Summary must be at least 5 characters")
    .max(500, "Summary cannot exceed 500 characters"),
  workPerformed: z
    .string()
    .trim()
    .min(10, "Detailed work performed must be at least 10 characters")
    .max(5000, "Work performed cannot exceed 5000 characters"),
  tasksCompleted: z.string().trim().max(2000).optional().nullable(),
  challenges: z.string().trim().max(1000).optional().nullable(),
  nextSteps: z.string().trim().max(1000).optional().nullable(),
  hoursWorked: z.coerce
    .number()
    .min(0.1, "Hours worked must be at least 0.1")
    .max(24, "Hours worked cannot exceed 24 hours in a single day"),
  status: z.enum(["DRAFT", "SUBMITTED"]).optional().default("SUBMITTED"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const { searchParams } = new URL(req.url);

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const monthParam = searchParams.get("month"); // YYYY-MM

    const where: any = { userId: user.id };

    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      if (year && month) {
        const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
        const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));
        where.date = { gte: startOfMonth, lte: endOfMonth };
      }
    } else if (startDateParam || endDateParam) {
      where.date = {};
      if (startDateParam) where.date.gte = new Date(startDateParam);
      if (endDateParam) where.date.lte = new Date(endDateParam);
    }

    const reports = await db.workReport.findMany({
      where,
      orderBy: { date: "desc" },
    });

    // Compute monthly metrics & consecutive submission streak
    const todayStr = getCompanyDateString();
    const currentMonthPrefix = todayStr.slice(0, 7); // YYYY-MM

    const thisMonthReports = reports.filter((r) =>
      r.date.toISOString().startsWith(currentMonthPrefix)
    );

    const totalHoursThisMonth = thisMonthReports.reduce(
      (sum, r) => sum + (r.hoursWorked || 0),
      0
    );

    // Compute active consecutive reporting streak (consecutive workdays)
    let streak = 0;
    const sortedAll = await db.workReport.findMany({
      where: { userId: user.id, status: "SUBMITTED" },
      select: { date: true },
      orderBy: { date: "desc" },
      take: 60,
    });

    const reportDateStrings = new Set(
      sortedAll.map((r) => r.date.toISOString().split("T")[0])
    );

    let checkDate = new Date(todayStr);
    // If user hasn't submitted today yet, check starting from yesterday
    if (!reportDateStrings.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      // Skip weekends in streak evaluation
      const dayOfWeek = checkDate.getUTCDay(); // 0 is Sunday, 6 is Saturday
      const checkStr = checkDate.toISOString().split("T")[0];

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend day, just step back without breaking streak
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }

      if (reportDateStrings.has(checkStr)) {
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      reports,
      meta: {
        streak,
        totalReportsThisMonth: thisMonthReports.length,
        totalHoursThisMonth: Math.round(totalHoursThisMonth * 10) / 10,
        todayReportSubmitted: reportDateStrings.has(todayStr),
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const parsed = createWorkReportSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid work report data",
        "VALIDATION_ERROR"
      );
    }

    const {
      date,
      summary,
      workPerformed,
      tasksCompleted,
      challenges,
      nextSteps,
      hoursWorked,
      status,
    } = parsed.data;

    // Date resolution
    const today = getCompanyCalendarDate();

    const reportDate = date ? new Date(date) : today;
    if (isNaN(reportDate.getTime())) {
      throw new ApiError(400, "Invalid date format");
    }
    reportDate.setHours(0, 0, 0, 0);

    // Validation: Cannot submit for future dates
    if (reportDate > today) {
      throw new ApiError(400, "Cannot submit a work report for a future date");
    }

    // Validation: Cannot submit for dates older than 14 days
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    if (reportDate < fourteenDaysAgo) {
      throw new ApiError(
        400,
        "Cannot submit or modify work reports older than 14 days without supervisor approval"
      );
    }

    // Double submit protection
    const idempotencyKey = `work-report:${user.id}:${reportDate.toISOString().split("T")[0]}`;
    checkIdempotency(idempotencyKey, 3000);

    // Check if an existing report exists and whether it is within the 48-hour edit window
    const existing = await db.workReport.findUnique({
      where: { userId_date: { userId: user.id, date: reportDate } },
    });

    if (existing) {
      const hoursSinceCreation =
        (Date.now() - new Date(existing.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation > 48) {
        throw new ApiError(
          400,
          "This work report was submitted over 48 hours ago and is now locked for editing. Please contact your manager."
        );
      }
    }

    const report = await db.workReport.upsert({
      where: { userId_date: { userId: user.id, date: reportDate } },
      update: {
        summary,
        workPerformed,
        tasksCompleted: tasksCompleted || null,
        challenges: challenges || null,
        nextSteps: nextSteps || null,
        hoursWorked,
        status,
      },
      create: {
        userId: user.id,
        date: reportDate,
        summary,
        workPerformed,
        tasksCompleted: tasksCompleted || null,
        challenges: challenges || null,
        nextSteps: nextSteps || null,
        hoursWorked,
        status,
      },
    });

    // Notify admins / platform event
    if (status === "SUBMITTED") {
      try {
        const admins = await getPlatformAdmins();

        if (admins.length > 0) {
          await db.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.id,
              type: "WORK_REPORT_SUBMITTED",
              title: `Daily Work Report: ${user.name}`,
              message: `${user.name} logged ${hoursWorked} hours for ${reportDate.toLocaleDateString()}. Summary: ${summary.slice(0, 100)}`,
              link: "/admin/work-reports",
            })),
          });
        }

        const { EventBus } = await import("@/lib/events/bus").catch(() => ({ EventBus: null }));
        if (EventBus) {
          await EventBus.emit({
            eventType: "WORK_REPORT_SUBMITTED",
            actorId: user.id,
            entityType: "WORK_REPORT",
            entityId: report.id,
            title: `Work Report: ${user.name}`,
            message: `${user.name} submitted work report for ${reportDate.toLocaleDateString()}.`,
            metadata: { date: reportDate, hoursWorked, reportId: report.id },
          }).catch(() => {});
        }
      } catch (err) {
        console.error("[WorkReport] Notification emission error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      report,
      message: existing
        ? "Work report updated successfully."
        : "Work report submitted successfully.",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
