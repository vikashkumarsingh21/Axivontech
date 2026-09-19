import type { Metadata } from "next";
import IndustriesHero from "@/components/industries/IndustriesHero";
import IndustriesGrid from "@/components/industries/IndustriesGrid";
import CTA from "@/components/CTA";

export const metadata: Metadata = {
  title: "Industries We Serve | Axivon Technologies",
  description:
    "Discover how Axivon Technologies delivers custom software, AI, and cloud solutions for Education, Healthcare, Retail, Real Estate, and more.",
  alternates: {
    canonical: "https://axivontech.in/industries",
  },
};

export default function IndustriesPage() {
  return (
    <main className="bg-[#0f0f0f] overflow-hidden">
      {/* 1. Hero */}
      <IndustriesHero />

      {/* 2. Grid */}
      <IndustriesGrid />

      {/* 3. CTA */}
      <CTA />
    </main>
  );
}
