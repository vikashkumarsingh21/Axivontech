import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

    const job = await db.jobPosting.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!job) {
      throw new ApiError(404, "Job posting not found.");
    }

    return NextResponse.json({ job });
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
      throw new ApiError(400, "Invalid JSON body provided.");
    }

    const existing = await db.jobPosting.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Job posting not found.");
    }

    const data: any = {};

    if (body.title !== undefined) data.title = body.title.trim();
    if (body.department !== undefined) data.department = body.department.trim();
    if (body.employmentType !== undefined) data.employmentType = body.employmentType.trim();
    if (body.workArrangement !== undefined) data.workArrangement = body.workArrangement.trim();
    if (body.location !== undefined) data.location = body.location.trim();
    if (body.experienceLevel !== undefined) data.experienceLevel = body.experienceLevel.trim();
    if (body.minExperience !== undefined) data.minExperience = Number(body.minExperience);
    if (body.maxExperience !== undefined) data.maxExperience = Number(body.maxExperience);
    if (body.stipend !== undefined) data.stipend = body.stipend?.trim() || null;
    if (body.salaryRange !== undefined) data.salaryRange = body.salaryRange?.trim() || null;
    if (body.summary !== undefined) data.summary = body.summary.trim();
    if (body.description !== undefined) data.description = body.description.trim();
    if (body.responsibilities !== undefined) data.responsibilities = body.responsibilities;
    if (body.qualifications !== undefined) data.qualifications = body.qualifications;
    if (body.skills !== undefined) data.skills = body.skills;
    if (body.preferredSkills !== undefined) data.preferredSkills = body.preferredSkills;
    if (body.benefits !== undefined) data.benefits = body.benefits;
    if (body.deadline !== undefined) data.deadline = body.deadline ? new Date(body.deadline) : null;
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
    if (body.displayOrder !== undefined) data.displayOrder = Number(body.displayOrder);
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle?.trim() || null;
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription?.trim() || null;

    // Handle slug change if provided
    if (body.slug && body.slug !== existing.slug) {
      const slugCandidate = body.slug.toLowerCase().trim().replace(/\s+/g, "-");
      const conflict = await db.jobPosting.findUnique({ where: { slug: slugCandidate } });
      if (conflict && conflict.id !== id) {
        throw new ApiError(409, "A job posting with this URL slug already exists.");
      }
      data.slug = slugCandidate;
    }

    // Handle status transitions
    if (body.status && body.status !== existing.status) {
      data.status = body.status;
      if (body.status === "PUBLISHED" && !existing.publishedAt) {
        data.publishedAt = new Date();
      } else if (body.status === "CLOSED") {
        data.closedAt = new Date();
      } else if (body.status === "ARCHIVED") {
        data.archivedAt = new Date();
      }
    }

    const updated = await db.jobPosting.update({
      where: { id },
      data,
    });

    try {
      revalidatePath("/careers");
      revalidatePath(`/careers/${updated.slug}`);
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("[Job Update Reval Warning]:", e);
    }

    return NextResponse.json({ success: true, job: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { id } = await params;

    const existing = await db.jobPosting.findUnique({
      where: { id },
      include: { _count: { select: { applications: true } } },
    });

    if (!existing) {
      throw new ApiError(404, "Job posting not found.");
    }

    // If applications exist, instead of hard deleting and losing applicant data, mark as ARCHIVED or allow explicit delete
    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";

    if (existing._count.applications > 0 && !force) {
      // Archive job safely preserving applications
      const archived = await db.jobPosting.update({
        where: { id },
        data: { status: "ARCHIVED", archivedAt: new Date() },
      });

      try {
        revalidatePath("/careers");
        revalidatePath(`/careers/${existing.slug}`);
        revalidatePath("/sitemap.xml");
      } catch (e) {
        console.warn("[Job Archive Reval Warning]:", e);
      }

      return NextResponse.json({
        success: true,
        archived: true,
        message: "Job posting had active candidate applications so it was safely moved to ARCHIVED state.",
        job: archived,
      });
    }

    await db.jobPosting.delete({ where: { id } });

    try {
      revalidatePath("/careers");
      revalidatePath(`/careers/${existing.slug}`);
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("[Job Delete Reval Warning]:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Job posting deleted successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
