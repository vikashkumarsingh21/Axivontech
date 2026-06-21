import type { Metadata } from "next";

import TermsHero from "@/components/legal/TermsHero";
import TermsContent from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and Conditions of Axivon Technologies.",
};

export default function TermsPage() {
  return (
    <main className="overflow-hidden bg-[#050816]">
      <TermsHero />
      <TermsContent />
    </main>
  );
}