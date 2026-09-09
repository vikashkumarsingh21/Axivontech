import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);
    const { id } = await params;

    const doc = await db.document.findUnique({ where: { id } });
    if (!doc) throw new ApiError(404, "Document not found");

    const isAdmin = user.userRoles.some((ur) => ["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(ur.role.name));
    if (!isAdmin && doc.uploadedById !== user.id) {
      throw new ApiError(403, "You do not have permission to archive this document");
    }

    const archived = await db.document.update({
      where: { id },
      data: { isArchived: true },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "DOCUMENT_ARCHIVED",
        resource: "Document",
        details: { documentId: id, title: doc.title },
      },
    });

    return NextResponse.json({ success: true, message: "Document archived successfully", data: archived });
  } catch (e) {
    return handleApiError(e);
  }
}
