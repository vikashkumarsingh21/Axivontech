import type { Metadata } from "next";

import PortfolioHero from "@/components/portfolio/PortfolioHero";

// Future Sections
import FeaturedProjects from "@/components/portfolio/FeaturedProjects";
// import ProjectFilters from "@/components/portfolio/ProjectFilters";
import CaseStudies from "@/components/portfolio/CaseStudies";
import PortfolioStats from "@/components/portfolio/PortfolioStats";
import ClientTestimonials from "@/components/portfolio/ClientTestimonials";

import CTA from "@/components/CTA";

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
};

export default function PortfolioPage() {
  return (
    <main className="overflow-hidden bg-[#050816]">
      {/* Hero Section */}
      <PortfolioHero />

      {/* Featured Projects */}
      <FeaturedProjects />

      {/* Project Categories Filter */}
      {/* <ProjectFilters /> */}

      {/* Detailed Case Studies */}
      <CaseStudies />

      {/* Company / Portfolio Statistics */}
      <PortfolioStats />

      {/* Testimonials */}
      <ClientTestimonials />

      {/* CTA */}
      <CTA />
    </main>
  );
}