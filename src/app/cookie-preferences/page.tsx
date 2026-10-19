import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import CookiePreferencesPageClient from "./CookiePreferencesPageClient";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Preferences Manager",
  description:
    "Manage your cookie and tracking consent preferences for Axivon Technologies. Granular controls for necessary, performance, analytics, and marketing cookies.",
  path: "/cookie-preferences",
  keywords: ["Cookie Preferences", "Cookie Manager", "Privacy Settings", "Tracking Opt-out"],
});

export default function CookiePreferencesPage() {
  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#F3F5F7] selection:bg-emerald-500/20 selection:text-emerald-300">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: "Cookie Preferences", url: "https://axivontech.in/cookie-preferences" },
        ]}
      />
      <CookiePreferencesPageClient />
    </main>
  );
}
