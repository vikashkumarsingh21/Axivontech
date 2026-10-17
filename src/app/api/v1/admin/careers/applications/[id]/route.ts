import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { id } = await params;

    const application = await db.careerApplication.findUnique({
      where: { id },
      include: {
        job: true,
        reviewedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!application) {
      throw new ApiError(404, "Application not found.");
    }

    return NextResponse.json({ application });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await requirePermission(userId, "admin:access");

    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body) {
      throw new ApiError(400, "Invalid JSON body provided.");
    }

    const existing = await db.careerApplication.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Application not found.");
    }

    const data: any = {};

    if (body.status !== undefined) {
      const validStatuses = ["NEW", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"];
      if (!validStatuses.includes(body.status)) {
        throw new ApiError(400, `Invalid application status: ${body.status}`);
      }
      data.status = body.status;
      data.reviewedById = user.id;
      data.reviewedAt = new Date();
    }

    if (body.adminNotes !== undefined) {
      data.adminNotes = typeof body.adminNotes === "string" ? body.adminNotes.trim() : null;
      data.reviewedById = user.id;
      data.reviewedAt = new Date();
    }

    if (body.rating !== undefined) {
      data.rating = typeof body.rating === "number" ? Math.max(1, Math.min(5, body.rating)) : null;
    }

    const updated = await db.careerApplication.update({
      where: { id },
      data,
      include: {
        job: { select: { id: true, title: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { id } = await params;

    const existing = await db.careerApplication.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Application not found.");
    }

    await db.careerApplication.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
