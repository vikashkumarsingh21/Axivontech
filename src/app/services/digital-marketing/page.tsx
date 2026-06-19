import type { Metadata } from "next";

import { getServiceBySlug } from "@/data/services";

import ServiceHero from "@/components/service-pages/ServiceHero";
import ServiceBenefits from "@/components/service-pages/ServiceBenefits";
import ServiceProcess from "@/components/service-pages/ServiceProcess";
import ServiceTechStack from "@/components/service-pages/ServiceTechStack";
import ServiceFAQ from "@/components/service-pages/ServiceFAQ";
import CTA from "@/components/CTA";

const service = getServiceBySlug("digital-marketing");

if (!service) {
  throw new Error("Digital Marketing service not found");
}

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,

  keywords: [
    "Digital Marketing Services",
    "Online Marketing",
    "Performance Marketing",
    "Social Media Marketing",
    "Google Ads",
    "Meta Ads",
    "Facebook Marketing",
    "Instagram Marketing",
    "Lead Generation",
    "Digital Marketing Agency India",
    "Business Growth Marketing",
    "Axivon Technologies",
  ],

  openGraph: {
    title: service.metaTitle,
    description: service.metaDescription,
    url: "https://axivontech.in/services/digital-marketing",
    siteName: "Axivon Technologies",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: service.metaTitle,
    description: service.metaDescription,
  },

  alternates: {
    canonical: "https://axivontech.in/services/digital-marketing",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function DigitalMarketingPage() {
  return (
    <main className="overflow-hidden bg-[#050816]">
      {/* Hero Section */}
      <ServiceHero service={service} />

      {/* Benefits Section */}
      <ServiceBenefits service={service} />

      {/* Development Process */}
      <ServiceProcess service={service} />

      {/* Technology Stack */}
      <ServiceTechStack service={service} />

      {/* FAQ Section */}
      <ServiceFAQ service={service} />

      {/* Call To Action */}
      <CTA />
    </main>
  );
}