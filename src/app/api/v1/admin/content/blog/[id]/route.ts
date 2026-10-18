import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");
    const { id } = await params;

    const article = await db.websiteArticle.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");
    const { id } = await params;

    const body = await req.json();
    const existing = await db.websiteArticle.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const {
      title,
      slug,
      excerpt,
      contentHtml,
      category,
      authorName,
      authorRole,
      authorAvatar,
      readingTime,
      featuredImage,
      featuredImageAlt,
      featured,
      status,
      keywords,
      metaTitle,
      metaDescription,
    } = body;

    const isPublishingNow = status === "PUBLISHED" && existing.status !== "PUBLISHED";

    const updated = await db.websiteArticle.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(slug !== undefined && { slug: slug.trim() }),
        ...(excerpt !== undefined && { excerpt: excerpt.trim() }),
        ...(contentHtml !== undefined && { contentHtml }),
        ...(category !== undefined && { category }),
        ...(authorName !== undefined && { authorName: authorName.trim() }),
        ...(authorRole !== undefined && { authorRole: authorRole.trim() }),
        ...(authorAvatar !== undefined && { authorAvatar: authorAvatar?.trim() || null }),
        ...(readingTime !== undefined && { readingTime: readingTime.trim() }),
        ...(featuredImage !== undefined && { featuredImage: featuredImage.trim() }),
        ...(featuredImageAlt !== undefined && { featuredImageAlt: featuredImageAlt?.trim() || null }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(status !== undefined && { status }),
        ...(isPublishingNow && { publishedAt: new Date() }),
        ...(keywords !== undefined && { keywords: Array.isArray(keywords) ? keywords : [] }),
        ...(metaTitle !== undefined && { metaTitle: metaTitle?.trim() || null }),
        ...(metaDescription !== undefined && { metaDescription: metaDescription?.trim() || null }),
      },
    });

    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${updated.slug}`);
      revalidatePath("/sitemap.xml");
    } catch {
      // safe
    }

    return NextResponse.json({ article: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");
    const { id } = await params;

    const existing = await db.websiteArticle.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await db.websiteArticle.delete({
      where: { id },
    });

    try {
      revalidatePath("/blog");
      revalidatePath("/sitemap.xml");
    } catch {
      // safe
    }

    return NextResponse.json({ success: true, message: "Article deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
