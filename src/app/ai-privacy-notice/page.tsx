import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = createPageMetadata({
  title: "AI Privacy & Usage Notice",
  description:
    "Transparency notice on how Axivon AI Assistants operate, LLM data processing rules, zero-training on confidential client data, and human oversight standards.",
  path: "/ai-usage",
  keywords: ["AI Privacy", "AI Ethics", "LLM Data Processing"],
});

export default async function AiPrivacyNoticePage() {
  const policy = await getPublishedPolicyBySlug("ai-usage");
  if (!policy) notFound();

  return (
    <main className="overflow-hidden bg-[#0B0D10]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: policy.title, url: "https://axivontech.in/ai-usage" },
        ]}
      />
      <LegalPageLayout policy={policy} />
    </main>
  );
}
