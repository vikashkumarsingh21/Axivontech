import type { Metadata } from "next";
import EstateVistaClientView from "@/components/demo-projects/estatevista/EstateVistaClientView";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

export const metadata: Metadata = {
  title: "EstateVista — Prime Real Estate & Architecture Demo | Axivon Technologies",
  description:
    "Explore EstateVista, an interactive luxury real estate demo by Axivon Technologies. Featuring architectural floor plans, live property filtering, mortgage calculators, and private tour booking.",
  keywords: [
    "EstateVista",
    "Real Estate Website Demo",
    "Luxury Property Portal",
    "Architectural Showcase",
    "Axivon Technologies Demo Projects",
    "Prop-Tech Platform",
    "Property Search & Filter",
    "Mortgage Calculator Demo",
  ],
  openGraph: {
    title: "EstateVista — Prime Real Estate & Architecture Showcase | Axivon Technologies",
    description:
      "A premium real estate and prop-tech demonstration engineered with architectural precision and responsive frontend design by Axivon Technologies.",
    url: "https://axivontech.in/demo-projects/real-estate/estatevista",
    siteName: "Axivon Technologies",
    type: "website",
  },
};

export default function EstateVistaPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Demo Projects", url: "https://axivontech.in/demo-projects" },
          {
            name: "EstateVista (Real Estate)",
            url: "https://axivontech.in/demo-projects/real-estate/estatevista",
          },
        ]}
      />
      <EstateVistaClientView />
    </>
  );
}
