import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Security & Vulnerability Disclosure",
  description:
    "Security practices, encryption standards, defense controls, and responsible vulnerability disclosure policy for Axivon Technologies.",
  path: "/security-policy",
  keywords: ["Security Policy", "Vulnerability Disclosure", "Safe Harbor", "Encryption", "Responsible Reporting"],
});

export default async function SecurityPolicyPage() {
  const policy = await getPublishedPolicyBySlug("security-policy");
  if (!policy) notFound();

  const related = [
    { slug: "acceptable-use-policy", title: "Acceptable Use Policy", category: "COMPLIANCE" },
    { slug: "privacy-policy", title: "Privacy Policy", category: "PRIVACY_DATA" },
    { slug: "terms", title: "Terms & Conditions", category: "CORE_LEGAL" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/security-policy" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
