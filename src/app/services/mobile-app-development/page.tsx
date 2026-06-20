import type { Metadata } from "next";

import { getServiceBySlug } from "@/data/services";

import ServiceHero from "@/components/service-pages/ServiceHero";
import ServiceBenefits from "@/components/service-pages/ServiceBenefits";
import ServiceProcess from "@/components/service-pages/ServiceProcess";
import ServiceTechStack from "@/components/service-pages/ServiceTechStack";
import ServiceFAQ from "@/components/service-pages/ServiceFAQ";
import CTA from "@/components/CTA";
import ServiceSchema from "@/components/seo/ServiceSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

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

      <ServiceSchema
        name={service.title}
        description={service.metaDescription}
        url="https://axivontech.in/services/mobile-app-development"
      />

      <BreadcrumbSchema
              items={[
                {
                  name: "Home",
                  url: "https://axivontech.in",
                },
                {
                  name: "Services",
                  url: "https://axivontech.in/services",
                },
                {
                  name: "Mobile App Development",
                  url: "https://axivontech.in/services/mobile-app-development",
                },
              ]}
            />

      <ServiceHero service={service} />
      <ServiceBenefits service={service} />
      <ServiceProcess service={service} />
      <ServiceTechStack service={service} />
      <ServiceFAQ service={service} />
      <CTA />
    </main>
  );
}