import type { Metadata } from "next";
import dynamic from "next/dynamic";
import CareersHero from "@/components/careers/CareersHero";

const CareerApplication = dynamic(() => import("@/components/careers/CareerApplication"));
const WhyWorkWithUs = dynamic(() => import("@/components/careers/WhyWorkWithUs"));
const OpenPositions = dynamic(() => import("@/components/careers/OpenPositions"));
const HiringProcess = dynamic(() => import("@/components/careers/HiringProcess"));
const EmployeeBenefits = dynamic(() => import("@/components/careers/EmployeeBenefits"));
const CareersFAQ = dynamic(() => import("@/components/careers/CareersFAQ"));
// import CareersCTA from "@/components/CTA";

const CTA = dynamic(() => import("@/components/CTA"));

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
  robots: {
    index: true,
    follow: true,
  },
};

export default function CareersPage() {
  return (
    <main className="overflow-hidden bg-[#0f0f0f]">
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

      {/* Career Application Form */}
      <CareerApplication />

      {/* Global CTA */}
      <CTA />
    </main>
  );
}