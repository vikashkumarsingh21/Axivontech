import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
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
