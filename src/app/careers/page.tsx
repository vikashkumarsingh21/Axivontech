import type { Metadata } from "next";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import CareersHero from "@/components/careers/CareersHero";
import WhyWorkWithUs from "@/components/careers/WhyWorkWithUs";
import HiringProcess from "@/components/careers/HiringProcess";
import CareersCTA from "@/components/careers/CareersCTA";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { getPublishedJobs, getCareersPageSettings } from "@/lib/careers/careers-db";

// Client interactive components
const OpenPositions = dynamic(() => import("@/components/careers/OpenPositions"), {
  loading: () => (
    <div className="py-20 text-center text-[#7E8997] bg-[#0B0D10]">
      <div className="w-8 h-8 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin mx-auto mb-3" />
      <p className="text-xs">Loading open positions...</p>
    </div>
  ),
});

const CareersFAQ = dynamic(() => import("@/components/careers/CareersFAQ"));
const CareerApplication = dynamic(() => import("@/components/careers/CareerApplication"), {
  loading: () => (
    <div className="py-20 text-center text-[#7E8997] bg-[#0B0D10]">
      <div className="w-8 h-8 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin mx-auto mb-3" />
      <p className="text-xs">Loading application form...</p>
    </div>
  ),
});

export const revalidate = 0; // Immediate revalidation for administrator toggles

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCareersPageSettings();

  // If the administrator has turned the Careers page OFF, do not index or expose metadata
  if (!settings.careersPageEnabled) {
    return {
      title: "Not Found | Axivon Technologies",
      robots: { index: false, follow: false },
    };
  }

  const title = settings.seoTitle || "Careers & Open Positions | Axivon Technologies";
  const description =
    settings.seoDescription ||
    "Join Axivon Technologies. Explore engineering, AI, and design opportunities. 100% remote-first.";

  return {
    title,
    description,
    keywords: [
      "Axivon Careers",
      "Technology Careers",
      "Remote Engineering Jobs",
      "Software Development Opportunities",
      "Axivon Technologies",
    ],
    alternates: {
      canonical: "https://axivontech.in/careers",
    },
    openGraph: {
      title,
      description,
      url: "https://axivontech.in/careers",
      siteName: "Axivon Technologies",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CareersPage() {
  const settings = await getCareersPageSettings();

  // SERVER-SIDE GUARD: If Careers page is disabled by Admin, trigger 404 immediately
  if (!settings.careersPageEnabled) {
    notFound();
  }

  const jobs = await getPublishedJobs();

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#F3F5F7]">
      <BreadcrumbSchema
        items={[
          {
            name: "Home",
            url: "https://axivontech.in",
          },
          {
            name: "Careers",
            url: "https://axivontech.in/careers",
          },
        ]}
      />

      {/* 1. Careers Hero with Dynamic Content & Live Openings Count */}
      <CareersHero settings={settings} openingsCount={jobs.length} />

      {/* 2. Why Work With Axivon */}
      <WhyWorkWithUs />

      {/* 3. Open Positions with Dynamic Jobs strictly from Database */}
      <OpenPositions initialJobs={jobs} />

      {/* 4. Transparent 4-Stage Hiring Process */}
      <HiringProcess />

      {/* 5. Frequently Asked Questions with Dynamic FAQs */}
      <CareersFAQ faqs={Array.isArray(settings.faqs) ? (settings.faqs as any) : undefined} />

      {/* 6. Career Application Submission Form connected to DB */}
      <CareerApplication initialJobs={jobs} />

      {/* 7. Speculative Application & Contact CTA */}
      <CareersCTA settings={settings} />
    </main>
  );
}