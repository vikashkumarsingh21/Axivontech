import type { Metadata } from "next";

import CareersHero from "@/components/careers/CareersHero";

// Future Sections
import WhyWorkWithUs from "@/components/careers/WhyWorkWithUs";
import OpenPositions from "@/components/careers/OpenPositions";
import HiringProcess from "@/components/careers/HiringProcess";
import EmployeeBenefits from "@/components/careers/EmployeeBenefits";
import CareersFAQ from "@/components/careers/CareersFAQ";
// import CareersCTA from "@/components/careers/CareersCTA";

import CTA from "@/components/CTA";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join Axivon Technologies and build the future with a team of innovators, developers, AI engineers, designers, and technology experts. Explore exciting career opportunities and grow with us.",

  keywords: [
    "Axivon Careers",
    "Technology Jobs",
    "Software Developer Jobs",
    "Frontend Developer",
    "Backend Developer",
    "AI Engineer",
    "Machine Learning Engineer",
    "UI UX Designer",
    "Cloud Engineer",
    "Technology Careers",
    "Startup Jobs",
    "Remote Jobs",
    "IT Company Careers",
    "Axivon Technologies",
  ],

  alternates: {
    canonical: "https://axivontech.in/careers",
  },

  openGraph: {
    title: "Careers | Axivon Technologies",
    description:
      "Join Axivon Technologies and help build innovative digital products, AI solutions, cloud platforms, and next-generation technology experiences.",
    url: "https://axivontech.in/careers",
    siteName: "Axivon Technologies",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Careers | Axivon Technologies",
    description:
      "Explore exciting opportunities and build the future with Axivon Technologies.",
  },
};

export default function CareersPage() {
  return (
    <main className="overflow-hidden bg-[#050816]">
      {/* Hero Section */}
      <CareersHero />

      {/* Why Work With Us */}
      <WhyWorkWithUs />

      {/* Open Positions */}
      <OpenPositions />

      {/* Hiring Process */}
      <HiringProcess />

      {/* Employee Benefits */}
      <EmployeeBenefits />

      {/* FAQ */}
      <CareersFAQ />

      {/* Careers CTA */}
      {/* <CareersCTA /> */}

      {/* Global CTA */}
      <CTA />
    </main>
  );
}