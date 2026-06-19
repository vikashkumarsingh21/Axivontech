import type { Metadata } from "next";

import { getServiceBySlug } from "@/data/services";

import ServiceHero from "@/components/service-pages/ServiceHero";
import ServiceBenefits from "@/components/service-pages/ServiceBenefits";
import ServiceProcess from "@/components/service-pages/ServiceProcess";
import ServiceTechStack from "@/components/service-pages/ServiceTechStack";
import ServiceFAQ from "@/components/service-pages/ServiceFAQ";
import CTA from "@/components/CTA";

const service = getServiceBySlug("ai-solutions")!;

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  keywords: [
    "AI Solutions",
    "Artificial Intelligence",
    "Machine Learning",
    "AI Automation",
    "AI Chatbot Development",
    "Generative AI",
    "Business Automation",
    "Axivon Technologies",
  ],
};

export default function AISolutionsPage() {
  return (
    <main className="overflow-hidden bg-[#050816]">
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