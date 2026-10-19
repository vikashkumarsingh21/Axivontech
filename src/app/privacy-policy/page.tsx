import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "Comprehensive privacy policy for Axivon Technologies detailing personal data collection, processing, DPDP Act 2023 compliance, cookies, security, and data subject rights.",
  path: "/privacy-policy",
  keywords: ["Privacy Policy", "DPDP Act 2023", "Data Protection", "Information Technology Act", "Data Principal Rights"],
});

export default async function PrivacyPolicyPage() {
  const policy = await getPublishedPolicyBySlug("privacy-policy");

  if (!policy) {
    notFound();
  }

  const related = [
    { slug: "cookie-policy", title: "Cookie Policy", category: "PRIVACY_DATA" },
    { slug: "ai-usage", title: "AI Privacy & Usage Notice", category: "PRIVACY_DATA" },
    { slug: "privacy-requests", title: "Data Subject Privacy Rights Portal", category: "PRIVACY_DATA" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/privacy-policy" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}