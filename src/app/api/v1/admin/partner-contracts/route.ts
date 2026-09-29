import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 15;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.partnerProject = {
        OR: [
          { projectCode: { contains: search, mode: "insensitive" } },
          { clientName: { contains: search, mode: "insensitive" } },
          { companyName: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [contracts, total] = await Promise.all([
      db.partnerContract.findMany({
        where,
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
          partnerProject: {
            select: {
              id: true, projectCode: true, clientName: true, companyName: true, status: true, projectBudget: true,
              brokerProfile: { select: { user: { select: { name: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.partnerContract.count({ where }),
    ]);

    return NextResponse.json({ data: contracts, meta: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Send a contract for a project
export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    const body = await req.json();
    const { partnerProjectId, contractName, contractDescription, contractFileUrl, contractStorageKey } = body;

    if (!partnerProjectId || !contractName || !contractFileUrl) {
      throw new ApiError(400, "Project ID, contract name, and contract file are required.");
    }

    const project = await db.partnerProject.findUnique({
      where: { id: partnerProjectId },
      include: { contract: true, brokerProfile: { select: { userId: true } } },
    });
    if (!project) throw new ApiError(404, "Project not found.");
    if (project.contract) throw new ApiError(409, "A contract already exists for this project.");

    const [contract] = await db.$transaction([
      db.partnerContract.create({
        data: {
          partnerProjectId,
          status: "SENT",
          versions: {
            create: {
              versionNumber: 1,
              contractName: contractName.trim(),
              contractDescription: contractDescription?.trim() || null,
              contractFileUrl,
              contractStorageKey: contractStorageKey || null,
              sentById: userId!,
              status: "SENT",
            }
          }
        },
      }),
      db.partnerProject.update({
        where: { id: partnerProjectId },
        data: { status: "CONTRACT_SENT" },
      }),
      db.auditLog.create({
        data: { userId, action: "CONTRACT_SENT", resource: "PartnerContract", details: { projectId: partnerProjectId, contractName } },
      }),
      db.notification.create({
        data: {
          userId: project.brokerProfile.userId,
          type: "SYSTEM",
          title: "Contract Sent",
          message: `A contract "${contractName}" has been sent for project ${project.projectCode}. Please review and sign.`,
          link: `/broker/projects/${partnerProjectId}`,
        },
      }),
    ]);

    return NextResponse.json({ data: contract }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
