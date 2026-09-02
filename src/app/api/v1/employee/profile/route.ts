import { NextRequest, NextResponse } from "next/server";
import { getEmployeeProfile, updateEmployeeProfile } from "@/lib/services/profile.service";
import { handleApiError, ApiError } from "@/lib/api-error";
import { verifySession } from "@/lib/auth/session";

async function getAuthenticatedUserId(req: NextRequest): Promise<string> {
  // First check if middleware populated x-user-id header
  const headerUserId = req.headers.get("x-user-id");
  if (headerUserId) return headerUserId;

  // Fallback direct session cookie check
  const sessionCookie = req.cookies.get("axivon_session")?.value;
  if (!sessionCookie) {
    throw new ApiError(401, "Authentication required");
  }

  const payload = await verifySession(sessionCookie);
  if (!payload || !payload.userId) {
    throw new ApiError(401, "Invalid or expired session");
  }

  return payload.userId;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const profile = await getEmployeeProfile(userId);
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const body = await req.json();

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const updatedProfile = await updateEmployeeProfile(userId, body, { ipAddress, userAgent });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
