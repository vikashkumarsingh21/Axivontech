import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, apiSuccess, apiError } from "@/lib/api/foundation";
import { canUsePresentationMode } from "@/lib/project-library/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userContext = await getSessionUser(req);
    const userRole = userContext.role;

    if (!canUsePresentationMode(userRole)) {
      return apiError("FORBIDDEN", "Access denied: Presentation mode requires authorized permissions.", 403);
    }

    const { id } = await params;
    const project = await db.projectLibraryItem.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: {
        id: true,
        slug: true,
        name: true,
        industry: true,
        category: true,
        projectType: true,
        completionDate: true,
        liveUrl: true,
        demoUrl: true,
        shortDescription: true,
        overview: true,
        solutionDelivered: true,
        features: true,
        technologies: true,
        thumbnailUrl: true,
        websiteScreenshots: true,
        mobileScreenshots: true,
        galleryImages: true,
        presentationHighlights: true,
        presentationNotes: true,
        isPresentationReady: true,
      },
    });

    if (!project) {
      return apiError("NOT_FOUND", "Project record not found.", 404);
    }

    // Log audit entry asynchronously
    db.projectLibraryAuditLog.create({
      data: {
        projectId: project.id,
        userId: userContext.id,
        userName: userContext.name,
        userRole,
        action: "PRESENTATION_OPENED",
        details: {
          timestamp: new Date().toISOString(),
        },
      },
    }).catch(() => {});

    return apiSuccess({
      presentation: {
        id: project.id,
        slug: project.slug,
        name: project.name,
        industry: project.industry,
        category: project.category,
        projectType: project.projectType || "Enterprise Web Solution",
        completionYear: project.completionDate ? new Date(project.completionDate).getFullYear() : undefined,
        liveUrl: project.liveUrl,
        demoUrl: project.demoUrl,
        shortDescription: project.shortDescription,
        overview: project.overview || project.shortDescription,
        solutionDelivered: project.solutionDelivered,
        features: project.features,
        technologies: project.technologies,
        thumbnailUrl: project.thumbnailUrl,
        screenshots: [
          ...(project.thumbnailUrl ? [project.thumbnailUrl] : []),
          ...(project.websiteScreenshots || []),
          ...(project.galleryImages || []),
        ],
        highlights: project.presentationHighlights.length > 0
          ? project.presentationHighlights
          : [
              `Successfully delivered and live in production`,
              `Engineered using modern scalable architecture`,
              `Mobile-first responsive design passing enterprise QA standards`,
            ],
        presenterGuidance: project.presentationNotes,
      },
    });
  } catch (error: any) {
    return apiError("INTERNAL_ERROR", error.message || "Failed to generate client presentation view", error.statusCode || 500);
  }
}
