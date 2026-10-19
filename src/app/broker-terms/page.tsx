import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Broker Referral & Commission Terms",
  description:
    "Official agreement governing referral link tracking, qualifying project criteria, commission calculation tiers, and disbursement schedules for Axivon Brokers.",
  path: "/broker-terms",
  keywords: ["Broker Terms", "Referral Agreement", "Commission Tiers", "Deal Attribution"],
});

export default async function BrokerTermsPage() {
  const policy = await getPublishedPolicyBySlug("broker-terms");
  if (!policy) notFound();

  const related = [
    { slug: "business-partner-terms", title: "Business Partner Terms", category: "PROGRAM_TERMS" },
    { slug: "terms", title: "Terms & Conditions", category: "CORE_LEGAL" },
    { slug: "payment-terms", title: "Payment & Billing Terms", category: "COMMERCIAL" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/broker-terms" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
