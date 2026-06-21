import type { Metadata } from "next";

import PrivacyPolicyHero from "@/components/legal/PrivacyPolicyHero";
import PrivacyPolicyContent from "@/components/legal/PrivacyPolicyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy of Axivon Technologies.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="overflow-hidden bg-[#050816]">
      <PrivacyPolicyHero />
      <PrivacyPolicyContent />
    </main>
  );
}