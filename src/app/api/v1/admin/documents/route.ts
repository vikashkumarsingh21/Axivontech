import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { validateFileUpload } from "@/lib/services/document.service";
import { z } from "zod";

const CreateDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum([
    "COMPANY_POLICY",
    "GUIDELINE",
    "FORM",
    "HR_DOCUMENT",
    "PROJECT_DOCUMENT",
    "CLIENT_DOCUMENT",
    "TEMPLATE",
    "INTERNAL_RESOURCE",
  ]),
  fileUrl: z.string().url(),
  storageKey: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().int().positive().optional(),
  visibility: z.enum(["COMPANY", "DEPARTMENT", "ROLE", "PROJECT", "PRIVATE", "USERS"]).optional().default("COMPANY"),
  visibilityScope: z.string().nullable().optional(),
});

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "document.manage");

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const where: any = { isArchived: false };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [documents, total] = await Promise.all([
      db.document.findMany({
        where,
        include: {
          uploadedBy: { select: { id: true, name: true, email: true } },
          versions: { orderBy: { versionNumber: "desc" }, take: 1 },
          permissions: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.document.count({ where }),
    ]);

    return NextResponse.json({
      data: documents,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "document.upload");

    const body = await req.json();
    const parsed = CreateDocumentSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed");

    const { title, description, category, fileUrl, storageKey, mimeType, size, visibility, visibilityScope } =
      parsed.data;

    if (mimeType && size) {
      validateFileUpload(mimeType, size);
    }

    const document = await db.document.create({
      data: {
        title,
        description,
        category,
        fileUrl,
        storageKey,
        mimeType: mimeType || "application/octet-stream",
        size: size || null,
        visibility,
        visibilityScope: visibilityScope || null,
        currentVersion: 1,
        uploadedById: userId,
        versions: {
          create: {
            versionNumber: 1,
            fileUrl,
            storageKey,
            size: size || null,
            mimeType: mimeType || "application/octet-stream",
            changeNotes: "Initial document creation",
            uploadedById: userId,
          },
        },
      },
      include: {
        versions: true,
        uploadedBy: { select: { name: true, email: true } },
      },
    });

    await db.auditLog.create({
      data: {
        userId,
        action: "DOCUMENT_CREATED",
        resource: "Document",
        details: { documentId: document.id, title, category, visibility },
      },
    });

    // Emit event
    const { EventBus } = await import("@/lib/events/bus").catch(() => ({ EventBus: null }));
    if (EventBus) {
      EventBus.emit({
        eventType: "DOCUMENT_SHARED",
        actorId: userId,
        entityType: "DOCUMENT",
        entityId: document.id,
        title: "New Document Uploaded",
        message: `Document "${title}" has been uploaded in category ${category}.`,
      }).catch(() => {});
    }

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
