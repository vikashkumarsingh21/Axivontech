"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
} from "lucide-react";
import {
  DEMO_PROJECTS,
  DEMO_CATEGORIES,
  type DemoProject,
  type DemoCategory,
} from "@/data/demo-projects";
import { SectionHeader, Badge } from "@/components/ui";

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
  const [sortBy, setSortBy] = useState<"recommended" | "az">("recommended");

  // Filtering and sorting logic
  const filteredProjects = useMemo(() => {
    let result = [...DEMO_PROJECTS];

    // Category filter
    if (selectedCategory !== "All Projects") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search query filter (matches name, category, description, and feature tags)
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
      // "recommended" -> Priority P1 first, then featured, then P2, P3
      const priorityWeights: Record<string, number> = { P1: 1, P2: 2, P3: 3 };
      result.sort((a, b) => {
        const diff = (priorityWeights[a.priority] || 99) - (priorityWeights[b.priority] || 99);
        if (diff !== 0) return diff;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Projects");
    setSortBy("recommended");
  };

  const isFiltered = searchQuery.trim().length > 0 || selectedCategory !== "All Projects";

  // Featured P1 showcase items (for top highlight section when no filter is active)
  const featuredShowcase = useMemo(() => {
    return DEMO_PROJECTS.filter((p) => p.isFeatured && p.priority === "P1").slice(0, 3);
  }, []);

  return (
    <div className="relative">
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
            <span>AXIVON DIGITAL SHOWCASE</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#f4f4f5] sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-[1.15]">
            Explore Our <span className="text-gradient-amber">Demo Projects</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#a1a1aa] max-w-2xl mx-auto">
            Discover website and software demonstrations designed for different industries. Explore the
            possibilities and find the right digital experience for your business.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#catalogue-grid"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8a064] px-7 py-3.5 text-sm font-semibold text-[#0f0f0f] shadow-[0_4px_16px_rgba(232,160,100,0.25)] transition-all hover:bg-[#f0b07a] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/50"
            >
              <span>Explore Projects</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <Link
              href="/contact#contact-form"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#303030] bg-[#141414] px-7 py-3.5 text-sm font-medium text-[#f4f4f5] transition-all hover:border-[#e8a064]/50 hover:bg-[#1c1c1e] hover:text-[#e8a064] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/50"
            >
              <span>Discuss Your Project</span>
            </Link>
          </div>

          {/* Quick Stats Badges */}
          <div className="mt-14 pt-8 border-t border-[#1f1f1f] flex flex-wrap items-center justify-center gap-8 text-xs text-[#71717a]">
            <div>
              <span className="font-semibold text-[#f4f4f5] text-sm sm:text-base">47+</span> Concepts & Prototypes
            </div>
            <div className="hidden sm:block h-3 w-px bg-[#262626]" />
            <div>
              <span className="font-semibold text-[#f4f4f5] text-sm sm:text-base">22</span> Industry Domains
            </div>
            <div className="hidden sm:block h-3 w-px bg-[#262626]" />
            <div>
              <span className="font-semibold text-[#e8a064] text-sm sm:text-base">100%</span> Production-grade Architecture
            </div>
          </div>
        </div>
      </section>

      {/* ── Section C & D: Featured Highlights (only shown when not searching/filtering) ── */}
      {!isFiltered && (
        <section className="border-b border-[#262626] bg-[#0c0c0d] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e8a064]">
                  CURATED PREVIEWS
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#f4f4f5]">
                  Featured Industry Showcases
                </h2>
              </div>
              <p className="text-sm text-[#71717a] max-w-md">
                Our flagship interactive blueprints crafted for corporate scalability, patient workflows, and high-conversion commerce.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredShowcase.map((project) => (
                <ProjectCard key={project.id} project={project} featuredBadge />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section E: Interactive Search, Category Tabs & Catalogue ── */}
      <section id="catalogue-grid" className="scroll-mt-24 py-16 sm:py-20 bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          {/* Controls Bar */}
          <div className="flex flex-col gap-6 lg:gap-8 mb-10">
            {/* Search Input & Sort Options */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
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

              {/* Sort by dropdown */}
              <div className="flex items-center gap-3">
                <label htmlFor="sort-select" className="text-xs font-medium text-[#71717a] whitespace-nowrap flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recommended" | "az")}
                  className="rounded-full border border-[#262626] bg-[#141414] px-4 py-2.5 text-xs font-medium text-[#f4f4f5] focus:border-[#e8a064] focus:outline-none focus:ring-1 focus:ring-[#e8a064]/40 transition-colors"
                >
                  <option value="recommended">Recommended</option>
                  <option value="az">Project Name A–Z</option>
                </select>
              </div>
            </div>

            {/* Horizontal Scrollable Category Filter Pills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#71717a]">
                  Filter by Industry ({DEMO_CATEGORIES.length - 1} domains)
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
                {DEMO_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const Icon = CATEGORY_ICONS[cat] || Layers;
                  return (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setSelectedCategory(cat)}
                      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/50 ${
                        isSelected
                          ? "bg-[#e8a064] text-[#0f0f0f] shadow-md shadow-[#e8a064]/10 font-semibold"
                          : "border border-[#262626] bg-[#141414] text-[#a1a1aa] hover:border-[#383838] hover:bg-[#1a1a1a] hover:text-[#f4f4f5]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat}</span>
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
              <h3 className="text-xl font-bold text-[#f4f4f5]">No projects found</h3>
              <p className="mt-2 text-sm text-[#71717a] max-w-md">
                Try another search term or clear your filters to explore our full showcase of 47 demo concepts.
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

      {/* ── Section F: Closing Consultation Call-to-Action ───────────── */}
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
              href="/contact#contact-form"
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

// ── Project Card Component ─────────────────────────────────────────────

interface ProjectCardProps {
  project: DemoProject;
  featuredBadge?: boolean;
}

function ProjectCard({ project, featuredBadge = false }: ProjectCardProps) {
  const isLive = project.status === "Live Demo";
  const consultationUrl = `/contact?project=${encodeURIComponent(project.name)}#contact-form`;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-[#262626] bg-[#141414] p-6 transition-all duration-200 hover:border-[rgba(232,160,100,0.35)] hover:bg-[#18181a] shadow-sm">
      {/* Top Meta: Category + Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e8a064] truncate">
          {project.category}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {isLive ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Live Demo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#303030] bg-[#1c1c1e] px-2.5 py-0.5 text-[10px] font-medium text-[#a1a1aa]">
              <Clock className="h-3 w-3 text-[#71717a]" />
              Coming Soon
            </span>
          )}
        </div>
      </div>

      {/* Title & Priority Tag */}
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="text-xl font-bold tracking-tight text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors">
          {project.name}
        </h3>
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
      <div className="flex flex-wrap gap-1.5 mb-6">
        {project.features.map((feature) => (
          <span
            key={feature}
            className="rounded-md border border-[#262626] bg-[#0f0f0f] px-2 py-1 text-[10px] text-[#a1a1aa]"
          >
            {feature}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <div className="mt-auto pt-2 border-t border-[#1f1f1f]">
        {isLive && project.demoUrl ? (
          project.demoUrl.startsWith("/") ? (
            <Link
              href={project.demoUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8a064] px-4 py-2.5 text-xs font-semibold text-[#0f0f0f] transition-all hover:bg-[#f0b07a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]"
            >
              <span>View Demo</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8a064] px-4 py-2.5 text-xs font-semibold text-[#0f0f0f] transition-all hover:bg-[#f0b07a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]"
            >
              <span>View Demo</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )
        ) : (
          <Link
            href={consultationUrl}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#303030] bg-[#1a1a1c] px-4 py-2.5 text-xs font-medium text-[#f4f4f5] transition-all hover:border-[#e8a064]/50 hover:bg-[#202024] hover:text-[#e8a064] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]"
          >
            <span>Request a Similar Project</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#e8a064]" />
          </Link>
        )}
      </div>
    </div>
  );
}
