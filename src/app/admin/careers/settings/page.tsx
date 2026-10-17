"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Settings, ArrowLeft, Save, Loader2, Plus, X,
  CheckCircle, AlertCircle, Sparkles, HelpCircle, Layers,
  Power, Eye, EyeOff, ShieldAlert, Check, Calendar, UserCheck
} from "lucide-react";

export default function AdminCareersSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  // Visibility & Metadata
  const [careersPageEnabled, setCareersPageEnabled] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<{ name: string; email: string } | null>(null);
  const [publishedJobsCount, setPublishedJobsCount] = useState<number>(0);

  // Form State
  const [form, setForm] = useState({
    heroEyebrow: "",
    heroTitle: "",
    heroDescription: "",
    primaryCtaText: "",
    secondaryCtaText: "",
    statTotalOpenings: "",
    statWorkPolicy: "",
    statExperienceLevel: "",
    statResponseTime: "",
    whyWorkTitle: "",
    whyWorkSubtitle: "",
    faqs: [] as { question: string; answer: string }[],
    ctaHeading: "",
    ctaDescription: "",
    ctaButtonText: "",
    ctaEmail: "",
    seoTitle: "",
    seoDescription: "",
  });

  const loadSettingsAndJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, jobsRes] = await Promise.all([
        fetch("/api/v1/admin/careers/settings"),
        fetch("/api/v1/admin/careers/jobs"),
      ]);

      if (!settingsRes.ok) throw new Error("Failed to load careers settings.");
      const settingsData = await settingsRes.json();

      if (settingsData.settings) {
        const s = settingsData.settings;
        setCareersPageEnabled(Boolean(s.careersPageEnabled));
        setUpdatedAt(s.updatedAt || null);
        setUpdatedBy(s.updatedBy || null);

        setForm({
          heroEyebrow: s.heroEyebrow || "",
          heroTitle: s.heroTitle || "",
          heroDescription: s.heroDescription || "",
          primaryCtaText: s.primaryCtaText || "",
          secondaryCtaText: s.secondaryCtaText || "",
          statTotalOpenings: s.statTotalOpenings || "0",
          statWorkPolicy: s.statWorkPolicy || "100% Remote-First",
          statExperienceLevel: s.statExperienceLevel || "Freshers & Experienced",
          statResponseTime: s.statResponseTime || "< 48h Response",
          whyWorkTitle: s.whyWorkTitle || "",
          whyWorkSubtitle: s.whyWorkSubtitle || "",
          faqs: Array.isArray(s.faqs) ? s.faqs : [],
          ctaHeading: s.ctaHeading || "",
          ctaDescription: s.ctaDescription || "",
          ctaButtonText: s.ctaButtonText || "",
          ctaEmail: s.ctaEmail || "careers@axivontech.in",
          seoTitle: s.seoTitle || "",
          seoDescription: s.seoDescription || "",
        });
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        const activePublished = (jobsData.jobs || []).filter(
          (j: any) => j.status === "PUBLISHED"
        ).length;
        setPublishedJobsCount(activePublished);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load careers settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettingsAndJobs();
  }, [loadSettingsAndJobs]);

  const handleToggleVisibility = async (newVal: boolean) => {
    if (!newVal && careersPageEnabled) {
      // Prompt confirmation dialog before disabling
      setShowDisableModal(true);
      return;
    }

    await applyVisibilityChange(newVal);
  };

  const applyVisibilityChange = async (newVal: boolean) => {
    setTogglingVisibility(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/careers/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careersPageEnabled: newVal }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update visibility setting.");

      setCareersPageEnabled(newVal);
      if (data.settings?.updatedAt) setUpdatedAt(data.settings.updatedAt);
      if (data.settings?.updatedBy) setUpdatedBy(data.settings.updatedBy);

      setShowDisableModal(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: any) {
      setError(e.message || "Failed to update visibility setting.");
    } finally {
      setTogglingVisibility(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/v1/admin/careers/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          careersPageEnabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings.");

      if (data.settings?.updatedAt) setUpdatedAt(data.settings.updatedAt);
      if (data.settings?.updatedBy) setUpdatedBy(data.settings.updatedBy);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: any) {
      setError(e.message || "An error occurred saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const addFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const updateFaq = (index: number, field: "question" | "answer", val: string) => {
    setForm((prev) => {
      const updated = [...prev.faqs];
      updated[index][field] = val;
      return { ...prev, faqs: updated };
    });
  };

  const removeFaq = (index: number) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] text-[#F3F5F7] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
        <p className="text-xs text-[#7E8997]">Loading careers page content settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F5F7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/careers"
                className="p-1 rounded-lg text-[#7E8997] hover:text-white hover:bg-[#1B222B] transition-colors"
                title="Back to Job Postings"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Settings className="w-4 h-4 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white font-heading">Careers Page Settings</h1>
            </div>
            <p className="text-xs text-[#7E8997]">
              Manage the public visibility switch, content copy, hero highlights, FAQs, and SEO metadata on /careers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {careersPageEnabled && (
              <Link
                href="/careers"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#151A21] hover:bg-[#1B222B] border border-[#29313B] text-[#A7B0BC] hover:text-white transition-all shadow-xs"
              >
                Preview Live Page ↗
              </Link>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-[#04130E] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 font-heading"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback banners */}
        {success && (
          <div className="p-4 mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 shadow-xs">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Careers page settings and visibility updated in the database successfully.
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* ======================================================== */}
          {/* MASTER ON/OFF SWITCH CARD                                */}
          {/* ======================================================== */}
          <div className={`p-6 rounded-2xl border transition-all ${
            careersPageEnabled
              ? "bg-[#151A21] border-emerald-500/30 shadow-[0_0_25px_-5px_rgba(16,185,129,0.12)]"
              : "bg-[#151A21] border-rose-500/20 shadow-xs"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-[#1E2530] pb-5 mb-5">
              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  careersPageEnabled
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/15 border-rose-500/30 text-rose-400"
                }`}>
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base font-bold text-white font-heading">
                      Public Careers Page Visibility
                    </h2>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      careersPageEnabled
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {careersPageEnabled ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ONLINE (PUBLICLY ACCESSIBLE)
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          OFFLINE (HIDDEN)
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-[#A7B0BC] mt-1 leading-relaxed">
                    Authoritative master switch. When turned OFF, the Careers page is hidden from website navigation, direct /careers URL returns a 404 response, and candidate applications are blocked.
                  </p>
                </div>
              </div>

              {/* Action Toggle Button */}
              <div className="shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(!careersPageEnabled)}
                  disabled={togglingVisibility}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0D10] ${
                    careersPageEnabled
                      ? "bg-emerald-500 focus:ring-emerald-500"
                      : "bg-[#29313B] focus:ring-[#566171]"
                  }`}
                  aria-pressed={careersPageEnabled}
                  title={careersPageEnabled ? "Click to disable public Careers page" : "Click to enable public Careers page"}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      careersPageEnabled ? "translate-x-9" : "translate-x-1"
                    } flex items-center justify-center text-[10px] font-bold text-black`}
                  >
                    {togglingVisibility ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-700" />
                    ) : careersPageEnabled ? (
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    ) : (
                      <X className="w-3 h-3 text-gray-500 stroke-[3]" />
                    )}
                  </span>
                </button>
                <span className="text-xs font-semibold text-white min-w-[3rem]">
                  {careersPageEnabled ? "ON" : "OFF"}
                </span>
              </div>
            </div>

            {/* Status Information Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-[#101318] border border-[#1E2530]">
                <div className="text-[11px] text-[#7E8997] mb-1 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Public Route Status</span>
                </div>
                <p className="font-semibold text-white">
                  {careersPageEnabled ? "Accessible (HTTP 200)" : "Not Found (HTTP 404)"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#101318] border border-[#1E2530]">
                <div className="text-[11px] text-[#7E8997] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#e8a064]" />
                  <span>Last Modified</span>
                </div>
                <p className="font-semibold text-white">
                  {updatedAt ? new Date(updatedAt).toLocaleString() : "Initial deployment"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#101318] border border-[#1E2530]">
                <div className="text-[11px] text-[#7E8997] mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Modified By</span>
                </div>
                <p className="font-semibold text-white truncate" title={updatedBy?.email || "Admin"}>
                  {updatedBy?.name || updatedBy?.email || "Platform Admin"}
                </p>
              </div>
            </div>

            {/* Contextual Guidance Notice */}
            <div className="mt-4">
              {careersPageEnabled ? (
                publishedJobsCount === 0 ? (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <p className="font-semibold">Notice: No Published Job Postings</p>
                      <p className="text-amber-200/80 mt-0.5 leading-relaxed">
                        The Careers page is currently ON, but 0 positions have status = &apos;PUBLISHED&apos;. Visitors will see an authentic empty state inviting general/speculative applications. No fake positions will be displayed.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <div>
                      <p className="font-semibold">Active Recruitment Mode</p>
                      <p className="text-emerald-200/80 mt-0.5 leading-relaxed">
                        The Careers page is live with <strong>{publishedJobsCount}</strong> active published job posting(s). Candidates can browse roles and submit applications.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-3.5 rounded-xl bg-[#101318] border border-[#1E2530] text-[#A7B0BC] text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#7E8997]" />
                  <div>
                    <p className="font-semibold text-white">Recruitment Inactive</p>
                    <p className="text-[#7E8997] mt-0.5 leading-relaxed">
                      Careers link is removed from navigation. Visitors attempting to open /careers will receive a 404 response. Job management and past applicant records in this Admin Panel remain 100% functional.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 1: Hero Configuration */}
          <div className="p-6 bg-[#151A21] border border-[#29313B] rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#1E2530] pb-3 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white font-heading">Hero Section Content</h2>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Eyebrow Badge Text
              </label>
              <input
                type="text"
                value={form.heroEyebrow}
                onChange={(e) => setForm({ ...form, heroEyebrow: e.target.value })}
                className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Main Hero Heading
              </label>
              <input
                type="text"
                value={form.heroTitle}
                onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Hero Supporting Description
              </label>
              <textarea
                rows={3}
                value={form.heroDescription}
                onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
                className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                  Primary Button CTA
                </label>
                <input
                  type="text"
                  value={form.primaryCtaText}
                  onChange={(e) => setForm({ ...form, primaryCtaText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                  Secondary Button CTA
                </label>
                <input
                  type="text"
                  value={form.secondaryCtaText}
                  onChange={(e) => setForm({ ...form, secondaryCtaText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Why Work With Us Narrative */}
          <div className="p-6 bg-[#151A21] border border-[#29313B] rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#1E2530] pb-3 mb-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white font-heading">Culture & Why Work With Us Section</h2>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Section Heading
              </label>
              <input
                type="text"
                value={form.whyWorkTitle}
                onChange={(e) => setForm({ ...form, whyWorkTitle: e.target.value })}
                className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Section Subtitle / Narrative
              </label>
              <textarea
                rows={2}
                value={form.whyWorkSubtitle}
                onChange={(e) => setForm({ ...form, whyWorkSubtitle: e.target.value })}
                className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Section 3: Candidate FAQs Manager */}
          <div className="p-6 bg-[#151A21] border border-[#29313B] rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#1E2530] pb-3 mb-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white font-heading">Candidate FAQs ({form.faqs.length})</h2>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1 border border-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            <div className="space-y-3">
              {form.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 bg-[#101318] border border-[#1E2530] rounded-xl relative space-y-3">
                  <button
                    type="button"
                    onClick={() => removeFaq(idx)}
                    className="absolute right-3 top-3 p-1 text-[#7E8997] hover:text-rose-400 rounded-lg hover:bg-[#202833]"
                    title="Remove question"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <label className="block text-[11px] font-medium text-[#A7B0BC] mb-1">
                      Question #{idx + 1}
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaq(idx, "question", e.target.value)}
                      placeholder="e.g. Can college students in their final year apply?"
                      className="w-full px-3 py-2 bg-[#151A21] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#A7B0BC] mb-1">
                      Answer
                    </label>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                      placeholder="Clear, candid answer for prospective candidates..."
                      className="w-full px-3 py-2 bg-[#151A21] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Speculative CTA Banner */}
          <div className="p-6 bg-[#151A21] border border-[#29313B] rounded-2xl space-y-4 shadow-xs">
            <div className="border-b border-[#1E2530] pb-3 mb-2">
              <h2 className="text-sm font-bold text-white font-heading">Speculative Application CTA</h2>
              <p className="text-[11px] text-[#7E8997]">
                Content for candidates who do not see an immediate role match.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Section Heading
              </label>
              <input
                type="text"
                value={form.ctaHeading}
                onChange={(e) => setForm({ ...form, ctaHeading: e.target.value })}
                className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={form.ctaDescription}
                onChange={(e) => setForm({ ...form, ctaDescription: e.target.value })}
                className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                  Button Text
                </label>
                <input
                  type="text"
                  value={form.ctaButtonText}
                  onChange={(e) => setForm({ ...form, ctaButtonText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                  Destination Email
                </label>
                <input
                  type="email"
                  value={form.ctaEmail}
                  onChange={(e) => setForm({ ...form, ctaEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* Section 5: SEO Metadata */}
          <div className="p-6 bg-[#151A21] border border-[#29313B] rounded-2xl space-y-4 shadow-xs">
            <div className="border-b border-[#1E2530] pb-3 mb-2">
              <h2 className="text-sm font-bold text-white font-heading">Careers Page SEO & Metadata</h2>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Meta Title
              </label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-[#04130E] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 font-heading"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Page Content
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL BEFORE DISABLING CAREERS */}
      {showDisableModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#151A21] border border-rose-500/30 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white font-heading mb-2">
              Turn Public Careers Page OFF?
            </h3>

            <p className="text-xs text-[#A7B0BC] leading-relaxed mb-4">
              Turning the Careers page OFF will immediately:
            </p>

            <ul className="text-xs text-[#A7B0BC] space-y-2 mb-6 bg-[#101318] p-3.5 rounded-xl border border-[#1E2530]">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>Hide the <strong>Careers</strong> link from main website navigation and footer.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>Direct visits to <strong>/careers</strong> and job pages will return a <strong>404 Not Found</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>Reject new candidate applications & resume uploads on the backend.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>No data will be deleted:</strong> all jobs, applicant histories, and settings in this Admin Panel will remain preserved.</span>
              </li>
            </ul>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDisableModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1B222B] hover:bg-[#202833] text-xs font-semibold text-[#A7B0BC] hover:text-white border border-[#29313B] transition-colors"
              >
                Keep Careers ON
              </button>
              <button
                type="button"
                onClick={() => applyVisibilityChange(false)}
                disabled={togglingVisibility}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                {togglingVisibility ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                Confirm & Turn OFF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
