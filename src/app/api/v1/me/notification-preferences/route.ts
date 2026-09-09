import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    let pref = await db.userPreference.findUnique({ where: { userId } });
    if (!pref) {
      pref = await db.userPreference.create({
        data: { userId, emailNotifications: true, inAppNotifications: true, timezone: "UTC", theme: "dark" },
      });
    }

    return NextResponse.json({
      data: {
        emailNotifications: pref.emailNotifications,
        inAppNotifications: pref.inAppNotifications,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const body = await req.json();
    const updated = await db.userPreference.upsert({
      where: { userId },
      update: {
        emailNotifications: body.emailNotifications !== undefined ? !!body.emailNotifications : undefined,
        inAppNotifications: body.inAppNotifications !== undefined ? !!body.inAppNotifications : undefined,
      },
      create: {
        userId,
        emailNotifications: body.emailNotifications ?? true,
        inAppNotifications: body.inAppNotifications ?? true,
      },
    });

    return NextResponse.json({
      data: {
        emailNotifications: updated.emailNotifications,
        inAppNotifications: updated.inAppNotifications,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
