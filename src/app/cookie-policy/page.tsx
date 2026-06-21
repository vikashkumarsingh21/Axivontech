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
    <main className="overflow-hidden bg-[#050816]">
      <CookieHero />
      <CookieContent />
    </main>
  );
}