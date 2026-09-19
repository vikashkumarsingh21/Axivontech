import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.lead.view");
    const document = await db.knowledgeDocument.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    });
    if (!document) throw new ApiError(404, "Knowledge document not found.");
    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.lead.create");

    const body = await req.json();
    const { title, category, content, sourceType, sourceReference, tags, status } = body;

    const existing = await db.knowledgeDocument.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError(404, "Knowledge document not found.");

    const contentChanged = content && content.trim() !== existing.content;

    const document = await db.knowledgeDocument.update({
      where: { id: params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(category && { category }),
        ...(content && { content: content.trim() }),
        ...(sourceType && { sourceType }),
        ...(sourceReference !== undefined && { sourceReference: sourceReference?.trim() || null }),
        ...(Array.isArray(tags) && { tags }),
        ...(status && { status }),
        ...(contentChanged && { version: existing.version + 1 }),
        updatedById: userId || null,
      },
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.lead.create");

    await db.knowledgeDocument.update({
      where: { id: params.id },
      data: { status: "ARCHIVED", updatedById: userId || null },
    });

    return NextResponse.json({ success: true, message: "Document archived." });
  } catch (error) {
    return handleApiError(error);
  }
}
