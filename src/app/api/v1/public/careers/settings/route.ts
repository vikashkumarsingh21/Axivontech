import { NextRequest, NextResponse } from "next/server";
import { getCareersPageSettings } from "@/lib/careers/careers-db";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const settings = await getCareersPageSettings();

    // Strip internal admin fields before returning to public
    const publicSettings = {
      careersPageEnabled: settings.careersPageEnabled,
      heroEyebrow: settings.heroEyebrow,
      heroTitle: settings.heroTitle,
      heroDescription: settings.heroDescription,
      primaryCtaText: settings.primaryCtaText,
      secondaryCtaText: settings.secondaryCtaText,
      statTotalOpenings: settings.statTotalOpenings,
      statWorkPolicy: settings.statWorkPolicy,
      statExperienceLevel: settings.statExperienceLevel,
      statResponseTime: settings.statResponseTime,
      whyWorkTitle: settings.whyWorkTitle,
      whyWorkSubtitle: settings.whyWorkSubtitle,
      culturePillars: settings.culturePillars,
      hiringSteps: settings.hiringSteps,
      faqs: settings.faqs,
      ctaHeading: settings.ctaHeading,
      ctaDescription: settings.ctaDescription,
      ctaButtonText: settings.ctaButtonText,
      ctaEmail: settings.ctaEmail,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription,
      sectionsVisibility: settings.sectionsVisibility,
    };

    return NextResponse.json({
      success: true,
      settings: publicSettings,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
