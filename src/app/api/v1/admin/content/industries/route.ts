import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { DEFAULT_INDUSTRIES } from "@/lib/content/content-db";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status");

    let industries = await db.websiteIndustry.findMany({
      orderBy: { displayOrder: "asc" },
    });

    if (industries.length === 0) {
      try {
        await Promise.all(
          DEFAULT_INDUSTRIES.map((ind, idx) =>
            db.websiteIndustry.create({
              data: {
                slug: ind.slug,
                title: ind.title,
                description: ind.description,
                tags: ind.tags,
                icon: ind.icon,
                displayOrder: idx + 1,
                status: "PUBLISHED",
                relatedService: ind.relatedService,
              },
            })
          )
        );
        industries = await db.websiteIndustry.findMany({ orderBy: { displayOrder: "asc" } });
      } catch {
        industries = DEFAULT_INDUSTRIES as any;
      }
    }

    let filtered = industries;
    if (status && status !== "ALL") {
      filtered = filtered.filter((i) => i.status === status);
    }
    if (search) {
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(search) ||
          i.description.toLowerCase().includes(search) ||
          i.slug.toLowerCase().includes(search)
      );
    }

    const stats = {
      total: industries.length,
      published: industries.filter((i) => i.status === "PUBLISHED").length,
      draft: industries.filter((i) => i.status === "DRAFT").length,
      archived: industries.filter((i) => i.status === "ARCHIVED").length,
    };

    return NextResponse.json({ industries: filtered, stats });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const body = await req.json();
    const { title, name, slug, description, tags, icon, displayOrder, status, relatedService, metaTitle, metaDescription } = body;
    const resolvedTitle = (title || name)?.trim();

    if (!resolvedTitle || !description) {
      return NextResponse.json(
        { error: "Title and Description are required." },
        { status: 400 }
      );
    }

    const autoSlug = (slug || resolvedTitle)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const count = await db.websiteIndustry.count();

    const industry = await db.websiteIndustry.create({
      data: {
        title: resolvedTitle,
        slug: autoSlug,
        description: description.trim(),
        tags: Array.isArray(tags) ? tags : [],
        icon: icon || "Building2",
        displayOrder: displayOrder !== undefined ? displayOrder : count + 1,
        status: status || "PUBLISHED",
        relatedService: relatedService || null,
        metaTitle: metaTitle?.trim() || `${title} Software Solutions | Axivon Technologies`,
        metaDescription: metaDescription?.trim() || description.trim(),
        createdById: userId,
      },
    });

    try {
      revalidatePath("/industries");
      revalidatePath("/sitemap.xml");
    } catch {
      // safe
    }

    return NextResponse.json({ industry }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
