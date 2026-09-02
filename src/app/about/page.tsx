import type { Metadata } from "next";

import AboutHero from "@/components/about/AboutHero";
import CompanyStats from "@/components/about/CompanyStats";
import OurStory from "@/components/about/OurStory";
import FounderMessage from "@/components/about/FounderMessage";
import MissionVision from "@/components/about/MissionVision";
import CoreValues from "@/components/about/CoreValues";
import WhyChooseAxivon from "@/components/about/WhyChooseAxivon";
import TechnologyStack from "@/components/about/TechnologyStack";
import CTA from "@/components/CTA";

export const metadata: Metadata = {
  title: "About Axivon Technologies | Website & Software Development Company",
  description:
    "Learn about Axivon Technologies, founded by Vikash Kumar & Pathan Rokhiya Khanam. We specialize in Website Development, Mobile App Development, AI Solutions, UI/UX Design and Custom Software Development.",
  alternates: {
    canonical: "https://axivontech.in/about",
  },
  openGraph: {
    title: "About Axivon Technologies",
    description:
      "Discover our mission, vision, values, executive leadership and technology solutions that help businesses grow digitally.",
    url: "https://axivontech.in/about",
    siteName: "Axivon Technologies",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Axivon Technologies",
    description:
      "Learn more about Axivon Technologies and our digital transformation services.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <main className="bg-[#0f0f0f] overflow-hidden">
      {/* 1. Hero Section */}
      <AboutHero />

      {/* 2. Company Stats (Immediate Social Proof) */}
      <CompanyStats />

      {/* 3. Company Story */}
      <OurStory />

      {/* 4. Leadership & Executive Co-Founders (Vikash Kumar & Pathan Rokhiya Khanam) */}
      <FounderMessage />

      {/* 5. Mission & Vision */}
      <MissionVision />

      {/* 6. Core Values */}
      <CoreValues />

      {/* 7. Why Choose Axivon */}
      <WhyChooseAxivon />

      {/* 8. Technology Stack */}
      <TechnologyStack />

      {/* 9. Global CTA */}
      <CTA />
    </main>
  );
}