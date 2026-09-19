import type { Metadata } from "next";
import dynamic from "next/dynamic";
import PortfolioHero from "@/components/portfolio/PortfolioHero";

const FeaturedWork = dynamic(() => import("@/components/portfolio/FeaturedWork"));
const ProjectGrid = dynamic(() => import("@/components/portfolio/ProjectGrid"));
const HowWeBuild = dynamic(() => import("@/components/portfolio/HowWeBuild"));
const TechCapabilities = dynamic(() => import("@/components/portfolio/TechCapabilities"));
const RelatedInsights = dynamic(() => import("@/components/portfolio/RelatedInsights"));
const PortfolioCTA = dynamic(() => import("@/components/portfolio/PortfolioCTA"));

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