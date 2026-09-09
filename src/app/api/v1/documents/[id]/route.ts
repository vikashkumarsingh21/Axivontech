import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { canAccessDocument } from "@/lib/services/document.service";
import { z } from "zod";

const UpdateDocSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  category: z.enum([
    "COMPANY_POLICY",
    "GUIDELINE",
    "FORM",
    "HR_DOCUMENT",
    "PROJECT_DOCUMENT",
    "CLIENT_DOCUMENT",
    "TEMPLATE",
    "INTERNAL_RESOURCE",
  ]).optional(),
  visibility: z.enum(["COMPANY", "DEPARTMENT", "ROLE", "PROJECT", "PRIVATE", "USERS"]).optional(),
  visibilityScope: z.string().nullable().optional(),
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

    if (!allowed) throw new ApiError(403, "Forbidden: You do not have access to this document");

    const doc = await db.document.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        versions: { orderBy: { versionNumber: "desc" } },
        permissions: true,
      },
    });

    if (!doc) throw new ApiError(404, "Document not found");

    return NextResponse.json({ data: doc });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);
    const { id } = await params;

    const existing = await db.document.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Document not found");

    const isAdmin = user.userRoles.some((ur) => ["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(ur.role.name));
    if (!isAdmin && existing.uploadedById !== user.id) {
      throw new ApiError(403, "You can only update documents you uploaded");
    }

    const body = await req.json();
    const parsed = UpdateDocSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed");

    const updated = await db.document.update({
      where: { id },
      data: parsed.data,
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "DOCUMENT_UPDATED",
        resource: "Document",
        details: { documentId: id, changes: parsed.data },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (e) {
    return handleApiError(e);
  }
}
