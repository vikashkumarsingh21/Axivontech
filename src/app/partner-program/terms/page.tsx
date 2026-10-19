import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Partner Program Terms",
  description:
    "Official agreement and operational terms for agencies, technology partners, and collaborative delivery organizations working with Axivon Technologies.",
  path: "/partner-program/terms",
  keywords: ["Partner Program Terms", "Agency Agreement"],
});

export default async function PartnerProgramTermsPage() {
  const policy = await getPublishedPolicyBySlug("business-partner-terms");
  if (!policy) notFound();

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Business Partner", url: "https://axivontech.in/business-partner" },
          { name: "Partner Program Terms", url: "https://axivontech.in/partner-program/terms" },
        ]}
      />
      <LegalPageLayout policy={policy} />
    </main>
  );
}
