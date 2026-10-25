"use client";

import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  Loader2,
  Shield,
  Target,
  Code,
  Building,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { AboutPageContent, DEFAULT_ABOUT_CONTENT } from "@/lib/content/content-db";

export default function AboutContentEditor() {
  const [content, setContent] = useState<AboutPageContent>(DEFAULT_ABOUT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"mission" | "founder" | "contact" | "milestones">("mission");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch("/api/v1/admin/content/settings?key=about");
        if (res.ok) {
          const json = await res.json();
          if (json.setting?.data) {
            setContent({
              ...DEFAULT_ABOUT_CONTENT,
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
          key: "about",
          data: content,
          action,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(json) || "Save failed");

      setFeedback({
        type: "success",
        message: action === "publish" ? "About & Company information published live!" : "Draft saved successfully.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to save content.",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateContact = (field: keyof AboutPageContent["contactInfo"], value: any) => {
    setContent((prev) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [field]: value },
    }));
  };

  const updateFounder = (field: keyof AboutPageContent["founder"], value: any) => {
    setContent((prev) => ({
      ...prev,
      founder: { ...prev.founder, [field]: value },
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Info className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">About & Company Information</h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage mission, vision, core values, leadership bio, company milestones, and central contact details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/about"
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
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white text-xs underline">
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-white/5">
          {[
            { id: "mission", label: "Mission & Values" },
            { id: "founder", label: "Founder & Leadership" },
            { id: "contact", label: "Central Contact & Office" },
            { id: "milestones", label: "Company Milestones" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`h-10 px-4 text-xs font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-amber-400 text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Mission & Values */}
        {activeTab === "mission" && (
          <div className="space-y-5 bg-[#111111] border border-white/5 rounded-2xl p-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Mission Statement</label>
              <textarea
                rows={3}
                value={content.mission}
                onChange={(e) => setContent({ ...content, mission: e.target.value })}
                className="w-full p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Vision Statement</label>
              <textarea
                rows={3}
                value={content.vision}
                onChange={(e) => setContent({ ...content, vision: e.target.value })}
                className="w-full p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40 resize-none"
              />
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-sm font-semibold text-white mb-3">Core Company Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.values.map((val, idx) => (
                  <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                    <input
                      type="text"
                      value={val.title}
                      onChange={(e) => {
                        const updated = [...content.values];
                        updated[idx].title = e.target.value;
                        setContent({ ...content, values: updated });
                      }}
                      className="w-full h-8 px-2.5 bg-white/[0.04] border border-white/[0.08] rounded text-xs font-semibold text-white focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      value={val.description}
                      onChange={(e) => {
                        const updated = [...content.values];
                        updated[idx].description = e.target.value;
                        setContent({ ...content, values: updated });
                      }}
                      className="w-full p-2 bg-white/[0.04] border border-white/[0.08] rounded text-xs text-gray-400 focus:outline-none resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Founder & Leadership */}
        {activeTab === "founder" && (
          <div className="space-y-5 bg-[#111111] border border-white/5 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Founder Name</label>
                <input
                  type="text"
                  value={content.founder.name}
                  onChange={(e) => updateFounder("name", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Executive Role</label>
                <input
                  type="text"
                  value={content.founder.role}
                  onChange={(e) => updateFounder("role", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Headshot Image URL</label>
              <input
                type="text"
                value={content.founder.image}
                onChange={(e) => updateFounder("image", e.target.value)}
                className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Founder Biography</label>
              <textarea
                rows={3}
                value={content.founder.bio}
                onChange={(e) => updateFounder("bio", e.target.value)}
                className="w-full p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Founder Philosophy / Quote</label>
              <input
                type="text"
                value={content.founder.quote}
                onChange={(e) => updateFounder("quote", e.target.value)}
                className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Central Contact & Office */}
        {activeTab === "contact" && (
          <div className="space-y-5 bg-[#111111] border border-white/5 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Primary Contact Email</label>
                <input
                  type="email"
                  value={content.contactInfo.email}
                  onChange={(e) => updateContact("email", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Official Phone Number</label>
                <input
                  type="text"
                  value={content.contactInfo.phone}
                  onChange={(e) => updateContact("phone", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">City</label>
                <input
                  type="text"
                  value={content.contactInfo.city}
                  onChange={(e) => updateContact("city", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">State</label>
                <input
                  type="text"
                  value={content.contactInfo.state}
                  onChange={(e) => updateContact("state", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Country</label>
                <input
                  type="text"
                  value={content.contactInfo.country}
                  onChange={(e) => updateContact("country", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Business Hours</label>
              <input
                type="text"
                value={content.contactInfo.businessHours}
                onChange={(e) => updateContact("businessHours", e.target.value)}
                className="w-full h-10 px-3.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/40"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Milestones */}
        {activeTab === "milestones" && (
          <div className="space-y-4 bg-[#111111] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-2">Company Milestones & Journey</h3>
            {content.milestones.map((ms, idx) => (
              <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                <div className="grid grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={ms.year}
                    onChange={(e) => {
                      const updated = [...content.milestones];
                      updated[idx].year = e.target.value;
                      setContent({ ...content, milestones: updated });
                    }}
                    placeholder="Year"
                    className="h-8 px-2.5 bg-white/[0.04] border border-white/[0.08] rounded text-xs font-mono text-amber-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={ms.title}
                    onChange={(e) => {
                      const updated = [...content.milestones];
                      updated[idx].title = e.target.value;
                      setContent({ ...content, milestones: updated });
                    }}
                    placeholder="Milestone Title"
                    className="col-span-3 h-8 px-2.5 bg-white/[0.04] border border-white/[0.08] rounded text-xs font-semibold text-white focus:outline-none"
                  />
                </div>
                <textarea
                  rows={2}
                  value={ms.description}
                  onChange={(e) => {
                    const updated = [...content.milestones];
                    updated[idx].description = e.target.value;
                    setContent({ ...content, milestones: updated });
                  }}
                  className="w-full p-2 bg-white/[0.04] border border-white/[0.08] rounded text-xs text-gray-400 focus:outline-none resize-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
