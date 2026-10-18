import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { BLOG_POSTS } from "@/data/blog-posts";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let articles = await db.websiteArticle.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (articles.length === 0) {
      try {
        await Promise.all(
          BLOG_POSTS.map((p) =>
            db.websiteArticle.create({
              data: {
                slug: p.slug,
                title: p.title,
                excerpt: p.excerpt,
                contentHtml: p.contentHtml,
                category: p.category,
                authorName: p.author.name,
                authorRole: p.author.role,
                authorAvatar: p.author.avatar,
                readingTime: p.readingTime,
                featuredImage: p.featuredImage,
                featuredImageAlt: p.featuredImageAlt,
                featured: p.featured,
                status: "PUBLISHED",
                publishedAt: new Date(p.publishedDate),
                keywords: p.keywords,
                metaTitle: p.metaTitle,
                metaDescription: p.metaDescription,
                canonicalUrl: p.canonicalUrl,
              },
            })
          )
        );
        articles = await db.websiteArticle.findMany({ orderBy: { createdAt: "desc" } });
      } catch {
        articles = BLOG_POSTS.map((p, idx) => ({
          id: `art-${idx + 1}`,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          contentHtml: p.contentHtml,
          category: p.category,
          authorName: p.author.name,
          authorRole: p.author.role,
          authorAvatar: p.author.avatar,
          readingTime: p.readingTime,
          featuredImage: p.featuredImage,
          featuredImageAlt: p.featuredImageAlt,
          featured: p.featured,
          status: "PUBLISHED",
          publishedAt: new Date(p.publishedDate),
          keywords: p.keywords,
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
          canonicalUrl: p.canonicalUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        })) as any;
      }
    }

    let filtered = articles;
    if (category && category !== "ALL") {
      filtered = filtered.filter((a) => a.category === category);
    }
    if (status && status !== "ALL") {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.excerpt.toLowerCase().includes(search) ||
          a.slug.toLowerCase().includes(search)
      );
    }

    const stats = {
      total: articles.length,
      published: articles.filter((a) => a.status === "PUBLISHED").length,
      draft: articles.filter((a) => a.status === "DRAFT").length,
      featured: articles.filter((a) => a.featured).length,
    };

    return NextResponse.json({ articles: filtered, stats });
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

    if (!title || !contentHtml) {
      return NextResponse.json(
        { error: "Title and content HTML are required." },
        { status: 400 }
      );
    }

    const finalImage = featuredImage?.trim() || "/assets/images/placeholder.jpg";

    const autoSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const isPublished = status === "PUBLISHED";
    const now = new Date();

    const article = await db.websiteArticle.create({
      data: {
        title: title.trim(),
        slug: autoSlug,
        excerpt: excerpt?.trim() || title.trim(),
        contentHtml,
        category: category || "Web & Custom Software",
        authorName: authorName?.trim() || "Axivon Engineering Team",
        authorRole: authorRole?.trim() || "Core Engineering",
        authorAvatar: authorAvatar?.trim() || null,
        readingTime: readingTime?.trim() || "5 min read",
        featuredImage: finalImage,
        featuredImageAlt: featuredImageAlt?.trim() || title.trim(),
        featured: Boolean(featured),
        status: status || "DRAFT",
        publishedAt: isPublished ? now : null,
        keywords: Array.isArray(keywords) ? keywords : [],
        metaTitle: metaTitle?.trim() || `${title} | Axivon Technologies`,
        metaDescription: metaDescription?.trim() || excerpt?.trim() || title.trim(),
        canonicalUrl: `https://axivontech.in/blog/${autoSlug}`,
        createdById: userId,
      },
    });

    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${autoSlug}`);
      revalidatePath("/sitemap.xml");
    } catch {
      // safe
    }

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
