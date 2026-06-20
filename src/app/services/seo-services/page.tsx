import type { Metadata } from "next";

import { getServiceBySlug } from "@/data/services";

import ServiceHero from "@/components/service-pages/ServiceHero";
import ServiceBenefits from "@/components/service-pages/ServiceBenefits";
import ServiceProcess from "@/components/service-pages/ServiceProcess";
import ServiceTechStack from "@/components/service-pages/ServiceTechStack";
import ServiceFAQ from "@/components/service-pages/ServiceFAQ";
import CTA from "@/components/CTA";
import ServiceSchema from "@/components/seo/ServiceSchema";

const service = getServiceBySlug("seo-services");

if (!service) {
  throw new Error("SEO Services not found");
}

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,

  keywords: [
    "SEO Services",
    "Search Engine Optimization",
    "Technical SEO",
    "On Page SEO",
    "Off Page SEO",
    "Local SEO",
    "Google Ranking",
    "Website SEO",
    "SEO Agency India",
    "SEO Company Bihar",
    "Digital Marketing Services",
    "Axivon Technologies",
  ],

  openGraph: {
    title: service.metaTitle,
    description: service.metaDescription,
    type: "website",
    siteName: "Axivon Technologies",
  },

  twitter: {
    card: "summary_large_image",
    title: service.metaTitle,
    description: service.metaDescription,
  },

  alternates: {
    canonical: "https://axivontech.in/services/seo-services",
  },
};

export default function SEOServicesPage() {
  return (
    <main className="overflow-hidden bg-[#050816]">
      <ServiceSchema
        name={service.title}
        description={service.metaDescription}
        url="https://axivontech.in/services/seo-services"
      />
      {/* Hero */}
      <ServiceHero service={service} />

      {/* Benefits */}
      <ServiceBenefits service={service} />

      {/* Process */}
      <ServiceProcess service={service} />

      {/* Technology Stack */}
      <ServiceTechStack service={service} />

      {/* FAQ */}
      <ServiceFAQ service={service} />

      {/* CTA */}
      <CTA />
    </main>
  );
}