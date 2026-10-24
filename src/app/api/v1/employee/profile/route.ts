import { NextRequest, NextResponse } from "next/server";
import { getEmployeeProfile, updateEmployeeProfile } from "@/lib/services/profile.service";
import { handleApiError } from "@/lib/api-error";
import { requireEmployee } from "@/lib/api/foundation";

export async function GET(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const profile = await getEmployeeProfile(user.id);
    return NextResponse.json({ success: true, profile, data: profile });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const updatedProfile = await updateEmployeeProfile(user.id, body, { ipAddress, userAgent });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
      data: updatedProfile,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
