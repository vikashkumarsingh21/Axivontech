import { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/data/blog-posts";
import { portfolioProjects } from "@/data/portfolio";
import { isCareersPageEnabled, getPublishedJobs } from "@/lib/careers/careers-db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://axivontech.in";
  const lastModified = "2026-10-16";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1 },
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
    { url: `${baseUrl}/blog`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    // Service Pages
    { url: `${baseUrl}/services/web-development`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/mobile-app-development`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/ai-solutions`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/cloud-solutions`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/ui-ux-design`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/seo-services`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/digital-marketing`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/custom-software-development`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/automation`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/robotics-iot`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    // Legal pages
    { url: `${baseUrl}/privacy-policy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookie-policy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  const portfolioPages: MetadataRoute.Sitemap = portfolioProjects.map((project) => ({
    url: `${baseUrl}/portfolio/${project.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedDate || post.publishedDate).toISOString().split("T")[0],
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Dynamic Careers Sitemap: only included if the administrator has enabled the careers page
  const careersEnabled = await isCareersPageEnabled();
  let careerPages: MetadataRoute.Sitemap = [];

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

  return [...staticPages, ...portfolioPages, ...blogPages, ...careerPages];
}