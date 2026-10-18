"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  Loader2,
  Sliders,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";
import { HomepageContent, DEFAULT_HOMEPAGE_CONTENT } from "@/lib/content/content-db";

export default function HomepageContentEditor() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "sections" | "cta" | "seo">("hero");

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch("/api/v1/admin/content/settings?key=homepage");
        if (res.ok) {
          const json = await res.json();
          if (json.setting?.data) {
            setContent({
              ...DEFAULT_HOMEPAGE_CONTENT,
              ...json.setting.data,
            });
          }
        }
      } catch (err) {
        // default
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleSave = async (action: "publish" | "draft") => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/admin/content/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "homepage",
          data: content,
          action,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      setFeedback({
        type: "success",
        message: action === "publish" ? "Homepage published live to axivontech.in!" : "Draft saved successfully.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to update content.",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: keyof HomepageContent["hero"], value: any) => {
    setContent((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  const updateClosingCta = (field: keyof HomepageContent["closingCta"], value: any) => {
    setContent((prev) => ({
      ...prev,
      closingCta: { ...prev.closingCta, [field]: value },
    }));
  };

  const updateSeo = (field: keyof HomepageContent["seo"], value: any) => {
    setContent((prev) => ({
      ...prev,
      seo: { ...prev.seo, [field]: value },
    }));
  };

  const toggleSection = (section: keyof HomepageContent["sectionsVisibility"]) => {
    setContent((prev) => ({
      ...prev,
      sectionsVisibility: {
        ...prev.sectionsVisibility,
        [section]: !prev.sectionsVisibility[section],
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Home className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Homepage Content Management</h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Customize hero messaging, CTAs, feature badges, and section visibility on the public homepage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg text-xs font-medium text-gray-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Live</span>
            </Link>
            <button
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="h-9 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-gray-300 rounded-lg transition-colors border border-white/10"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave("publish")}
              disabled={saving}
              className="flex items-center gap-1.5 h-9 px-4 bg-red-600 hover:bg-red-500 text-xs font-semibold text-white rounded-lg transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Publish Live</span>
            </button>
          </div>
        </div>

        {/* Feedback alert */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : "bg-red-500/10 border-red-500/20 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="text-gray-400 hover:text-white text-xs underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-white/5">
          {[
            { id: "hero", label: "Hero Section" },
            { id: "sections", label: "Section Visibility" },
            { id: "cta", label: "Closing CTA & Stats" },
            { id: "seo", label: "SEO Metadata" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`h-10 px-4 text-xs font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-red-500 text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Hero Section */}
        {activeTab === "hero" && (
          <div className="space-y-5 bg-[#111111] border border-white/5 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Hero Eyebrow Text</label>
                <input
                  type="text"
                  value={content.hero.eyebrow}
                  onChange={(e) => updateHero("eyebrow", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Headline Accent / Highlight</label>
                <input
                  type="text"
                  value={content.hero.highlight}
                  onChange={(e) => updateHero("highlight", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Main Headline</label>
              <input
                type="text"
                value={content.hero.headline}
                onChange={(e) => updateHero("headline", e.target.value)}
                className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Supporting Subcopy</label>
              <textarea
                rows={3}
                value={content.hero.subcopy}
                onChange={(e) => updateHero("subcopy", e.target.value)}
                className="w-full p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-white/5">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Primary CTA Button Label</label>
                <input
                  type="text"
                  value={content.hero.primaryCtaText}
                  onChange={(e) => updateHero("primaryCtaText", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Primary CTA Destination</label>
                <input
                  type="text"
                  value={content.hero.primaryCtaLink}
                  onChange={(e) => updateHero("primaryCtaLink", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Secondary CTA Button Label</label>
                <input
                  type="text"
                  value={content.hero.secondaryCtaText}
                  onChange={(e) => updateHero("secondaryCtaText", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Secondary CTA Destination</label>
                <input
                  type="text"
                  value={content.hero.secondaryCtaLink}
                  onChange={(e) => updateHero("secondaryCtaLink", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Capability Badges (Comma-separated)
              </label>
              <input
                type="text"
                value={content.hero.capabilityBadges.join(", ")}
                onChange={(e) =>
                  updateHero(
                    "capabilityBadges",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Section Visibility */}
        {activeTab === "sections" && (
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-2">Public Homepage Section Toggles</h3>
            <p className="text-xs text-gray-500 mb-6">
              Enable or disable specific sections on the homepage without modifying component code.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: "hero", label: "Hero Video Banner" },
                { key: "services", label: "Core Services Grid" },
                { key: "whyChooseUs", label: "Why Choose Us (Impact)" },
                { key: "industries", label: "Industries We Serve" },
                { key: "portfolio", label: "Selected Works / Portfolio" },
                { key: "process", label: "Delivery Process (4 Steps)" },
                { key: "reviews", label: "Client Reviews & Ratings" },
                { key: "faq", label: "Frequently Asked Questions" },
                { key: "cta", label: "Final Project CTA Banner" },
              ].map((sec) => {
                const isEnabled = content.sectionsVisibility[sec.key as keyof HomepageContent["sectionsVisibility"]];
                return (
                  <div
                    key={sec.key}
                    onClick={() => toggleSection(sec.key as any)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isEnabled
                        ? "bg-white/[0.03] border-red-500/40 text-white"
                        : "bg-white/[0.01] border-white/5 text-gray-500 opacity-60"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-medium">{sec.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{isEnabled ? "Visible" : "Hidden"}</p>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        isEnabled ? "bg-red-600" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          isEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Closing CTA & Stats */}
        {activeTab === "cta" && (
          <div className="space-y-5 bg-[#111111] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-2">Closing Conversion Banner</h3>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">CTA Heading</label>
              <input
                type="text"
                value={content.closingCta.heading}
                onChange={(e) => updateClosingCta("heading", e.target.value)}
                className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">CTA Subheading</label>
              <textarea
                rows={2}
                value={content.closingCta.subheading}
                onChange={(e) => updateClosingCta("subheading", e.target.value)}
                className="w-full p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Primary Button Text</label>
                <input
                  type="text"
                  value={content.closingCta.primaryButtonText}
                  onChange={(e) => updateClosingCta("primaryButtonText", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Primary Button Destination</label>
                <input
                  type="text"
                  value={content.closingCta.primaryButtonLink}
                  onChange={(e) => updateClosingCta("primaryButtonLink", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: SEO Metadata */}
        {activeTab === "seo" && (
          <div className="space-y-5 bg-[#111111] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-2">Homepage Search Engine Optimization</h3>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Page Title</label>
              <input
                type="text"
                value={content.seo.title}
                onChange={(e) => updateSeo("title", e.target.value)}
                className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Meta Description</label>
              <textarea
                rows={3}
                value={content.seo.description}
                onChange={(e) => updateSeo("description", e.target.value)}
                className="w-full p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Keywords (Comma-separated)</label>
              <input
                type="text"
                value={content.seo.keywords.join(", ")}
                onChange={(e) =>
                  updateSeo(
                    "keywords",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
