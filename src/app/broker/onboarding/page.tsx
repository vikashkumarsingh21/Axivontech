"use client";

import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Lock,
  ChevronRight,
  User,
  Building,
  CreditCard,
  FileText,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Upload,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { BrokerButton } from "@/components/broker/BrokerButton";
import { BrokerSkeletonCard, BrokerSkeletonDetail } from "@/components/broker/BrokerSkeleton";

interface OnboardingData {
  name: string;
  phone: string;
  whatsapp: string;
  companyName: string;
  designation: string;
  city: string;
  state: string;
  country: string;
  website: string;
  // Payout
  payoutMethod: "BANK_TRANSFER" | "UPI";
  accountHolder: string;
  accountNumber: string;
  confirmAccountNumber: string;
  bankName: string;
  ifsc: string;
  upiId: string;
  // KYC
  panNumber: string;
  gstNumber: string;
  kycFileName: string;
  kycFileSize: string;
  // Terms
  termsAccepted: boolean;
  termsAcceptedAt: string | null;
  // Referral
  partnerId: string;
  referralCode: string;
  referralLink: string;
  projectStartLink: string;
}

export default function BrokerOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    phone: "",
    whatsapp: "",
    companyName: "",
    designation: "",
    city: "",
    state: "",
    country: "India",
    website: "",
    payoutMethod: "BANK_TRANSFER",
    accountHolder: "",
    accountNumber: "",
    confirmAccountNumber: "",
    bankName: "",
    ifsc: "",
    upiId: "",
    panNumber: "",
    gstNumber: "",
    kycFileName: "",
    kycFileSize: "",
    termsAccepted: false,
    termsAcceptedAt: null,
    partnerId: "",
    referralCode: "",
    referralLink: "",
    projectStartLink: "",
  });

  // Step completion flags
  const [completedSteps, setCompletedSteps] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  // Load existing profile & checklist
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/broker/profile");
        if (res.ok) {
          const json = await res.json();
          const profile = json.data?.profile;
          const brokerProfile = profile?.brokerProfile;
          const extDetails = brokerProfile?.payoutDetails;
          const checklist = profile?.onboarding?.checklist;

          const hasProfile = !!(profile?.name && profile?.phone && brokerProfile?.companyName && brokerProfile?.city);
          const hasPayout = !!(brokerProfile?.payoutMethod && (extDetails?.accountNumberMasked || extDetails?.upiIdMasked));
          const hasKyc = !!(brokerProfile?.panNumberMasked);
          const hasTerms = checklist?.termsAccepted === true;
          const hasReferral = !!brokerProfile?.referralCode;

          setCompletedSteps({
            1: hasProfile,
            2: hasPayout,
            3: hasKyc,
            4: hasTerms,
            5: hasReferral,
          });

          // Determine initial active step
          if (!hasProfile) setActiveStep(1);
          else if (!hasPayout) setActiveStep(2);
          else if (!hasKyc) setActiveStep(3);
          else if (!hasTerms) setActiveStep(4);
          else if (!hasReferral) setActiveStep(5);
          else setActiveStep(5);

          setFormData((prev) => ({
            ...prev,
            name: profile?.name || "",
            phone: profile?.phone || "",
            whatsapp: brokerProfile?.whatsapp || profile?.phone || "",
            companyName: brokerProfile?.companyName || "",
            designation: brokerProfile?.designation || "Business Partner",
            city: brokerProfile?.city || "",
            state: brokerProfile?.state || "",
            country: brokerProfile?.country || "India",
            website: brokerProfile?.website || "",
            payoutMethod: brokerProfile?.payoutMethod || "BANK_TRANSFER",
            accountHolder: extDetails?.accountHolder || profile?.name || "",
            accountNumber: "",
            confirmAccountNumber: "",
            bankName: extDetails?.bankName || "",
            ifsc: extDetails?.ifsc || "",
            upiId: "",
            panNumber: "",
            gstNumber: brokerProfile?.gstNumber || "",
            termsAccepted: checklist?.termsAccepted || false,
            termsAcceptedAt: profile?.onboarding?.termsAcceptedAt || null,
            partnerId: brokerProfile?.partnerId || "",
            referralCode: brokerProfile?.referralCode || "",
            referralLink: brokerProfile?.referralCode
              ? `${window.location.origin}/lead/${brokerProfile.referralCode}`
              : "",
            projectStartLink: brokerProfile?.referralCode
              ? `${window.location.origin}/project/start/${brokerProfile.referralCode}`
              : "",
          }));
        }
      } catch (err) {
        console.error("Failed to load broker onboarding profile", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Step 1: Profile & Company Details Save
  const handleSaveStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setGlobalSuccess(null);
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.companyName.trim()) errors.companyName = "Company or agency name is required";
    if (!formData.city.trim()) errors.city = "City is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/v1/broker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          companyName: formData.companyName,
          designation: formData.designation,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          website: formData.website || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(json) || "Failed to update profile details");
      }

      setCompletedSteps((prev) => ({ ...prev, 1: true }));
      setGlobalSuccess("Profile details saved successfully.");
      setActiveStep(2);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Step 2: Payout Details Save
  const handleSaveStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setGlobalSuccess(null);
    const errors: Record<string, string> = {};

    if (formData.payoutMethod === "BANK_TRANSFER") {
      if (!formData.accountHolder.trim()) errors.accountHolder = "Account holder name is required";
      if (!formData.accountNumber.trim()) errors.accountNumber = "Account number is required";
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        errors.confirmAccountNumber = "Account numbers do not match";
      }
      if (!formData.ifsc.trim()) {
        errors.ifsc = "IFSC code is required";
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc.trim().toUpperCase())) {
        errors.ifsc = "Invalid IFSC format (e.g. HDFC0001234)";
      }
    } else {
      if (!formData.upiId.trim()) {
        errors.upiId = "UPI ID is required";
      } else if (!formData.upiId.includes("@")) {
        errors.upiId = "Invalid UPI ID (e.g., username@bank)";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        payoutMethod: formData.payoutMethod,
        payoutDetails:
          formData.payoutMethod === "BANK_TRANSFER"
            ? {
                accountHolder: formData.accountHolder,
                accountNumber: formData.accountNumber,
                ifsc: formData.ifsc.toUpperCase(),
                bankName: formData.bankName || "Bank Account",
              }
            : {
                upiId: formData.upiId.trim(),
              },
      };

      const res = await fetch("/api/v1/broker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(json) || "Failed to update payout details");
      }

      setCompletedSteps((prev) => ({ ...prev, 2: true }));
      setGlobalSuccess("Payout configurations recorded securely.");
      setActiveStep(3);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Step 3: KYC Verification Save
  const handleSaveStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setGlobalSuccess(null);
    const errors: Record<string, string> = {};

    const cleanPan = formData.panNumber.trim().toUpperCase();
    if (!cleanPan) {
      errors.panNumber = "Permanent Account Number (PAN) is required for TDS compliance";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      errors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }

    if (formData.gstNumber.trim()) {
      const cleanGst = formData.gstNumber.trim().toUpperCase();
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGst)) {
        errors.gstNumber = "Invalid GSTIN format (15 characters, e.g., 29ABCDE1234F1Z5)";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/v1/broker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panNumber: cleanPan,
          gstNumber: formData.gstNumber.trim().toUpperCase() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(json) || "Failed to save KYC credentials");
      }

      setCompletedSteps((prev) => ({ ...prev, 3: true }));
      setGlobalSuccess("Tax identity verified and recorded.");
      setActiveStep(4);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Step 4: Accept Partner Terms & Commercial Policies
  const handleSaveStep4 = async () => {
    if (!formData.termsAccepted) {
      setGlobalError("You must acknowledge and accept the Partner Commercial Terms.");
      return;
    }

    try {
      setSaving(true);
      setGlobalError(null);
      const res = await fetch("/api/v1/broker/profile/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termsVersion: "2.1",
          agreed: true,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(json) || "Failed to record terms agreement");
      }

      setCompletedSteps((prev) => ({ ...prev, 4: true }));
      setFormData((prev) => ({
        ...prev,
        termsAcceptedAt: json.data?.acceptedAt || new Date().toISOString(),
      }));
      setGlobalSuccess("Master Partner Agreement recorded.");
      setActiveStep(5);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Step 5: Generate / Activate Referral Engine
  const handleActivateReferral = async () => {
    try {
      setSaving(true);
      setGlobalError(null);
      const res = await fetch("/api/v1/broker/referral/generate", {
        method: "POST",
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(json) || "Failed to generate referral links");
      }

      const data = json.data;
      setFormData((prev) => ({
        ...prev,
        referralCode: data.referralCode,
        referralLink: data.leadUrl || `${window.location.origin}/lead/${data.referralCode}`,
        projectStartLink: data.projectUrl || `${window.location.origin}/project/start/${data.referralCode}`,
      }));

      setCompletedSteps((prev) => ({ ...prev, 5: true }));
      setGlobalSuccess("Axivon Partner Engine activated successfully!");
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Calculate percentage
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 5) * 100);

  const stepsMeta = [
    { id: 1, title: "Company Profile", subtitle: "Agency & Contact Info", icon: Building },
    { id: 2, title: "Payout Details", subtitle: "Bank Transfer or UPI", icon: CreditCard },
    { id: 3, title: "KYC Compliance", subtitle: "PAN & GST Verification", icon: ShieldCheck },
    { id: 4, title: "Partner Agreement", subtitle: "Terms & Policies v2.1", icon: FileText },
    { id: 5, title: "Referral Activation", subtitle: "Unique Code & Links", icon: Sparkles },
  ];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <BrokerSkeletonDetail />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <BrokerPageHeader
        title="Partner Onboarding"
        subtitle="Complete your verification checklist to unlock full pipeline access, automated referral links, and direct bank payouts."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#C2A878]/10 text-[#C2A878] border border-[#C2A878]/25">
            <ShieldCheck className="w-3.5 h-3.5" />
            Accreditation Workflow
          </span>
        }
      />

      {/* Global Alerts */}
      {globalSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{globalSuccess}</span>
          </div>
          <button
            onClick={() => setGlobalSuccess(null)}
            className="text-emerald-400/70 hover:text-emerald-300 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {globalError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{globalError}</span>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            className="text-rose-400/70 hover:text-rose-300 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Layout Grid: Left Stepper Navigation + Right Form Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Progress Card & Steps list */}
        <div className="lg:col-span-4 space-y-5">
          <BrokerCard className="p-5">
            <div className="flex items-center gap-4">
              {/* Circular Progress Ring */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  {/* Track */}
                  <path
                    className="text-[#22262D]"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress stroke */}
                  <path
                    className="text-[#C2A878] transition-all duration-700 ease-out"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold text-[#E6E8EB] font-mono leading-none">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#E6E8EB]">Setup Progress</h3>
                <p className="text-xs text-[#8B94A1] mt-0.5">
                  {completedCount} of 5 milestones verified
                </p>
                {formData.partnerId && (
                  <span className="inline-block mt-1 font-mono text-[11px] text-[#C2A878]">
                    {formData.partnerId}
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Vertical List */}
            <nav aria-label="Onboarding Steps" className="mt-6 space-y-2">
              {stepsMeta.map((step) => {
                const isDone = completedSteps[step.id as keyof typeof completedSteps];
                const isCurrent = activeStep === step.id;
                // A step is locked if the previous step is not completed (unless it is step 1)
                const isLocked = step.id > 1 && !completedSteps[(step.id - 1) as keyof typeof completedSteps];

                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      if (!isLocked) {
                        setGlobalError(null);
                        setActiveStep(step.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                      isCurrent
                        ? "bg-[#171A1F] border border-[#C2A878]/40 shadow-sm"
                        : isDone
                        ? "hover:bg-[#171A1F]/50 text-[#8B94A1]"
                        : isLocked
                        ? "opacity-50 cursor-not-allowed text-[#566171]"
                        : "hover:bg-[#171A1F]/30 text-[#8B94A1]"
                    }`}
                  >
                    {/* Step Icon or Status */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium transition-colors ${
                        isDone
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : isCurrent
                          ? "bg-[#C2A878] text-[#0A0B0D] font-bold"
                          : isLocked
                          ? "bg-[#1E232B] text-[#566171]"
                          : "bg-[#1E232B] text-[#8B94A1]"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : isLocked ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        step.id
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs font-semibold truncate ${
                            isCurrent ? "text-[#E6E8EB]" : isDone ? "text-[#D0D4DC]" : "text-[#8B94A1]"
                          }`}
                        >
                          {step.title}
                        </p>
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C2A878] animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#566171] truncate">{step.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {completedSteps[5] && (
              <div className="mt-6 pt-4 border-t border-[#1E232B]">
                <Link
                  href="/broker/dashboard"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#C2A878] hover:bg-[#D4BC8B] text-[#0A0B0D] font-semibold text-xs transition-colors shadow-sm"
                >
                  <span>Go to Partner Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </BrokerCard>

          {/* Quick Help Card */}
          <div className="p-4 rounded-xl border border-[#22262D] bg-[#0E1013] text-xs text-[#8B94A1] space-y-2">
            <div className="flex items-center gap-2 text-[#E6E8EB] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#C2A878]" />
              <span>Commercial Safeguard</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Axivon guarantees a transparent 10% commission on closed client contracts. Payouts are
              transferred within 48 hours of client milestone clearance in compliance with Section 194H
              TDS regulations.
            </p>
          </div>
        </div>

        {/* Right Column: Step Forms */}
        <div className="lg:col-span-8">
          {/* STEP 1: Profile & Company Details */}
          {activeStep === 1 && (
            <BrokerCard
              title="Step 1: Partner & Agency Profile"
              subtitle="Provide your primary commercial contact and registered agency information."
            >
              <form onSubmit={handleSaveStep1} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Full Legal Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                    {fieldErrors.name && (
                      <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Mobile Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Company / Agency Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      placeholder="e.g. Apex Tech Ventures"
                      className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                    {fieldErrors.companyName && (
                      <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => handleInputChange("designation", e.target.value)}
                      placeholder="e.g. Managing Director / Partner"
                      className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      City <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                    {fieldErrors.city && (
                      <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="e.g. Karnataka"
                      className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">Website</label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://youragency.com"
                      className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1E232B]">
                  <BrokerButton
                    type="submit"
                    variant="primary"
                    loading={saving}
                    icon={<ChevronRight className="w-4 h-4" />}
                  >
                    Save & Proceed to Payouts
                  </BrokerButton>
                </div>
              </form>
            </BrokerCard>
          )}

          {/* STEP 2: Bank / UPI Payout Details */}
          {activeStep === 2 && (
            <BrokerCard
              title="Step 2: Commercial Payout Account"
              subtitle="Where should Axivon disburse your commission settlements? Direct Bank Transfer or UPI."
            >
              <form onSubmit={handleSaveStep2} className="space-y-5">
                {/* Payout Method Toggle */}
                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-2">
                    Settlement Method
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => handleInputChange("payoutMethod", "BANK_TRANSFER")}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        formData.payoutMethod === "BANK_TRANSFER"
                          ? "bg-[#C2A878]/15 border-[#C2A878] text-[#E6E8EB]"
                          : "bg-[#171A1F] border-[#22262D] text-[#8B94A1] hover:text-[#E6E8EB]"
                      }`}
                    >
                      <Building className="w-3.5 h-3.5 text-[#C2A878]" />
                      <span>Bank Account (NEFT/RTGS)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange("payoutMethod", "UPI")}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        formData.payoutMethod === "UPI"
                          ? "bg-[#C2A878]/15 border-[#C2A878] text-[#E6E8EB]"
                          : "bg-[#171A1F] border-[#22262D] text-[#8B94A1] hover:text-[#E6E8EB]"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#C2A878]" />
                      <span>Instant UPI ID</span>
                    </button>
                  </div>
                </div>

                {formData.payoutMethod === "BANK_TRANSFER" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                        Account Holder Name (as in bank passbook) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.accountHolder}
                        onChange={(e) => handleInputChange("accountHolder", e.target.value)}
                        placeholder="Jane Doe or Apex Ventures LLP"
                        className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                      />
                      {fieldErrors.accountHolder && (
                        <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.accountHolder}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                        Bank Account Number <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="password"
                        value={formData.accountNumber}
                        onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] font-mono"
                      />
                      {fieldErrors.accountNumber && (
                        <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.accountNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                        Confirm Account Number <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.confirmAccountNumber}
                        onChange={(e) => handleInputChange("confirmAccountNumber", e.target.value)}
                        placeholder="Re-enter account number"
                        className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] font-mono"
                      />
                      {fieldErrors.confirmAccountNumber && (
                        <p className="text-[11px] text-rose-400 mt-1">
                          {fieldErrors.confirmAccountNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                        IFSC Code (11 alphanumeric characters) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.ifsc}
                        onChange={(e) => handleInputChange("ifsc", e.target.value.toUpperCase())}
                        placeholder="e.g. HDFC0001234"
                        maxLength={11}
                        className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] uppercase font-mono"
                      />
                      {fieldErrors.ifsc && (
                        <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.ifsc}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                        Bank Name & Branch
                      </label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => handleInputChange("bankName", e.target.value)}
                        placeholder="e.g. HDFC Bank, Indiranagar"
                        className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      UPI ID (Virtual Payment Address) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => handleInputChange("upiId", e.target.value)}
                      placeholder="e.g. username@okhdfcbank or 9876543210@paytm"
                      className="w-full max-w-md px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] font-mono"
                    />
                    {fieldErrors.upiId && (
                      <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.upiId}</p>
                    )}
                    <p className="text-[11px] text-[#8B94A1] mt-1.5">
                      Ensure your UPI ID is linked to your primary commercial or personal bank account.
                    </p>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between border-t border-[#1E232B]">
                  <BrokerButton
                    type="button"
                    variant="ghost"
                    onClick={() => setActiveStep(1)}
                  >
                    Back to Profile
                  </BrokerButton>

                  <BrokerButton
                    type="submit"
                    variant="primary"
                    loading={saving}
                    icon={<ChevronRight className="w-4 h-4" />}
                  >
                    Save & Continue to KYC
                  </BrokerButton>
                </div>
              </form>
            </BrokerCard>
          )}

          {/* STEP 3: KYC Verification */}
          {activeStep === 3 && (
            <BrokerCard
              title="Step 3: Tax & KYC Compliance"
              subtitle="Required under Section 194H of the Indian Income Tax Act for commercial brokerage disbursements."
            >
              <form onSubmit={handleSaveStep3} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Permanent Account Number (PAN) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange("panNumber", e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] uppercase font-mono tracking-wider"
                    />
                    {fieldErrors.panNumber && (
                      <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.panNumber}</p>
                    )}
                    <p className="text-[11px] text-[#566171] mt-1">
                      A valid 10-character alphanumeric PAN is mandatory for 5% TDS rate.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => handleInputChange("gstNumber", e.target.value.toUpperCase())}
                      placeholder="29ABCDE1234F1Z5"
                      maxLength={15}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] uppercase font-mono"
                    />
                    {fieldErrors.gstNumber && (
                      <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.gstNumber}</p>
                    )}
                    <p className="text-[11px] text-[#566171] mt-1">
                      If registered for Goods & Services Tax in India.
                    </p>
                  </div>
                </div>

                {/* File Upload Box (PAN Card / Aadhaar document preview) */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1.5">
                    Upload PAN Card / KYC Document (PDF, PNG, JPG)
                  </label>
                  <div className="border-2 border-dashed border-[#22262D] hover:border-[#C2A878]/50 rounded-xl p-6 text-center transition-colors bg-[#0E1013]">
                    <div className="mx-auto w-10 h-10 rounded-full bg-[#171A1F] flex items-center justify-center text-[#C2A878] mb-3">
                      <Upload className="w-5 h-5" />
                    </div>
                    {formData.kycFileName ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                        <FileCheck className="w-4 h-4" />
                        <span className="font-mono">{formData.kycFileName}</span>
                        <span className="text-[#8B94A1]">({formData.kycFileSize})</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-[#E6E8EB] font-medium">
                          Click to select or drag and drop your PAN copy
                        </p>
                        <p className="text-[11px] text-[#566171] mt-1">
                          Maximum file size: 5MB. Verified confidentially by Axivon Finance.
                        </p>
                        <label className="mt-3 inline-block">
                          <input
                            type="file"
                            accept=".pdf,image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFormData((prev) => ({
                                  ...prev,
                                  kycFileName: file.name,
                                  kycFileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                                }));
                              }
                            }}
                          />
                          <span className="px-3 py-1.5 rounded-md bg-[#171A1F] hover:bg-[#22262D] border border-[#2C313A] text-xs font-medium text-[#C2A878] cursor-pointer transition-colors inline-block">
                            Browse File
                          </span>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#1E232B]">
                  <BrokerButton
                    type="button"
                    variant="ghost"
                    onClick={() => setActiveStep(2)}
                  >
                    Back to Payouts
                  </BrokerButton>

                  <BrokerButton
                    type="submit"
                    variant="primary"
                    loading={saving}
                    icon={<ChevronRight className="w-4 h-4" />}
                  >
                    Confirm & Proceed to Agreement
                  </BrokerButton>
                </div>
              </form>
            </BrokerCard>
          )}

          {/* STEP 4: Accept Partner Terms & Policies */}
          {activeStep === 4 && (
            <BrokerCard
              title="Step 4: Master Partner Agreement & Commercial Terms"
              subtitle="Review and execute Axivon Technologies Business Partner Agreement (v2.1)."
            >
              <div className="space-y-4">
                {/* Scrollable Terms & Policy Box */}
                <div className="h-64 overflow-y-auto p-4 rounded-xl bg-[#0E1013] border border-[#22262D] text-xs text-[#8B94A1] space-y-3 font-mono leading-relaxed select-none">
                  <div className="text-xs font-bold text-[#C2A878]">
                    AXIVON TECHNOLOGIES BUSINESS PARTNER & BROKER COMMERCIAL AGREEMENT
                  </div>
                  <p>
                    <strong>1. Commercial Commission Rate:</strong> The Business Partner is entitled to a
                    gross commission of up to 10% (ten percent) of confirmed software engineering, cloud
                    infrastructure, or AI consulting contracts generated through verified referral links or
                    portal submissions.
                  </p>
                  <p>
                    <strong>2. Milestone Disbursements:</strong> Broker commissions are calculated pro-rata
                    against cleared client invoices. Once a client milestone payment is settled, eligible
                    broker payout transfers are executed within 48 business hours via NEFT, RTGS, or UPI.
                  </p>
                  <p>
                    <strong>3. Statutory Tax Deduction (TDS):</strong> All brokerage disbursements are
                    subject to applicable statutory tax deduction at source under Section 194H of the Indian
                    Income Tax Act (standard rate 5% for valid PAN accounts). Digital Form 16A TDS
                    certificates are issued quarterly.
                  </p>
                  <p>
                    <strong>4. Client Non-Circumvention:</strong> Axivon Technologies warrants that all
                    leads submitted by the Business Partner remain strictly attributed to the partner for a
                    standard validity window of 365 calendar days. Direct circumvention is strictly
                    prohibited.
                  </p>
                  <p>
                    <strong>5. Code of Conduct:</strong> Partners agree to represent Axivon capabilities
                    truthfully without misrepresenting pricing, guarantees, or delivery timelines.
                  </p>
                </div>

                {/* Acceptance Checkbox */}
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#171A1F] border border-[#22262D] cursor-pointer hover:border-[#C2A878]/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded border-[#22262D] bg-[#0E1013] text-[#C2A878] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#C2A878]"
                  />
                  <div className="text-xs leading-relaxed text-[#D0D4DC]">
                    <span>
                      I have read, understood, and accept the{" "}
                      <Link
                        href="/business-partner/policy"
                        target="_blank"
                        className="text-[#C2A878] hover:underline"
                      >
                        Axivon Partner Commercial Terms & Referral Policies (v2.1)
                      </Link>
                      . I confirm that the details provided are accurate and authorize electronic signing.
                    </span>
                    {formData.termsAcceptedAt && (
                      <p className="text-[11px] text-emerald-400 mt-1">
                        Accepted on: {new Date(formData.termsAcceptedAt).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </label>

                <div className="pt-4 flex items-center justify-between border-t border-[#1E232B]">
                  <BrokerButton
                    type="button"
                    variant="ghost"
                    onClick={() => setActiveStep(3)}
                  >
                    Back to KYC
                  </BrokerButton>

                  <BrokerButton
                    type="button"
                    variant="primary"
                    loading={saving}
                    onClick={handleSaveStep4}
                    disabled={!formData.termsAccepted}
                    icon={<ChevronRight className="w-4 h-4" />}
                  >
                    Sign & Execute Agreement
                  </BrokerButton>
                </div>
              </div>
            </BrokerCard>
          )}

          {/* STEP 5: Referral Activation & Completion */}
          {activeStep === 5 && (
            <BrokerCard
              title="Step 5: Partner Referral Engine & Accreditation"
              subtitle="Generate your unique Axivon referral credentials and intake URLs."
            >
              <div className="space-y-6">
                {!formData.referralCode ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-[#C2A878]/15 border border-[#C2A878]/30 mx-auto flex items-center justify-center text-[#C2A878]">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <h4 className="text-base font-semibold text-[#E6E8EB]">
                        All Preliminary Milestones Verified!
                      </h4>
                      <p className="text-xs text-[#8B94A1] mt-1.5">
                        Your profile, bank payout details, and partner terms have been verified. Click below
                        to generate your permanent Axivon Partner Referral Code and intake links.
                      </p>
                    </div>

                    <BrokerButton
                      type="button"
                      variant="primary"
                      size="lg"
                      loading={saving}
                      onClick={handleActivateReferral}
                      icon={<Sparkles className="w-4 h-4" />}
                    >
                      Generate My Partner Referral Code
                    </BrokerButton>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Celebratory Banner */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#C2A878]/15 via-[#171A1F] to-[#111317] border border-[#C2A878]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 mb-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accredited Partner Active
                        </div>
                        <h4 className="text-sm font-bold text-[#E6E8EB]">
                          Welcome Aboard, {formData.name}!
                        </h4>
                        <p className="text-xs text-[#8B94A1]">
                          Your commercial partner account is fully activated. Share your links or submit
                          client projects directly.
                        </p>
                      </div>

                      <Link
                        href="/broker/dashboard"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C2A878] hover:bg-[#D4BC8B] text-[#0A0B0D] font-semibold text-xs transition-colors shrink-0 shadow-sm"
                      >
                        <span>Open Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Referral Credentials Cards */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                          Official Referral Code
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-sm text-[#C2A878] font-mono font-bold tracking-wider">
                            {formData.referralCode}
                          </div>
                          <BrokerButton
                            variant="secondary"
                            size="sm"
                            onClick={() => copyToClipboard(formData.referralCode, "code")}
                            icon={
                              copiedLink === "code" ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )
                            }
                          >
                            {copiedLink === "code" ? "Copied" : "Copy Code"}
                          </BrokerButton>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                          Client Lead Intake Link
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={formData.referralLink}
                            className="flex-1 px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] font-mono focus:outline-none"
                          />
                          <BrokerButton
                            variant="secondary"
                            size="sm"
                            onClick={() => copyToClipboard(formData.referralLink, "lead")}
                            icon={
                              copiedLink === "lead" ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )
                            }
                          >
                            {copiedLink === "lead" ? "Copied" : "Copy"}
                          </BrokerButton>
                          <a
                            href={formData.referralLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-[#171A1F] hover:bg-[#22262D] border border-[#22262D] text-[#8B94A1] hover:text-[#E6E8EB] transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                          Direct Project Initiation Link
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={formData.projectStartLink}
                            className="flex-1 px-3.5 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] font-mono focus:outline-none"
                          />
                          <BrokerButton
                            variant="secondary"
                            size="sm"
                            onClick={() => copyToClipboard(formData.projectStartLink, "project")}
                            icon={
                              copiedLink === "project" ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )
                            }
                          >
                            {copiedLink === "project" ? "Copied" : "Copy"}
                          </BrokerButton>
                          <a
                            href={formData.projectStartLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-[#171A1F] hover:bg-[#22262D] border border-[#22262D] text-[#8B94A1] hover:text-[#E6E8EB] transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </BrokerCard>
          )}
        </div>
      </div>
    </div>
  );
}
