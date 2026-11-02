"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Building,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  MapPin,
  Briefcase,
  FileText,
  DollarSign,
  Clock,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Save,
  Check,
  Sparkles,
  HelpCircle,
  FileCheck2,
} from "lucide-react";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { BrokerButton } from "@/components/broker/BrokerButton";
import { formatCurrencyINR } from "@/components/broker/BrokerFormatters";
import { toast } from "@/lib/notifications/toast";
import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

export const AXIVON_SERVICES = [
  "Website Development",
  "Web Application Development",
  "Mobile App Development",
  "AI and Machine Learning Solutions",
  "Custom Software Development",
  "Cloud Solutions",
  "UI/UX Design",
  "SEO and Digital Marketing",
  "Chatbot Development",
  "Business Automation",
  "Other Services",
] as const;

export const INDUSTRY_OPTIONS = [
  "Technology & Software",
  "E-Commerce & Retail",
  "Healthcare & Life Sciences",
  "Financial Services & FinTech",
  "Education & EdTech",
  "Manufacturing & Industrial",
  "Logistics & Supply Chain",
  "Real Estate & Property Tech",
  "Hospitality & Travel",
  "Media & Entertainment",
  "Professional Consulting",
  "Government & Non-Profit",
  "Other Industry",
];

export const TIMELINE_OPTIONS = [
  "Under 1 Month (Fast-track Sprint)",
  "1 - 3 Months (Standard Delivery)",
  "3 - 6 Months (Enterprise Implementation)",
  "6+ Months (Multi-phase Milestone)",
  "Flexible / Undetermined",
];

export const CONTACT_METHOD_OPTIONS = [
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone Call" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "VIDEO_CALL", label: "Video Conference (Google Meet / Zoom)" },
  { value: "ANY", label: "Any Convenient Channel" },
];

export interface UploadedDoc {
  name: string;
  url: string;
  size?: number | null;
  type?: string | null;
}

export function UnifiedLeadRegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Opportunity Stage
  const [opportunityStage, setOpportunityStage] = useState<"EARLY_STAGE" | "CONFIRMED">(
    searchParams.get("stage") === "CONFIRMED" ? "CONFIRMED" : "EARLY_STAGE"
  );

  // Form State
  const [form, setForm] = useState({
    // Section A: Client Information
    name: searchParams.get("clientName") || searchParams.get("name") || "",
    contactPerson: searchParams.get("contactPerson") || "",
    email: searchParams.get("clientEmail") || searchParams.get("email") || "",
    phone: searchParams.get("clientPhone") || searchParams.get("phone") || "",
    whatsapp: "",
    companyName: searchParams.get("companyName") || "",
    designation: searchParams.get("designation") || "",
    industry: searchParams.get("industry") || "Technology & Software",
    city: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    address: "",
    website: searchParams.get("website") || "",
    companySize: "",

    // Section B: Service Requirements
    serviceInterest: searchParams.get("serviceInterest") || searchParams.get("service") || AXIVON_SERVICES[0],
    otherServiceDetails: "",

    // Section C: Project Information
    leadTitle: searchParams.get("projectName") || searchParams.get("leadTitle") || "",
    projectDescription: "",
    clientRequirements: "",
    message: "",
    budget: searchParams.get("budget") || "",
    timeline: TIMELINE_OPTIONS[1],
    preferredContactMethod: "EMAIL",
    additionalNotes: "",
  });

  // Supporting Documents
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI States
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "review">("form");
  const [submittedLead, setSubmittedLead] = useState<{
    id: string;
    leadCode: string;
    name: string;
    serviceInterest: string;
    warning?: string;
  } | null>(null);

  // Load existing draft if present
  useEffect(() => {
    async function checkDraft() {
      try {
        const res = await fetch("/api/v1/broker/drafts?type=LEAD");
        if (res.ok) {
          const json = await res.json();
          const draftList = json.data?.drafts || [];
          if (draftList.length > 0 && !searchParams.get("name") && !searchParams.get("clientName")) {
            const latest = draftList[0];
            if (latest?.data) {
              setForm((prev) => ({ ...prev, ...latest.data }));
              if (latest.data.opportunityStage) {
                setOpportunityStage(latest.data.opportunityStage);
              }
              if (Array.isArray(latest.data.documents)) {
                setDocuments(latest.data.documents);
              }
              toast.info("Restored your previous lead draft.");
            }
          }
        }
      } catch {
        // Silently continue if draft service is not reachable
      }
    }
    checkDraft();
  }, [searchParams]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Document upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingDoc(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 10MB file limit.`);
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/v1/broker/leads/upload", {
          method: "POST",
          body: formData,
        });

        const parsed = await parseApiResponse(res);
        if (!parsed.ok) {
          throw new Error(parsed.errorMessage || `Failed to upload "${file.name}"`);
        }

        const uploadedFile = parsed.data?.file || (parsed.raw as any)?.data?.file;
        if (uploadedFile) {
          setDocuments((prev) => [
            ...prev,
            {
              name: uploadedFile.name,
              url: uploadedFile.url,
              size: uploadedFile.size,
              type: uploadedFile.type,
            },
          ]);
        }
      }
      toast.success("Document attached successfully.");
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveDoc = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Draft save handler
  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      const res = await fetch("/api/v1/broker/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftType: "LEAD",
          title: form.leadTitle || form.name || "Untitled Lead",
          data: {
            ...form,
            opportunityStage,
            documents,
          },
        }),
      });

      if (res.ok) {
        setDraftSaved(true);
        toast.success("Lead draft saved securely.");
        setTimeout(() => setDraftSaved(false), 3000);
      } else {
        toast.error("Could not save draft.");
      }
    } catch {
      toast.error("Network error saving draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  // Client Validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = "Client or business name is required.";
    }

    if (!form.email.trim()) {
      errors.email = "Client email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!form.phone.trim()) {
      errors.phone = "Client phone number is required.";
    } else if (form.phone.trim().length < 7) {
      errors.phone = "Please enter a valid phone number.";
    }

    if (!form.leadTitle.trim()) {
      errors.leadTitle = "Lead title or project name is required.";
    }

    if (form.serviceInterest === "Other Services" && !form.otherServiceDetails.trim()) {
      errors.otherServiceDetails = "Please specify the custom service or technical scope.";
    }

    if (opportunityStage === "CONFIRMED") {
      if (!form.clientRequirements.trim() && !form.projectDescription.trim() && !form.message.trim()) {
        errors.clientRequirements = "For confirmed opportunities, please provide project requirements or client brief.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Final Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (submitting) return;

    if (!validate()) {
      setActiveTab("form");
      toast.error("Please fill in all required fields marked in red.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || undefined,
        companyName: form.companyName.trim() || form.name.trim(),
        designation: form.designation.trim() || undefined,
        industry: form.industry.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        address: form.address.trim() || undefined,
        website: form.website.trim() || undefined,
        companySize: form.companySize.trim() || undefined,

        serviceInterest: form.serviceInterest,
        otherServiceDetails: form.otherServiceDetails.trim() || undefined,

        leadTitle: form.leadTitle.trim(),
        projectDescription: form.projectDescription.trim() || undefined,
        clientRequirements: form.clientRequirements.trim() || undefined,
        message: form.message.trim() || undefined,
        budget: form.budget ? form.budget.replace(/[^0-9]/g, "") : null,
        timeline: form.timeline,
        preferredContactMethod: form.preferredContactMethod,
        opportunityStage,
        additionalNotes: form.additionalNotes.trim() || undefined,

        documents,
      };

      const res = await fetch("/api/v1/broker/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const parsed = await parseApiResponse(res);
      if (!parsed.ok) {
        throw new Error(parsed.errorMessage || "Failed to submit lead registration.");
      }

      const result = parsed.data || (parsed.raw as any);

      // Clean up saved draft upon successful registration
      fetch("/api/v1/broker/drafts?type=LEAD", { method: "DELETE" }).catch(() => {});

      setSubmittedLead({
        id: result.leadId || "",
        leadCode: result.leadCode || "LD-PROCESSED",
        name: form.name,
        serviceInterest: form.serviceInterest,
        warning: result.warning,
      });

      toast.success(`Lead ${result.leadCode || ""} registered successfully!`);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form to register another lead
  const handleReset = () => {
    setSubmittedLead(null);
    setActiveTab("form");
    setOpportunityStage("EARLY_STAGE");
    setDocuments([]);
    setFieldErrors({});
    setForm({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      whatsapp: "",
      companyName: "",
      designation: "",
      industry: "Technology & Software",
      city: "",
      state: "",
      address: "",
      website: "",
      companySize: "",
      serviceInterest: AXIVON_SERVICES[0],
      otherServiceDetails: "",
      leadTitle: "",
      projectDescription: "",
      clientRequirements: "",
      message: "",
      budget: "",
      timeline: TIMELINE_OPTIONS[1],
      preferredContactMethod: "EMAIL",
      additionalNotes: "",
    });
  };

  // Success view
  if (submittedLead) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center animate-scaleIn">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-[#C2A878] tracking-wider uppercase px-3 py-1 rounded-full bg-[#C2A878]/10 border border-[#C2A878]/25 inline-block">
            {submittedLead.leadCode}
          </span>
          <h2 className="text-2xl font-bold text-[#E6E8EB]">Lead Registered Successfully!</h2>
          <p className="text-sm text-[#8B94A1] max-w-lg mx-auto leading-relaxed">
            Opportunity <strong>{form.leadTitle || submittedLead.name}</strong> has been registered and attributed
            strictly to your partner account. Our business and technical team will review the details and advance
            its qualification status.
          </p>
        </div>

        {submittedLead.warning && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 max-w-md mx-auto text-left text-xs text-amber-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>{submittedLead.warning}</span>
          </div>
        )}

        <div className="p-5 rounded-xl bg-[#111317] border border-[#22262D] max-w-md mx-auto text-left space-y-2.5 text-xs">
          <div className="flex justify-between pb-2 border-b border-[#1E232B]">
            <span className="text-[#8B94A1]">Client / Organization:</span>
            <span className="font-medium text-[#E6E8EB]">{submittedLead.name}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-[#1E232B]">
            <span className="text-[#8B94A1]">Service Requested:</span>
            <span className="text-[#C2A878] font-medium">{submittedLead.serviceInterest}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-[#1E232B]">
            <span className="text-[#8B94A1]">Opportunity Status:</span>
            <span className="text-emerald-400 font-mono font-semibold">
              {opportunityStage === "CONFIRMED" ? "Qualified / In Review" : "New Prospect Intake"}
            </span>
          </div>
          {documents.length > 0 && (
            <div className="flex justify-between">
              <span className="text-[#8B94A1]">Attached Documents:</span>
              <span className="text-[#E6E8EB] font-mono">{documents.length} file(s) attached</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/broker/leads">
            <BrokerButton variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
              View in My Leads
            </BrokerButton>
          </Link>
          <BrokerButton variant="secondary" onClick={handleReset} icon={<Sparkles className="w-4 h-4" />}>
            + Register Another Lead
          </BrokerButton>
        </div>
      </div>
    );
  }

  const budgetNum = Number(form.budget.replace(/[^0-9]/g, "")) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#171A1F] to-[#111317] border border-[#22262D] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold text-[#C2A878] bg-[#C2A878]/10 border border-[#C2A878]/25">
                Unified Partner Registration
              </span>
              <span className="text-xs text-[#8B94A1]">• 100% Broker Data Isolated</span>
            </div>
            <h1 className="text-2xl font-bold text-[#E6E8EB] mt-1.5">Register a New Lead</h1>
            <p className="text-xs text-[#8B94A1] max-w-2xl mt-1 leading-relaxed">
              Submit a new business opportunity to Axivon Technologies. Provide the available client information,
              required services, and project details. Our team will review the submission and update its status as the
              opportunity progresses.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <BrokerButton
              variant="secondary"
              size="sm"
              loading={savingDraft}
              onClick={handleSaveDraft}
              icon={draftSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            >
              {draftSaved ? "Draft Saved" : "Save Draft"}
            </BrokerButton>
            <Link href="/broker/leads">
              <BrokerButton variant="ghost" size="sm">
                Cancel
              </BrokerButton>
            </Link>
          </div>
        </div>

        {/* Opportunity Stage Selector Card */}
        <div className="pt-4 border-t border-[#1E232B]">
          <label className="block text-xs font-semibold text-[#8B94A1] uppercase tracking-wider mb-2">
            Opportunity Stage / Readiness
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOpportunityStage("EARLY_STAGE")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                opportunityStage === "EARLY_STAGE"
                  ? "bg-[#C2A878]/10 border-[#C2A878] ring-1 ring-[#C2A878]"
                  : "bg-[#0E1013] border-[#22262D] hover:border-[#2C313A]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E6E8EB]">Early-Stage Opportunity</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    opportunityStage === "EARLY_STAGE"
                      ? "border-[#C2A878] bg-[#C2A878]"
                      : "border-[#566171]"
                  }`}
                >
                  {opportunityStage === "EARLY_STAGE" && <span className="w-1.5 h-1.5 rounded-full bg-[#0A0B0D]" />}
                </span>
              </div>
              <p className="text-[11px] text-[#8B94A1] mt-1 leading-relaxed">
                Prospect identified; requirements, budget, or scope are in preliminary discussions. Register now to lock
                partner attribution.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setOpportunityStage("CONFIRMED")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                opportunityStage === "CONFIRMED"
                  ? "bg-[#C2A878]/10 border-[#C2A878] ring-1 ring-[#C2A878]"
                  : "bg-[#0E1013] border-[#22262D] hover:border-[#2C313A]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E6E8EB]">Confirmed Opportunity</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    opportunityStage === "CONFIRMED"
                      ? "border-[#C2A878] bg-[#C2A878]"
                      : "border-[#566171]"
                  }`}
                >
                  {opportunityStage === "CONFIRMED" && <span className="w-1.5 h-1.5 rounded-full bg-[#0A0B0D]" />}
                </span>
              </div>
              <p className="text-[11px] text-[#8B94A1] mt-1 leading-relaxed">
                Client has confirmed interest and provided requirements. Ready for technical review, scoping, or formal
                proposal.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Switcher (Form View vs Summary Review) */}
      <div className="flex items-center justify-between border-b border-[#22262D] pb-1">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "form"
                ? "border-[#C2A878] text-[#C2A878]"
                : "border-transparent text-[#8B94A1] hover:text-[#E6E8EB]"
            }`}
          >
            1. Lead Information & Requirements
          </button>
          <button
            type="button"
            onClick={() => {
              if (validate()) setActiveTab("review");
            }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "review"
                ? "border-[#C2A878] text-[#C2A878]"
                : "border-transparent text-[#8B94A1] hover:text-[#E6E8EB]"
            }`}
          >
            2. Review & Final Submission
          </button>
        </div>
      </div>

      {activeTab === "form" ? (
        <form onSubmit={(e) => { e.preventDefault(); if (validate()) setActiveTab("review"); }} className="space-y-6">
          {/* SECTION A: CLIENT INFORMATION */}
          <BrokerCard
            title={
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#C2A878]" />
                <span>Section A: Client Information</span>
              </div>
            }
            subtitle="Details of the prospective client or company representing this business opportunity."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client or Business Name */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">
                  Client or Business Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Apex Health Systems Pvt Ltd"
                  className={`w-full px-3 py-2 rounded-lg bg-[#0E1013] border text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] ${
                    fieldErrors.name ? "border-red-500" : "border-[#22262D]"
                  }`}
                />
                {fieldErrors.name && <p className="text-[11px] text-red-400">{fieldErrors.name}</p>}
              </div>

              {/* Client Contact Person */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">
                  Client Contact Person <span className="text-[#8B94A1] text-[10px]">(Optional if same as above)</span>
                </label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) => handleChange("contactPerson", e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              {/* Client Email */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">
                  Client Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="e.g. contact@apexhealth.in"
                  className={`w-full px-3 py-2 rounded-lg bg-[#0E1013] border text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] ${
                    fieldErrors.email ? "border-red-500" : "border-[#22262D]"
                  }`}
                />
                {fieldErrors.email && <p className="text-[11px] text-red-400">{fieldErrors.email}</p>}
              </div>

              {/* Client Phone */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">
                  Client Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full px-3 py-2 rounded-lg bg-[#0E1013] border text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] ${
                    fieldErrors.phone ? "border-red-500" : "border-[#22262D]"
                  }`}
                />
                {fieldErrors.phone && <p className="text-[11px] text-red-400">{fieldErrors.phone}</p>}
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">
                  WhatsApp Number <span className="text-[#8B94A1] text-[10px]">(Optional)</span>
                </label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              {/* Business Name (if different) */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">
                  Business or Organization Name <span className="text-[#8B94A1] text-[10px]">(If different)</span>
                </label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="e.g. Apex Group Holdings"
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              {/* Industry */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">Business Type or Industry</label>
                <select
                  value={form.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                >
                  {INDUSTRY_OPTIONS.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">
                  Client Designation <span className="text-[#8B94A1] text-[10px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => handleChange("designation", e.target.value)}
                  placeholder="e.g. Chief Medical Officer / Director"
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="e.g. Karnataka"
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              {/* Additional Location Details */}
              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-medium text-[#E6E8EB]">
                  Additional Location Details / Address <span className="text-[#8B94A1] text-[10px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="e.g. Koramangala 4th Block, 100ft Road"
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>
            </div>
          </BrokerCard>

          {/* SECTION B: SERVICE REQUIREMENTS */}
          <BrokerCard
            title={
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#C2A878]" />
                <span>Section B: Service Requirements</span>
              </div>
            }
            subtitle="Select the technology domain or service needed by the client."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {AXIVON_SERVICES.map((srv) => {
                  const isSelected = form.serviceInterest === srv;
                  return (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => handleChange("serviceInterest", srv)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                        isSelected
                          ? "bg-[#C2A878]/15 border-[#C2A878] text-[#C2A878] font-semibold"
                          : "bg-[#0E1013] border-[#22262D] text-[#8B94A1] hover:text-[#E6E8EB] hover:border-[#2C313A]"
                      }`}
                    >
                      <span className="truncate">{srv}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#C2A878]" />}
                    </button>
                  );
                })}
              </div>

              {/* Other Services Detail Field */}
              {form.serviceInterest === "Other Services" && (
                <div className="p-3.5 rounded-xl bg-[#0E1013] border border-[#C2A878]/40 space-y-1.5 animate-fadeIn">
                  <label className="block text-xs font-semibold text-[#E6E8EB]">
                    Please Explain the Required Service / Scope <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.otherServiceDetails}
                    onChange={(e) => handleChange("otherServiceDetails", e.target.value)}
                    placeholder="Specify the bespoke technical service, integration, or custom software required..."
                    className={`w-full px-3 py-2 rounded-lg bg-[#171A1F] border text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] ${
                      fieldErrors.otherServiceDetails ? "border-red-500" : "border-[#22262D]"
                    }`}
                  />
                  {fieldErrors.otherServiceDetails && (
                    <p className="text-[11px] text-red-400">{fieldErrors.otherServiceDetails}</p>
                  )}
                </div>
              )}
            </div>
          </BrokerCard>

          {/* SECTION C: PROJECT INFORMATION */}
          <BrokerCard
            title={
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C2A878]" />
                <span>Section C: Project Information</span>
              </div>
            }
            subtitle="Provide details on project scope, timelines, and commercial parameters if known."
          >
            <div className="space-y-4">
              {/* Lead Title or Project Name */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">
                  Lead Title or Project Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.leadTitle}
                  onChange={(e) => handleChange("leadTitle", e.target.value)}
                  placeholder="e.g. Cloud ERP Migration & Telehealth Mobile App"
                  className={`w-full px-3 py-2 rounded-lg bg-[#0E1013] border text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] ${
                    fieldErrors.leadTitle ? "border-red-500" : "border-[#22262D]"
                  }`}
                />
                {fieldErrors.leadTitle && <p className="text-[11px] text-red-400">{fieldErrors.leadTitle}</p>}
              </div>

              {/* Project Description */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">
                  Project Description / Objective
                </label>
                <textarea
                  rows={3}
                  value={form.projectDescription}
                  onChange={(e) => handleChange("projectDescription", e.target.value)}
                  placeholder="High-level overview of what the client is trying to achieve, problem statement, or business goal..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              {/* Client Requirements / Scope */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">
                  Client Requirements & Features
                  {opportunityStage === "CONFIRMED" && <span className="text-red-400"> *</span>}
                </label>
                <textarea
                  rows={4}
                  value={form.clientRequirements}
                  onChange={(e) => handleChange("clientRequirements", e.target.value)}
                  placeholder="List key requirements, desired modules, user roles, integrations, or client specifications..."
                  className={`w-full px-3 py-2 rounded-lg bg-[#0E1013] border text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] ${
                    fieldErrors.clientRequirements ? "border-red-500" : "border-[#22262D]"
                  }`}
                />
                {fieldErrors.clientRequirements && (
                  <p className="text-[11px] text-red-400">{fieldErrors.clientRequirements}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Estimated Budget */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#E6E8EB]">
                    Estimated Budget <span className="text-[#8B94A1] text-[10px]">(Optional, if known)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8B94A1]">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={form.budget}
                      onChange={(e) => handleChange("budget", e.target.value)}
                      placeholder="e.g. 5,00,000"
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] font-mono text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                  </div>
                  {budgetNum > 0 && (
                    <p className="text-[10px] text-[#C2A878] font-mono">
                      Formatted: {formatCurrencyINR(budgetNum)}
                    </p>
                  )}
                </div>

                {/* Expected Timeline */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#E6E8EB]">Expected Timeline</label>
                  <select
                    value={form.timeline}
                    onChange={(e) => handleChange("timeline", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                  >
                    {TIMELINE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Contact Method */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#E6E8EB]">Preferred Contact Method</label>
                  <select
                    value={form.preferredContactMethod}
                    onChange={(e) => handleChange("preferredContactMethod", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                  >
                    {CONTACT_METHOD_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#E6E8EB]">
                  Additional Notes / Broker Insights <span className="text-[#8B94A1] text-[10px]">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.additionalNotes}
                  onChange={(e) => handleChange("additionalNotes", e.target.value)}
                  placeholder="Any helpful background: decision timeframe, competition, past technical pain points..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                />
              </div>
            </div>
          </BrokerCard>

          {/* SECTION D: SUPPORTING DOCUMENTS */}
          <BrokerCard
            title={
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#C2A878]" />
                <span>Section D: Supporting Documents</span>
              </div>
            }
            subtitle="Upload project requirement briefs, RFP documents, client specifications, or reference mockups (Max 10MB per file)."
          >
            <div className="space-y-4">
              {/* Upload Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-xl border-2 border-dashed border-[#22262D] hover:border-[#C2A878]/50 bg-[#0E1013] text-center cursor-pointer transition-colors group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg,.webp,.zip"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-[#171A1F] border border-[#22262D] text-[#C2A878] mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="mt-2 text-xs font-semibold text-[#E6E8EB]">
                  {uploadingDoc ? "Uploading Document..." : "Click or Drag Documents Here to Attach"}
                </div>
                <p className="text-[11px] text-[#8B94A1] mt-0.5">
                  Supported formats: PDF, Word (DOC/DOCX), TXT, RTF, Images (PNG/JPG), ZIP up to 10MB
                </p>
              </div>

              {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}

              {/* Uploaded Documents List */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#8B94A1] block">
                    Attached Files ({documents.length}):
                  </span>
                  <div className="divide-y divide-[#1E232B] rounded-xl border border-[#22262D] bg-[#0E1013] overflow-hidden">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 truncate">
                          <FileCheck2 className="w-4 h-4 text-[#C2A878] shrink-0" />
                          <span className="text-[#E6E8EB] font-medium truncate">{doc.name}</span>
                          {doc.size && (
                            <span className="text-[10px] text-[#8B94A1] font-mono shrink-0">
                              ({(doc.size / 1024).toFixed(1)} KB)
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(idx)}
                          className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </BrokerCard>

          {/* Form Actions Footer */}
          <div className="p-4 rounded-xl border border-[#22262D] bg-[#111317] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#8B94A1]">
              <Sparkles className="w-4 h-4 text-[#C2A878]" />
              <span>Review your submission before sending to sales engineering.</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <BrokerButton
                type="button"
                variant="secondary"
                size="md"
                onClick={handleSaveDraft}
                loading={savingDraft}
                icon={draftSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                className="flex-1 sm:flex-none"
              >
                {draftSaved ? "Draft Saved" : "Save Draft"}
              </BrokerButton>

              <BrokerButton
                type="submit"
                variant="primary"
                size="md"
                iconRight={<ArrowRight className="w-4 h-4" />}
                className="flex-1 sm:flex-none"
              >
                Continue to Review
              </BrokerButton>
            </div>
          </div>
        </form>
      ) : (
        /* SECTION E: REVIEW AND SUBMIT */
        <div className="space-y-6 animate-fadeIn">
          <BrokerCard
            title={
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C2A878]" />
                <span>Section E: Review & Finalize Lead Registration</span>
              </div>
            }
            subtitle="Please review the opportunity summary below before submitting."
            action={
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className="text-xs text-[#C2A878] hover:underline inline-flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Edit Details
              </button>
            }
          >
            <div className="space-y-6 text-xs">
              {/* Stage Badge Banner */}
              <div className="p-3.5 rounded-xl bg-[#0E1013] border border-[#22262D] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8B94A1] block">Selected Opportunity Type</span>
                  <span className="text-sm font-bold text-[#C2A878]">
                    {opportunityStage === "CONFIRMED" ? "Confirmed Opportunity" : "Early-Stage Opportunity"}
                  </span>
                </div>
                <span className="text-[11px] text-[#8B94A1]">
                  {opportunityStage === "CONFIRMED"
                    ? "Detailed requirements confirmed by client"
                    : "Initial client exploratory registration"}
                </span>
              </div>

              {/* Grid Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Info Summary */}
                <div className="p-4 rounded-xl bg-[#171A1F] border border-[#22262D] space-y-2">
                  <h4 className="text-xs font-semibold text-[#8B94A1] uppercase tracking-wider pb-1 border-b border-[#22262D]">
                    Client Details
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Client Name:</span>
                    <span className="font-semibold text-[#E6E8EB]">{form.name}</span>
                  </div>
                  {form.contactPerson && (
                    <div className="flex justify-between">
                      <span className="text-[#8B94A1]">Contact Person:</span>
                      <span className="text-[#E6E8EB]">{form.contactPerson}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Email:</span>
                    <span className="text-[#E6E8EB]">{form.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Phone:</span>
                    <span className="text-[#E6E8EB]">{form.phone}</span>
                  </div>
                  {form.companyName && (
                    <div className="flex justify-between">
                      <span className="text-[#8B94A1]">Organization:</span>
                      <span className="text-[#E6E8EB]">{form.companyName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Location:</span>
                    <span className="text-[#E6E8EB]">
                      {[form.city, form.state].filter(Boolean).join(", ") || "Unspecified"}
                    </span>
                  </div>
                </div>

                {/* Project Info Summary */}
                <div className="p-4 rounded-xl bg-[#171A1F] border border-[#22262D] space-y-2">
                  <h4 className="text-xs font-semibold text-[#8B94A1] uppercase tracking-wider pb-1 border-b border-[#22262D]">
                    Project & Service
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Project Title:</span>
                    <span className="font-semibold text-[#E6E8EB]">{form.leadTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Service Domain:</span>
                    <span className="text-[#C2A878] font-medium">{form.serviceInterest}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Estimated Budget:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {budgetNum > 0 ? formatCurrencyINR(budgetNum) : "Flexible / To be scoped"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Timeline:</span>
                    <span className="text-[#E6E8EB]">{form.timeline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Preferred Channel:</span>
                    <span className="text-[#E6E8EB]">{form.preferredContactMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Attached Documents:</span>
                    <span className="font-mono text-[#E6E8EB]">{documents.length} file(s)</span>
                  </div>
                </div>
              </div>

              {/* Requirements Narrative */}
              {(form.projectDescription || form.clientRequirements) && (
                <div className="p-4 rounded-xl bg-[#171A1F] border border-[#22262D] space-y-2">
                  <h4 className="text-xs font-semibold text-[#8B94A1] uppercase tracking-wider">
                    Requirements Summary
                  </h4>
                  {form.projectDescription && (
                    <div className="text-xs text-[#D0D4DC] leading-relaxed">
                      <strong className="text-[#8B94A1] block text-[11px] mb-0.5">Objective:</strong>
                      {form.projectDescription}
                    </div>
                  )}
                  {form.clientRequirements && (
                    <div className="text-xs text-[#D0D4DC] leading-relaxed pt-2 border-t border-[#22262D]">
                      <strong className="text-[#8B94A1] block text-[11px] mb-0.5">Specifications:</strong>
                      {form.clientRequirements}
                    </div>
                  )}
                </div>
              )}
            </div>
          </BrokerCard>

          {/* Submission Action Bar */}
          <div className="p-4 rounded-xl border border-[#22262D] bg-[#111317] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className="text-xs text-[#8B94A1] hover:text-[#E6E8EB] inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Edit Form
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <BrokerButton
                type="button"
                variant="secondary"
                size="md"
                onClick={handleSaveDraft}
                loading={savingDraft}
                icon={draftSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                className="flex-1 sm:flex-none"
              >
                {draftSaved ? "Draft Saved" : "Save Draft"}
              </BrokerButton>

              <BrokerButton
                type="button"
                variant="primary"
                size="lg"
                loading={submitting}
                onClick={() => handleSubmit()}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="flex-1 sm:flex-none px-6"
              >
                Submit Lead
              </BrokerButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
