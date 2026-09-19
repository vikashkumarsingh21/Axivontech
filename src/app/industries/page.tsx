import type { Metadata } from "next";
import dynamic from "next/dynamic";
import IndustriesHero from "@/components/industries/IndustriesHero";

const IndustriesGrid = dynamic(() => import("@/components/industries/IndustriesGrid"));
const CTA = dynamic(() => import("@/components/CTA"));

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
