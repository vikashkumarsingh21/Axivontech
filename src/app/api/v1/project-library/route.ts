import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, apiSuccess, apiError } from "@/lib/api/foundation";
import {
  hasProjectLibraryWriteAccess,
  sanitizeProjectRecord,
} from "@/lib/project-library/permissions";

export async function GET(req: NextRequest) {
  try {
    const userContext = await getSessionUser(req);
    const userRole = userContext.role;
    const canWrite = hasProjectLibraryWriteAccess(userRole);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const industry = searchParams.get("industry")?.trim() || "";
    const year = searchParams.get("year")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const showArchived = searchParams.get("archived") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    // Filter construction
    const where: any = {};

    // Only write users can see archived projects
    if (canWrite && showArchived) {
      where.isArchived = true;
    } else {
      where.isArchived = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
      ];
      // Full-access write users can also search by technologies, client, or features
      if (canWrite) {
        where.OR.push(
          { clientName: { contains: search, mode: "insensitive" } },
          { clientCompany: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } }
        );
      }
    }

    if (industry && industry !== "ALL") {
      where.industry = { contains: industry, mode: "insensitive" };
    }

    if (category && category !== "ALL" && canWrite) {
      where.category = { contains: category, mode: "insensitive" };
    }

    if (year && year !== "ALL") {
      const yr = parseInt(year, 10);
      if (!isNaN(yr)) {
        where.completionDate = {
          gte: new Date(`${yr}-01-01T00:00:00.000Z`),
          lte: new Date(`${yr}-12-31T23:59:59.999Z`),
        };
      }
    }

    const [rawItems, totalCount, allIndustries] = await Promise.all([
      canWrite
        ? db.projectLibraryItem.findMany({
            where,
            orderBy: { completionDate: "desc" },
            skip,
            take: limit,
            include: {
              createdBy: { select: { id: true, name: true, email: true } },
              updatedBy: { select: { id: true, name: true, email: true } },
              assets: true,
              _count: { select: { assets: true, documents: true, auditLogs: true } },
            },
          })
        : db.projectLibraryItem.findMany({
            where,
            orderBy: { completionDate: "desc" },
            skip,
            take: limit,
            select: {
              id: true,
              slug: true,
              name: true,
              industry: true,
              liveUrl: true,
              completionDate: true,
              status: true,
              thumbnailUrl: true,
            },
          }),
      db.projectLibraryItem.count({ where }),
      db.projectLibraryItem.findMany({
        where: { isArchived: false },
        select: { industry: true, completionDate: true },
      }),
    ]);

    // Distinct industries and years for filtering
    const industriesSet = new Set<string>();
    const yearsSet = new Set<number>();
    allIndustries.forEach((p) => {
      if (p.industry) industriesSet.add(p.industry);
      if (p.completionDate) {
        const y = new Date(p.completionDate).getFullYear();
        if (y > 2000) yearsSet.add(y);
      }
    });

    const industries = Array.from(industriesSet).sort();
    const years = Array.from(yearsSet).sort((a, b) => b - a);

    // Apply strict field-level sanitization for read-only users
    const sanitizedItems = rawItems.map((item) => sanitizeProjectRecord(item, userRole));

    // Role-dependent dashboard statistics
    const stats: any = {
      totalCompleted: allIndustries.length,
      availableIndustries: industries,
      availableYears: years,
    };

    if (canWrite) {
      const archivedCount = await db.projectLibraryItem.count({ where: { isArchived: true } });
      stats.archivedCount = archivedCount;
      stats.byIndustry = industries.map((ind) => ({
        industry: ind,
        count: allIndustries.filter((p) => p.industry === ind).length,
      }));
    }

    return apiSuccess({
      items: sanitizedItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats,
      userRole,
      canWrite,
    });
  } catch (error: any) {
    return apiError("INTERNAL_ERROR", error.message || "Failed to retrieve projects from library", error.statusCode || 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userContext = await getSessionUser(req);
    const userRole = userContext.role;

    if (!hasProjectLibraryWriteAccess(userRole)) {
      return apiError("FORBIDDEN", "Access denied: Write permission required to add projects to library", 403);
    }

    const body = await req.json();

    const name = body.name?.trim();
    if (!name) {
      return apiError("BAD_REQUEST", "Project name is required.", 400);
    }

    // Generate or validate slug
    let slug = body.slug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    // Check duplicate slug
    const existing = await db.projectLibraryItem.findUnique({ where: { slug } });
    if (existing) {
      return apiError("CONFLICT", `A project with the identifier or slug "${slug}" already exists in the library.`, 409);
    }

    // Check duplicate by normalized liveUrl if provided
    if (body.liveUrl) {
      const normalizedUrl = body.liveUrl.trim().replace(/\/+$/, "");
      const duplicateUrl = await db.projectLibraryItem.findFirst({
        where: {
          liveUrl: {
            in: [normalizedUrl, `${normalizedUrl}/`],
          },
        },
      });
      if (duplicateUrl) {
        return apiError(
          "CONFLICT",
          `A project with the live URL "${body.liveUrl}" already exists ("${duplicateUrl.name}"). Link or update existing record instead.`,
          409
        );
      }
    }

    const technologies = Array.from(
      new Set([
        ...(body.technologies || []),
        ...(body.frontendTech || []),
        ...(body.backendTech || []),
        ...(body.databaseTech || []),
        ...(body.frameworks || []),
        ...(body.languages || []),
      ])
    ).filter(Boolean);

    const project = await db.projectLibraryItem.create({
      data: {
        slug,
        name,
        clientName: body.clientName?.trim() || null,
        clientCompany: body.clientCompany?.trim() || null,
        industry: body.industry?.trim() || "Technology",
        category: body.category?.trim() || "Web Development",
        projectType: body.projectType?.trim() || null,
        status: body.status?.trim() || "COMPLETED",
        startDate: body.startDate ? new Date(body.startDate) : null,
        completionDate: body.completionDate ? new Date(body.completionDate) : new Date(),
        liveUrl: body.liveUrl?.trim() || null,
        demoUrl: body.demoUrl?.trim() || null,
        clientPreviewUrl: body.clientPreviewUrl?.trim() || null,
        documentationUrl: body.documentationUrl?.trim() || null,
        githubUrl: body.githubUrl?.trim() || null,

        shortDescription: body.shortDescription?.trim() || `${name} completed project archive.`,
        overview: body.overview?.trim() || null,
        businessRequirement: body.businessRequirement?.trim() || null,
        problemStatement: body.problemStatement?.trim() || null,
        solutionDelivered: body.solutionDelivered?.trim() || null,
        objectives: body.objectives?.trim() || null,
        scopeOfWork: body.scopeOfWork?.trim() || null,
        deliverables: body.deliverables?.trim() || null,

        frontendTech: body.frontendTech || [],
        backendTech: body.backendTech || [],
        databaseTech: body.databaseTech || [],
        frameworks: body.frameworks || [],
        languages: body.languages || [],
        apisAndIntegrations: body.apisAndIntegrations || [],
        hostingPlatform: body.hostingPlatform?.trim() || null,
        devTools: body.devTools || [],
        additionalTech: body.additionalTech || [],
        technologies,

        features: body.features || [],

        thumbnailUrl: body.thumbnailUrl?.trim() || null,
        websiteScreenshots: body.websiteScreenshots || [],
        dashboardScreenshots: body.dashboardScreenshots || [],
        mobileScreenshots: body.mobileScreenshots || [],
        galleryImages: body.galleryImages || [],
        demoVideoUrl: body.demoVideoUrl?.trim() || null,

        presentationHighlights: body.presentationHighlights || [],
        presentationNotes: body.presentationNotes?.trim() || null,
        isPresentationReady: body.isPresentationReady !== false,

        internalNotes: body.internalNotes?.trim() || null,
        assignedTeam: body.assignedTeam?.trim() || null,
        projectOwner: body.projectOwner?.trim() || userContext.name,
        developmentDepartment: body.developmentDepartment?.trim() || userContext.department || null,
        deliveryNotes: body.deliveryNotes?.trim() || null,
        maintenanceInfo: body.maintenanceInfo?.trim() || null,
        qualityNotes: body.qualityNotes?.trim() || null,
        confidentialData: body.confidentialData?.trim() || null,

        deliveryConfirmation: body.deliveryConfirmation !== false,
        reviewStatus: body.reviewStatus?.trim() || "APPROVED",
        finalApprovedLink: body.finalApprovedLink?.trim() || body.liveUrl?.trim() || null,

        createdById: userContext.id,
        updatedById: userContext.id,

        auditLogs: {
          create: [
            {
              userId: userContext.id,
              userName: userContext.name,
              userRole,
              action: "PROJECT_CREATED",
              details: {
                name,
                slug,
                industry: body.industry,
                completionDate: body.completionDate,
              },
            },
          ],
        },
      },
    });

    return apiSuccess(project, undefined, { message: "Project record created successfully." }, 201);
  } catch (error: any) {
    return apiError("INTERNAL_ERROR", error.message || "Failed to create project record", error.statusCode || 500);
  }
}
