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
          "/broker/",
          "/client/",
          "/login",
          "/logout",
          "/preferences",
          "/reminders",
        ],
      },
    ],
    sitemap: "https://axivontech.in/sitemap.xml",
    host: "https://axivontech.in",
  };
}