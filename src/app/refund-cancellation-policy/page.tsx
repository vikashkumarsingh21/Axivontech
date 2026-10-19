import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Refund & Cancellation Policy",
  description:
    "Official guidelines on milestone billing, non-refundable retainers, project cancellation protocols, and warranty periods for custom software services by Axivon Technologies.",
  path: "/refund-cancellation-policy",
  keywords: ["Refund Policy", "Cancellation Policy", "Milestone Billing", "Software Warranty"],
});

export default async function RefundPolicyPage() {
  const policy = await getPublishedPolicyBySlug("refund-cancellation-policy");
  if (!policy) notFound();

  const related = [
    { slug: "service-delivery-policy", title: "Service Delivery Policy", category: "COMMERCIAL" },
    { slug: "payment-terms", title: "Payment & Billing Terms", category: "COMMERCIAL" },
    { slug: "terms", title: "Terms & Conditions", category: "CORE_LEGAL" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/refund-cancellation-policy" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
