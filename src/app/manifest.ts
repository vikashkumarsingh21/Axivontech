import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Axivon Technologies",
    short_name: "Axivon",
    description:
      "Future-Ready Technology Solutions for Modern Businesses.",

    start_url: "/",

    display: "standalone",

    background_color: "#050816",

    theme_color: "#050816",

    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}