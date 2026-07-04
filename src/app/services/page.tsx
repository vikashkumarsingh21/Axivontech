import type { Metadata } from "next";
import ServicesHero from "@/components/services/ServicesHero";
import ServicesGrid from "@/components/services/ServicesGrid";
import DevelopmentProcess from "@/components/services/DevelopmentProcess";

import IndustriesWeServe from "@/components/services/IndustriesWeServe";
import TechnologyStack from "@/components/about/TechnologyStack";

import PricingBanner from "@/components/services/PricingBanner";
import ServicesFAQ from "@/components/services/ServicesFAQ";

import CTA from "@/components/CTA";



export const metadata: Metadata = {
  title:
    "Website Development, Mobile App Development & Software Services | Axivon Technologies",

  description:
    "Explore Axivon Technologies' professional Website Development, Mobile App Development, AI Solutions, UI/UX Design, SEO Services, Digital Marketing, Cloud Solutions and Custom Software Development services for startups and businesses.",

  alternates: {
    canonical: "https://axivontech.in/services",
  },

  openGraph: {
    title:
      "Website Development & Software Services | Axivon Technologies",

    description:
      "Professional Website Development, Mobile App Development, AI Solutions and Digital Services for modern businesses.",

    url: "https://axivontech.in/services",

    siteName: "Axivon Technologies",

    locale: "en_US",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Website Development & Software Services | Axivon Technologies",

    description:
      "Explore our Website Development, Mobile App Development, AI Solutions and Software Development services.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function ServicesPage() {
  return (
    <main className="bg-[#050816] overflow-hidden">
      <ServicesHero />

      <ServicesGrid />

      <DevelopmentProcess />

      <IndustriesWeServe />

      <TechnologyStack />

      <PricingBanner />

      <ServicesFAQ />

      <CTA />
    </main>
  );
}