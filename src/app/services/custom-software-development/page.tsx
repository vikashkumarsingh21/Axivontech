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

const service = getServiceBySlug("custom-software-development");

if (!service) {
  throw new Error("Custom Software Development service not found");
}

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,

  keywords: [
    "Custom Software Development",
    "Business Software Development",
    "Enterprise Software Solutions",
    "CRM Development",
    "ERP Development",
    "Web Application Development",
    "Software Consulting",
    "Custom Business Applications",
    "Workflow Automation",
    "Enterprise Solutions",
    "Software Development Company",
    "Axivon Technologies",
  ],

  openGraph: {
    title: service.metaTitle,
    description: service.metaDescription,
    url: "https://axivontech.in/services/custom-software-development",
    siteName: "Axivon Technologies",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: service.metaTitle,
    description: service.metaDescription,
  },

  alternates: {
    canonical:
      "https://axivontech.in/services/custom-software-development",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function CustomSoftwareDevelopmentPage() {
  return (
    <main className="overflow-hidden bg-[#050816]">

      <ServiceSchema
        name={service.title}
        description={service.metaDescription}
        url="https://axivontech.in/services/custom-software-development"
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
                  name: "Custom Software Development",
                  url: "https://axivontech.in/services/custom-software-development",
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

      {/* CTA Section */}
      <CTA />
    </main>
  );
}