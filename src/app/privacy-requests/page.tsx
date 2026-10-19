import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import PrivacyRequestsClient from "./PrivacyRequestsClient";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Rights & Request Portal",
  description:
    "Exercise your rights under India's Digital Personal Data Protection Act 2023 (DPDP Act). Submit and track access, correction, erasure, or consent withdrawal requests.",
  path: "/privacy-requests",
  keywords: ["Privacy Request", "Data Rights", "DPDP Act 2023", "Data Access", "Data Erasure", "Grievance Redressal"],
});

export default function PrivacyRequestsPage() {
  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#F3F5F7] selection:bg-emerald-500/20 selection:text-emerald-300">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
          { name: "Privacy Rights Portal", url: "https://axivontech.in/privacy-requests" },
        ]}
      />
      <PrivacyRequestsClient />
    </main>
  );
}
