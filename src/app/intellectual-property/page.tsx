import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Intellectual Property Policy",
  description:
    "Intellectual property policy defining custom code deliverable ownership, Axivon Core background technologies, open-source compliance, and trademarks.",
  path: "/intellectual-property",
  keywords: ["Intellectual Property", "IP Ownership", "Copyright", "Software Licensing", "Background IP"],
});

export default async function IntellectualPropertyPage() {
  const policy = await getPublishedPolicyBySlug("intellectual-property");
  if (!policy) notFound();

  const related = [
    { slug: "terms", title: "Terms & Conditions", category: "CORE_LEGAL" },
    { slug: "service-delivery-policy", title: "Service Delivery Policy", category: "COMMERCIAL" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/intellectual-property" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
