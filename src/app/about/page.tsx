import type { Metadata } from "next";

import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import MissionVision from "@/components/about/MissionVision";
import CoreValues from "@/components/about/CoreValues";
import WhyChooseAxivon from "@/components/about/WhyChooseAxivon";
import TechnologyStack from "@/components/about/TechnologyStack";
import FounderMessage from "@/components/about/FounderMessage";
import CompanyStats from "@/components/about/CompanyStats";
import CTA from "@/components/CTA";

export const metadata: Metadata = {
  title: "About Axivon Technologies | Website & Software Development Company",

  description:
    "Learn about Axivon Technologies, a professional Website Development, Mobile App Development, AI Solutions, UI/UX Design and Custom Software Development company helping startups and businesses build innovative digital products.",

  alternates: {
    canonical: "https://axivontech.in/about",
  },

  openGraph: {
    title: "About Axivon Technologies",
    description:
      "Discover our mission, vision, values, expert team and technology solutions that help businesses grow digitally.",

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
    <main className="bg-[#050816] overflow-hidden">
      {/* Hero Section */}
      <AboutHero />

      {/* Company Story */}
      <OurStory />

      {/* Mission & Vision */}
      <MissionVision />

      {/* Core Values */}
      <CoreValues />

      {/* Why Choose Axivon */}
      <WhyChooseAxivon />

      {/* Technology Stack */}
      <TechnologyStack />


      <FounderMessage />
      <CompanyStats /> 

      {/* Global CTA */}
      <CTA />
    </main>
  );
}