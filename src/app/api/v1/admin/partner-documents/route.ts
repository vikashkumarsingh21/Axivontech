import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const brokerId = searchParams.get("brokerId") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 15;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (brokerId) where.brokerProfileId = brokerId === "ALL" ? null : brokerId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [docs, total] = await Promise.all([
      db.partnerDocument.findMany({
        where,
        include: {
          uploadedBy: { select: { id: true, name: true } },
          brokerProfile: { select: { id: true, user: { select: { name: true } } } },
        },
        orderBy: [{ isImportant: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      db.partnerDocument.count({ where }),
    ]);

    return NextResponse.json({
      data: docs,
      meta: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    const body = await req.json();
    const { title, description, fileUrl, storageKey, mimeType, sizeBytes, category, isImportant, expiresAt, brokerProfileId } = body;

    if (!title || !fileUrl) throw new ApiError(400, "Title and file URL are required.");

    const doc = await db.partnerDocument.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        fileUrl,
        storageKey: storageKey || null,
        mimeType: mimeType || null,
        sizeBytes: sizeBytes || null,
        category: category || "GENERAL",
        isImportant: isImportant || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        uploadedById: userId!,
        brokerProfileId: brokerProfileId || null,
      },
    });

    await db.auditLog.create({
      data: {
        userId: userId,
        action: "DOCUMENT_UPLOADED",
        resource: "PartnerDocument",
        details: { documentId: doc.id, title: doc.title, category: doc.category, target: brokerProfileId ? "specific_broker" : "all_brokers" },
      },
    });

    // Notify brokers
    if (brokerProfileId) {
      const bp = await db.brokerProfile.findUnique({ where: { id: brokerProfileId }, select: { userId: true } });
      if (bp) {
        await db.notification.create({
          data: { userId: bp.userId, type: "SYSTEM", title: "New Document Shared", message: `A new document "${title}" has been shared with you.`, link: "/broker/documents" },
        });
      }
    } else {
      const allBrokers = await db.brokerProfile.findMany({ select: { userId: true } });
      if (allBrokers.length > 0) {
        await db.notification.createMany({
          data: allBrokers.map((b) => ({
            userId: b.userId, type: "SYSTEM" as const, title: "New Document Shared", message: `A new document "${title}" has been shared with all partners.`, link: "/broker/documents",
          })),
        });
      }
    }

    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
