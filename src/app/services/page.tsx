import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";

import dynamic from "next/dynamic";
import ServicesHero from "@/components/services/ServicesHero";

const SolutionAreas = dynamic(() => import("@/components/services/SolutionAreas"));
const CoreServices = dynamic(() => import("@/components/services/CoreServices"));
const ServiceExplorer = dynamic(() => import("@/components/services/ServiceExplorer"));
const TechnologyCapabilities = dynamic(() => import("@/components/services/TechnologyCapabilities"));
const HowWeWork = dynamic(() => import("@/components/services/HowWeWork"));
const ServicesByNeed = dynamic(() => import("@/components/services/ServicesByNeed"));
const RelatedWork = dynamic(() => import("@/components/services/RelatedWork"));
const ServicesFAQ = dynamic(() => import("@/components/services/ServicesFAQ"));
const ServicesCTA = dynamic(() => import("@/components/services/ServicesCTA"));

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