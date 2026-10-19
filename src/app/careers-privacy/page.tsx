import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Careers & Applicant Privacy Notice",
  description:
    "Privacy notice for job applicants regarding resume collection, technical assessment notes, candidate evaluation, and data retention by Axivon Technologies.",
  path: "/careers-privacy",
  keywords: ["Careers Privacy", "Applicant Data", "Job Applications", "Resume Retention"],
});

export default async function CareersPrivacyPage() {
  const policy = await getPublishedPolicyBySlug("careers-privacy");
  if (!policy) notFound();

  const related = [
    { slug: "privacy-policy", title: "Privacy Policy", category: "PRIVACY_DATA" },
    { slug: "acceptable-use-policy", title: "Acceptable Use Policy", category: "COMPLIANCE" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/careers-privacy" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}
