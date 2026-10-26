import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { normalizeRole } from "@/lib/auth/roles";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = normalizeRole(req.headers.get("x-user-role") || "");

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(userRole)) {
      throw new ApiError(403, "Forbidden: Administrative access required.");
    }

    await requirePermission(userId, "export:partners");

    const logs = await db.auditLog.findMany({
      where: { action: "EXPORT_PARTNERS" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const formattedHistory = logs.map((log) => {
      const details = (log.details as Record<string, any>) || {};
      return {
        id: log.id,
        adminName: log.user?.name || "System Admin",
        adminEmail: log.user?.email || "",
        exportType: details.exportType || log.resource,
        format: details.format || "xlsx",
        rowCount: details.rowCount ?? 0,
        sensitiveUnmasked: details.sensitiveUnmasked === true,
        fileName: details.fileName || "",
        ipAddress: log.ipAddress || "",
        createdAt: log.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedHistory,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
