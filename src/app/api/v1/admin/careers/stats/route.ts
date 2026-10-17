import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { getAdminCareersStats } from "@/lib/careers/careers-db";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const stats = await getAdminCareersStats();
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
