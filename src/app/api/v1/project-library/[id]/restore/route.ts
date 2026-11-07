import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, apiSuccess, apiError } from "@/lib/api/foundation";
import { hasProjectLibraryArchiveAccess } from "@/lib/project-library/permissions";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userContext = await getSessionUser(req);
    const userRole = userContext.role;

    if (!hasProjectLibraryArchiveAccess(userRole)) {
      return apiError(
        "FORBIDDEN",
        "Access denied: Administrator or Executive authorization required to restore archived project records.",
        403
      );
    }

    const { id } = await params;
    const existing = await db.projectLibraryItem.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return apiError("NOT_FOUND", "Project record not found.", 404);
    }

    const restored = await db.projectLibraryItem.update({
      where: { id: existing.id },
      data: {
        isArchived: false,
        archivedAt: null,
        archivedReason: null,
        updatedById: userContext.id,
        auditLogs: {
          create: [
            {
              userId: userContext.id,
              userName: userContext.name,
              userRole,
              action: "PROJECT_RESTORED",
              details: {
                restoredAt: new Date().toISOString(),
              },
            },
          ],
        },
      },
    });

    return apiSuccess(restored, undefined, { message: `Project "${restored.name}" restored successfully.` });
  } catch (error: any) {
    return apiError("INTERNAL_ERROR", error.message || "Failed to restore project record", error.statusCode || 500);
  }
}
