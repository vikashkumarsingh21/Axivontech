import { MetadataRoute } from "next";
import { portfolioProjects } from "@/data/portfolio";
import { DEMO_PROJECTS, getDemoProjectSlug } from "@/data/demo-projects";
import { isCareersPageEnabled, getPublishedJobs } from "@/lib/careers/careers-db";
import { getPublishedArticles, getPublishedServices, getSeoSettings } from "@/lib/content/content-db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSeoSettings();
  const baseUrl = seo.canonicalBase || "https://axivontech.in";
  const lastModified = new Date().toISOString().split("T")[0];

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/portfolio`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/industries`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/business-partner`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/reviews`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/demo-projects`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/demo-projects/business/corporatepro`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/demo-projects/healthcare/medicare`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/demo-projects/food/foodiehub`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/demo-projects/education/edusmart`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/demo-projects/ecommerce/novacart`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/demo-projects/fitness/fitzone`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/demo-projects/real-estate/estatevista`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/demo-projects/saas/leadpilot`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    // Legal pages
    { url: `${baseUrl}/privacy-policy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookie-policy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic Service Pages from CMS
  const services = await getPublishedServices();
  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const portfolioPages: MetadataRoute.Sitemap = portfolioProjects.map((project) => ({
    url: `${baseUrl}/portfolio/${project.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Dynamic Blog Pages from CMS
  const articles = await getPublishedArticles();
  const blogPages: MetadataRoute.Sitemap = articles.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.publishedDate || lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Dynamic Careers Sitemap: only included if the administrator has enabled the careers page
  const careersEnabled = await isCareersPageEnabled();
  const careerPages: MetadataRoute.Sitemap = [];

  if (careersEnabled) {
    careerPages.push({
      url: `${baseUrl}/careers`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    });

    const publishedJobs = await getPublishedJobs();
    for (const job of publishedJobs) {
      careerPages.push({
        url: `${baseUrl}/careers/${job.slug}`,
        lastModified: job.publishedAt ? new Date(job.publishedAt).toISOString().split("T")[0] : lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  const demoProjectDetailPages: MetadataRoute.Sitemap = DEMO_PROJECTS.map((project) => ({
    url: `${baseUrl}/demo-projects/${getDemoProjectSlug(project)}`,
    lastModified,
    changeFrequency: project.status === "Live Demo" ? "weekly" : "monthly",
    priority: project.status === "Live Demo" ? 0.8 : 0.6,
  }));

  return [...staticPages, ...servicePages, ...portfolioPages, ...blogPages, ...careerPages, ...demoProjectDetailPages];
}