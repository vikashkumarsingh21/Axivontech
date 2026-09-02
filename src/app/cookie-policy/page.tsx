import type { Metadata } from "next";

import CookieHero from "@/components/legal/CookieHero";
import CookieContent from "@/components/legal/CookieContent";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Cookie Policy of Axivon Technologies.",
};

export default function CookiePolicyPage() {
  return (
    <main className="overflow-hidden bg-[#0f0f0f]">
      <CookieHero />
      <CookieContent />
    </main>
  );
}