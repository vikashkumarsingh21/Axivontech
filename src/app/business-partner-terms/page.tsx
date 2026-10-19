import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Business Partner Terms",
  description:
    "Official agreement and operational terms for agencies, technology partners, and collaborative delivery organizations working with Axivon Technologies.",
  path: "/business-partner-terms",
  keywords: ["Business Partner Terms", "Agency Agreement", "Non-Disclosure", "Co-Delivery"],
});

export default async function BusinessPartnerTermsPage() {
  const policy = await getPublishedPolicyBySlug("business-partner-terms");
  if (!policy) notFound();

  const related = [
    { slug: "broker-terms", title: "Broker Referral & Commission Terms", category: "PROGRAM_TERMS" },
    { slug: "terms", title: "Terms & Conditions", category: "CORE_LEGAL" },
    { slug: "intellectual-property", title: "Intellectual Property Policy", category: "CORE_LEGAL" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/business-partner-terms" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
