import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { canAccessDocument, validateFileUpload } from "@/lib/services/document.service";
import { z } from "zod";

const CreateVersionSchema = z.object({
  fileUrl: z.string().url(),
  storageKey: z.string().optional(),
  size: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
  changeNotes: z.string().optional(),
});

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

    if (!allowed) throw new ApiError(403, "Forbidden: No access to document versions");

    const versions = await db.documentVersion.findMany({
      where: { documentId: id },
      orderBy: { versionNumber: "desc" },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data: versions });
  } catch (e) {
    return handleApiError(e);
  }
}

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
      throw new ApiError(403, "You do not have permission to add versions to this document");
    }

    const body = await req.json();
    const parsed = CreateVersionSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed");

    const { fileUrl, storageKey, size, mimeType, changeNotes } = parsed.data;

    if (mimeType && size) {
      validateFileUpload(mimeType, size);
    }

    const nextVersionNumber = doc.currentVersion + 1;

    const [newVersion, updatedDoc] = await db.$transaction([
      db.documentVersion.create({
        data: {
          documentId: id,
          versionNumber: nextVersionNumber,
          fileUrl,
          storageKey,
          size: size || null,
          mimeType: mimeType || "application/octet-stream",
          changeNotes: changeNotes || `Version ${nextVersionNumber}`,
          uploadedById: user.id,
        },
      }),
      db.document.update({
        where: { id },
        data: {
          currentVersion: nextVersionNumber,
          fileUrl,
          storageKey,
          size: size || doc.size,
          mimeType: mimeType || doc.mimeType,
        },
      }),
    ]);

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "DOCUMENT_VERSION_ADDED",
        resource: "Document",
        details: { documentId: id, versionNumber: nextVersionNumber, changeNotes },
      },
    });

    return NextResponse.json({ data: newVersion, currentVersion: updatedDoc.currentVersion }, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
