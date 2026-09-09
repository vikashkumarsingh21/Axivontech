import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { canAccessDocument } from "@/lib/services/document.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);
    const { id } = await params;

    const userRoles = user.userRoles.map((ur) => ur.role.name);
    const allowed = await canAccessDocument(id, {
      userId: user.id,
      userDepartment: user.department,
      userRole: userRoles[0],
    });

    if (!allowed) throw new ApiError(403, "Forbidden: You do not have permission to download this document");

    const doc = await db.document.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
    });

    if (!doc) throw new ApiError(404, "Document not found");

    // Log the download activity
    const { ActivityService } = await import("@/lib/events/bus").catch(() => ({ ActivityService: null }));
    if (ActivityService) {
      ActivityService.log({
        actorId: user.id,
        action: "DOCUMENT_DOWNLOADED",
        entityType: "DOCUMENT",
        entityId: doc.id,
        summary: `${user.name} downloaded document "${doc.title}"`,
      }).catch(() => {});
    }

    // In a production system, this could redirect to signed S3 URL or return direct fileUrl
    return NextResponse.json({
      success: true,
      downloadUrl: doc.fileUrl,
      title: doc.title,
      mimeType: doc.mimeType,
      currentVersion: doc.currentVersion,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
