import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Terms & Conditions",
  description:
    "Official Terms and Conditions governing use of the Axivon Technologies website, AXIVON ONE enterprise portals, and software development service engagements.",
  path: "/terms",
  keywords: ["Terms of Service", "Terms and Conditions", "Master Service Agreement", "User Agreement"],
});

export default async function TermsPage() {
  const policy = await getPublishedPolicyBySlug("terms");

  if (!policy) {
    notFound();
  }

  const related = [
    { slug: "service-delivery-policy", title: "Service Delivery Policy", category: "COMMERCIAL" },
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
          { name: policy.title, url: "https://axivontech.in/terms" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
