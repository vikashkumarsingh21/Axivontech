import ServicesHero from "@/components/services/ServicesHero";
import ServicesGrid from "@/components/services/ServicesGrid";
import DevelopmentProcess from "@/components/services/DevelopmentProcess";

import IndustriesWeServe from "@/components/services/IndustriesWeServe";
import TechnologyStack from "@/components/about/TechnologyStack";

import PricingBanner from "@/components/services/PricingBanner";
import ServicesFAQ from "@/components/services/ServicesFAQ";

import CTA from "@/components/CTA";

export const metadata = {
  title: "Services | Axivon Technologies",
  description:
    "Web Development, Mobile App Development, AI Solutions, SEO, Digital Marketing and Custom Software Development by Axivon Technologies.",
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