import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getCareersPageSettings } from "@/lib/careers/careers-db";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const settings = await db.careersPageSetting.findUnique({
      where: { id: "default" },
      include: {
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (settings) {
      return NextResponse.json({ settings });
    }

    // Fallback if not yet seeded
    const fallbackSettings = await getCareersPageSettings();
    return NextResponse.json({ settings: fallbackSettings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await requirePermission(userId, "admin:access");

    const body = await req.json().catch(() => null);
    if (!body) {
      throw new ApiError(400, "Invalid JSON body provided.");
    }

    const data: any = {
      updatedById: user.id,
    };

    if (body.careersPageEnabled !== undefined) data.careersPageEnabled = Boolean(body.careersPageEnabled);
    if (body.heroEyebrow !== undefined) data.heroEyebrow = body.heroEyebrow.trim();
    if (body.heroTitle !== undefined) data.heroTitle = body.heroTitle.trim();
    if (body.heroDescription !== undefined) data.heroDescription = body.heroDescription.trim();
    if (body.primaryCtaText !== undefined) data.primaryCtaText = body.primaryCtaText.trim();
    if (body.secondaryCtaText !== undefined) data.secondaryCtaText = body.secondaryCtaText.trim();
    if (body.statTotalOpenings !== undefined) data.statTotalOpenings = String(body.statTotalOpenings).trim();
    if (body.statWorkPolicy !== undefined) data.statWorkPolicy = body.statWorkPolicy.trim();
    if (body.statExperienceLevel !== undefined) data.statExperienceLevel = body.statExperienceLevel.trim();
    if (body.statResponseTime !== undefined) data.statResponseTime = body.statResponseTime.trim();
    if (body.whyWorkTitle !== undefined) data.whyWorkTitle = body.whyWorkTitle.trim();
    if (body.whyWorkSubtitle !== undefined) data.whyWorkSubtitle = body.whyWorkSubtitle.trim();
    if (body.culturePillars !== undefined) data.culturePillars = body.culturePillars;
    if (body.hiringSteps !== undefined) data.hiringSteps = body.hiringSteps;
    if (body.faqs !== undefined) data.faqs = body.faqs;
    if (body.ctaHeading !== undefined) data.ctaHeading = body.ctaHeading.trim();
    if (body.ctaDescription !== undefined) data.ctaDescription = body.ctaDescription.trim();
    if (body.ctaButtonText !== undefined) data.ctaButtonText = body.ctaButtonText.trim();
    if (body.ctaEmail !== undefined) data.ctaEmail = body.ctaEmail.trim();
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle.trim();
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription.trim();
    if (body.sectionsVisibility !== undefined) data.sectionsVisibility = body.sectionsVisibility;

    const updated = await db.careersPageSetting.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ...data,
      },
      update: data,
      include: {
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Revalidate public routes and caches on settings modification
    try {
      revalidatePath("/careers");
      revalidatePath("/sitemap.xml");
      revalidatePath("/", "layout");
    } catch (revalErr) {
      console.warn("[Careers Revalidation Warning]:", revalErr);
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
