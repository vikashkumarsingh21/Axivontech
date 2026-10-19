import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Accessibility Statement",
  description:
    "Axivon Technologies' commitment to digital accessibility, conformance with WCAG 2.1 Level AA standards, assistive tech compatibility, and feedback reporting.",
  path: "/accessibility",
  keywords: ["Accessibility", "WCAG 2.1 AA", "Screen Reader Support", "Keyboard Navigation", "Inclusion"],
});

export default async function AccessibilityPage() {
  const policy = await getPublishedPolicyBySlug("accessibility");
  if (!policy) notFound();

  const related = [
    { slug: "terms", title: "Terms & Conditions", category: "CORE_LEGAL" },
    { slug: "acceptable-use-policy", title: "Acceptable Use Policy", category: "COMPLIANCE" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/accessibility" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
