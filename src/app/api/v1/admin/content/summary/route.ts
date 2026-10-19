import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const [
      services,
      industries,
      faqs,
      articles,
      portfolioProjects,
      mediaAssets,
      posters,
      careersSetting,
      jobs,
      homepageSetting,
      aboutSetting,
      seoSetting,
    ] = await Promise.all([
      db.websiteService.findMany({ select: { id: true, status: true } }),
      db.websiteIndustry.findMany({ select: { id: true, status: true } }),
      db.websiteFaq.findMany({ select: { id: true, status: true, category: true } }),
      db.websiteArticle.findMany({ select: { id: true, status: true, featured: true } }),
      db.portfolioProject.findMany({ select: { id: true, status: true, featured: true } }),
      db.mediaAsset.findMany({ select: { id: true, fileSize: true, fileType: true } }),
      db.loginPagePoster.findMany({ select: { id: true, status: true } }),
      db.careersPageSetting.findUnique({ where: { id: "default" } }),
      db.jobPosting.findMany({ select: { id: true, status: true } }),
      db.websiteSetting.findUnique({ where: { key: "homepage" } }),
      db.websiteSetting.findUnique({ where: { key: "about" } }),
      db.websiteSetting.findUnique({ where: { key: "seo" } }),
    ]);

    const totalMediaBytes = mediaAssets.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);

    const summary = {
      services: {
        total: services.length,
        published: services.filter((s) => s.status === "PUBLISHED").length,
        draft: services.filter((s) => s.status === "DRAFT").length,
        archived: services.filter((s) => s.status === "ARCHIVED").length,
      },
      industries: {
        total: industries.length,
        published: industries.filter((i) => i.status === "PUBLISHED").length,
        draft: industries.filter((i) => i.status === "DRAFT").length,
        archived: industries.filter((i) => i.status === "ARCHIVED").length,
      },
      faqs: {
        total: faqs.length,
        published: faqs.filter((f) => f.status === "PUBLISHED").length,
        draft: faqs.filter((f) => f.status === "DRAFT").length,
        archived: faqs.filter((f) => f.status === "ARCHIVED").length,
      },
      articles: {
        total: articles.length,
        published: articles.filter((a) => a.status === "PUBLISHED").length,
        draft: articles.filter((a) => a.status === "DRAFT").length,
        featured: articles.filter((a) => a.featured).length,
      },
      portfolio: {
        total: portfolioProjects.length,
        published: portfolioProjects.filter((p) => p.status === "PUBLISHED").length,
        draft: portfolioProjects.filter((p) => p.status === "DRAFT" || p.status === "COMING_SOON").length,
        featured: portfolioProjects.filter((p) => p.featured).length,
      },
      media: {
        total: mediaAssets.length,
        totalBytes: totalMediaBytes,
        totalMB: (totalMediaBytes / (1024 * 1024)).toFixed(2),
      },
      loginPosters: {
        total: posters.length,
        active: posters.filter((p) => p.status === "ACTIVE").length,
        draft: posters.filter((p) => p.status === "DRAFT").length,
        scheduled: posters.filter((p) => p.status === "SCHEDULED").length,
        inactive: posters.filter((p) => p.status === "INACTIVE").length,
      },
      careers: {
        careersPageEnabled: careersSetting?.careersPageEnabled ?? false,
        totalJobs: jobs.length,
        publishedJobs: jobs.filter((j) => j.status === "PUBLISHED").length,
      },
      settings: {
        homepageStatus: homepageSetting?.status || "PUBLISHED",
        aboutStatus: aboutSetting?.status || "PUBLISHED",
        seoStatus: seoSetting?.status || "PUBLISHED",
      },
    };

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    return handleApiError(error);
  }
}
