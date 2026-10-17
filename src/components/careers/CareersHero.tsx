import Link from "next/link";
import { ArrowRight, Briefcase, Globe, Laptop, Sparkles, CheckCircle2 } from "lucide-react";
import { CAREER_HIGHLIGHTS } from "@/data/careers";

interface CareersHeroProps {
  settings?: any;
  openingsCount?: number;
}

export default function CareersHero({ settings, openingsCount }: CareersHeroProps = {}) {
  const eyebrow = settings?.heroEyebrow || "Careers at Axivon";
  const title = settings?.heroTitle || "Build Technology That Moves Businesses Forward.";
  const description =
    settings?.heroDescription ||
    "Join a driven engineering team building modern web platforms, intelligent automation workflows, and meaningful digital products. We value curiosity, craft, and practical execution.";
  const primaryCta = settings?.primaryCtaText || "Explore Open Positions";
  const secondaryCta = settings?.secondaryCtaText || "Why Work With Axivon";
  const totalOpenings = openingsCount !== undefined ? openingsCount : (settings?.statTotalOpenings || CAREER_HIGHLIGHTS.totalOpenings);
  const workPolicy = settings?.statWorkPolicy || "100% Remote";
  const experienceLevel = settings?.statExperienceLevel || "0–1 Years";

  return (
    <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#1E2530] bg-[#0B0D10] overflow-hidden">
      {/* Subtle background ambient glow (static CSS, GPU-accelerated, zero CPU overhead) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.08),transparent)]"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{eyebrow}</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F3F5F7] leading-tight mb-6">
            {title}
          </h1>

          {/* Supporting description */}
          <p className="text-base sm:text-lg text-[#A7B0BC] leading-relaxed font-light mb-8 max-w-2xl mx-auto">
            {description}
          </p>

          {/* Hero Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="#open-positions"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#04130E] font-semibold text-sm transition-colors shadow-lg shadow-[#10B981]/15"
            >
              <span>{primaryCta}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#why-axivon"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#151A21] hover:bg-[#1B222B] text-[#F3F5F7] font-medium text-sm border border-[#29313B] transition-colors"
            >
              <span>{secondaryCta}</span>
            </a>
          </div>
        </div>

        {/* Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-16 pt-8 border-t border-[#1E2530]">
          <div className="p-4 rounded-xl bg-[#151A21] border border-[#29313B]/80 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#7E8997] text-xs mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Available Roles</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#F3F5F7]">{totalOpenings} Active Openings</p>
            <p className="text-[11px] text-[#7E8997] mt-1">Live from database</p>
          </div>

          <div className="p-4 rounded-xl bg-[#151A21] border border-[#29313B]/80 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#7E8997] text-xs mb-1.5">
              <Globe className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Work Arrangement</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#F3F5F7]">{workPolicy}</p>
            <p className="text-[11px] text-[#7E8997] mt-1">Collaborate from anywhere</p>
          </div>

          <div className="p-4 rounded-xl bg-[#151A21] border border-[#29313B]/80 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#7E8997] text-xs mb-1.5">
              <Laptop className="w-3.5 h-3.5 text-[#D6B779]" />
              <span>Experience Level</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#F3F5F7]">{experienceLevel}</p>
            <p className="text-[11px] text-[#7E8997] mt-1">Students & early career</p>
          </div>

          <div className="p-4 rounded-xl bg-[#151A21] border border-[#29313B]/80 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#7E8997] text-xs mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Core Tech Stack</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#F3F5F7]">Modern Web & AI</p>
            <p className="text-[11px] text-[#7E8997] mt-1">Next.js, Python, PostgreSQL</p>
          </div>
        </div>
      </div>
    </section>
  );
}
