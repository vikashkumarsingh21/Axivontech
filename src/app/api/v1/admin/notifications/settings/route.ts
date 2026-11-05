import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";
import {
  getReminderScheduleSettings,
  updateReminderScheduleSettings,
} from "@/lib/notifications/settings";

export const dynamic = "force-dynamic";

const updateSettingsSchema = z.object({
  timezone: z.string().optional(),
  attendanceReminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM format")
    .optional(),
  attendanceManagerAlertTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM format")
    .optional(),
  workReportReminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM format")
    .optional(),
  workReportOverdueTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM format")
    .optional(),
  workDays: z.array(z.number().min(0).max(6)).optional(),
  enableAttendanceReminders: z.boolean().optional(),
  enableWorkReportReminders: z.boolean().optional(),
  enableTaskReminders: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    let adminId = req.headers.get("x-user-id");
    if (!adminId) {
      try {
        const session = await getAuthenticatedSession(req);
        adminId = session.userId;
      } catch {
        // Handled below
      }
    }

    if (!adminId) {
      throw new ApiError(401, "Authentication required");
    }

    await requirePermission(adminId, "admin:access");

    const settings = await getReminderScheduleSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    let adminId = req.headers.get("x-user-id");
    if (!adminId) {
      try {
        const session = await getAuthenticatedSession(req);
        adminId = session.userId;
      } catch {
        // Handled below
      }
    }

    if (!adminId) {
      throw new ApiError(401, "Authentication required");
    }

    await requirePermission(adminId, "admin:access");

    const body = await req.json().catch(() => ({}));
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid payload");
    }

    const updated = await updateReminderScheduleSettings(parsed.data);
    return NextResponse.json({
      success: true,
      message: "Reminder schedule settings updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
