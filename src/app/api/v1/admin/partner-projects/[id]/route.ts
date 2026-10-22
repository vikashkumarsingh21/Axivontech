import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const project = await db.partnerProject.findUnique({
      where: { id: params.id },
      include: {
        brokerProfile: {
          include: { user: { select: { name: true, email: true } } },
        },
        contract: {
          include: {
            versions: {
              orderBy: { versionNumber: "desc" }
            }
          }
        },
        payment: true,
        documents: true,
      },
    });

    if (!project) throw new ApiError(404, "Partner project not found.");

    return NextResponse.json({ data: project });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    if (!userId) throw new ApiError(401, "Unauthorized");

    const body = await req.json();
    const { qaStatus } = body;

    const allowedStatuses = ["INTERNAL_QA", "UAT_READY", "UAT_IN_PROGRESS", "UAT_APPROVED", "UAT_REJECTED"];
    if (qaStatus && !allowedStatuses.includes(qaStatus)) {
      throw new ApiError(400, `Invalid qaStatus. Allowed values: ${allowedStatuses.join(", ")}`);
    }

    const updated = await db.partnerProject.update({
      where: { id },
      data: {
        ...(qaStatus ? { qaStatus } : {}),
      },
      include: {
        brokerProfile: {
          include: { user: { select: { name: true, email: true } } },
        },
        contract: true,
        payment: true,
        documents: true,
      },
    });

    await db.auditLog.create({
      data: {
        userId,
        action: "PROJECT_QA_STATUS_UPDATED",
        resource: "PartnerProject",
        details: { projectId: id, qaStatus },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
