import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let userId = req.headers.get("x-user-id");
    if (!userId) {
      try {
        const session = await getAuthenticatedSession(req);
        userId = session.userId;
      } catch {
        // Handled below
      }
    }

    if (!userId) throw new ApiError(401, "Unauthorized");

    let pref = await db.userPreference.findUnique({ where: { userId } });
    if (!pref) {
      pref = await db.userPreference.create({
        data: {
          userId,
          emailNotifications: true,
          inAppNotifications: true,
          timezone: "Asia/Kolkata",
          theme: "dark",
        },
      });
    }

    // Load granular preferences if configured
    let granularPrefs = {
      attendanceReminders: true,
      workReportReminders: true,
      taskReminders: true,
      announcements: true,
      pushNotifications: true,
    };

    try {
      const extraSetting = await db.organizationSetting.findUnique({
        where: { key: `user_pref_granular:${userId}` },
      });
      if (extraSetting?.value && typeof extraSetting.value === "object") {
        granularPrefs = { ...granularPrefs, ...(extraSetting.value as any) };
      }
    } catch {
      // Ignored, fallback to defaults
    }

    return NextResponse.json({
      success: true,
      data: {
        emailNotifications: pref.emailNotifications,
        inAppNotifications: pref.inAppNotifications,
        timezone: pref.timezone || "Asia/Kolkata",
        ...granularPrefs,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    let userId = req.headers.get("x-user-id");
    if (!userId) {
      try {
        const session = await getAuthenticatedSession(req);
        userId = session.userId;
      } catch {
        // Handled below
      }
    }

    if (!userId) throw new ApiError(401, "Unauthorized");

    const body = await req.json().catch(() => ({}));

    // Update base UserPreference
    const updatedPref = await db.userPreference.upsert({
      where: { userId },
      update: {
        emailNotifications:
          body.emailNotifications !== undefined ? !!body.emailNotifications : undefined,
        inAppNotifications:
          body.inAppNotifications !== undefined ? !!body.inAppNotifications : undefined,
        timezone: body.timezone || undefined,
      },
      create: {
        userId,
        emailNotifications: body.emailNotifications ?? true,
        inAppNotifications: body.inAppNotifications ?? true,
        timezone: body.timezone || "Asia/Kolkata",
      },
    });

    // Update granular preferences
    const granularData: Record<string, boolean> = {};
    if (body.attendanceReminders !== undefined)
      granularData.attendanceReminders = !!body.attendanceReminders;
    if (body.workReportReminders !== undefined)
      granularData.workReportReminders = !!body.workReportReminders;
    if (body.taskReminders !== undefined)
      granularData.taskReminders = !!body.taskReminders;
    if (body.announcements !== undefined)
      granularData.announcements = !!body.announcements;
    if (body.pushNotifications !== undefined)
      granularData.pushNotifications = !!body.pushNotifications;

    if (Object.keys(granularData).length > 0) {
      const existing = await db.organizationSetting.findUnique({
        where: { key: `user_pref_granular:${userId}` },
      });
      const merged = {
        attendanceReminders: true,
        workReportReminders: true,
        taskReminders: true,
        announcements: true,
        pushNotifications: true,
        ...((existing?.value as any) || {}),
        ...granularData,
      };

      await db.organizationSetting.upsert({
        where: { key: `user_pref_granular:${userId}` },
        create: {
          key: `user_pref_granular:${userId}`,
          value: merged as any,
        },
        update: {
          value: merged as any,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully",
      data: {
        emailNotifications: updatedPref.emailNotifications,
        inAppNotifications: updatedPref.inAppNotifications,
        timezone: updatedPref.timezone,
        ...granularData,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
