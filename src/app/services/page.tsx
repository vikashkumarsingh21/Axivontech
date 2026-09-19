import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";

import ServicesHero from "@/components/services/ServicesHero";
import SolutionAreas from "@/components/services/SolutionAreas";
import CoreServices from "@/components/services/CoreServices";
import ServiceExplorer from "@/components/services/ServiceExplorer";
import TechnologyCapabilities from "@/components/services/TechnologyCapabilities";
import HowWeWork from "@/components/services/HowWeWork";
import ServicesByNeed from "@/components/services/ServicesByNeed";
import RelatedWork from "@/components/services/RelatedWork";
import ServicesFAQ from "@/components/services/ServicesFAQ";
import ServicesCTA from "@/components/services/ServicesCTA";

export const metadata: Metadata = createPageMetadata({
  title: "Website Development, Mobile App Development & Software Services",
  description:
    "Explore Axivon Technologies' professional Website Development, Mobile App Development, AI Solutions, UI/UX Design, SEO Services, Digital Marketing, Cloud Solutions and Custom Software Development services for startups and businesses.",
  path: "/services",
  keywords: [
    "Website Development",
    "Mobile App Development",
    "Software Services",
    "AI Solutions",
    "Digital Marketing",
  ],
});

export default function ServicesPage() {
  return (
    <main className="bg-[#0f0f0f] overflow-hidden">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Services", url: "https://axivontech.in/services" },
        ]}
      />
      
      {/* 01 - Services Hero */}
      <ServicesHero />
      
      {/* 02 - What We Help Businesses Build */}
      <SolutionAreas />

      {/* 03 - Core Services */}
      <CoreServices />

      {/* 04 - Explore Services */}
      <ServiceExplorer />

      {/* 05 - Technology Capabilities */}
      <TechnologyCapabilities />

      {/* 06 - How We Work */}
      <HowWeWork />

      {/* 07 - Services by Business Need */}
      <ServicesByNeed />

      {/* 08 - Related Work / Portfolio */}
      <RelatedWork />

      {/* 09 - FAQ */}
      <ServicesFAQ />

      {/* 10 - Final Conversion CTA */}
      <ServicesCTA />
    </main>
  );
}