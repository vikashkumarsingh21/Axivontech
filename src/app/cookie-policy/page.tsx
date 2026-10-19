import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Policy",
  description:
    "Learn about how Axivon Technologies uses strictly necessary, preferences, analytics, and tracking technologies across our website and AXIVON ONE platform.",
  path: "/cookie-policy",
  keywords: ["Cookie Policy", "Website Tracking", "Cookies Usage", "Cookie Consent"],
});

export default async function CookiePolicyPage() {
  const policy = await getPublishedPolicyBySlug("cookie-policy");

  if (!policy) {
    notFound();
  }

  const related = [
    { slug: "privacy-policy", title: "Privacy Policy", category: "PRIVACY_DATA" },
    { slug: "cookie-preferences", title: "Cookie Preferences Manager", category: "PRIVACY_DATA" },
    { slug: "acceptable-use-policy", title: "Acceptable Use Policy", category: "COMPLIANCE" },
  ];

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/cookie-policy" },
        ]}
      />
      <LegalPageLayout policy={policy} relatedPolicies={related} />
    </main>
  );
}