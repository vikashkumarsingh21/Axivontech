import type { Metadata } from "next";
import PrivacyPolicyHero from "@/components/legal/PrivacyPolicyHero";
import PrivacyPolicyContent from "@/components/legal/PrivacyPolicyContent";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "Learn about how Axivon Technologies collects, protects, and manages your personal information and privacy rights.",
  path: "/privacy-policy",
  keywords: ["Privacy Policy", "Data Protection", "User Privacy"],
});

export default function PrivacyPolicyPage() {
  return (
    <main className="overflow-hidden bg-[#0f0f0f]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Privacy Policy", url: "https://axivontech.in/privacy-policy" },
        ]}
      />
      <PrivacyPolicyHero />
      <PrivacyPolicyContent />
    </main>
  );
}