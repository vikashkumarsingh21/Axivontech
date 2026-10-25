"use client";

import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  User,
  Building,
  DollarSign,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  Save,
} from "lucide-react";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { BrokerButton } from "@/components/broker/BrokerButton";
import { formatCurrencyINR } from "@/components/broker/BrokerFormatters";

const SERVICE_OPTIONS = [
  "Custom Software Development",
  "Enterprise Web Application",
  "Mobile App (iOS & Android)",
  "Cloud & DevOps Architecture",
  "AI & Machine Learning Solutions",
  "UI/UX Product Design",
  "Cybersecurity & Compliance",
  "Dedicated Developer Team",
];

const TIMELINE_OPTIONS = [
  "2 - 4 Weeks (MVP / Sprint)",
  "1 - 2 Months (Standard Delivery)",
  "3 - 6 Months (Complex Enterprise)",
  "6+ Months (Long-term Milestone)",
];

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeStep, setActiveStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdProject, setCreatedProject] = useState<{
    id: string;
    projectCode: string;
    projectName: string;
  } | null>(null);

  const [form, setForm] = useState({
    // Client Info
    clientName: searchParams.get("clientName") || "",
    clientEmail: searchParams.get("clientEmail") || "",
    clientPhone: searchParams.get("clientPhone") || "",
    clientWhatsapp: "",
    clientDesignation: "",
    // Company Info
    companyName: searchParams.get("companyName") || "",
    industry: "Technology",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    website: "",
    // Project Info
    projectName: "",
    requiredService: searchParams.get("serviceInterest") || SERVICE_OPTIONS[0],
    detailedRequirement: "",
    expectedTimeline: TIMELINE_OPTIONS[1],
    projectBudget: "500000",
    additionalRequirements: "",
  });

  // Load draft if available on mount
  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await fetch("/api/v1/broker/drafts?type=PROJECT");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.content && !searchParams.get("clientName")) {
            setForm((prev) => ({ ...prev, ...json.data.content }));
          }
        }
      } catch (e) {
        // Silent draft load fail
      }
    }
    loadDraft();
  }, [searchParams]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Auto-save draft
  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      await fetch("/api/v1/broker/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PROJECT",
          content: form,
        }),
      });
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch (e) {
      console.error("Draft save error", e);
    } finally {
      setSavingDraft(false);
    }
  };

  // Step 1 Validation
  const handleNextStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.clientName.trim()) errs.clientName = "Client name is required";
    if (!form.clientEmail.trim() || !form.clientEmail.includes("@")) {
      errs.clientEmail = "Valid email is required";
    }
    if (!form.clientPhone.trim()) errs.clientPhone = "Phone number is required";
    if (!form.companyName.trim()) errs.companyName = "Company name is required";

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setActiveStep(2);
  };

  // Step 2 Validation
  const handleNextStep2 = () => {
    const errs: Record<string, string> = {};
    if (!form.projectName.trim()) errs.projectName = "Project name is required";
    if (!form.detailedRequirement.trim() || form.detailedRequirement.length < 10) {
      errs.detailedRequirement = "Please provide detailed requirements (minimum 10 characters)";
    }
    if (!form.projectBudget.trim()) errs.projectBudget = "Budget is required";

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setActiveStep(3);
  };

  // Submit Final Form
  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        projectName: form.projectName.trim(),
        requiredService: form.requiredService,
        detailedRequirement: form.detailedRequirement.trim(),
        expectedTimeline: form.expectedTimeline,
        projectBudget: form.projectBudget.trim(),
        additionalRequirements: form.additionalRequirements.trim() || null,

        clientName: form.clientName.trim(),
        clientEmail: form.clientEmail.trim(),
        clientPhone: form.clientPhone.trim(),
        clientWhatsapp: form.clientWhatsapp.trim() || null,
        clientDesignation: form.clientDesignation.trim() || null,

        companyName: form.companyName.trim() || "Individual Client",
        industry: form.industry.trim() || "Technology",
        city: form.city.trim() || "Unspecified",
        state: form.state.trim() || "Unspecified",
        country: form.country.trim() || "India",
        website: form.website.trim() || undefined,
      };

      const res = await fetch("/api/v1/broker/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(json) || "Failed to submit project.");
      }

      // Clear draft after successful creation
      fetch("/api/v1/broker/drafts?type=PROJECT", { method: "DELETE" }).catch(() => {});

      const created = json.data;
      setCreatedProject({
        id: created.id,
        projectCode: created.projectCode,
        projectName: created.projectName,
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Commission calculations preview (10% gross, 5% TDS, 9.5% net)
  const budgetNum = Number(form.projectBudget.replace(/[^0-9]/g, "")) || 0;
  const grossCommission = Math.round(budgetNum * 0.1);
  const estimatedTds = Math.round(grossCommission * 0.05);
  const netCommission = grossCommission - estimatedTds;

  if (createdProject) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center animate-scaleIn">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-[#C2A878] tracking-wider uppercase">
            {createdProject.projectCode}
          </span>
          <h2 className="text-2xl font-bold text-[#E6E8EB]">Project Referral Recorded!</h2>
          <p className="text-xs text-[#8B94A1] max-w-md mx-auto">
            Your project submission <strong>{createdProject.projectName}</strong> has been assigned to the
            executive tech sales team for feasibility assessment and contracting.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111317] border border-[#22262D] max-w-md mx-auto text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#8B94A1]">Estimated Project Value:</span>
            <span className="font-mono font-semibold text-[#E6E8EB]">{formatCurrencyINR(budgetNum)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8B94A1]">Projected Broker Commission (10%):</span>
            <span className="font-mono font-bold text-[#C2A878]">{formatCurrencyINR(grossCommission)}</span>
          </div>
          <div className="flex justify-between border-t border-[#1E232B] pt-2">
            <span className="text-[#8B94A1]">Estimated Net Payout (Post-TDS):</span>
            <span className="font-mono font-bold text-emerald-400">{formatCurrencyINR(netCommission)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href={`/broker/projects/${createdProject.id}`}>
            <BrokerButton variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
              Open Project Details
            </BrokerButton>
          </Link>

          <BrokerButton
            variant="ghost"
            onClick={() => {
              setCreatedProject(null);
              setActiveStep(1);
              setForm({
                clientName: "",
                clientEmail: "",
                clientPhone: "",
                clientWhatsapp: "",
                clientDesignation: "",
                companyName: "",
                industry: "Technology",
                city: "Bengaluru",
                state: "Karnataka",
                country: "India",
                website: "",
                projectName: "",
                requiredService: SERVICE_OPTIONS[0],
                detailedRequirement: "",
                expectedTimeline: TIMELINE_OPTIONS[1],
                projectBudget: "500000",
                additionalRequirements: "",
              });
            }}
          >
            Submit Another Project
          </BrokerButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <BrokerPageHeader
        title="Submit Commercial Project Referral"
        subtitle="Initiate a scoped technology contract on behalf of your enterprise client."
        backHref="/broker/projects"
        actions={
          <BrokerButton
            variant="ghost"
            size="sm"
            loading={savingDraft}
            onClick={handleSaveDraft}
            icon={draftSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
          >
            {draftSaved ? "Draft Saved" : "Save Draft"}
          </BrokerButton>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-300">
            Dismiss
          </button>
        </div>
      )}

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { num: 1, title: "Client Details", icon: User },
          { num: 2, title: "Technical Scope", icon: Briefcase },
          { num: 3, title: "Commercial Review", icon: DollarSign },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => {
              if (s.num < activeStep) setActiveStep(s.num);
            }}
            disabled={s.num > activeStep}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeStep === s.num
                ? "bg-[#171A1F] border-[#C2A878] text-[#E6E8EB] shadow-sm"
                : activeStep > s.num
                ? "bg-[#111317] border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50 cursor-pointer"
                : "bg-[#0E1013] border-[#22262D] text-[#566171] cursor-not-allowed opacity-60"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeStep === s.num
                    ? "bg-[#C2A878] text-[#0A0B0D]"
                    : activeStep > s.num
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-[#22262D] text-[#8B94A1]"
                }`}
              >
                {activeStep > s.num ? "✓" : s.num}
              </div>
              <span className="text-xs font-semibold truncate">{s.title}</span>
            </div>
          </button>
        ))}
      </div>

      {/* STEP 1: Client & Company Information */}
      {activeStep === 1 && (
        <BrokerCard
          title="Step 1: Client & Business Information"
          subtitle="Provide primary decision maker contact and registered enterprise details."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                  Client Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => handleChange("clientName", e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
                {fieldErrors.clientName && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                  Client Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => handleChange("clientEmail", e.target.value)}
                  placeholder="vikram@enterprise.com"
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
                {fieldErrors.clientEmail && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.clientEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                  Mobile Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.clientPhone}
                  onChange={(e) => handleChange("clientPhone", e.target.value)}
                  placeholder="+91 9888877777"
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
                {fieldErrors.clientPhone && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.clientPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={form.clientWhatsapp}
                  onChange={(e) => handleChange("clientWhatsapp", e.target.value)}
                  placeholder="+91 9888877777"
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                  Company Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="e.g. Apex Logistics Technologies Pvt Ltd"
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
                {fieldErrors.companyName && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">Industry</label>
                <input
                  type="text"
                  value={form.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  placeholder="e.g. FinTech, Healthcare, Logistics"
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Bengaluru"
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">Website</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://apexlogistics.com"
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E232B] flex items-center justify-end">
              <BrokerButton
                type="button"
                variant="primary"
                onClick={handleNextStep1}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Proceed to Scope & Tech
              </BrokerButton>
            </div>
          </div>
        </BrokerCard>
      )}

      {/* STEP 2: Technical Scope & Requirements */}
      {activeStep === 2 && (
        <BrokerCard
          title="Step 2: Technical Requirements & Delivery"
          subtitle="Define what Axivon will engineer and deliver for this client engagement."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                Project Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={form.projectName}
                onChange={(e) => handleChange("projectName", e.target.value)}
                placeholder="e.g. Automated Warehouse Management & Dispatch System"
                className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
              />
              {fieldErrors.projectName && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.projectName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                  Required Service Domain <span className="text-rose-400">*</span>
                </label>
                <select
                  value={form.requiredService}
                  onChange={(e) => handleChange("requiredService", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                >
                  {SERVICE_OPTIONS.map((svc) => (
                    <option key={svc} value={svc}>
                      {svc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                  Target Delivery Timeline <span className="text-rose-400">*</span>
                </label>
                <select
                  value={form.expectedTimeline}
                  onChange={(e) => handleChange("expectedTimeline", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                >
                  {TIMELINE_OPTIONS.map((tl) => (
                    <option key={tl} value={tl}>
                      {tl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                Detailed Technical Requirement Statement <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={5}
                value={form.detailedRequirement}
                onChange={(e) => handleChange("detailedRequirement", e.target.value)}
                placeholder="Outline the core deliverables, modules, integrations (e.g. ERP, payment gateways, IoT), and key functional outcomes..."
                className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] leading-relaxed"
              />
              {fieldErrors.detailedRequirement && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.detailedRequirement}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                Target Project Budget (INR) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={form.projectBudget}
                onChange={(e) => handleChange("projectBudget", e.target.value)}
                placeholder="e.g. 500000"
                className="w-full max-w-sm px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] font-mono"
              />
              {fieldErrors.projectBudget && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.projectBudget}</p>
              )}
            </div>

            <div className="pt-4 border-t border-[#1E232B] flex items-center justify-between">
              <BrokerButton type="button" variant="ghost" onClick={() => setActiveStep(1)}>
                Back to Client Info
              </BrokerButton>

              <BrokerButton
                type="button"
                variant="primary"
                onClick={handleNextStep2}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Review Commercials
              </BrokerButton>
            </div>
          </div>
        </BrokerCard>
      )}

      {/* STEP 3: Commercial Review & Submission */}
      {activeStep === 3 && (
        <BrokerCard
          title="Step 3: Commercial Scope & Attribution Review"
          subtitle="Confirm proposal terms and estimated broker revenue before dispatch to executive review."
        >
          <div className="space-y-6">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#0E1013] border border-[#22262D] space-y-2">
                <span className="font-semibold text-[#C2A878] uppercase tracking-wider block text-[11px]">
                  Client Engagement
                </span>
                <div className="flex justify-between">
                  <span className="text-[#8B94A1]">Client:</span>
                  <span className="font-medium text-[#E6E8EB]">{form.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B94A1]">Email:</span>
                  <span className="text-[#E6E8EB] font-mono">{form.clientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B94A1]">Company:</span>
                  <span className="text-[#E6E8EB]">{form.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B94A1]">Location:</span>
                  <span className="text-[#E6E8EB]">{form.city}, {form.country}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1013] border border-[#22262D] space-y-2">
                <span className="font-semibold text-[#C2A878] uppercase tracking-wider block text-[11px]">
                  Project Deliverable
                </span>
                <div className="flex justify-between">
                  <span className="text-[#8B94A1]">Title:</span>
                  <span className="font-medium text-[#E6E8EB] truncate max-w-[180px]">{form.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B94A1]">Service Domain:</span>
                  <span className="text-[#E6E8EB]">{form.requiredService}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B94A1]">Target Timeline:</span>
                  <span className="text-[#E6E8EB]">{form.expectedTimeline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B94A1]">Estimated Budget:</span>
                  <span className="font-mono text-emerald-400 font-bold">{formatCurrencyINR(budgetNum)}</span>
                </div>
              </div>
            </div>

            {/* Broker Commercial Yield Box */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#C2A878]/15 via-[#171A1F] to-[#111317] border border-[#C2A878]/30 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C2A878]" />
                <h4 className="text-xs font-bold text-[#E6E8EB] uppercase tracking-wider">
                  Partner Yield Projection (10% Tier)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0E1013] border border-[#22262D]">
                  <span className="text-[11px] text-[#8B94A1] block">Gross Commission</span>
                  <span className="text-base font-bold font-mono text-[#C2A878] mt-1 block">
                    {formatCurrencyINR(grossCommission)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0E1013] border border-[#22262D]">
                  <span className="text-[11px] text-[#8B94A1] block">Section 194H TDS (5%)</span>
                  <span className="text-base font-bold font-mono text-amber-400 mt-1 block">
                    - {formatCurrencyINR(estimatedTds)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0E1013] border border-[#22262D]">
                  <span className="text-[11px] text-[#8B94A1] block">Net Broker Disbursement</span>
                  <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                    {formatCurrencyINR(netCommission)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#8B94A1] leading-relaxed">
                Broker fees are credited pro-rata as milestones clear. Disbursed within 48 hours of
                receipt directly to your verified payout account.
              </p>
            </div>

            <div className="pt-4 border-t border-[#1E232B] flex items-center justify-between">
              <BrokerButton type="button" variant="ghost" onClick={() => setActiveStep(2)}>
                Back to Scope
              </BrokerButton>

              <BrokerButton
                type="button"
                variant="primary"
                loading={submitting}
                onClick={handleSubmit}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Submit Project to Executive Review
              </BrokerButton>
            </div>
          </div>
        </BrokerCard>
      )}
    </div>
  );
}

export default function NewBrokerProjectPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-[#8B94A1]">Loading project initiation wizard...</div>}>
      <NewProjectForm />
    </Suspense>
  );
}
