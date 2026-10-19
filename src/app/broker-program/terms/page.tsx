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
  path: "/broker-program/terms",
  keywords: ["Broker Terms", "Referral Agreement"],
});

export default async function BrokerProgramTermsPage() {
  const policy = await getPublishedPolicyBySlug("broker-terms");
  if (!policy) notFound();

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/broker-program/terms" },
        ]}
      />
      <LegalPageLayout policy={policy} />
    </main>
  );
}
