import type { Metadata } from "next";

import { getServiceBySlug } from "@/data/services";

import ServiceHero from "@/components/service-pages/ServiceHero";
import ServiceBenefits from "@/components/service-pages/ServiceBenefits";
import ServiceProcess from "@/components/service-pages/ServiceProcess";
import ServiceTechStack from "@/components/service-pages/ServiceTechStack";
import ServiceFAQ from "@/components/service-pages/ServiceFAQ";
import CTA from "@/components/CTA";

const service = getServiceBySlug("mobile-app-development");

if (!service) {
  throw new Error("Mobile App Development service not found");
}

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
};

export default function MobileAppDevelopmentPage() {
  return (
    <main className="overflow-hidden bg-[#050816]">
      <ServiceHero service={service} />
      <ServiceBenefits service={service} />
      <ServiceProcess service={service} />
      <ServiceTechStack service={service} />
      <ServiceFAQ service={service} />
      <CTA />
    </main>
  );
}