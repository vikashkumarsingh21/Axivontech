import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/session";
import {
  cancelPendingEmailChange,
  ensureAllowedProfileRole,
} from "@/lib/services/profile-settings.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    ensureAllowedProfileRole(session.role);

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const result = await cancelPendingEmailChange(session.userId, {
      ipAddress,
      userAgent,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
