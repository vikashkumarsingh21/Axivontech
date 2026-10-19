import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { DEFAULT_LEGAL_POLICIES, seedDefaultPoliciesIfEmpty } from "@/lib/legal/legal-db";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    // Auto seed default policies if database has 0 policies
    await seedDefaultPoliciesIfEmpty();

    let policies: any[] = [];
    try {
      policies = await db.legalPolicy.findMany({
        include: {
          publishedBy: {
            select: { id: true, name: true, email: true },
          },
          versions: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    } catch {
      // Fallback
      policies = DEFAULT_LEGAL_POLICIES as any[];
    }

    if (policies.length === 0) {
      policies = DEFAULT_LEGAL_POLICIES as any[];
    }

    const stats = {
      total: policies.length,
      published: policies.filter((p) => p.status === "PUBLISHED").length,
      draft: policies.filter((p) => p.status === "DRAFT").length,
      inReview: policies.filter((p) => p.status === "IN_REVIEW").length,
      missingDetailsCount: policies.filter((p) => p.missingDetails && p.missingDetails.length > 0).length,
      requiringApprovalCount: policies.filter((p) => p.requiresApproval).length,
    };

    return NextResponse.json({ success: true, policies, stats });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const body = await req.json();
    const {
      slug,
      title,
      category,
      summary,
      content,
      version = "1.0.0",
      status = "DRAFT",
      requiresApproval = false,
      missingDetails = [],
    } = body;

    if (!slug?.trim() || !title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Slug, title, and content are required." },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const existing = await db.legalPolicy.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A policy with slug "${cleanSlug}" already exists.` },
        { status: 409 }
      );
    }

    const policy = await db.legalPolicy.create({
      data: {
        slug: cleanSlug,
        title: title.trim(),
        category: category || "CORE_LEGAL",
        summary: summary?.trim() || "",
        content: content.trim(),
        version,
        status,
        requiresApproval: Boolean(requiresApproval),
        missingDetails: Array.isArray(missingDetails) ? missingDetails : [],
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        publishedById: status === "PUBLISHED" ? userId : null,
      },
    });

    return NextResponse.json({ success: true, policy }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
