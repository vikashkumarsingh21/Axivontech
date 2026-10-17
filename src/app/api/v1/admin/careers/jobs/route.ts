import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { seedInitialCareersData } from "@/lib/careers/careers-db";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    await seedInitialCareersData();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (department && department !== "ALL") {
      where.department = department;
    }

    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { department: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
      ];
    }

    const jobs = await db.jobPosting.findMany({
      where,
      include: {
        _count: {
          select: { applications: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [
        { isFeatured: "desc" },
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await requirePermission(userId, "admin:access");

    const body = await req.json().catch(() => null);
    if (!body) {
      throw new ApiError(400, "Invalid JSON body provided.");
    }

    const {
      title,
      department,
      employmentType,
      workArrangement,
      location,
      experienceLevel,
      minExperience,
      maxExperience,
      stipend,
      salaryRange,
      summary,
      description,
      responsibilities,
      qualifications,
      skills,
      preferredSkills,
      benefits,
      deadline,
      status = "DRAFT",
      isFeatured = false,
      displayOrder = 0,
      seoTitle,
      seoDescription,
    } = body;

    if (!title?.trim()) {
      throw new ApiError(400, "Job title is required.");
    }
    if (!department?.trim()) {
      throw new ApiError(400, "Department is required.");
    }
    if (!summary?.trim()) {
      throw new ApiError(400, "Job summary is required.");
    }

    // Generate unique slug
    let baseSlug = body.slug?.trim() ? generateSlug(body.slug) : generateSlug(title);
    if (!baseSlug) baseSlug = `job-${Date.now()}`;

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await db.jobPosting.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    const job = await db.jobPosting.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        department: department.trim(),
        employmentType: employmentType?.trim() || "Internship",
        workArrangement: workArrangement?.trim() || "Remote",
        location: location?.trim() || "Remote (India)",
        experienceLevel: experienceLevel?.trim() || "0–1 Years / Freshers Welcome",
        minExperience: typeof minExperience === "number" ? minExperience : 0,
        maxExperience: typeof maxExperience === "number" ? maxExperience : 1,
        stipend: stipend?.trim() || null,
        salaryRange: salaryRange?.trim() || null,
        summary: summary.trim(),
        description: description?.trim() || summary.trim(),
        responsibilities: Array.isArray(responsibilities) ? responsibilities.filter(Boolean) : [],
        qualifications: Array.isArray(qualifications) ? qualifications.filter(Boolean) : [],
        skills: Array.isArray(skills) ? skills.filter(Boolean) : [],
        preferredSkills: Array.isArray(preferredSkills) ? preferredSkills.filter(Boolean) : [],
        benefits: Array.isArray(benefits) ? benefits.filter(Boolean) : [],
        deadline: deadline ? new Date(deadline) : null,
        status: status || "DRAFT",
        isFeatured: Boolean(isFeatured),
        displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
        seoTitle: seoTitle?.trim() || `${title} | Axivon Technologies Careers`,
        seoDescription: seoDescription?.trim() || summary.trim(),
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        createdById: user.id,
      },
    });

    try {
      revalidatePath("/careers");
      revalidatePath(`/careers/${job.slug}`);
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("[Jobs Revalidation Warning]:", e);
    }

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
