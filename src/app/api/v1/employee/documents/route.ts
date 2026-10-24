import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requireEmployee, getPagination } from "@/lib/api/foundation";

const acknowledgeSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  action: z.enum(["ACKNOWLEDGE"]).optional().default("ACKNOWLEDGE"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim();

    // Collect user roles and assigned projects upfront (eliminates N+1 loop)
    const userRoles = user.userRoles.map((ur) => ur.role.name);
    const primaryRole = userRoles[0] || user.role;

    const userProjects = await db.projectMember.findMany({
      where: { userId: user.id },
      select: { projectId: true },
    });
    const projectIds = userProjects.map((p) => p.projectId);

    // Build single-query permission-scoped filter
    const accessConditions: any[] = [
      { uploadedById: user.id },
      { visibility: "COMPANY" },
      { permissions: { some: { userId: user.id } } },
    ];

    if (user.department) {
      accessConditions.push({
        visibility: "DEPARTMENT",
        visibilityScope: user.department,
      });
    }

    if (primaryRole) {
      accessConditions.push({
        visibility: "ROLE",
        visibilityScope: primaryRole,
      });
      accessConditions.push({
        permissions: { some: { role: primaryRole, userId: null } },
      });
    }

    if (projectIds.length > 0) {
      accessConditions.push({
        visibility: "PROJECT",
        visibilityScope: { in: projectIds },
      });
    }

    const where: any = {
      isArchived: false,
      OR: accessConditions,
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const docs = await db.document.findMany({
      where,
      include: {
        uploadedBy: { select: { name: true, email: true } },
        acknowledgments: {
          where: { userId: user.id },
          select: { acknowledgedAt: true },
        },
        _count: {
          select: { versions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const documents = docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      fileUrl: doc.fileUrl,
      fileType: doc.mimeType,
      fileSize: doc.size,
      category: doc.category,
      visibility: doc.visibility,
      isArchived: doc.isArchived,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      uploadedBy: doc.uploadedBy,
      versionCount: doc._count.versions,
      isAcknowledged: doc.acknowledgments.length > 0,
      acknowledgedAt: doc.acknowledgments[0]?.acknowledgedAt || null,
    }));

    return NextResponse.json({
      success: true,
      documents,
      data: documents,
      meta: {
        total: documents.length,
        acknowledgedCount: documents.filter((d) => d.isAcknowledged).length,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const parsed = acknowledgeSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid payload",
        "VALIDATION_ERROR"
      );
    }

    const { documentId } = parsed.data;

    const doc = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.isArchived) {
      throw new ApiError(404, "Document not found or archived");
    }

    const acknowledgment = await db.documentAcknowledgment.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId: user.id,
        },
      },
      update: {
        acknowledgedAt: new Date(),
      },
      create: {
        documentId,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      acknowledgment,
      message: `Document "${doc.title}" acknowledged successfully.`,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
