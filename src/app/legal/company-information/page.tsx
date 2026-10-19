import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Company Legal Information",
  description:
    "Official corporate identity details, registered particulars, contact channels, operating jurisdiction, and statutory officers for Axivon Technologies.",
  path: "/legal/company-information",
  keywords: ["Company Information", "Corporate Details", "Jurisdiction", "Grievance Officer", "Contact"],
});

export default async function CompanyInformationPage() {
  const policy = await getPublishedPolicyBySlug("company-information");
  if (!policy) notFound();

  const related = [
    { slug: "terms", title: "Terms & Conditions", category: "CORE_LEGAL" },
    { slug: "privacy-policy", title: "Privacy Policy", category: "PRIVACY_DATA" },
    { slug: "disclaimer", title: "Legal Disclaimer", category: "CORE_LEGAL" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/legal/company-information" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
