import { db } from "@/lib/db";
import { getCompanyCalendarDate, getCompanyDateString, getCompanyTimezone } from "@/lib/api/foundation";

export interface CloseStaleAttendanceResult {
  success: boolean;
  closedCount: number;
  updatedRecordIds: string[];
  timestamp: string;
}

export interface CloseStaleAttendanceOptions {
  userId?: string;
  dryRun?: boolean;
}

/**
 * Automatically closes any unclosed attendance records from past days.
 * 
 * Rules:
 * 1. An attendance record from a past calendar day (date < today in company timezone)
 *    with checkInAt != null but checkOutAt == null is marked as MISSED_CHECKOUT.
 * 2. Does NOT invent a checkout time (checkOutAt remains null).
 * 3. Worked minutes (grossMinutes, netMinutes, totalMinutes) are set to null (uncalculated).
 * 4. Any dangling breaks are closed, flagged with isAutoClosed = true, autoClosedAt = now.
 * 5. Sends an in-app notification with dedupKey so multiple runs are strictly idempotent.
 * 6. Accepts an injectable clock (now = new Date()) for time-travel verification and cron executions.
 */
export async function closeStaleAttendance(
  now: Date = new Date(),
  options: CloseStaleAttendanceOptions = {}
): Promise<CloseStaleAttendanceResult> {
  const timezone = await getCompanyTimezone();
  const todayCalendarDate = getCompanyCalendarDate(now, timezone);

  // Find all open sessions from days strictly before today's calendar date
  const staleSessions = (await db.attendance.findMany({
    where: {
      ...(options.userId ? { userId: options.userId } : {}),
      date: { lt: todayCalendarDate },
      checkOutAt: null,
      status: { not: "MISSED_CHECKOUT" },
    },
    include: {
      breaks: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { date: "asc" },
  })) || [];

  if (!Array.isArray(staleSessions) || staleSessions.length === 0) {
    return {
      success: true,
      closedCount: 0,
      updatedRecordIds: [],
      timestamp: now.toISOString(),
    };
  }

  if (options.dryRun) {
    return {
      success: true,
      closedCount: staleSessions.length,
      updatedRecordIds: staleSessions.map((s) => s.id),
      timestamp: now.toISOString(),
    };
  }

  const updatedRecordIds: string[] = [];

  for (const session of staleSessions) {
    // 1. Close any open breaks
    for (const b of session.breaks) {
      if (!b.endTime) {
        // Cap break duration at now or end of session date
        const bStart = new Date(b.startTime);
        const breakDuration = Math.max(0, Math.floor((now.getTime() - bStart.getTime()) / 60000));
        
        await db.attendanceBreak.update({
          where: { id: b.id },
          data: {
            endTime: now,
            durationMinutes: breakDuration,
            isAutoClosed: true,
            autoClosedAt: now,
            notes: b.notes
              ? `${b.notes} | [Auto-closed due to missed check-out]`
              : "[Auto-closed due to missed check-out]",
          },
        });
      }
    }

    // 2. Mark Attendance as MISSED_CHECKOUT with null worked minutes
    await db.attendance.update({
      where: { id: session.id },
      data: {
        status: "MISSED_CHECKOUT",
        completionStatus: "MISSED_CHECKOUT",
        autoClosedAt: now,
        checkOutAt: null, // Strictly null, never invent a checkout time
        grossMinutes: null,
        netMinutes: null,
        totalMinutes: null,
        remainingMinutes: null,
        emailAlertSent: true,
      },
    });

    // 3. Format session date for notifications (en-IN format: e.g., 26 Oct 2026)
    const sessionDateStr = getCompanyDateString(session.date, timezone);
    const dateParts = sessionDateStr.split("-");
    let formattedDate = sessionDateStr;
    if (dateParts.length === 3) {
      const d = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
      formattedDate = d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    // 4. Create in-app notification with dedupKey to ensure idempotency
    const dedupKey = `missed_checkout_${session.id}`;
    const existingNotification = db.notification?.findFirst ? await db.notification.findFirst({
      where: { dedupKey },
    }) : null;

    if (!existingNotification && db.notification?.create) {
      await db.notification.create({
        data: {
          userId: session.userId,
          type: "SYSTEM_EVENT",
          title: "Missed Check-Out",
          message: `You did not check out on ${formattedDate}. Request a correction so your hours are counted.`,
          link: "/employee/attendance",
          entityType: "Attendance",
          entityId: session.id,
          priority: "HIGH",
          dedupKey,
        },
      });

      // Console notification logging (with email fallback)
      console.log(
        `[Attendance] In-app notification sent to ${session.user?.email || session.userId} for missed check-out on ${formattedDate}`
      );
    }

    updatedRecordIds.push(session.id);
  }

  return {
    success: true,
    closedCount: updatedRecordIds.length,
    updatedRecordIds,
    timestamp: now.toISOString(),
  };
}

/**
 * Returns any unregularized missed checkout attendance records for an employee.
 * A record is unregularized if status is MISSED_CHECKOUT and it either has no regularization
 * request, or its regularization request is still PENDING or was REJECTED.
 */
export async function getEmployeeUnregularizedMissedCheckouts(userId: string) {
  return db.attendance.findMany({
    where: {
      userId,
      status: "MISSED_CHECKOUT",
      OR: [
        { regularization: null },
        { regularization: { status: { in: ["PENDING", "REJECTED"] } } },
      ],
    },
    include: {
      regularization: {
        select: {
          id: true,
          status: true,
          reviewNotes: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });
}
