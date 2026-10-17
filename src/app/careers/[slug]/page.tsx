import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Briefcase, MapPin, Clock, ArrowLeft, CheckCircle2,
  Calendar, Award, Sparkles, Shield, Send
} from "lucide-react";
import { getPublishedJobBySlug, getPublishedJobs, isCareersPageEnabled } from "@/lib/careers/careers-db";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import CareerApplication from "@/components/careers/CareerApplication";

export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const enabled = await isCareersPageEnabled();
  if (!enabled) {
    return {
      title: "Not Found | Axivon Technologies",
      robots: { index: false, follow: false },
    };
  }

  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  if (!job) {
    return {
      title: "Job Position Not Found | Axivon Technologies",
      description: "The requested job position is no longer active or does not exist.",
      robots: { index: false, follow: false },
    };
  }

  const title = job.seoTitle || `${job.title} | Careers at Axivon Technologies`;
  const description = job.seoDescription || job.summary;

  return {
    title,
    description,
    keywords: [
      job.title,
      job.department,
      "Axivon Careers",
      "Technology Careers",
      ...job.skills,
    ],
    alternates: {
      canonical: `https://axivontech.in/careers/${job.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://axivontech.in/careers/${job.slug}`,
      siteName: "Axivon Technologies",
      type: "website",
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const enabled = await isCareersPageEnabled();
  if (!enabled) {
    notFound();
  }

  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  if (!job) {
    notFound();
  }

  // Schema.org JobPosting structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || job.summary,
    datePosted: job.publishedAt ? new Date(job.publishedAt).toISOString() : new Date().toISOString(),
    validThrough: job.deadline ? new Date(job.deadline).toISOString() : undefined,
    employmentType: job.employmentType.toUpperCase() === "INTERNSHIP" ? "INTERN" : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "Axivon Technologies",
      sameAs: "https://axivontech.in",
      logo: "https://axivontech.in/assets/logo/logo-full.png",
    },
    jobLocationType: job.workArrangement === "Remote" ? "TELECOMMUTE" : undefined,
    applicantLocationRequirements: {
      "@type": "Country",
      name: "India",
    },
    baseSalary: job.stipend
      ? {
          "@type": "MonetaryAmount",
          currency: "INR",
          value: {
            "@type": "QuantitativeValue",
            value: job.stipend,
          },
        }
      : undefined,
  };

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#F3F5F7] pt-12 pb-24 border-b border-[#1E2530]">
      {/* Schema.org JobPosting */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Careers", url: "https://axivontech.in/careers" },
          { name: job.title, url: `https://axivontech.in/careers/${job.slug}` },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/careers#open-positions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A7B0BC] hover:text-[#10B981] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Openings</span>
        </Link>

        {/* Role Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#151A21] border border-[#29313B] shadow-sm mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
              {job.department}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1B222B] text-[#A7B0BC] border border-[#29313B]">
              {job.employmentType}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1B222B] text-[#A7B0BC] border border-[#29313B]">
              {job.workArrangement}
            </span>
            {job.isFeatured && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D6B779]/10 text-[#D6B779] border border-[#D6B779]/20">
                Featured Role
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            {job.title}
          </h1>

          <p className="text-sm sm:text-base text-[#A7B0BC] leading-relaxed max-w-3xl mb-8">
            {job.summary}
          </p>

          {/* Key Facts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#1E2530]">
            <div>
              <p className="text-[11px] text-[#7E8997] font-medium">Location</p>
              <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">{job.location}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#7E8997] font-medium">Experience Level</p>
              <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">{job.experienceLevel}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#7E8997] font-medium">Stipend / Comp</p>
              <p className="text-xs sm:text-sm font-semibold text-[#10B981] mt-0.5">
                {job.stipend || "Competitive for Interns"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#7E8997] font-medium">Application Deadline</p>
              <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                {job.deadline
                  ? new Date(job.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Rolling / Immediate"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Details Grid */}
        <div className="space-y-8 mb-16">
          {/* Detailed Role Overview */}
          {job.description && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#151A21] border border-[#29313B]">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4">Role Overview</h2>
              <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          )}

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#151A21] border border-[#29313B]">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4">
                What You Will Do
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((resp: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#A7B0BC]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements & Qualifications */}
          {job.qualifications && job.qualifications.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#151A21] border border-[#29313B]">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4">
                What We Are Looking For
              </h2>
              <ul className="space-y-3">
                {job.qualifications.map((qual: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#A7B0BC]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0 mt-2" />
                    <span className="leading-relaxed">{qual}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills & Technologies */}
          {job.skills && job.skills.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#151A21] border border-[#29313B]">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4">
                Required Tech Stack & Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl bg-[#101318] border border-[#29313B] text-xs font-semibold text-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#151A21] border border-[#29313B]">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4">
                Internship Benefits & Growth
              </h2>
              <ul className="space-y-3">
                {job.benefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#A7B0BC]">
                    <Sparkles className="w-4 h-4 text-[#D6B779] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Embedded Application Form Pre-filled for this Role */}
        <div id="apply-now" className="scroll-mt-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Apply for {job.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#7E8997] mt-2">
              Submit your profile and resume below. Our engineering leads review every submission within 48 business hours.
            </p>
          </div>

          <CareerApplication preselectedJobTitle={job.title} preselectedJobId={job.id} />
        </div>
      </div>
    </main>
  );
}
