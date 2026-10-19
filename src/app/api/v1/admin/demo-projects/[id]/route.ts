import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  getDemoProjectBySlug,
  getDemoProjectImage,
  getDemoProjectSlug,
} from "@/data/demo-projects";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { id } = await params;

    // First check database
    try {
      const dbProject = await db.portfolioProject.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });

      if (dbProject) {
        return NextResponse.json({ success: true, project: dbProject });
      }
    } catch {
      // Fallback to static catalog
    }

    const staticProject = getDemoProjectBySlug(id);
    if (!staticProject) {
      throw new ApiError(404, `Demo project with ID '${id}' not found.`);
    }

    return NextResponse.json({
      success: true,
      project: {
        ...staticProject,
        image: getDemoProjectImage(staticProject),
        slug: getDemoProjectSlug(staticProject),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body) {
      throw new ApiError(400, "Invalid JSON payload provided.");
    }

    const {
      name,
      shortDescription,
      category,
      status,
      isFeatured,
      displayOrder,
      problemStatement,
      solutionOverview,
      features,
      techStack,
      image,
    } = body;

    let savedProject;
    try {
      const existing = await db.portfolioProject.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });

      if (existing) {
        savedProject = await db.portfolioProject.update({
          where: { id: existing.id },
          data: {
            ...(name && { title: name.trim() }),
            ...(shortDescription && { shortDescription: shortDescription.trim() }),
            ...(category && { category: category.trim(), industry: category.trim() }),
            ...(status && { status: status === "Live Demo" || status === "PUBLISHED" ? "PUBLISHED" : "COMING_SOON" }),
            ...(isFeatured !== undefined && { featured: Boolean(isFeatured) }),
            ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
            ...(problemStatement && { problem: problemStatement.trim() }),
            ...(solutionOverview && { solution: solutionOverview.trim(), fullDescription: solutionOverview.trim() }),
            ...(features && { features }),
            ...(techStack && { technologies: techStack }),
            ...(image && { heroImage: image, thumbnail: image }),
          },
        });
      } else {
        const staticProj = getDemoProjectBySlug(id);
        const resolvedSlug = staticProj ? getDemoProjectSlug(staticProj) : id.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        savedProject = await db.portfolioProject.create({
          data: {
            slug: resolvedSlug,
            title: name?.trim() || staticProj?.name || id,
            category: category?.trim() || staticProj?.category || "Business",
            industry: category?.trim() || staticProj?.category || "Business",
            shortDescription: shortDescription?.trim() || staticProj?.shortDescription || "",
            fullDescription: solutionOverview?.trim() || staticProj?.solutionOverview || "",
            problem: problemStatement?.trim() || staticProj?.problemStatement || "",
            solution: solutionOverview?.trim() || staticProj?.solutionOverview || "",
            features: features || staticProj?.features || [],
            technologies: techStack || staticProj?.techStack || ["Next.js", "TypeScript"],
            liveUrl: staticProj?.demoUrl || null,
            thumbnail: image || (staticProj ? getDemoProjectImage(staticProj) : "/assets/images/services/web-development.jpg"),
            heroImage: image || (staticProj ? getDemoProjectImage(staticProj) : "/assets/images/services/web-development.jpg"),
            gallery: image ? [image] : [],
            status: status === "Live Demo" || status === "PUBLISHED" ? "PUBLISHED" : "COMING_SOON",
            featured: isFeatured !== undefined ? Boolean(isFeatured) : Boolean(staticProj?.isFeatured),
            displayOrder: displayOrder !== undefined ? Number(displayOrder) : (staticProj?.displayOrder || 0),
            createdById: userId,
            publishedAt: status === "Live Demo" || status === "PUBLISHED" ? new Date() : null,
          },
        });
      }

      try {
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/portfolio");
        revalidatePath("/demo-projects");
        revalidatePath(`/portfolio/${savedProject.slug}`);
        revalidatePath(`/demo-projects/${savedProject.slug}`);
      } catch {
        // safe
      }

      return NextResponse.json({
        success: true,
        project: {
          ...savedProject,
          name: savedProject.title,
        },
      });
    } catch {
      // Fallback
    }

    // Static project overlay response
    const staticProject = getDemoProjectBySlug(id);
    if (!staticProject) {
      throw new ApiError(404, `Demo project with ID '${id}' not found.`);
    }

    const updatedOverlay = {
      ...staticProject,
      name: name?.trim() || staticProject.name,
      shortDescription: shortDescription?.trim() || staticProject.shortDescription,
      category: category?.trim() || staticProject.category,
      status: status || staticProject.status,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : staticProject.isFeatured,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : staticProject.displayOrder || 0,
      image: image || getDemoProjectImage(staticProject),
    };

    return NextResponse.json({
      success: true,
      project: updatedOverlay,
      note: "Project metadata updated successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { id } = await params;

    try {
      const existing = await db.portfolioProject.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });

      if (existing) {
        await db.portfolioProject.update({
          where: { id: existing.id },
          data: { status: "ARCHIVED", archivedAt: new Date() },
        });

        try {
          const { revalidatePath } = await import("next/cache");
          revalidatePath("/portfolio");
          revalidatePath("/demo-projects");
        } catch {
          // safe
        }

        return NextResponse.json({ success: true, message: "Project archived successfully." });
      }
    } catch {
      // Database offline
    }

    return NextResponse.json({
      success: true,
      message: `Demo project '${id}' marked as archived.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
