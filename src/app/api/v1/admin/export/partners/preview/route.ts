import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getExportPreview } from "@/lib/export/partners-export-service";
import { normalizeRole } from "@/lib/auth/roles";

const previewSchema = z.object({
  type: z.enum(["APPLICATIONS", "CONFIRMED_PARTNERS"]),
  filters: z.record(z.string(), z.any()).optional().default({}),
  exportScope: z.enum(["ALL_MATCHING", "SELECTED_IDS", "LATEST_N"]).optional().default("ALL_MATCHING"),
  selectedIds: z.array(z.string()).optional().default([]),
  latestNCount: z.number().int().positive().max(20000).optional().default(100),
});

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = normalizeRole(req.headers.get("x-user-role") || "");

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(userRole)) {
      throw new ApiError(403, "Forbidden: Administrative access required for partner export.");
    }

    await requirePermission(userId, "export:partners");

    const body = await req.json();
    const validated = previewSchema.parse(body);

    const result = await getExportPreview({
      type: validated.type,
      filters: validated.filters,
      exportScope: validated.exportScope,
      selectedIds: validated.selectedIds,
      latestNCount: validated.latestNCount,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
