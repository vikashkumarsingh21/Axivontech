import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Axivon Commerce — Full-Stack E-Commerce Platform & Downloadable Demo | Axivon Technologies",
  description:
    "Explore Axivon Commerce, an enterprise-grade e-commerce application demonstration featuring catalog browsing, interactive cart, checkout simulation, and a dedicated store administration console. Download the complete runnable application package to explore locally.",
  keywords: [
    "Axivon Commerce",
    "E-commerce Demo Application",
    "Downloadable E-commerce",
    "Next.js Storefront",
    "Online Store Prototype",
    "Axivon Technologies",
    "Custom E-commerce Development",
  ],
  openGraph: {
    title: "Axivon Commerce — Full-Stack E-Commerce Demo & Download",
    description:
      "Explore Axivon Commerce: live customer storefront, simulated checkout, and store admin dashboard. Downloadable as a verified standalone application package.",
    url: "https://axivontech.in/application-demos/ecommerce",
    siteName: "Axivon Technologies",
    type: "website",
  },
};

export default function EcommerceDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
