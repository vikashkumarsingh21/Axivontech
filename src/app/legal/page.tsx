import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Scale,
  Lock,
  FileText,
  Sliders,
  Mail,
  Search,
  ExternalLink,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getAllPublishedPolicies, LEGAL_CATEGORIES } from "@/lib/legal/legal-db";
import LegalHubClient from "./LegalHubClient";

export const metadata: Metadata = createPageMetadata({
  title: "Legal & Privacy Center",
  description:
    "Official legal policies, privacy notices, data subject request workflows, terms of service, and compliance disclosures for Axivon Technologies.",
  path: "/legal",
  keywords: ["Legal Center", "Privacy Policy", "DPDP Act 2023", "Terms of Service", "Compliance", "Cookie Policy"],
});

export default async function LegalCenterPage() {
  const policies = await getAllPublishedPolicies();

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#F3F5F7] selection:bg-emerald-500/20 selection:text-emerald-300">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Legal & Privacy Center", url: "https://axivontech.in/legal" },
        ]}
      />

      {/* Hero Header */}
      <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 border-b border-[#1E2530] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Governance, Trust & Compliance</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F3F5F7] tracking-tight max-w-4xl mx-auto leading-tight mb-4">
            Legal & Privacy Center
          </h1>

          <p className="text-sm sm:text-base text-[#A7B0BC] max-w-2xl mx-auto leading-relaxed mb-8">
            Access Axivon Technologies&apos; verified legal frameworks, statutory privacy disclosures under India&apos;s DPDP Act 2023, service agreements, and security standards.
          </p>

          {/* Quick Hub Action Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/privacy-requests"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#04130E] text-xs font-bold rounded-xl transition-all shadow-md"
            >
              <Lock className="w-4 h-4" />
              Privacy Rights Portal
            </Link>
            <Link
              href="/cookie-preferences"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#151A21] hover:bg-[#1B222B] text-[#F3F5F7] border border-[#29313B] text-xs font-semibold rounded-xl transition-all"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              Cookie Preferences
            </Link>
            <a
              href="mailto:support@axivontech.in"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#151A21] hover:bg-[#1B222B] text-[#F3F5F7] border border-[#29313B] text-xs font-semibold rounded-xl transition-all"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              Grievance Officer
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Policy Search & Filter Component */}
      <LegalHubClient initialPolicies={policies} />
    </main>
  );
}
