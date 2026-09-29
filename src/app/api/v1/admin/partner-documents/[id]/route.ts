import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const doc = await db.partnerDocument.findUnique({
      where: { id: params.id },
      include: {
        uploadedBy: { select: { name: true, email: true } },
        brokerProfile: { select: { id: true, user: { select: { name: true } } } },
      },
    });
    if (!doc) throw new ApiError(404, "Document not found.");

    return NextResponse.json({ data: doc });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    const body = await req.json();
    const { title, description, category, isImportant, expiresAt } = body;

    const doc = await db.partnerDocument.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(category !== undefined && { category }),
        ...(isImportant !== undefined && { isImportant }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
    });

    await db.auditLog.create({
      data: { userId, action: "DOCUMENT_UPDATED", resource: "PartnerDocument", details: { documentId: doc.id, title: doc.title } },
    });

    return NextResponse.json({ data: doc });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    const doc = await db.partnerDocument.findUnique({ where: { id: params.id } });
    if (!doc) throw new ApiError(404, "Document not found.");

    await db.partnerDocument.delete({ where: { id: params.id } });

    await db.auditLog.create({
      data: { userId, action: "DOCUMENT_ACCESS_REVOKED", resource: "PartnerDocument", details: { documentId: doc.id, title: doc.title } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
