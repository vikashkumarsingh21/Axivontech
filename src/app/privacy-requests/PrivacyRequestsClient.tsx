"use client";

import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  ChevronRight,
  ArrowRight,
  FileText,
  UserCheck,
} from "lucide-react";
import { TurnstileWidget, TurnstileWidgetHandle } from "@/components/ui/TurnstileWidget";
import { RequiredPolicyAcknowledgement } from "@/components/legal/RequiredPolicyAcknowledgement";
import { GoogleRecaptchaWidget } from "@/components/ui/GoogleRecaptchaWidget";

const CATEGORIES = [
  {
    id: "ACCESS",
    title: "Access / Data Summary",
    desc: "Obtain a summary of personal data held and processed by Axivon Technologies.",
  },
  {
    id: "CORRECTION",
    title: "Correction / Update",
    desc: "Update inaccurate, incomplete, or out-of-date personal data in our systems.",
  },
  {
    id: "ERASURE",
    title: "Erasure / Deletion",
    desc: "Request deletion of personal data no longer required for statutory or contractual purposes.",
  },
  {
    id: "WITHDRAW_CONSENT",
    title: "Withdraw Consent",
    desc: "Revoke previously granted consent for marketing communications or optional services.",
  },
  {
    id: "GRIEVANCE",
    title: "Grievance Redressal",
    desc: "File a formal grievance regarding personal data handling with our Grievance Officer.",
  },
];

export default function PrivacyRequestsClient() {
  const [activeTab, setActiveTab] = useState<"submit" | "track">("submit");

  // Submit form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("ACCESS");
  const [details, setDetails] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [policyAcknowledged, setPolicyAcknowledged] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [recaptchaResetCount, setRecaptchaResetCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    referenceId: string;
    message: string;
  } | null>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  // Track form state
  const [trackRefId, setTrackRefId] = useState("");
  const [trackEmail, setTrackEmail] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackedRecord, setTrackedRecord] = useState<{
    referenceId: string;
    category: string;
    status: string;
    createdAt: string;
    resolvedAt?: string | null;
    resolutionNotes?: string | null;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim() || !email.trim() || !details.trim()) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    if (!policyAcknowledged) {
      setPolicyError("Please acknowledge the Privacy Policy before submitting.");
      setSubmitError("Please acknowledge the Privacy Policy before submitting.");
      return;
    }

    if (!captchaToken) {
      setSubmitError("Please complete the human verification before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/public/privacy-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterName: name,
          requesterEmail: email,
          requesterPhone: phone,
          category,
          requestDetails: details,
          privacyPolicyAcknowledged: true,
          policyVersion: "1.0.0",
          recaptchaToken: captchaToken,
          captchaToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data) || "Failed to submit privacy request.");
      }

      setSubmittedResult({
        referenceId: data.referenceId,
        message: data.message,
      });
      // Clear form
      setName("");
      setEmail("");
      setPhone("");
      setDetails("");
      setCaptchaToken("");
      setPolicyAcknowledged(false);
      setRecaptchaResetCount((c) => c + 1);
      turnstileRef.current?.reset();
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong.");
      setRecaptchaResetCount((c) => c + 1);
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    setTrackedRecord(null);

    if (!trackRefId.trim() || !trackEmail.trim()) {
      setTrackError("Please enter both your Reference ID and the email address used when submitting.");
      return;
    }

    setIsTracking(true);
    try {
      const res = await fetch(
        `/api/v1/public/privacy-requests?referenceId=${encodeURIComponent(
          trackRefId.trim()
        )}&email=${encodeURIComponent(trackEmail.trim())}`
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data) || "Request not found.");
      }

      setTrackedRecord(data.request);
    } catch (err: any) {
      setTrackError(err.message || "Failed to track request.");
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <Lock className="w-3.5 h-3.5" />
          <span>India DPDP Act 2023 Statutory Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F3F5F7] tracking-tight mb-3">
          Data Subject Privacy Rights Portal
        </h1>
        <p className="text-sm text-[#A7B0BC] max-w-xl mx-auto leading-relaxed">
          Submit and track official requests regarding personal data processed by Axivon Technologies. All requests are handled directly by our designated Data Protection & Grievance team.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setActiveTab("submit")}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "submit"
              ? "bg-emerald-500 text-[#04130E] shadow-md"
              : "bg-[#10151B] text-[#7E8997] hover:text-[#F3F5F7] border border-[#1E2530]"
          }`}
        >
          Submit New Request
        </button>
        <button
          onClick={() => setActiveTab("track")}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "track"
              ? "bg-emerald-500 text-[#04130E] shadow-md"
              : "bg-[#10151B] text-[#7E8997] hover:text-[#F3F5F7] border border-[#1E2530]"
          }`}
        >
          Track Request Status
        </button>
      </div>

      {/* SUBMIT TAB */}
      {activeTab === "submit" && (
        <div className="bg-[#10151B] border border-[#1E2530] rounded-2xl p-6 sm:p-10 shadow-xl">
          {submittedResult ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[#F3F5F7]">Request Successfully Recorded</h2>
              <div className="inline-block p-3 rounded-xl bg-[#151A21] border border-[#1E2530] font-mono text-sm text-emerald-400">
                Tracking Reference: <strong className="text-white">{submittedResult.referenceId}</strong>
              </div>
              <p className="text-xs sm:text-sm text-[#A7B0BC] max-w-lg mx-auto leading-relaxed">
                {submittedResult.message}
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => setSubmittedResult(null)}
                  className="px-4 py-2 bg-[#151A21] hover:bg-[#1B222B] text-[#F3F5F7] border border-[#29313B] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Submit Another Request
                </button>
                <button
                  onClick={() => {
                    setTrackRefId(submittedResult.referenceId);
                    setActiveTab("track");
                    setSubmittedResult(null);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#04130E] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Track This Request →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm text-red-400 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Request Category Selector */}
              <div>
                <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-2.5">
                  1. Select Right / Request Category <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        category === cat.id
                          ? "bg-emerald-500/10 border-emerald-500 text-[#F3F5F7]"
                          : "bg-[#151A21] border-[#1E2530] text-[#7E8997] hover:border-[#29313B] hover:text-[#A7B0BC]"
                      }`}
                    >
                      <p className="text-xs font-bold mb-1 flex items-center justify-between">
                        <span>{cat.title}</span>
                        {category === cat.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </p>
                      <p className="text-[11px] leading-relaxed text-[#7E8997]">{cat.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-2.5">
                  2. Requester Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#7E8997] mb-1">
                      Full Legal Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-10 px-3.5 bg-[#151A21] border border-[#1E2530] rounded-xl text-sm text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7E8997] mb-1">
                      Verified Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-10 px-3.5 bg-[#151A21] border border-[#1E2530] rounded-xl text-sm text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-[#7E8997] mb-1">
                      Contact Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full h-10 px-3.5 bg-[#151A21] border border-[#1E2530] rounded-xl text-sm text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div>
                <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-1">
                  3. Description & Specific Details <span className="text-red-400">*</span>
                </label>
                <p className="text-[11px] text-[#7E8997] mb-2">
                  Please describe the specific records or personal data relating to your request to facilitate prompt retrieval.
                </p>
                <textarea
                  required
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide context, such as email addresses previously used, project names, or job applications…"
                  className="w-full p-3.5 bg-[#151A21] border border-[#1E2530] rounded-xl text-sm text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
                />
              </div>

              {/* Dual Checks: Privacy Policy Acknowledgement & Google reCAPTCHA v2 */}
              <div className="space-y-4 pt-2 border-t border-[#1E2530]">
                <RequiredPolicyAcknowledgement
                  checked={policyAcknowledged}
                  onChange={(checked) => {
                    setPolicyAcknowledged(checked);
                    if (checked) setPolicyError(null);
                  }}
                  policySlug="privacy-policy"
                  errorMessage={policyError || undefined}
                />

                <div>
                  <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-2">
                    Human Verification <span className="text-red-400">*</span>
                  </label>
                  <GoogleRecaptchaWidget
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpired={() => setCaptchaToken("")}
                    onError={() => setCaptchaToken("")}
                    resetTrigger={recaptchaResetCount}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#04130E] text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Submitting Request…" : "Submit Formal Privacy Request"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* TRACK TAB */}
      {activeTab === "track" && (
        <div className="bg-[#10151B] border border-[#1E2530] rounded-2xl p-6 sm:p-10 shadow-xl">
          <form onSubmit={handleTrack} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-1">
                  Tracking Reference ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PR-2026-A1B2C3"
                  value={trackRefId}
                  onChange={(e) => setTrackRefId(e.target.value.toUpperCase())}
                  className="w-full h-10 px-3.5 bg-[#151A21] border border-[#1E2530] rounded-xl text-sm font-mono text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-1">
                  Requester Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={trackEmail}
                  onChange={(e) => setTrackEmail(e.target.value)}
                  className="w-full h-10 px-3.5 bg-[#151A21] border border-[#1E2530] rounded-xl text-sm text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isTracking}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#04130E] text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              {isTracking ? "Searching Records…" : "Check Request Status"}
            </button>
          </form>

          {trackError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm text-red-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{trackError}</span>
            </div>
          )}

          {trackedRecord && (
            <div className="p-6 rounded-xl bg-[#151A21] border border-[#1E2530] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2530] pb-3">
                <span className="text-xs font-mono text-[#7E8997]">
                  Reference ID: <strong className="text-white">{trackedRecord.referenceId}</strong>
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    trackedRecord.status === "FULFILLED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : trackedRecord.status === "REJECTED"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {trackedRecord.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#7E8997]">Category:</span>
                  <p className="font-semibold text-[#F3F5F7] mt-0.5">{trackedRecord.category}</p>
                </div>
                <div>
                  <span className="text-[#7E8997]">Submitted:</span>
                  <p className="font-semibold text-[#F3F5F7] mt-0.5">
                    {new Date(trackedRecord.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {trackedRecord.resolutionNotes && (
                <div className="pt-3 border-t border-[#1E2530] text-xs">
                  <span className="text-[#7E8997]">Resolution Notes from Compliance Team:</span>
                  <p className="mt-1 p-3 rounded-lg bg-[#10151B] border border-[#1E2530] text-[#A7B0BC] leading-relaxed">
                    {trackedRecord.resolutionNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
