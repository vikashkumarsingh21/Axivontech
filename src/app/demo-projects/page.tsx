import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import DemoProjectsCatalogue from "@/components/demo-projects/DemoProjectsCatalogue";

export const metadata: Metadata = createPageMetadata({
  title: "Demo Projects — Interactive Digital Solutions Catalogue | Axivon Technologies",
  description:
    "Explore interactive website and software demonstrations created by Axivon Technologies across Healthcare, E-commerce, SaaS, Real Estate, Education, and 20+ industries.",
  path: "/demo-projects",
  keywords: [
    "Axivon Demo Projects",
    "Website Demonstrations",
    "Software Showcase",
    "Interactive Demos",
    "Industry Website Templates",
    "Custom Software Prototypes",
    "Digital Product Showcase",
    "Axivon Technologies",
  ],
});

export default function DemoProjectsPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Portfolio", url: "https://axivontech.in/portfolio" },
          { name: "Demo Projects", url: "https://axivontech.in/demo-projects" },
        ]}
      />
      <DemoProjectsCatalogue />
    </main>
  );
}
