import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },

      {
        userAgent: "Googlebot",
        allow: "/",
      },

      {
        userAgent: "Bingbot",
        allow: "/",
      },
    ],

    sitemap: "https://axivontech.in/sitemap.xml",

    host: "https://axivontech.in",
  };
}