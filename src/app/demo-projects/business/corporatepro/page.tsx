import type { Metadata } from "next";
import CorporateProDemoStrip from "@/components/demo-projects/corporatepro/CorporateProDemoStrip";
import NorthlineHeader from "@/components/demo-projects/corporatepro/NorthlineHeader";
import NorthlineHero from "@/components/demo-projects/corporatepro/NorthlineHero";
import NorthlineServices from "@/components/demo-projects/corporatepro/NorthlineServices";
import NorthlineApproach from "@/components/demo-projects/corporatepro/NorthlineApproach";
import NorthlineWork from "@/components/demo-projects/corporatepro/NorthlineWork";
import NorthlineAbout from "@/components/demo-projects/corporatepro/NorthlineAbout";
import NorthlineFAQ from "@/components/demo-projects/corporatepro/NorthlineFAQ";
import NorthlineContact from "@/components/demo-projects/corporatepro/NorthlineContact";
import NorthlineFooter from "@/components/demo-projects/corporatepro/NorthlineFooter";

export const metadata: Metadata = {
  title: "CorporatePro — Northline Advisory | Premium B2B Consulting Demo | Axivon Technologies",
  description:
    "Explore CorporatePro, a high-performance corporate website demo for Northline Advisory. Featuring editorial typography, strategic consulting pillars, operational excellence case studies, and modern frontend responsiveness.",
  keywords: [
    "CorporatePro",
    "Northline Advisory",
    "B2B Consulting Website Demo",
    "Corporate Website Design",
    "Axivon Technologies Demo Projects",
    "Business Strategy",
    "Operational Excellence",
    "Digital Transformation",
  ],
  openGraph: {
    title: "CorporatePro — Northline Advisory | Axivon Demo Showcase",
    description:
      "A premium B2B consulting website demonstration built with editorial precision and responsive architecture by Axivon Technologies.",
    url: "https://axivontechnologies.com/demo-projects/business/corporatepro",
    siteName: "Axivon Technologies",
    type: "website",
    images: [
      {
        url: "/images/demo-projects/corporatepro/hero-advisory.jpg",
        width: 1200,
        height: 630,
        alt: "Northline Advisory Corporate Website Showcase",
      },
    ],
  },
};

export default function CorporateProPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#252925] font-sans antialiased selection:bg-[#29483B]/20 selection:text-[#252925]">
      {/* 1. Axivon Demo Portfolio Context Strip */}
      <CorporateProDemoStrip />

      {/* 2. Custom Fictional Brand Navigation */}
      <NorthlineHeader />

      {/* Main Page Content */}
      <main id="main-content">
        {/* 3. Hero Section with Two-Column Composition */}
        <NorthlineHero />

        {/* 4. Advisory Practice Areas (Services) with Interactive Scope Modal */}
        <NorthlineServices />

        {/* 5. 3-Stage Process (Discover · Define · Deliver) */}
        <NorthlineApproach />

        {/* 6. Selected Work (Illustrative Case Studies) */}
        <NorthlineWork />

        {/* 7. About & Consulting Philosophy */}
        <NorthlineAbout />

        {/* 8. Accessible FAQ Accordion */}
        <NorthlineFAQ />

        {/* 9. Contact & Inquiries with Interactive Client Validation */}
        <NorthlineContact />
      </main>

      {/* 10. Northline Advisory Fictional Footer */}
      <NorthlineFooter />
    </div>
  );
}
