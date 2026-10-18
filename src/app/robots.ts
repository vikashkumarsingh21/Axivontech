import type { MetadataRoute } from "next";
import { getSeoSettings } from "@/lib/content/content-db";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSettings();
  const baseUrl = seo.canonicalBase || "https://axivontech.in";

  if (!seo.allowIndexing) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
      host: baseUrl,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/employee/",
          "/executive/",
          "/broker/",
          "/client/",
          "/login",
          "/logout",
          "/preferences",
          "/reminders",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}