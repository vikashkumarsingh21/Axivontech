import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, apiSuccess, apiError } from "@/lib/api/foundation";
import {
  hasProjectLibraryWriteAccess,
  hasProjectLibraryArchiveAccess,
  sanitizeProjectRecord,
} from "@/lib/project-library/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userContext = await getSessionUser(req);
    const userRole = userContext.role;
    const canWrite = hasProjectLibraryWriteAccess(userRole);

    const { id } = await params;

    // Search by ID or Slug
    const project = await db.projectLibraryItem.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: canWrite
        ? {
            createdBy: { select: { id: true, name: true, email: true } },
            updatedBy: { select: { id: true, name: true, email: true } },
            assets: { orderBy: { displayOrder: "asc" } },
            documents: { orderBy: { createdAt: "desc" } },
            auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
          }
        : undefined,
    });

    if (!project) {
      return apiError("NOT_FOUND", "Project record not found in Project Library.", 404);
    }

    // For read-only users: strictly sanitize to the 4 permitted fields:
    // 1. Project Name
    // 2. Project Field / Industry
    // 3. Project Live URL
    // 4. Project Completion Date
    const result = sanitizeProjectRecord(project, userRole);

    return apiSuccess({
      project: result,
      canWrite,
      userRole,
    });
  } catch (error: any) {
    return apiError("INTERNAL_ERROR", error.message || "Failed to load project details", error.statusCode || 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userContext = await getSessionUser(req);
    const userRole = userContext.role;

    if (!hasProjectLibraryWriteAccess(userRole)) {
      return apiError("FORBIDDEN", "Access denied: Write permission required to edit project records", 403);
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await db.projectLibraryItem.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return apiError("NOT_FOUND", "Project record not found.", 404);
    }

    const technologies = Array.from(
      new Set([
        ...(body.technologies || existing.technologies || []),
        ...(body.frontendTech || existing.frontendTech || []),
        ...(body.backendTech || existing.backendTech || []),
        ...(body.databaseTech || existing.databaseTech || []),
        ...(body.frameworks || existing.frameworks || []),
        ...(body.languages || existing.languages || []),
      ])
    ).filter(Boolean);

    const updated = await db.projectLibraryItem.update({
      where: { id: existing.id },
      data: {
        name: body.name?.trim() || existing.name,
        clientName: body.clientName !== undefined ? body.clientName?.trim() : existing.clientName,
        clientCompany: body.clientCompany !== undefined ? body.clientCompany?.trim() : existing.clientCompany,
        industry: body.industry?.trim() || existing.industry,
        category: body.category?.trim() || existing.category,
        projectType: body.projectType !== undefined ? body.projectType?.trim() : existing.projectType,
        status: body.status?.trim() || existing.status,
        startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
        completionDate: body.completionDate ? new Date(body.completionDate) : existing.completionDate,
        liveUrl: body.liveUrl !== undefined ? body.liveUrl?.trim() : existing.liveUrl,
        demoUrl: body.demoUrl !== undefined ? body.demoUrl?.trim() : existing.demoUrl,
        clientPreviewUrl: body.clientPreviewUrl !== undefined ? body.clientPreviewUrl?.trim() : existing.clientPreviewUrl,
        documentationUrl: body.documentationUrl !== undefined ? body.documentationUrl?.trim() : existing.documentationUrl,
        githubUrl: body.githubUrl !== undefined ? body.githubUrl?.trim() : existing.githubUrl,

        shortDescription: body.shortDescription?.trim() || existing.shortDescription,
        overview: body.overview !== undefined ? body.overview?.trim() : existing.overview,
        businessRequirement: body.businessRequirement !== undefined ? body.businessRequirement?.trim() : existing.businessRequirement,
        problemStatement: body.problemStatement !== undefined ? body.problemStatement?.trim() : existing.problemStatement,
        solutionDelivered: body.solutionDelivered !== undefined ? body.solutionDelivered?.trim() : existing.solutionDelivered,
        objectives: body.objectives !== undefined ? body.objectives?.trim() : existing.objectives,
        scopeOfWork: body.scopeOfWork !== undefined ? body.scopeOfWork?.trim() : existing.scopeOfWork,
        deliverables: body.deliverables !== undefined ? body.deliverables?.trim() : existing.deliverables,

        frontendTech: body.frontendTech || existing.frontendTech,
        backendTech: body.backendTech || existing.backendTech,
        databaseTech: body.databaseTech || existing.databaseTech,
        frameworks: body.frameworks || existing.frameworks,
        languages: body.languages || existing.languages,
        apisAndIntegrations: body.apisAndIntegrations || existing.apisAndIntegrations,
        hostingPlatform: body.hostingPlatform !== undefined ? body.hostingPlatform?.trim() : existing.hostingPlatform,
        devTools: body.devTools || existing.devTools,
        additionalTech: body.additionalTech || existing.additionalTech,
        technologies,

        features: body.features || existing.features,

        thumbnailUrl: body.thumbnailUrl !== undefined ? body.thumbnailUrl?.trim() : existing.thumbnailUrl,
        websiteScreenshots: body.websiteScreenshots || existing.websiteScreenshots,
        dashboardScreenshots: body.dashboardScreenshots || existing.dashboardScreenshots,
        mobileScreenshots: body.mobileScreenshots || existing.mobileScreenshots,
        galleryImages: body.galleryImages || existing.galleryImages,
        demoVideoUrl: body.demoVideoUrl !== undefined ? body.demoVideoUrl?.trim() : existing.demoVideoUrl,

        presentationHighlights: body.presentationHighlights || existing.presentationHighlights,
        presentationNotes: body.presentationNotes !== undefined ? body.presentationNotes?.trim() : existing.presentationNotes,
        isPresentationReady: body.isPresentationReady !== undefined ? body.isPresentationReady : existing.isPresentationReady,

        internalNotes: body.internalNotes !== undefined ? body.internalNotes?.trim() : existing.internalNotes,
        assignedTeam: body.assignedTeam !== undefined ? body.assignedTeam?.trim() : existing.assignedTeam,
        projectOwner: body.projectOwner !== undefined ? body.projectOwner?.trim() : existing.projectOwner,
        developmentDepartment: body.developmentDepartment !== undefined ? body.developmentDepartment?.trim() : existing.developmentDepartment,
        deliveryNotes: body.deliveryNotes !== undefined ? body.deliveryNotes?.trim() : existing.deliveryNotes,
        maintenanceInfo: body.maintenanceInfo !== undefined ? body.maintenanceInfo?.trim() : existing.maintenanceInfo,
        qualityNotes: body.qualityNotes !== undefined ? body.qualityNotes?.trim() : existing.qualityNotes,
        confidentialData: body.confidentialData !== undefined ? body.confidentialData?.trim() : existing.confidentialData,

        deliveryConfirmation: body.deliveryConfirmation !== undefined ? body.deliveryConfirmation : existing.deliveryConfirmation,
        reviewStatus: body.reviewStatus !== undefined ? body.reviewStatus?.trim() : existing.reviewStatus,
        finalApprovedLink: body.finalApprovedLink !== undefined ? body.finalApprovedLink?.trim() : existing.finalApprovedLink,

        updatedById: userContext.id,

        auditLogs: {
          create: [
            {
              userId: userContext.id,
              userName: userContext.name,
              userRole,
              action: "PROJECT_UPDATED",
              details: {
                updatedFields: Object.keys(body),
              },
            },
          ],
        },
      },
    });

    return apiSuccess(updated, undefined, { message: "Project record updated successfully." });
  } catch (error: any) {
    return apiError("INTERNAL_ERROR", error.message || "Failed to update project record", error.statusCode || 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userContext = await getSessionUser(req);
    const userRole = userContext.role;

    if (!hasProjectLibraryArchiveAccess(userRole)) {
      return apiError(
        "FORBIDDEN",
        "Access denied: Administrator or Executive authorization required to archive project records.",
        403
      );
    }

    const { id } = await params;
    const existing = await db.projectLibraryItem.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return apiError("NOT_FOUND", "Project record not found.", 404);
    }

    // Soft archive
    const archived = await db.projectLibraryItem.update({
      where: { id: existing.id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedReason: "Archived via Project Library management portal",
        updatedById: userContext.id,
        auditLogs: {
          create: [
            {
              userId: userContext.id,
              userName: userContext.name,
              userRole,
              action: "PROJECT_ARCHIVED",
              details: {
                archivedAt: new Date().toISOString(),
              },
            },
          ],
        },
      },
    });

    return apiSuccess(archived, undefined, { message: `Project "${archived.name}" archived successfully.` });
  } catch (error: any) {
    return apiError("INTERNAL_ERROR", error.message || "Failed to archive project record", error.statusCode || 500);
  }
}
