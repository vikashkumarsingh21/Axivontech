import type { Metadata } from "next";

import { getServiceBySlug } from "@/data/services";

import ServiceHero from "@/components/service-pages/ServiceHero";
import ServiceBenefits from "@/components/service-pages/ServiceBenefits";
import ServiceProcess from "@/components/service-pages/ServiceProcess";
import ServiceTechStack from "@/components/service-pages/ServiceTechStack";
import ServiceFAQ from "@/components/service-pages/ServiceFAQ";
import ServiceSchema from "@/components/seo/ServiceSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const service = getServiceBySlug("automation");

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  alternates: {
    canonical: "https://axivontech.in/services/automation",
  },
  openGraph: {
    title: service.metaTitle,
    description: service.metaDescription,
    url: "https://axivontech.in/services/automation",
    siteName: "Axivon Technologies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: service.metaTitle,
    description: service.metaDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "Business Process Automation",
    "Workflow Automation",
    "API Integrations",
    "Data Pipelines",
    "Custom Integrations",
    "Zapier Alternatives",
    "Axivon Technologies",
  ],
};

export default function AutomationPage() {
  return (
    <main className="overflow-hidden bg-[#0f0f0f]">
      <ServiceSchema
        name={service.title}
        description={service.metaDescription}
        url="https://axivontech.in/services/automation"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Services", url: "https://axivontech.in/services" },
          { name: "Automation", url: "https://axivontech.in/services/automation" },
        ]}
      />
      <ServiceHero service={service} />
      <ServiceBenefits service={service} />
      <ServiceProcess service={service} />
      <ServiceTechStack service={service} />
      <ServiceFAQ service={service} />
    </main>
  );
}
