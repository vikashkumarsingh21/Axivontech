"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderGit2, Search, ExternalLink, Sparkles, Eye } from "lucide-react";
import { DEMO_PROJECTS } from "@/data/demo-projects";

export default function AdminContentPortfolioPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const filtered = DEMO_PROJECTS.filter((p) => {
    const matchCat = category === "ALL" || p.category === category;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-red-500" />
            <span>Portfolio & Case Studies Management</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure showcased customer solutions, enterprise client case studies, and live demo architectures.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/portfolio"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-semibold transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Public Page</span>
          </Link>
          <Link
            href="/admin/content/demo-projects"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage Demo Projects</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111] p-5 rounded-2xl border border-white/10">
          <p className="text-xs text-gray-500 font-medium">Total Showcased</p>
          <p className="text-2xl font-bold text-white mt-1">{DEMO_PROJECTS.length}</p>
        </div>
        <div className="bg-[#111] p-5 rounded-2xl border border-white/10">
          <p className="text-xs text-gray-500 font-medium">Live Deployments</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {DEMO_PROJECTS.filter((p) => p.status === "Live Demo").length}
          </p>
        </div>
        <div className="bg-[#111] p-5 rounded-2xl border border-white/10">
          <p className="text-xs text-gray-500 font-medium">Featured Case Studies</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {DEMO_PROJECTS.filter((p) => p.isFeatured).length}
          </p>
        </div>
        <div className="bg-[#111] p-5 rounded-2xl border border-white/10">
          <p className="text-xs text-gray-500 font-medium">Categories</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">6</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111] p-4 rounded-xl border border-white/10">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-red-500/50"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#0d0d0d] border border-white/10 rounded-lg py-2 px-3 text-xs text-gray-300 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="Healthcare">Healthcare</option>
          <option value="FinTech">FinTech</option>
          <option value="E-Commerce">E-Commerce</option>
          <option value="EdTech">EdTech</option>
          <option value="Logistics">Logistics</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                  {item.category}
                </span>
                <span className={"text-[10px] font-semibold px-2 py-0.5 rounded-full " + (
                  item.status === "Live Demo"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                )}>
                  {item.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{item.name}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.shortDescription}</p>
            </div>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-mono">{item.slug}</span>
              {item.demoUrl && (
                <Link
                  href={item.demoUrl}
                  target="_blank"
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <span>Preview</span>
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
