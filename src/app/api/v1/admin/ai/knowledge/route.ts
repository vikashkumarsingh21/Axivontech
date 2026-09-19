import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    // For now we reuse an existing admin permission
    await requirePermission(userId, "crm.lead.view");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;

    const [documents, total] = await Promise.all([
      db.knowledgeDocument.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
          updatedBy: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      db.knowledgeDocument.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: documents,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.lead.create");

    const body = await req.json();
    const { title, category, content, sourceType, sourceReference, tags, status } = body;

    if (!title || !category || !content) {
      throw new ApiError(400, "Title, category, and content are required.");
    }

    const document = await db.knowledgeDocument.create({
      data: {
        title: title.trim(),
        category,
        content: content.trim(),
        sourceType: sourceType || "MANUAL",
        sourceReference: sourceReference?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        status: status || "DRAFT",
        version: 1,
        createdById: userId || null,
        updatedById: userId || null,
      },
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
