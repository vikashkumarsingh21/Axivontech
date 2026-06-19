import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import MissionVision from "@/components/about/MissionVision";
import CoreValues from "@/components/about/CoreValues";
import WhyChooseAxivon from "@/components/about/WhyChooseAxivon";
import TechnologyStack from "@/components/about/TechnologyStack";
import FounderMessage from "@/components/about/FounderMessage";
import CompanyStats from "@/components/about/CompanyStats";
import CTA from "@/components/CTA";

export const metadata = {
  title: "About Us | Axivon Technologies",
  description:
    "Learn about Axivon Technologies, our mission, vision, values, technology expertise, and how we help businesses grow with future-ready digital solutions.",
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