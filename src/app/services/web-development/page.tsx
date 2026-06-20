import type { Metadata } from "next";

import { getServiceBySlug } from "@/data/services";

import ServiceHero from "@/components/service-pages/ServiceHero";
import ServiceBenefits from "@/components/service-pages/ServiceBenefits";
import ServiceProcess from "@/components/service-pages/ServiceProcess";
import ServiceTechStack from "@/components/service-pages/ServiceTechStack";
import ServiceFAQ from "@/components/service-pages/ServiceFAQ";
// import CTA from "@/components/CTA";
import ServiceSchema from "@/components/seo/ServiceSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const service = getServiceBySlug("web-development");

if (!service) {
  throw new Error("Web Development service not found");
}

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  keywords: [
    "Web Development",
    "Next.js Development",
    "React Development",
    "Custom Website Development",
    "Business Website",
    "SEO Friendly Website",
    "Axivon Technologies",
  ],
};

export default function WebDevelopmentPage() {
  return (
    <main className="overflow-hidden bg-[#050816']">
      
      <ServiceSchema
        name={service.title}
        description={service.metaDescription}
        url="https://axivontech.in/services/web-development"
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
            name: "Web Development",
            url: "https://axivontech.in/services/web-development",
          },
        ]}
      />

      {/* Hero Section */}
      <ServiceHero service={service} />

      {/* Benefits Section */}
      <ServiceBenefits service={service} />

      {/* Process Section */}
      <ServiceProcess service={service} />

      {/* Technology Stack */}
      <ServiceTechStack service={service} />

      {/* FAQ Section */}
      <ServiceFAQ service={service} />

    </main>
  );
}