import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Code2, PhoneCall, Sparkles } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import PricingCards from "@/components/pricing/PricingCards";
import PricingComparison from "@/components/pricing/PricingComparison";
import PricingAddOns from "@/components/pricing/PricingAddOns";
import PricingFAQSection from "@/components/pricing/PricingFAQSection";
import { CONTACT_CONFIG, getWhatsAppUrl, getPhoneTelLink } from "@/config/contact";

export const metadata: Metadata = createPageMetadata({
  title: "Website Development & Software Pricing Packages | Axivon Technologies",
  description:
    "Explore transparent website development, e-commerce, mobile app, and bespoke software packages from Axivon Technologies. Clear inclusions, honest turnaround times, and guaranteed quotes.",
  path: "/pricing",
  keywords: [
    "Website Development Packages",
    "Web Design Pricing Gujarat",
    "Custom Software Development Cost",
    "E-Commerce Website Packages",
    "Axivon Technologies Pricing",
  ],
});

export default function PricingPage() {
  return (
    <main className="bg-[#0f0f0f] text-[#F3F5F7] min-h-screen">
      {/* Breadcrumb Schema (no Product/Offer schema while prices are placeholders) */}
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Pricing & Packages", url: "https://axivontech.in/pricing" },
        ]}
      />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden border-b border-[#1e1e1e]">
        {/* Subtle Background Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[35rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,_rgba(232,160,100,0.08),_transparent_70%)]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8a064]/20 bg-[#e8a064]/10 px-3.5 py-1 text-xs font-mono font-semibold tracking-wider text-[#e8a064] mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Honest &amp; Transparent Development Packages</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F3F5F7] max-w-4xl mx-auto leading-tight">
            Predictable engineering scopes.{" "}
            <span className="text-[#e8a064]">Zero hidden surprises.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#A7B0BC] max-w-2xl mx-auto font-light leading-relaxed">
            Whether you need a sleek brochure website, an e-commerce platform, or a full-scale bespoke software system, we provide clear inclusions, grounded timelines, and 100% code ownership.
          </p>

          {/* Key Value Pillars */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#A7B0BC]">
            <div className="flex items-center gap-2 rounded-full bg-[#141414] border border-[#222730] px-3.5 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Full Code &amp; IP Ownership</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#141414] border border-[#222730] px-3.5 py-1.5">
              <Zap className="h-3.5 w-3.5 text-[#e8a064]" />
              <span>24-Hour Guaranteed Quote SLA</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#141414] border border-[#222730] px-3.5 py-1.5">
              <Code2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Modern Next.js &amp; TypeScript Stack</span>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs font-semibold text-[#7E8997]">
            <a href="#packages" className="hover:text-[#e8a064] transition-colors">
              Packages &darr;
            </a>
            <span className="text-white/10">&bull;</span>
            <a href="#comparison" className="hover:text-[#e8a064] transition-colors">
              Comparison Table &darr;
            </a>
            <span className="text-white/10">&bull;</span>
            <a href="#add-ons" className="hover:text-[#e8a064] transition-colors">
              Add-ons &darr;
            </a>
            <span className="text-white/10">&bull;</span>
            <a href="#pricing-faq" className="hover:text-[#e8a064] transition-colors">
              FAQ &darr;
            </a>
          </div>

        </div>
      </section>

      {/* 01 - 4 Pricing Package Cards */}
      <PricingCards />

      {/* 02 - Detailed Comparison Matrix */}
      <PricingComparison />

      {/* 03 - Optional Add-ons */}
      <PricingAddOns />

      {/* 04 - Neutral FAQ Section */}
      <PricingFAQSection />

      {/* 05 - Bottom Final Consultation Banner */}
      <section className="py-16 sm:py-24 border-t border-[#1e1e1e] bg-[#121212]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#262626] bg-[#18181b] p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl">
            
            <div className="max-w-2xl mx-auto">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#e8a064] block mb-2">
                Need Architectural Guidance?
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F3F5F7]">
                Not sure which package fits your roadmap?
              </h2>
              <p className="mt-4 text-xs sm:text-sm text-[#A7B0BC] leading-relaxed">
                Schedule a no-commitment technical consultation with our engineering leads. We review your requirements and provide a tailored scope within 24 hours.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  href="/contact#contact-form"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#e8a064] text-[#0f0f0f] px-7 py-3.5 text-xs font-bold hover:bg-[#d4915c] transition-colors shadow-lg"
                >
                  <span>Request Custom Written Estimate</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <a
                  href={getWhatsAppUrl("Hi Axivon, I would like to consult about website packages and pricing.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#14231a] text-[#25D366] px-6 py-3.5 text-xs font-semibold hover:bg-[#1a3324] transition-colors"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  <span>Direct WhatsApp Chat</span>
                </a>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#7E8997]">
                <span>Or call directly:</span>
                <a href={getPhoneTelLink()} className="text-[#F3F5F7] font-mono hover:text-[#e8a064] transition-colors font-medium">
                  {CONTACT_CONFIG.phoneDisplay}
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
