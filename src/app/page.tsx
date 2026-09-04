import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyChooseUs from "@/components/WhyChooseUs";
import IndustriesWeServe from "@/components/IndustriesWeServe";
import Portfolio from "@/components/Portfolio";
import Process from "@/components/Process";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import HomeFAQSchema from "@/components/seo/HomeFAQSchema";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Axivon Technologies — We Build Digital Products That Move Businesses Forward",
  description:
    "Axivon Technologies designs and engineers websites, mobile apps, AI systems, and custom software for startups, schools, healthcare teams, and growing businesses.",
  path: "/",
  keywords: [
    "Software Development Agency",
    "Web Design Patna",
    "App Developers India",
    "Custom AI Integration",
    "Full-Stack Development",
  ],
});

export default function Home() {
  return (
    <>
      <HomeFAQSchema />
      <Hero />
      <Services />
      <WhyChooseUs />
      <IndustriesWeServe />
      <Portfolio />
      <Process />
      <FAQ />
      <CTA />
    </>
  );
}