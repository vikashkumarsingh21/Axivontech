import type { Metadata } from "next";
import CookieHero from "@/components/legal/CookieHero";
import CookieContent from "@/components/legal/CookieContent";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Policy",
  description:
    "Understand how Axivon Technologies uses cookies and tracking technologies to improve user experience on our website.",
  path: "/cookie-policy",
  keywords: ["Cookie Policy", "Website Tracking", "Cookies Usage"],
});

export default function CookiePolicyPage() {
  return (
    <main className="overflow-hidden bg-[#0f0f0f]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Cookie Policy", url: "https://axivontech.in/cookie-policy" },
        ]}
      />
      <CookieHero />
      <CookieContent />
    </main>
  );
}