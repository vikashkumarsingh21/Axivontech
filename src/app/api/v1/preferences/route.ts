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

    return NextResponse.json({ data: pref });
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
        emailNotifications: body.emailNotifications ?? undefined,
        inAppNotifications: body.inAppNotifications ?? undefined,
        timezone: body.timezone ?? undefined,
        theme: body.theme ?? undefined,
      },
      create: {
        userId,
        emailNotifications: body.emailNotifications ?? true,
        inAppNotifications: body.inAppNotifications ?? true,
        timezone: body.timezone || "UTC",
        theme: body.theme || "dark",
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
