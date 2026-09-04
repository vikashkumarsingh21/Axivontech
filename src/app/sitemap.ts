import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://axivontech.in";
  // Use a static date to avoid regenerating sitemaps with the current date on every build, 
  // which causes unnecessary recrawling. 
  const lastModified = "2024-03-01";

  return [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/portfolio`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/careers`, lastModified, changeFrequency: "monthly", priority: 0.7 },
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
    // Legal pages
    { url: `${baseUrl}/privacy-policy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookie-policy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}