import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { registerDeviceToken, unregisterDeviceToken } from "@/lib/notifications/push";

const registerTokenSchema = z.object({
  token: z.string().min(10, "Invalid device token"),
  platform: z.enum(["ANDROID", "IOS", "WEB"]).optional().default("ANDROID"),
  deviceInfo: z.string().max(300).optional().nullable(),
});

const unregisterTokenSchema = z.object({
  token: z.string().min(10, "Invalid device token"),
});

export async function POST(req: NextRequest) {
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

    if (!userId) {
      throw new ApiError(401, "Authentication required to register device token");
    }

    const body = await req.json().catch(() => ({}));
    const parsed = registerTokenSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid payload");
    }

    const record = await registerDeviceToken(
      userId,
      parsed.data.token,
      parsed.data.platform,
      parsed.data.deviceInfo
    );

    return NextResponse.json({
      success: true,
      message: "Device token registered successfully",
      data: record,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = unregisterTokenSchema.safeParse(body);
    if (!parsed.success) {
      // Check query parameter fallback
      const { searchParams } = new URL(req.url);
      const queryToken = searchParams.get("token");
      if (!queryToken) {
        throw new ApiError(400, "Device token is required to unregister");
      }
      await unregisterDeviceToken(queryToken);
    } else {
      await unregisterDeviceToken(parsed.data.token);
    }

    return NextResponse.json({
      success: true,
      message: "Device token unregistered successfully",
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
