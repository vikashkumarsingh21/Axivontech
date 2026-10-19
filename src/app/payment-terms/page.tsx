import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Payment & Billing Terms",
  description:
    "Accepted payment methods, currency handling, milestone invoicing, tax applicability (GST), and settlement terms for Axivon Technologies.",
  path: "/payment-terms",
  keywords: ["Payment Terms", "Billing", "Invoicing", "Milestone Settlement", "GST"],
});

export default async function PaymentTermsPage() {
  const policy = await getPublishedPolicyBySlug("payment-terms");
  if (!policy) notFound();

  const related = [
    { slug: "refund-cancellation-policy", title: "Refund & Cancellation Policy", category: "COMMERCIAL" },
    { slug: "service-delivery-policy", title: "Service Delivery Policy", category: "COMMERCIAL" },
    { slug: "terms", title: "Terms & Conditions", category: "CORE_LEGAL" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/payment-terms" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
