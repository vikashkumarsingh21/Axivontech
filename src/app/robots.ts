import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
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
          "/login",
          "/preferences",
          "/reminders",
        ],
      },
    ],
    sitemap: "https://axivontech.in/sitemap.xml",
    host: "https://axivontech.in",
  };
}