import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Legal Disclaimer",
  description:
    "Official disclaimers regarding website estimates, AI assistant output verification, third-party integrations, and warranties for Axivon Technologies.",
  path: "/disclaimer",
  keywords: ["Legal Disclaimer", "AI Accuracy", "Technical Estimates", "Warranties Disclaimer"],
});

export default async function DisclaimerPage() {
  const policy = await getPublishedPolicyBySlug("disclaimer");
  if (!policy) notFound();

  const related = [
    { slug: "terms", title: "Terms & Conditions", category: "CORE_LEGAL" },
    { slug: "ai-usage", title: "AI Privacy & Usage Notice", category: "PRIVACY_DATA" },
    { slug: "service-delivery-policy", title: "Service Delivery Policy", category: "COMMERCIAL" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/disclaimer" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
