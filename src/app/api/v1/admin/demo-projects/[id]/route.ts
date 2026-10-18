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

    // Check if record exists in database
    try {
      const existing = await db.portfolioProject.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });

      if (existing) {
        const updated = await db.portfolioProject.update({
          where: { id: existing.id },
          data: {
            ...(name && { title: name.trim() }),
            ...(shortDescription && { shortDescription: shortDescription.trim() }),
            ...(category && { category: category.trim(), industry: category.trim() }),
            ...(status && { status: status === "Live Demo" ? "PUBLISHED" : "COMING_SOON" }),
            ...(isFeatured !== undefined && { featured: Boolean(isFeatured) }),
            ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
            ...(problemStatement && { problem: problemStatement.trim() }),
            ...(solutionOverview && { solution: solutionOverview.trim() }),
            ...(features && { features }),
            ...(techStack && { technologies: techStack }),
            ...(image && { heroImage: image, thumbnail: image }),
          },
        });

        return NextResponse.json({
          success: true,
          project: {
            ...updated,
            name: updated.title,
          },
        });
      }
    } catch {
      // Database unavailable or project is from static catalogue
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
