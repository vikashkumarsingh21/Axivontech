import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Acceptable Use Policy",
  description:
    "Standards of acceptable conduct, security prohibitions, abuse reporting, and operational rules for Axivon ONE multi-portal users and public visitors.",
  path: "/acceptable-use-policy",
  keywords: ["Acceptable Use", "Security Rules", "Prohibited Conduct", "Anti-Abuse", "API Usage"],
});

export default async function AcceptableUsePage() {
  const policy = await getPublishedPolicyBySlug("acceptable-use-policy");
  if (!policy) notFound();

  const related = [
    { slug: "terms", title: "Terms & Conditions", category: "CORE_LEGAL" },
    { slug: "security-policy", title: "Security & Vulnerability Policy", category: "COMPLIANCE" },
    { slug: "privacy-policy", title: "Privacy Policy", category: "PRIVACY_DATA" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/acceptable-use-policy" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
