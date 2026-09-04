import type { Metadata } from "next";
import TermsHero from "@/components/legal/TermsHero";
import TermsContent from "@/components/legal/TermsContent";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Terms & Conditions",
  description:
    "Read the terms, conditions, and service agreement guidelines for working with Axivon Technologies.",
  path: "/terms-and-conditions",
  keywords: ["Terms of Service", "Terms and Conditions", "User Agreement"],
});

export default function TermsPage() {
  return (
    <main className="overflow-hidden bg-[#0f0f0f]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Terms & Conditions", url: "https://axivontech.in/terms-and-conditions" },
        ]}
      />
      <TermsHero />
      <TermsContent />
    </main>
  );
}