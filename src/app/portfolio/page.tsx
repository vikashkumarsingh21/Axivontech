import type { Metadata } from "next";

import PortfolioHero from "@/components/portfolio/PortfolioHero";
import FeaturedWork from "@/components/portfolio/FeaturedWork";
import ProjectGrid from "@/components/portfolio/ProjectGrid";
import HowWeBuild from "@/components/portfolio/HowWeBuild";
import TechCapabilities from "@/components/portfolio/TechCapabilities";
import RelatedInsights from "@/components/portfolio/RelatedInsights";
import PortfolioCTA from "@/components/portfolio/PortfolioCTA";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Explore the portfolio of Axivon Technologies. Discover our work in Web Development, Mobile App Development, AI Solutions, Cloud Solutions, UI/UX Design, MVP Development, and Custom Software Development.",

  keywords: [
    "Axivon Portfolio",
    "Web Development Projects",
    "Mobile App Projects",
    "AI Projects",
    "Cloud Solutions Portfolio",
    "UI UX Design Portfolio",
    "Software Development Projects",
    "Technology Portfolio",
    "Axivon Technologies",
  ],

  alternates: {
    canonical: "https://axivontech.in/portfolio",
  },

  openGraph: {
    title: "Portfolio | Axivon Technologies",
    description:
      "Explore our portfolio of innovative digital products, websites, mobile applications, AI solutions, and cloud platforms.",
    url: "https://axivontech.in/portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio | Axivon Technologies",
    description:
      "Explore our portfolio of innovative digital products, websites, mobile applications, AI solutions, and cloud platforms.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PortfolioPage() {
  return (
    <main className="bg-[#0f0f0f]">
      {/* Clean editorial hero */}
      <PortfolioHero />

      {/* Asymmetric featured project showcase */}
      <FeaturedWork />

      {/* Filterable project grid with all projects */}
      <ProjectGrid />

      {/* Process / approach timeline */}
      <HowWeBuild />

      {/* Technology capabilities grouped by domain */}
      <TechCapabilities />

      {/* Related blog posts */}
      <RelatedInsights />

      {/* Final call to action */}
      <PortfolioCTA />
    </main>
  );
}