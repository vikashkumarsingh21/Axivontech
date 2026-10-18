"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  Loader2,
  Shield,
  Search,
  FileText,
  BarChart3,
  Check,
  AlertTriangle,
  Code2,
} from "lucide-react";
import { SeoSettings, DEFAULT_SEO_SETTINGS } from "@/lib/content/content-db";

export default function SeoSettingsPage() {
  const [seo, setSeo] = useState<SeoSettings>(DEFAULT_SEO_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function loadSeo() {
      try {
        const res = await fetch("/api/v1/admin/content/settings?key=seo");
        if (res.ok) {
          const json = await res.json();
          if (json.setting?.data) {
            setSeo({
              ...DEFAULT_SEO_SETTINGS,
              ...json.setting.data,
            });
          }
        }
      } catch {
        // default
      } finally {
        setLoading(false);
      }
    }
    loadSeo();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/admin/content/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "seo",
          data: seo,
          action: "publish",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update SEO settings");

      setFeedback({
        type: "success",
        message: "SEO configuration updated successfully.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to update SEO settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
      </div>
    );
  }

  const titleLength = (seo.defaultTitle || "").length;
  const descLength = (seo.defaultDescription || "").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Global SEO & Analytics Hub</h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {seo.allowIndexing ? "Live Indexing" : "Indexing Blocked"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Technical SEO controls, search console verification, Google Analytics 4 telemetry, and metadata previews.
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 h-9 px-4 bg-red-600 hover:bg-red-500 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save SEO Settings</span>
          </button>
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
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white text-xs underline">
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Technical SEO Health Status Card */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#111111] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Dynamic Sitemap</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-gray-300 font-mono">/sitemap.xml</p>
              <p className="text-[11px] text-gray-500 mt-1">Queries CMS services, blogs, & demos in real-time</p>
            </div>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
            >
              <span>Inspect XML</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Robots Directives</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-gray-300 font-mono">/robots.txt</p>
              <p className="text-[11px] text-gray-500 mt-1">Private routes shielded (/admin, /employee, /api)</p>
            </div>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
            >
              <span>Inspect Rules</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Schema.org JSON-LD</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-gray-300">5 Active Schemas</p>
              <p className="text-[11px] text-gray-500 mt-1">Organization, LocalBusiness, WebSite, FAQPage, ServiceFAQ</p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-gray-400">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>100% Dynamic</span>
            </span>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Analytics & PII</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-gray-300 font-mono">{seo.gaMeasurementId || "Not Configured"}</p>
              <p className="text-[11px] text-gray-500 mt-1">SPA route tracking active, zero-PII sanitization verified</p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-emerald-400">
              <Shield className="w-3 h-3" />
              <span>Zero-PII Filter</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main SEO Form (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metadata Section */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Default Metadata & Titles</h2>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Site Title Template</label>
                <input
                  type="text"
                  value={seo.titleTemplate}
                  onChange={(e) => setSeo({ ...seo, titleTemplate: e.target.value })}
                  placeholder="%s | Axivon Technologies"
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40 font-mono text-xs"
                />
                <p className="text-[11px] text-gray-500 mt-1">Used for child pages. &quot;%s&quot; is replaced by the specific page title.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-400">Default Meta Title</label>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      titleLength >= 50 && titleLength <= 60
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : titleLength > 60
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-white/5 text-gray-400 border border-white/10"
                    }`}
                  >
                    {titleLength} / 60 chars {titleLength >= 50 && titleLength <= 60 ? "• Optimal" : titleLength > 60 ? "• May truncate" : ""}
                  </span>
                </div>
                <input
                  type="text"
                  value={seo.defaultTitle}
                  onChange={(e) => setSeo({ ...seo, defaultTitle: e.target.value })}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-400">Default Meta Description</label>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      descLength >= 140 && descLength <= 160
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : descLength > 160
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-white/5 text-gray-400 border border-white/10"
                    }`}
                  >
                    {descLength} / 160 chars {descLength >= 140 && descLength <= 160 ? "• Optimal" : descLength > 160 ? "• May truncate" : ""}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={seo.defaultDescription}
                  onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })}
                  className="w-full p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Canonical Base URL</label>
                  <input
                    type="url"
                    value={seo.canonicalBase}
                    onChange={(e) => setSeo({ ...seo, canonicalBase: e.target.value })}
                    className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Default Social (OG) Image</label>
                  <input
                    type="text"
                    value={seo.defaultOgImage}
                    onChange={(e) => setSeo({ ...seo, defaultOgImage: e.target.value })}
                    className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Global Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  value={seo.keywords.join(", ")}
                  onChange={(e) =>
                    setSeo({
                      ...seo,
                      keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40"
                />
              </div>
            </div>

            {/* Search Console & Webmaster Verification */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Search Console & Analytics Integration</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Google Search Console Verification
                  </label>
                  <input
                    type="text"
                    value={seo.googleSiteVerification || ""}
                    onChange={(e) => setSeo({ ...seo, googleSiteVerification: e.target.value })}
                    placeholder="e.g. AbC123XyZ456..."
                    className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40 font-mono text-xs"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Adds &lt;meta name=&quot;google-site-verification&quot;&gt; to head automatically.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Bing Webmaster Verification
                  </label>
                  <input
                    type="text"
                    value={seo.bingSiteVerification || ""}
                    onChange={(e) => setSeo({ ...seo, bingSiteVerification: e.target.value })}
                    placeholder="e.g. 789ABCDEF012..."
                    className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40 font-mono text-xs"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Adds &lt;meta name=&quot;msvalidate.01&quot;&gt; to head automatically.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Google Analytics 4 Measurement ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={seo.gaMeasurementId || ""}
                    onChange={(e) => setSeo({ ...seo, gaMeasurementId: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40 font-mono text-xs"
                  />
                  <div className="shrink-0 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>GA4</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Enables GA4 telemetry with automatic SPA route transition tracking and zero-PII sanitization.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Search Engine Indexing Directives</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {seo.allowIndexing
                      ? "Enabled: search engines (Google, Bing) are permitted to index published pages."
                      : "Disabled: 'noindex, nofollow' applied globally to pause public crawl."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSeo({ ...seo, allowIndexing: !seo.allowIndexing })}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    seo.allowIndexing ? "bg-emerald-600" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      seo.allowIndexing ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* SERP & Social Previews (1 column) */}
          <div className="space-y-6">
            {/* Google SERP Preview */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-white/5">
                <Search className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Google Search Snippet</h3>
              </div>

              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 font-sans text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white">
                    A
                  </div>
                  <span className="text-gray-300">Axivon Technologies</span>
                  <span className="text-gray-600">›</span>
                  <span className="text-gray-500 font-mono">{seo.canonicalBase || "https://axivontech.in"}</span>
                </div>
                <h4 className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer leading-tight line-clamp-2">
                  {seo.defaultTitle || "Axivon Technologies — High-Performance Software"}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                  {seo.defaultDescription || "No description provided."}
                </p>
              </div>
            </div>

            {/* Social Share Card Preview */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-white/5">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Social Share Preview</h3>
              </div>

              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden text-left">
                <div className="h-32 bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center border-b border-white/10 relative">
                  {seo.defaultOgImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={seo.defaultOgImage}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Globe className="w-8 h-8 text-gray-600 mx-auto mb-1" />
                      <span className="text-[11px] text-gray-500">Default Social Image</span>
                    </div>
                  )}
                </div>
                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">
                    {seo.canonicalBase ? new URL(seo.canonicalBase).hostname : "axivontech.in"}
                  </span>
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {seo.defaultTitle}
                  </h4>
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                    {seo.defaultDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Structured Schema Audit Status */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/5">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Active Schema Types</h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">Organization</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">JSON-LD</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">LocalBusiness</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">JSON-LD</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">WebSite & SearchAction</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">JSON-LD</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">FAQPage (Homepage)</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Dynamic</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">Service & FAQ (10 Services)</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Dynamic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
