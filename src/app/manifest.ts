import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Axivon Technologies",
    short_name: "Axivon",
    description:
      "Axivon Technologies designs and engineers websites, mobile apps, AI systems, and custom software.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0f0f",
    theme_color: "#0f0f0f",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/assets/logo/logo-icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/logo/logo-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}