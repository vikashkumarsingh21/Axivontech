import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requireEmployee } from "@/lib/api/foundation";

const patchSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  timezone: z.string().max(50).optional(),
  theme: z.enum(["dark", "light", "system"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireEmployee(req);

    const preference = await db.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emailNotifications: true,
        inAppNotifications: true,
        timezone: "Asia/Kolkata",
        theme: "dark",
      },
      update: {},
    });

    return NextResponse.json({
      success: true,
      settings: {
        emailNotifications: preference.emailNotifications,
        inAppNotifications: preference.inAppNotifications,
        timezone: preference.timezone,
        theme: preference.theme,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const parsed = patchSettingsSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid settings payload",
        "VALIDATION_ERROR"
      );
    }

    const updated = await db.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emailNotifications: parsed.data.emailNotifications ?? true,
        inAppNotifications: parsed.data.inAppNotifications ?? true,
        timezone: parsed.data.timezone ?? "Asia/Kolkata",
        theme: parsed.data.theme ?? "dark",
      },
      update: {
        ...(parsed.data.emailNotifications !== undefined
          ? { emailNotifications: parsed.data.emailNotifications }
          : {}),
        ...(parsed.data.inAppNotifications !== undefined
          ? { inAppNotifications: parsed.data.inAppNotifications }
          : {}),
        ...(parsed.data.timezone !== undefined
          ? { timezone: parsed.data.timezone }
          : {}),
        ...(parsed.data.theme !== undefined ? { theme: parsed.data.theme } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Preferences updated successfully",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
