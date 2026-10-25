import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBroker, getBrokerPagination, apiSuccess, handleApiError } from "@/lib/api/broker";

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile } = await requireBroker(req);
    const { page, limit, skip } = getBrokerPagination(req);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const where: any = {
      partnerProject: {
        brokerProfileId: brokerProfile.id,
      },
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.partnerProject = {
        OR: [
          { projectCode: { contains: search, mode: "insensitive" } },
          { projectName: { contains: search, mode: "insensitive" } },
          { clientName: { contains: search, mode: "insensitive" } },
          { companyName: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [contracts, totalCount] = await Promise.all([
      db.partnerContract.findMany({
        where,
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
          partnerProject: {
            select: {
              id: true,
              projectCode: true,
              projectName: true,
              clientName: true,
              companyName: true,
              status: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      db.partnerContract.count({ where }),
    ]);

    const projectedContracts = contracts.map((c) => {
      const latestVersion = c.versions[0] || null;
      return {
        id: c.id,
        contractName: latestVersion?.contractName || c.partnerProject?.projectName || "Partner Contract",
        status: c.status,
        projectId: c.partnerProjectId,
        projectCode: c.partnerProject?.projectCode,
        projectName: c.partnerProject?.projectName,
        clientName: c.partnerProject?.clientName,
        companyName: c.partnerProject?.companyName,
        projectStatus: c.partnerProject?.status,
        latestVersion: latestVersion
          ? {
              id: latestVersion.id,
              versionNumber: latestVersion.versionNumber,
              status: latestVersion.status,
              contractFileUrl: latestVersion.contractFileUrl,
              signedFileUrl: latestVersion.signedFileUrl,
              signedAt: latestVersion.signedAt,
              createdAt: latestVersion.createdAt,
            }
          : null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    return apiSuccess({
      contracts: projectedContracts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
