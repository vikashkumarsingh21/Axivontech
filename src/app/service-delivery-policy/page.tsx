import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Service Delivery Policy",
  description:
    "Learn about Axivon Technologies' software development lifecycle, sprint cycles, staging environments, acceptance criteria, and project handoff procedures.",
  path: "/service-delivery-policy",
  keywords: ["Service Delivery", "Project Lifecycle", "Sprints", "UAT", "Acceptance Criteria", "Deployment Handoff"],
});

export default async function ServiceDeliveryPage() {
  const policy = await getPublishedPolicyBySlug("service-delivery-policy");
  if (!policy) notFound();

  const related = [
    { slug: "refund-cancellation-policy", title: "Refund & Cancellation Policy", category: "COMMERCIAL" },
    { slug: "payment-terms", title: "Payment & Billing Terms", category: "COMMERCIAL" },
    { slug: "intellectual-property", title: "Intellectual Property Policy", category: "CORE_LEGAL" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/service-delivery-policy" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
