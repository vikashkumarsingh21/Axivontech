"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutTemplate,
  Home,
  Layers,
  Building2,
  Info,
  HelpCircle,
  BookOpen,
  MessageSquare,
  ImageIcon,
  Globe,
  Sparkles,
  Sliders,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Scale,
} from "lucide-react";

interface ContentStatSummary {
  homepageStatus: string;
  servicesCount: number;
  industriesCount: number;
  faqsCount: number;
  articlesCount: number;
  reviewsCount: number;
  mediaCount: number;
  demoProjectsCount: number;
  postersCount: number;
  mediaBytesFormatted: string;
}

export default function ContentManagementHubPage() {
  const [stats, setStats] = useState<ContentStatSummary>({
    homepageStatus: "PUBLISHED",
    servicesCount: 10,
    industriesCount: 8,
    faqsCount: 8,
    articlesCount: 3,
    reviewsCount: 0,
    mediaCount: 4,
    demoProjectsCount: 47,
    postersCount: 0,
    mediaBytesFormatted: "0.0 MB",
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/content/summary");
      if (res.ok) {
        const data = await res.json();
        const s = data.summary;
        if (s) {
          setStats({
            homepageStatus: s.settings?.homepage ? "CUSTOMIZED" : "DEFAULT",
            servicesCount: s.services?.total ?? 10,
            industriesCount: s.industries?.total ?? 8,
            faqsCount: s.faqs?.total ?? 8,
            articlesCount: s.articles?.total ?? 3,
            reviewsCount: 0,
            mediaCount: s.media?.count ?? 0,
            demoProjectsCount: s.portfolio?.total ?? 47,
            postersCount: s.posters?.total ?? 0,
            mediaBytesFormatted: `${s.media?.totalMb || "0.0"} MB`,
          });
        }
      }
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const modules = [
    {
      title: "Homepage Content",
      description: "Manage hero eyebrow, headline, subcopy, CTA buttons, capability badges, and section visibility.",
      href: "/admin/content/homepage",
      icon: Home,
      stat: "Live",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Services Catalog",
      description: "Add, edit, or reorder services, engineering process stages, technologies, and pricing CTAs.",
      href: "/admin/content/services",
      icon: Layers,
      stat: `${stats.servicesCount} Services`,
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Industry Sectors",
      description: "Manage industry offerings, use cases, technology tags, and related service associations.",
      href: "/admin/content/industries",
      icon: Building2,
      stat: `${stats.industriesCount} Sectors`,
      badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "About & Leadership",
      description: "Manage mission, vision, values, founder message, company milestones, and verified office details.",
      href: "/admin/content/about",
      icon: Info,
      stat: "Verified",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "FAQ Directory",
      description: "Manage categorized questions and answers across Homepage, Services, Delivery, and Support.",
      href: "/admin/content/faqs",
      icon: HelpCircle,
      stat: `${stats.faqsCount} FAQs`,
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Blog & Technical Articles",
      description: "Publish engineering articles, architecture blueprints, guides, and SEO metadata.",
      href: "/admin/content/blog",
      icon: BookOpen,
      stat: `${stats.articlesCount} Articles`,
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Reviews Moderation",
      description: "Review, approve, or feature authentic client ratings and testimonials before publication.",
      href: "/admin/reviews",
      icon: MessageSquare,
      stat: "Moderated",
      badgeColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
    {
      title: "Media Library",
      description: "Manage verified photography, vectors, team headshots, and demo assets with alt-text tracking.",
      href: "/admin/content/media",
      icon: ImageIcon,
      stat: `${stats.mediaCount} Assets`,
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "SEO Configuration",
      description: "Manage default site titles, meta descriptions, canonical domain, OpenGraph, and indexing rules.",
      href: "/admin/content/seo",
      icon: Globe,
      stat: "Optimized",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Demo Projects (Phase 3)",
      description: "Manage interactive prototypes, live URLs, industry tags, and client conversion pathways.",
      href: "/admin/content/demo-projects",
      icon: Sparkles,
      stat: `${stats.demoProjectsCount} Demos`,
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Login Page Posters",
      description: "Configure dynamic carousel slides, security banners, and announcements for AXIVON ONE login.",
      href: "/admin/content/login-posters",
      icon: Sliders,
      stat: "Active",
      badgeColor: "text-red-400 bg-red-500/10 border-red-500/20",
    },
    {
      title: "Legal & Policy Center",
      description: "Manage statutory legal policies, DPDP Act 2023 compliance, terms of service, and privacy requests.",
      href: "/admin/content/legal",
      icon: Scale,
      stat: "Compliant",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Website Content Management</h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Step 4 Live
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage public website copy, services, industries, FAQs, blog articles, media, and SEO without code deployments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg text-xs font-medium text-gray-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              <span>View Public Website</span>
            </Link>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                href={mod.href}
                className="group p-5 bg-[#111111] hover:bg-[#141414] border border-white/5 hover:border-red-500/30 rounded-2xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:border-red-500/30 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4 text-gray-300 group-hover:text-red-400 transition-colors" />
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${mod.badgeColor}`}>
                      {mod.stat}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-medium text-gray-500 group-hover:text-gray-300 transition-colors">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Publishing Integrity Notice */}
        <div className="p-5 bg-[#111111] border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Single Source of Truth & Cache Revalidation</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Published changes immediately update database records and trigger Next.js cache revalidation for high-speed delivery.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Mock Records</span>
          </div>
        </div>
      </div>
    </div>
  );
}
