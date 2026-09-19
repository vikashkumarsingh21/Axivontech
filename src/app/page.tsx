import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import HomeFAQSchema from "@/components/seo/HomeFAQSchema";
import { createPageMetadata } from "@/lib/seo/metadata";

const Services = dynamic(() => import("@/components/Services"));
const WhyChooseUs = dynamic(() => import("@/components/WhyChooseUs"));
const IndustriesWeServe = dynamic(() => import("@/components/IndustriesWeServe"));
const Portfolio = dynamic(() => import("@/components/Portfolio"));
const Process = dynamic(() => import("@/components/Process"));
const FAQ = dynamic(() => import("@/components/FAQ"));
const CTA = dynamic(() => import("@/components/CTA"));

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