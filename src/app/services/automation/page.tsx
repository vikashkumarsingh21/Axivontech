import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/data/services";
import { getPublishedServiceBySlug } from "@/lib/content/content-db";

import ServiceHero from "@/components/service-pages/ServiceHero";
import ServiceBenefits from "@/components/service-pages/ServiceBenefits";
import ServiceProcess from "@/components/service-pages/ServiceProcess";
import ServiceTechStack from "@/components/service-pages/ServiceTechStack";
import ServiceFAQ from "@/components/service-pages/ServiceFAQ";
import ServiceSchema from "@/components/seo/ServiceSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const SLUG = "automation";

export async function generateMetadata(): Promise<Metadata> {
  const service = (await getPublishedServiceBySlug(SLUG)) || getServiceBySlug(SLUG);
  if (!service) return {};

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: {
      canonical: `https://axivontech.in/services/${SLUG}`,
    },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: `https://axivontech.in/services/${SLUG}`,
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
}

export default async function AutomationPage() {
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
          { name: "Home", url: "https://axivontech.in" },
          { name: "Services", url: "https://axivontech.in/services" },
          { name: service.title, url: `https://axivontech.in/services/${SLUG}` },
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
