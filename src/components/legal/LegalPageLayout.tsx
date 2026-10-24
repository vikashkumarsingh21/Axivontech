"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Calendar,
  Clock,
  Printer,
  FileText,
  ChevronRight,
  ArrowLeft,
  Mail,
  AlertTriangle,
  Lock,
  ExternalLink,
  Sliders,
} from "lucide-react";
import { LegalPolicyItem, LEGAL_CATEGORIES } from "@/lib/legal/types";

interface LegalPageLayoutProps {
  policy: LegalPolicyItem;
  relatedPolicies?: { slug: string; title: string; category: string }[];
}

interface TableOfContentItem {
  id: string;
  title: string;
  level: number;
}

export default function LegalPageLayout({ policy, relatedPolicies = [] }: LegalPageLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [toc, setToc] = useState<TableOfContentItem[]>([]);

  // Parse markdown-like headings to generate TOC
  useEffect(() => {
    const lines = policy.content.split("\n");
    const items: TableOfContentItem[] = [];

    lines.forEach((line) => {
      const matchH2 = line.match(/^##\s+(.+)$/);
      const matchH3 = line.match(/^###\s+(.+)$/);

      if (matchH2) {
        const title = matchH2[1].trim();
        const id = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        items.push({ id, title, level: 2 });
      } else if (matchH3) {
        const title = matchH3[1].trim();
        const id = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        items.push({ id, title, level: 3 });
      }
    });

    setToc(items);
    if (items.length > 0) {
      setActiveSection(items[0].id);
    }
  }, [policy.content]);

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll("h2[id], h3[id]");
      let current = "";
      headings.forEach((h) => {
        const rect = h.getBoundingClientRect();
        if (rect.top <= 160) {
          current = h.id;
        }
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const categoryMeta = LEGAL_CATEGORIES.find((c) => c.key === policy.category);

  // Render markdown content to structured HTML elements
  const renderContent = () => {
    const sections = policy.content.split("\n\n");

    return sections.map((sec, idx) => {
      const trimmed = sec.trim();

      // Heading 2
      if (trimmed.startsWith("## ")) {
        const title = trimmed.replace("## ", "").trim();
        const id = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        return (
          <h2
            key={idx}
            id={id}
            className="text-2xl font-bold text-[#F3F5F7] tracking-tight mt-10 mb-4 pb-2 border-b border-[#1E2530] scroll-mt-28 flex items-center gap-3"
          >
            <span className="w-1.5 h-5 rounded-full bg-emerald-500 shrink-0" />
            {title}
          </h2>
        );
      }

      // Heading 3
      if (trimmed.startsWith("### ")) {
        const title = trimmed.replace("### ", "").trim();
        const id = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        return (
          <h3
            key={idx}
            id={id}
            className="text-lg font-semibold text-[#F3F5F7] mt-6 mb-2 scroll-mt-28"
          >
            {title}
          </h3>
        );
      }

      // Alert / Note Block
      if (trimmed.startsWith("> [!NOTE]")) {
        const noteText = trimmed.replace("> [!NOTE]", "").trim();
        return (
          <div
            key={idx}
            className="my-6 p-4 rounded-xl bg-[#10151B] border border-emerald-500/30 text-sm text-[#A7B0BC] leading-relaxed flex items-start gap-3"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-400 text-xs uppercase tracking-wider mb-1">
                Official Regulatory Note
              </p>
              <p>{noteText}</p>
            </div>
          </div>
        );
      }

      // Table formatting
      if (trimmed.includes("|") && trimmed.includes("---")) {
        const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
        const headerRow = lines[0]
          .split("|")
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
        const dataRows = lines.slice(2).map((row) =>
          row
            .split("|")
            .map((c) => c.trim())
            .filter((c) => c.length > 0)
        );

        return (
          <div key={idx} className="my-6 overflow-x-auto rounded-xl border border-[#1E2530] bg-[#10151B]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#151A21] border-b border-[#1E2530] text-[#A7B0BC]">
                <tr>
                  {headerRow.map((h, i) => (
                    <th key={i} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2530] text-[#F3F5F7]">
                {dataRows.map((cols, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    {cols.map((col, j) => (
                      <td key={j} className="px-4 py-3 font-mono text-xs">
                        {col.replace(/`/g, "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // Unordered list
      if (trimmed.startsWith("- ") || trimmed.startsWith("1. ")) {
        const items = trimmed.split("\n");
        return (
          <ul key={idx} className="my-4 space-y-2 text-[#A7B0BC] text-sm sm:text-base leading-relaxed pl-5 list-disc marker:text-emerald-500">
            {items.map((it, i) => (
              <li key={i}>{it.replace(/^[-*]|\d+\.\s*/, "").trim()}</li>
            ))}
          </ul>
        );
      }

      // Standard Paragraph
      return (
        <p key={idx} className="my-4 text-[#A7B0BC] text-sm sm:text-base leading-relaxed">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F5F7] selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Print-only Header */}
      <div className="hidden print:block p-8 border-b border-black text-black">
        <h1 className="text-2xl font-bold">Axivon Technologies</h1>
        <p className="text-sm">Official Legal Policy Document - {policy.title}</p>
        <p className="text-xs text-gray-600">
          Version: {policy.version} | Last Reviewed: {new Date(policy.lastReviewedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#7E8997] print:hidden">
          <Link href="/" className="hover:text-emerald-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#566171]" />
          <Link href="/legal" className="hover:text-emerald-400 transition-colors">
            Legal & Privacy Center
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#566171]" />
          <span className="text-[#F3F5F7] font-medium">{policy.title}</span>
        </nav>

        {/* Hero Banner Header */}
        <div className="bg-[#10151B] border border-[#1E2530] rounded-2xl p-6 sm:p-10 mb-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              {categoryMeta && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${categoryMeta.badgeColor}`}>
                  {categoryMeta.label}
                </span>
              )}
              <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                v{policy.version}
              </span>
              <span className="text-xs text-[#7E8997] flex items-center gap-1.5 ml-auto">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                Effective: {new Date(policy.effectiveDate).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F3F5F7] tracking-tight mb-3">
              {policy.title}
            </h1>

            <p className="text-sm sm:text-base text-[#A7B0BC] max-w-3xl leading-relaxed mb-6">
              {policy.summary}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[#1E2530] text-xs text-[#7E8997] print:hidden">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  Last Reviewed: {new Date(policy.lastReviewedAt).toLocaleDateString()}
                </span>
                {policy.reviewedBy && (
                  <span className="hidden sm:inline-block">
                    Reviewed by: <strong className="text-[#F3F5F7] font-normal">{policy.reviewedBy}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151A21] hover:bg-[#1B222B] text-[#F3F5F7] border border-[#29313B] rounded-lg transition-colors text-xs font-medium cursor-pointer"
                  title="Print or save as PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  Print / Save PDF
                </button>
                <Link
                  href="/cookie-preferences"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151A21] hover:bg-[#1B222B] text-[#F3F5F7] border border-[#29313B] rounded-lg transition-colors text-xs font-medium"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  Cookie Settings
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Missing details banner if publication gate flags exist */}
        {policy.missingDetails && policy.missingDetails.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-400 mb-0.5">Corporate Detail Notice</p>
              <p className="text-amber-300/90 text-xs">
                The following organizational documentation is currently undergoing statutory filing or executive verification:{" "}
                <strong>{policy.missingDetails.join(", ")}</strong>. Direct inquiries may be addressed to support@axivontech.in.
              </p>
            </div>
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-8 bg-[#10151B] border border-[#1E2530] rounded-2xl p-6 sm:p-10 shadow-lg">
            <article className="prose prose-invert max-w-none">{renderContent()}</article>

            {/* Grievance & Contact Section */}
            <div className="mt-12 pt-8 border-t border-[#1E2530] bg-[#151A21]/40 rounded-xl p-6 text-sm text-[#A7B0BC]">
              <div className="flex items-center gap-2 mb-2 text-[#F3F5F7] font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Statutory Compliance & Inquiries
              </div>
              <p className="text-xs sm:text-sm text-[#7E8997] mb-4">
                Axivon Technologies strictly enforces the India DPDP Act 2023 and the Information Technology Act 2000. For statutory grievances or verification requests, reach out directly to our Grievance Officer:
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <a
                  href="mailto:support@axivontech.in"
                  className="flex items-center gap-1.5 text-emerald-400 hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  support@axivontech.in
                </a>
                <Link
                  href="/privacy-requests"
                  className="flex items-center gap-1.5 text-cyan-400 hover:underline font-sans"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Submit Privacy Request Portal →
                </Link>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Navigation (Desktop) */}
          <aside className="lg:col-span-4 sticky top-24 space-y-6 print:hidden">
            {/* Table of contents */}
            {toc.length > 0 && (
              <div className="bg-[#10151B] border border-[#1E2530] rounded-2xl p-5 shadow-lg">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7E8997] mb-3 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  On This Page
                </p>
                <nav className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-xs py-1.5 px-2.5 rounded-lg transition-colors leading-snug ${
                        item.level === 3 ? "pl-5" : ""
                      } ${
                        activeSection === item.id
                          ? "bg-emerald-500/10 text-emerald-400 font-medium border-l-2 border-emerald-500"
                          : "text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#151A21]"
                      }`}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Quick Action Card */}
            <div className="bg-gradient-to-br from-[#151A21] to-[#10151B] border border-[#1E2530] rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-[#F3F5F7] mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Data Protection Rights
              </h3>
              <p className="text-xs text-[#7E8997] leading-relaxed mb-4">
                Exercise your rights under India&apos;s DPDP Act 2023 for data access, correction, erasure, or consent withdrawal.
              </p>
              <Link
                href="/privacy-requests"
                className="block text-center w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-[#04130E] text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Submit Privacy Request
              </Link>
            </div>

            {/* Related Policies */}
            {relatedPolicies.length > 0 && (
              <div className="bg-[#10151B] border border-[#1E2530] rounded-2xl p-5 shadow-lg">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7E8997] mb-3">
                  Related Documents
                </p>
                <div className="space-y-2">
                  {relatedPolicies.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/${rel.slug}`}
                      className="block p-2.5 rounded-xl bg-[#151A21]/50 border border-[#1E2530] hover:border-emerald-500/40 hover:bg-[#151A21] transition-colors group"
                    >
                      <p className="text-xs font-medium text-[#F3F5F7] group-hover:text-emerald-400 transition-colors">
                        {rel.title}
                      </p>
                      <span className="text-[10px] text-[#7E8997]">View Policy →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
