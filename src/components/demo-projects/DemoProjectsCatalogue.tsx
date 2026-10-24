"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  RotateCcw,
  Building2,
  Stethoscope,
  GraduationCap,
  Utensils,
  ShoppingBag,
  Home,
  Hotel,
  Laptop,
  Store,
  Dumbbell,
  Calendar,
  Briefcase,
  Sprout,
  Landmark,
  Truck,
  UserCheck,
  Sparkle,
  Palette,
  LayoutDashboard,
  Bot,
  HeartHandshake,
  Compass,
  FileCode2,
} from "lucide-react";
import {
  DEMO_PROJECTS,
  DEMO_CATEGORIES,
  SHOW_COMING_SOON_DEMOS,
  getDemoProjectImage,
  getDemoProjectSlug,
  type DemoProject,
  type DemoCategory,
} from "@/data/demo-projects";
import { SectionHeader } from "@/components/ui";
import { trackDemoFilter, trackDemoView } from "@/lib/analytics";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "All Projects": Layers,
  "Business & Corporate": Building2,
  "Healthcare": Stethoscope,
  "Education": GraduationCap,
  "Restaurants & Food": Utensils,
  "E-commerce": ShoppingBag,
  "Real Estate": Home,
  "Hotels & Travel": Hotel,
  "SaaS & Software": Laptop,
  "Local Businesses": Store,
  "Fitness & Wellness": Dumbbell,
  "Events": Calendar,
  "Professional Services": Briefcase,
  "Agriculture & IoT": Sprout,
  "Finance & Accounting": Landmark,
  "Logistics": Truck,
  "Recruitment": UserCheck,
  "Beauty & Lifestyle": Sparkle,
  "Creative & Marketing": Palette,
  "Dashboards & Portals": LayoutDashboard,
  "AI & Automation": Bot,
  "Nonprofit": HeartHandshake,
  "Other Industries": Compass,
};

export default function DemoProjectsCatalogue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DemoCategory>("All Projects");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LIVE_ONLY" | "COMING_SOON">("ALL");
  const [sortBy, setSortBy] = useState<"recommended" | "az">("recommended");

  // Task 1: Visible base dataset respecting SHOW_COMING_SOON_DEMOS flag
  const baseProjects = useMemo(() => {
    if (SHOW_COMING_SOON_DEMOS) {
      return DEMO_PROJECTS;
    }
    return DEMO_PROJECTS.filter((p) => p.status === "Live Demo");
  }, []);

  // Task 2: Dynamic stats
  const liveCount = useMemo(() => {
    return DEMO_PROJECTS.filter((p) => p.status === "Live Demo").length;
  }, []);

  const visibleIndustriesCount = useMemo(() => {
    const cats = new Set(baseProjects.map((p) => p.category));
    return cats.size;
  }, [baseProjects]);

  // Task 3: Visible categories (only industries that have at least one visible demo, plus "All Projects")
  const visibleCategories = useMemo(() => {
    const activeCats = new Set(baseProjects.map((p) => p.category));
    return DEMO_CATEGORIES.filter((cat) => cat === "All Projects" || activeCats.has(cat));
  }, [baseProjects]);

  // Dynamic counts for each visible category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "All Projects": baseProjects.length };
    for (const cat of visibleCategories) {
      if (cat !== "All Projects") {
        counts[cat] = baseProjects.filter((p) => p.category === cat).length;
      }
    }
    return counts;
  }, [baseProjects, visibleCategories]);

  // Filtering and sorting logic
  const filteredProjects = useMemo(() => {
    let result = [...baseProjects];

    // Category filter
    if (selectedCategory !== "All Projects") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Status filter
    if (statusFilter === "LIVE_ONLY") {
      result = result.filter((p) => p.status === "Live Demo");
    } else if (statusFilter === "COMING_SOON") {
      result = result.filter((p) => p.status === "Coming Soon");
    }

    // Search query filter (matches name, category, description, target audience, and feature tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesDesc = p.shortDescription.toLowerCase().includes(q);
        const matchesAudience = p.targetAudience.toLowerCase().includes(q);
        const matchesTags = p.features.some((f) => f.toLowerCase().includes(q));
        return matchesName || matchesCategory || matchesDesc || matchesAudience || matchesTags;
      });
    }

    // Sorting
    if (sortBy === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // "recommended" -> displayOrder if set, otherwise live Demos first, then featured, then priority
      result.sort((a, b) => {
        if (a.displayOrder && b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        const liveDiff = (b.status === "Live Demo" ? 1 : 0) - (a.status === "Live Demo" ? 1 : 0);
        if (liveDiff !== 0) return liveDiff;
        const featDiff = (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        if (featDiff !== 0) return featDiff;
        const priorityWeights: Record<string, number> = { P1: 1, P2: 2, P3: 3 };
        return (priorityWeights[a.priority] || 99) - (priorityWeights[b.priority] || 99);
      });
    }

    return result;
  }, [baseProjects, searchQuery, selectedCategory, statusFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Projects");
    setStatusFilter("ALL");
    setSortBy("recommended");
  };

  const isFiltered =
    searchQuery.trim().length > 0 ||
    selectedCategory !== "All Projects" ||
    (SHOW_COMING_SOON_DEMOS && statusFilter !== "ALL");

  // Flagship spotlight project (EstateVista)
  const spotlightProject = useMemo(() => {
    return (
      DEMO_PROJECTS.find((p) => p.slug === "estatevista" || p.id === "estatevista") ||
      DEMO_PROJECTS.find((p) => p.isFeatured && p.status === "Live Demo")
    );
  }, []);

  return (
    <div className="relative selection:bg-[#e8a064] selection:text-[#0f0f0f]">
      {/* ── Section A: Breadcrumb ─────────────────────────────────────── */}
      <div className="border-b border-[#262626]/70 bg-[#0c0c0d]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#71717a]">
            <Link href="/" className="hover:text-[#f4f4f5] transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-[#52525b]" />
            <Link href="/portfolio" className="hover:text-[#f4f4f5] transition-colors">
              Portfolio
            </Link>
            <ChevronRight className="h-3 w-3 text-[#52525b]" />
            <span className="text-[#e8a064] font-medium" aria-current="page">
              Demo Projects
            </span>
          </nav>
        </div>
      </div>

      {/* ── Section B: Hero Section ───────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[#262626] bg-[#0f0f0f] py-16 sm:py-24 lg:py-28">
        {/* Ambient subtle glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[340px] w-full max-w-5xl rounded-full bg-[radial-gradient(ellipse,_rgba(232,160,100,0.08),_transparent_70%)]"
        />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(232,160,100,0.25)] bg-[#2a1f14] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#e8a064] shadow-sm mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>INTERACTIVE DIGITAL SHOWCASE</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#f4f4f5] sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-[1.15]">
            Explore What We Can <span className="text-gradient-amber">Build for Your Business</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#a1a1aa] max-w-2xl mx-auto">
            Discover interactive website and software demonstrations designed around real business use cases. Explore the experience and see how Axivon Technologies can help bring your project to life.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#catalogue-grid"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8a064] px-7 py-3.5 text-sm font-semibold text-[#0f0f0f] shadow-[0_4px_16px_rgba(232,160,100,0.25)] transition-all hover:bg-[#f0b07a] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/50"
            >
              <span>Explore All Demos</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <Link
              href="/contact?service=web-development#contact-form"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#303030] bg-[#141414] px-7 py-3.5 text-sm font-medium text-[#f4f4f5] transition-all hover:border-[#e8a064]/50 hover:bg-[#1c1c1e] hover:text-[#e8a064] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/50"
            >
              <span>Find a Solution for My Business</span>
            </Link>
          </div>

          {/* Dynamic Credible Statistics Row */}
          <div className="mt-14 pt-8 border-t border-[#1f1f1f] flex flex-wrap items-center justify-center gap-8 text-xs text-[#71717a]">
            <div>
              <span className="font-semibold text-emerald-400 text-sm sm:text-base">{liveCount}</span> Live Interactive Demos
            </div>
            <div className="hidden sm:block h-3 w-px bg-[#262626]" />
            <div>
              <span className="font-semibold text-[#f4f4f5] text-sm sm:text-base">{visibleIndustriesCount}</span> Industry Domains Covered
            </div>
            <div className="hidden sm:block h-3 w-px bg-[#262626]" />
            <div>
              <span className="font-semibold text-[#e8a064] text-sm sm:text-base">100%</span> Live, Clickable Demos
            </div>
          </div>
        </div>
      </section>

      {/* ── Section C: Featured Demo Spotlight (Shown when no active search/filters) ── */}
      {!isFiltered && spotlightProject && (
        <section className="border-b border-[#262626] bg-[#0c0c0d] py-16 sm:py-20 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e8a064]">
                  FLAGSHIP SPOTLIGHT
                </span>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#f4f4f5]">
                  Featured Interactive Showcase
                </h2>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Live Interactive Experience
              </span>
            </div>

            {/* Spotlight Banner Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl border border-[rgba(232,160,100,0.3)] bg-gradient-to-br from-[#161619] to-[#0e0e11] p-6 sm:p-8 lg:p-10 shadow-2xl">
              {/* Left Column: Visual Preview */}
              <div className="lg:col-span-7 overflow-hidden rounded-xl border border-[#2a2a30] relative aspect-video bg-[#141416] group">
                <Image
                  src={getDemoProjectImage(spotlightProject)}
                  alt={`${spotlightProject.name} Featured Showcase`}
                  fill
                  priority
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-[#f4f4f5]">
                  <span className="rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono text-[#e8a064]">
                    {spotlightProject.category}
                  </span>
                  <span className="rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] text-[#a1a1aa]">
                    Interactive CAD Blueprints & Mortgage Modeler
                  </span>
                </div>
              </div>

              {/* Right Column: Meta & Actions */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#e8a064]">
                      {spotlightProject.category}
                    </span>
                    <span className="text-[#52525b]">•</span>
                    <span className="text-xs text-emerald-400 font-medium">Verified Blueprint</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#f4f4f5] tracking-tight">
                    {spotlightProject.name}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                    {spotlightProject.shortDescription}
                  </p>

                  {/* Highlight Features */}
                  <div className="mt-5 space-y-2">
                    {spotlightProject.features.slice(0, 4).map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-[#d4d4d8]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#e8a064] shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-[#262626] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {spotlightProject.demoUrl && (
                    <Link
                      href={spotlightProject.demoUrl}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8a064] px-5 py-3 text-xs font-bold text-[#0f0f0f] hover:bg-[#f0b07a] transition-all"
                    >
                      <span>View Live Demo</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  <Link
                    href={`/contact?demo=${encodeURIComponent(spotlightProject.name)}&industry=${encodeURIComponent(spotlightProject.category)}&service=web-development#contact-form`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#303030] bg-[#1a1a1c] px-5 py-3 text-xs font-semibold text-[#f4f4f5] hover:border-[#e8a064]/50 hover:bg-[#202024] hover:text-[#e8a064] transition-all"
                  >
                    <span>Request Similar Website</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href={`/demo-projects/${getDemoProjectSlug(spotlightProject)}`}
                    className="inline-flex items-center justify-center gap-1 text-xs text-[#71717a] hover:text-[#e8a064] transition-colors py-2"
                  >
                    <span>Specs</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Section D: Interactive Search, Category Tabs & Catalogue ── */}
      <section id="catalogue-grid" className="scroll-mt-24 py-16 sm:py-20 bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          {/* Controls Bar */}
          <div className="flex flex-col gap-6 lg:gap-8 mb-10">
            {/* Search Input, Status Filters & Sort Options */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              {/* Search box */}
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717a]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by project name, industry, or feature..."
                  className="w-full rounded-full border border-[#262626] bg-[#141414] py-3.5 pl-11 pr-10 text-sm text-[#f4f4f5] placeholder:text-[#52525b] focus:border-[#e8a064] focus:outline-none focus:ring-1 focus:ring-[#e8a064]/50 transition-colors"
                  aria-label="Search demo projects"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#71717a] hover:text-[#f4f4f5] transition-colors"
                    aria-label="Clear search input"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Status Filter & Sort Dropdown */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Toggle Buttons (active when SHOW_COMING_SOON_DEMOS is true) */}
                {SHOW_COMING_SOON_DEMOS ? (
                  <div className="inline-flex rounded-full border border-[#262626] bg-[#141414] p-1 text-xs">
                    <button
                      onClick={() => setStatusFilter("ALL")}
                      className={`rounded-full px-3 py-1.5 transition-colors ${
                        statusFilter === "ALL"
                          ? "bg-[#262626] text-[#f4f4f5] font-semibold"
                          : "text-[#71717a] hover:text-[#a1a1aa]"
                      }`}
                    >
                      All Statuses
                    </button>
                    <button
                      onClick={() => setStatusFilter("LIVE_ONLY")}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${
                        statusFilter === "LIVE_ONLY"
                          ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                          : "text-[#71717a] hover:text-emerald-400"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Live Demos ({liveCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter("COMING_SOON")}
                      className={`rounded-full px-3 py-1.5 transition-colors ${
                        statusFilter === "COMING_SOON"
                          ? "bg-[#262626] text-[#f4f4f5] font-semibold"
                          : "text-[#71717a] hover:text-[#a1a1aa]"
                      }`}
                    >
                      Coming Soon
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{liveCount} Live Interactive Demos</span>
                  </div>
                )}

                {/* Sort by dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "recommended" | "az")}
                    className="rounded-full border border-[#262626] bg-[#141414] px-4 py-2 text-xs font-medium text-[#f4f4f5] focus:border-[#e8a064] focus:outline-none focus:ring-1 focus:ring-[#e8a064]/40 transition-colors"
                    aria-label="Sort demo projects"
                  >
                    <option value="recommended">Sort: Recommended</option>
                    <option value="az">Sort: Alphabetical (A–Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Horizontal Scrollable Category Filter Pills with Item Counts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#71717a]">
                  Browse by Industry ({visibleCategories.length - 1} domains)
                </span>
                {isFiltered && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs text-[#e8a064] hover:text-[#f0b07a] transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset all filters
                  </button>
                )}
              </div>

              <div
                role="tablist"
                aria-label="Filter demo projects by category"
                className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-[#262626] scrollbar-track-transparent"
              >
                {visibleCategories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const Icon = CATEGORY_ICONS[cat] || Layers;
                  const count = categoryCounts[cat] || 0;
                  return (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedCategory(cat);
                        trackDemoFilter(cat);
                      }}
                      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/50 ${
                        isSelected
                          ? "bg-[#e8a064] text-[#0f0f0f] shadow-md shadow-[#e8a064]/10 font-semibold"
                          : "border border-[#262626] bg-[#141414] text-[#a1a1aa] hover:border-[#383838] hover:bg-[#1a1a1a] hover:text-[#f4f4f5]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? "bg-black/20 text-[#0f0f0f]" : "bg-[#202024] text-[#71717a]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Results Counter */}
            <div className="flex items-center justify-between border-t border-[#1f1f1f] pt-4 text-xs text-[#71717a]">
              <div>
                Showing <span className="font-semibold text-[#f4f4f5]">{filteredProjects.length}</span>{" "}
                {filteredProjects.length === 1 ? "project" : "projects"}
                {selectedCategory !== "All Projects" && (
                  <> in <span className="text-[#e8a064] font-medium">{selectedCategory}</span></>
                )}
                {statusFilter === "LIVE_ONLY" && SHOW_COMING_SOON_DEMOS && <> (Live Demos only)</>}
                {statusFilter === "COMING_SOON" && SHOW_COMING_SOON_DEMOS && <> (Coming Soon concepts only)</>}
                {searchQuery.trim() && (
                  <> matching &ldquo;<span className="text-[#f4f4f5]">{searchQuery.trim()}</span>&rdquo;</>
                )}
              </div>
            </div>
          </div>

          {/* Catalogue Grid or Empty State */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#262626] bg-[#141414]/50 py-20 px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1c1c1e] text-[#71717a] mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#f4f4f5]">No demo projects found</h3>
              <p className="mt-2 text-sm text-[#71717a] max-w-md">
                No projects matched your criteria. Clear your search or change your category filter to explore our catalogue.
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e8a064] px-6 py-2.5 text-xs font-semibold text-[#0f0f0f] hover:bg-[#f0b07a] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Section E: Closing Consultation Call-to-Action ───────────── */}
      <section className="border-t border-[#262626] bg-[#0c0c0d] py-20 sm:py-24 relative overflow-hidden">
        {/* Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 h-72 w-full max-w-4xl rounded-full bg-[radial-gradient(ellipse,_rgba(232,160,100,0.06),_transparent_70%)]"
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <SectionHeader
            overline="Custom Digital Solutions"
            heading="Have a Project in Mind?"
            body="Tell us what your business needs. Our team can help you plan the right website, application, or digital solution."
            align="center"
          />

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact?service=web-development#contact-form"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8a064] px-8 py-4 text-sm font-semibold text-[#0f0f0f] shadow-[0_4px_16px_rgba(232,160,100,0.25)] transition-all hover:bg-[#f0b07a] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/50"
            >
              <span>Book a Consultation</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center rounded-full border border-[#262626] bg-[#141414] px-7 py-4 text-sm font-medium text-[#a1a1aa] transition-colors hover:border-[#383838] hover:text-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/50"
            >
              View Selected Client Work
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Project Card Component with Visual Previews & Dual CTAs ──────────

interface ProjectCardProps {
  project: DemoProject;
  featuredBadge?: boolean;
}

function ProjectCard({ project, featuredBadge = false }: ProjectCardProps) {
  const isLive = project.status === "Live Demo";
  const projectSlug = getDemoProjectSlug(project);
  const imageUrl = getDemoProjectImage(project);
  const consultationUrl = `/contact?demo=${encodeURIComponent(project.name)}&industry=${encodeURIComponent(project.category)}&service=${encodeURIComponent(project.relatedServiceSlug || "web-development")}#contact-form`;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-[#262626] bg-[#141414] overflow-hidden transition-all duration-200 hover:border-[rgba(232,160,100,0.35)] hover:bg-[#18181a] shadow-sm">
      {/* Visual Preview Image */}
      <Link href={`/demo-projects/${projectSlug}`} className="block relative aspect-video w-full overflow-hidden bg-[#1a1a1d]">
        <Image
          src={imageUrl}
          alt={`${project.name} Demonstration Preview`}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-80" />

        {/* Top Floating Badge on Image */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="rounded-full bg-black/70 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#e8a064] border border-[#e8a064]/20">
            {project.category}
          </span>

          {isLive ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-black/70 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Demo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#303030] bg-black/70 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-medium text-[#a1a1aa]">
              <Clock className="h-2.5 w-2.5 text-[#71717a]" />
              Coming Soon
            </span>
          )}
        </div>
      </Link>

      {/* Card Content Area */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {/* Title & Priority / Featured Tag */}
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <Link href={`/demo-projects/${projectSlug}`}>
            <h3 className="text-xl font-bold tracking-tight text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors">
              {project.name}
            </h3>
          </Link>
          {featuredBadge && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#e8a064] bg-[#2a1f14] px-2 py-0.5 rounded-full border border-[#e8a064]/30">
              Featured
            </span>
          )}
        </div>

        {/* Short Description */}
        <p className="text-xs sm:text-sm leading-relaxed text-[#a1a1aa] mb-4 flex-1">
          {project.shortDescription}
        </p>

        {/* Target Audience Hint */}
        <div className="mb-4 text-[11px] text-[#71717a] border-t border-[#1f1f1f] pt-3">
          <span className="text-[#888890] font-medium">Ideal for:</span> {project.targetAudience}
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="rounded-md border border-[#262626] bg-[#0f0f0f] px-2 py-0.5 text-[10px] text-[#a1a1aa]"
            >
              {feature}
            </span>
          ))}
          {project.features.length > 3 && (
            <span className="rounded-md border border-transparent bg-[#1f1f23] px-1.5 py-0.5 text-[10px] text-[#71717a]">
              +{project.features.length - 3}
            </span>
          )}
        </div>

        {/* Action Button Strip */}
        <div className="mt-auto pt-3 border-t border-[#1f1f1f] flex flex-col gap-2">
          {isLive && project.demoUrl ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={project.demoUrl}
                onClick={() => trackDemoView({ demoSlug: projectSlug, category: project.category, isLive: true })}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#e8a064] px-3 py-2 text-xs font-semibold text-[#0f0f0f] transition-all hover:bg-[#f0b07a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]"
              >
                <span>View Demo</span>
                <ExternalLink className="h-3 w-3" />
              </Link>

              <Link
                href={consultationUrl}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#303030] bg-[#1a1a1c] px-3 py-2 text-xs font-medium text-[#f4f4f5] transition-all hover:border-[#e8a064]/50 hover:bg-[#202024] hover:text-[#e8a064] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]"
              >
                <span>Request Similar</span>
                <ArrowRight className="h-3 w-3 text-[#e8a064]" />
              </Link>
            </div>
          ) : (
            <Link
              href={consultationUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#303030] bg-[#1a1a1c] px-4 py-2.5 text-xs font-medium text-[#f4f4f5] transition-all hover:border-[#e8a064]/50 hover:bg-[#202024] hover:text-[#e8a064] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]"
            >
              <span>Request a Similar Project</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#e8a064]" />
            </Link>
          )}

          {/* Quick link to Architecture Specs */}
          <Link
            href={`/demo-projects/${projectSlug}`}
            onClick={() => trackDemoView({ demoSlug: projectSlug, category: project.category, isLive })}
            className="inline-flex items-center justify-center gap-1 text-[11px] text-[#71717a] hover:text-[#e8a064] transition-colors py-1"
          >
            <FileCode2 className="h-3 w-3" />
            <span>View Architecture Specs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
