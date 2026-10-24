import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/session";
import {
  getUserProfileSettings,
  updateUserProfileSettings,
  ensureAllowedProfileRole,
} from "@/lib/services/profile-settings.service";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    ensureAllowedProfileRole(session.role);

    const profile = await getUserProfileSettings(session.userId);
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    ensureAllowedProfileRole(session.role);

    const body = await req.json();
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const updatedProfile = await updateUserProfileSettings(session.userId, body, {
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "Profile information updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
