import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { NotificationService } from "@/lib/notifications/service";

export const dynamic = "force-dynamic";

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

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));

    const history = await NotificationService.getBroadcastHistory(limit);

    return NextResponse.json({
      success: true,
      data: history,
      history,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
