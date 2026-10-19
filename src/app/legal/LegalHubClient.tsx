"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, FileText, ArrowRight, ShieldCheck, ChevronRight, Filter } from "lucide-react";
import { LegalPolicyItem, LEGAL_CATEGORIES } from "@/lib/legal/legal-db";

interface LegalHubClientProps {
  initialPolicies: LegalPolicyItem[];
}

export default function LegalHubClient({ initialPolicies }: LegalHubClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const filtered = useMemo(() => {
    return initialPolicies.filter((p) => {
      const matchCat = selectedCategory === "ALL" || p.category === selectedCategory;
      const matchSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.summary.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [initialPolicies, selectedCategory, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Search & Category Filter Controls */}
      <div className="mb-10 space-y-4">
        {/* Search Input */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#566171]" />
          <input
            type="text"
            placeholder="Search policies, compliance terms, or topics…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-[#10151B] border border-[#1E2530] rounded-xl text-sm text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-inner"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-emerald-500 text-[#04130E] shadow-sm"
                : "bg-[#10151B] text-[#7E8997] hover:text-[#F3F5F7] border border-[#1E2530]"
            }`}
          >
            All Policies ({initialPolicies.length})
          </button>
          {LEGAL_CATEGORIES.map((cat) => {
            const count = initialPolicies.filter((p) => p.category === cat.key).length;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-500 text-[#04130E] shadow-sm"
                    : "bg-[#10151B] text-[#7E8997] hover:text-[#F3F5F7] border border-[#1E2530]"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Policy Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#10151B] border border-[#1E2530] rounded-2xl max-w-lg mx-auto p-8">
          <FileText className="w-10 h-10 text-[#566171] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#F3F5F7] mb-1">No matching policies found</h3>
          <p className="text-xs text-[#7E8997] mb-4">
            Try adjusting your search keywords or resetting the category filter.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("ALL");
            }}
            className="px-4 py-2 bg-emerald-500 text-[#04130E] text-xs font-bold rounded-lg cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((policy) => {
            const catMeta = LEGAL_CATEGORIES.find((c) => c.key === policy.category);
            return (
              <Link
                key={policy.id}
                href={`/${policy.slug}`}
                className="group flex flex-col justify-between bg-[#10151B] border border-[#1E2530] hover:border-emerald-500/40 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {catMeta && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catMeta.badgeColor}`}>
                        {catMeta.label}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      v{policy.version}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-[#F3F5F7] group-hover:text-emerald-400 transition-colors mb-2">
                    {policy.title}
                  </h2>

                  <p className="text-xs text-[#A7B0BC] leading-relaxed line-clamp-3 mb-4">
                    {policy.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1E2530] flex items-center justify-between text-xs text-[#7E8997]">
                  <span>Updated: {new Date(policy.lastReviewedAt).toLocaleDateString()}</span>
                  <span className="text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                    Read Document <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
