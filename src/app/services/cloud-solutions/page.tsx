import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/data/services";
import { getPublishedServiceBySlug } from "@/lib/content/content-db";

import ServiceHero from "@/components/service-pages/ServiceHero";
import ServiceBenefits from "@/components/service-pages/ServiceBenefits";
import ServiceProcess from "@/components/service-pages/ServiceProcess";
import ServiceTechStack from "@/components/service-pages/ServiceTechStack";
import ServiceFAQ from "@/components/service-pages/ServiceFAQ";
import CTA from "@/components/CTA";
import ServiceSchema from "@/components/seo/ServiceSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const SLUG = "cloud-solutions";

export async function generateMetadata(): Promise<Metadata> {
  const service = (await getPublishedServiceBySlug(SLUG)) || getServiceBySlug(SLUG);
  if (!service) return {};

  return {
    title: service.metaTitle,
    description: service.metaDescription,

  keywords: [
    "Cloud Solutions",
    "Cloud Computing Services",
    "AWS Development",
    "Microsoft Azure",
    "Google Cloud Platform",
    "Cloud Infrastructure",
    "Cloud Migration",
    "Cloud Security",
    "DevOps Services",
    "Cloud Deployment",
    "Scalable Cloud Applications",
    "Cloud Consulting",
    "Axivon Technologies",
  ],

  openGraph: {
    title: service.metaTitle,
    description: service.metaDescription,
    url: "https://axivontech.in/services/cloud-solutions",
    siteName: "Axivon Technologies",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: service.metaTitle,
    description: service.metaDescription,
  },

  alternates: {
    canonical: "https://axivontech.in/services/cloud-solutions",
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
}

export default async function CloudSolutionsPage() {
  const service = (await getPublishedServiceBySlug(SLUG)) || getServiceBySlug(SLUG);
  if (!service) notFound();

  return (
    <main className="overflow-hidden bg-[#0f0f0f]">
      <ServiceSchema
        name={service.title}
        description={service.metaDescription}
        url={`https://axivontech.in/services/${SLUG}`}
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
            name: service.title,
            url: `https://axivontech.in/services/${SLUG}`,
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