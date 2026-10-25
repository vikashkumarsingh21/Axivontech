"use client";

import { toast } from "@/lib/notifications/toast";
import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  Briefcase,
  Users,
  Send,
  Lock,
  Edit2,
  RefreshCw,
  ExternalLink,
  Percent,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminBrokerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const brokerId = params.id as string;

  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "kyc" | "leads" | "projects" | "contracts" | "commissions" | "notes" | "activity"
  >("overview");

  // Copy helpers
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Internal Notes State
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // KYC Review State
  const [kycAction, setKycAction] = useState<"approve" | "reject" | null>(null);
  const [kycRemarks, setKycRemarks] = useState("");
  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Status Action State (Suspend / Reactivate / Resend Activation)
  const [actionModal, setActionModal] = useState<"resend_activation" | "suspend" | "reactivate" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionResult, setActionResult] = useState<string | null>(null);

  // Commission override state
  const [editingCommission, setEditingCommission] = useState(false);
  const [customRate, setCustomRate] = useState<number | string>("");
  const [savingCommission, setSavingCommission] = useState(false);

  const fetchDossier = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/v1/admin/brokers/${brokerId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load broker details");
      }
      const json = await res.json();
      setDossier(json.data);
      setNotes(json.data.internalNotes || []);
      setCustomRate(json.data.commissionConfig?.customRate ?? "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brokerId) {
      fetchDossier();
    }
  }, [brokerId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      setSubmittingNote(true);
      const res = await fetch(`/api/v1/admin/brokers/${brokerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(data) || "Failed to add note");
      setNewNote("");
      if (data.notes) setNotes(data.notes);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleKycReview = async () => {
    if (!kycAction) return;
    try {
      setSubmittingKyc(true);
      const res = await fetch(`/api/v1/admin/brokers/${brokerId}/kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: kycAction, reason: kycRemarks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(data) || "Failed to process KYC review");
      setKycAction(null);
      setKycRemarks("");
      fetchDossier();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingKyc(false);
    }
  };

  const handleAccountAction = async () => {
    if (!actionModal) return;
    try {
      setSubmittingAction(true);
      setActionResult(null);
      const res = await fetch(`/api/v1/admin/brokers/${brokerId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionModal, reason: actionReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(data) || "Failed to execute action");
      
      setActionResult(data.message || "Action completed successfully");
      setActionReason("");
      fetchDossier();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSaveCommissionRate = async () => {
    try {
      setSavingCommission(true);
      const parsedRate = customRate === "" ? null : Number(customRate);
      const res = await fetch(`/api/v1/admin/brokers/${brokerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customCommissionRate: parsedRate }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(getErrorMessage(data) || "Failed to update commission rate");
      }
      setEditingCommission(false);
      fetchDossier();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingCommission(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading partner dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-2">Unable to Load Broker Dossier</h2>
          <p className="text-sm text-gray-400 mb-6">{error || "Record not found."}</p>
          <Link
            href="/admin/crm/brokers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Brokers
          </Link>
        </div>
      </div>
    );
  }

  const { user, profile, kyc, stats, leads, projects, contracts, commissions, auditLogs } = dossier;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/crm/brokers"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Brokers & Partners
        </Link>
        <button
          onClick={fetchDossier}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-[#111] hover:bg-white/5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Main Dossier Header */}
      <div className="bg-[#111] border border-white/10 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-amber-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0">
              {user.name?.charAt(0) || "P"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                
                {/* Status Badges */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    user.status === "ACTIVE"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : user.status === "PENDING_ACTIVATION"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {user.status.replace(/_/g, " ")}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    kyc.status === "VERIFIED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : kyc.status === "REJECTED"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}
                >
                  KYC: {kyc.status}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-3">
                {profile.designation || "Business Partner"}{" "}
                {profile.companyName && <span className="text-gray-500">• {profile.companyName}</span>}
              </p>

              {/* Identity Keys */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {profile.partnerId && (
                  <div className="flex items-center gap-1.5 bg-[#0a0a0a] border border-white/10 px-2.5 py-1 rounded">
                    <span className="text-gray-500">Partner ID:</span>
                    <span className="font-mono text-[#C2A878] font-semibold">{profile.partnerId}</span>
                    <button
                      onClick={() => copyToClipboard(profile.partnerId, "partnerId")}
                      className="text-gray-500 hover:text-white transition-colors ml-1"
                      title="Copy Partner ID"
                    >
                      {copiedField === "partnerId" ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}

                {profile.referralCode && (
                  <div className="flex items-center gap-1.5 bg-[#0a0a0a] border border-white/10 px-2.5 py-1 rounded">
                    <span className="text-gray-500">Referral Code:</span>
                    <span className="font-mono text-white font-semibold">{profile.referralCode}</span>
                    <button
                      onClick={() => copyToClipboard(profile.referralCode, "referralCode")}
                      className="text-gray-500 hover:text-white transition-colors ml-1"
                      title="Copy Referral Code"
                    >
                      {copiedField === "referralCode" ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}

                <div className="text-gray-500">
                  Joined: <span className="text-gray-300">{format(new Date(user.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setKycAction("approve");
                setActiveTab("kyc");
              }}
              className="px-3.5 py-2 rounded-lg bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Review KYC
            </button>

            {user.status === "PENDING_ACTIVATION" && (
              <button
                onClick={() => setActionModal("resend_activation")}
                className="px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Resend Activation
              </button>
            )}

            {user.status === "ACTIVE" ? (
              <button
                onClick={() => setActionModal("suspend")}
                className="px-3.5 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" /> Suspend Partner
              </button>
            ) : (
              <button
                onClick={() => setActionModal("reactivate")}
                className="px-3.5 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> Reactivate Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">Total Earned</p>
          <p className="text-2xl font-bold text-white font-mono">
            ₹{stats.totalEarned.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-green-400 mt-1">Paid: ₹{stats.paidCommission.toLocaleString("en-IN")}</p>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">Eligible Payout</p>
          <p className="text-2xl font-bold text-[#C2A878] font-mono">
            ₹{stats.eligibleCommission.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Pending: ₹{stats.pendingCommission.toLocaleString("en-IN")}</p>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">Attributed Leads</p>
          <p className="text-2xl font-bold text-white font-mono">{stats.totalLeads}</p>
          <p className="text-[11px] text-gray-400 mt-1">Active pipeline leads</p>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">Projects Onboarded</p>
          <p className="text-2xl font-bold text-white font-mono">{stats.totalProjects}</p>
          <p className="text-[11px] text-gray-400 mt-1">Contracts: {stats.totalContracts}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-sm">
        {[
          { key: "overview", label: "Overview & Profile" },
          { key: "kyc", label: `KYC & Payout (${kyc.status})` },
          { key: "leads", label: `Leads (${leads.length})` },
          { key: "projects", label: `Projects (${projects.length})` },
          { key: "contracts", label: `Contracts (${contracts.length})` },
          { key: "commissions", label: `Commissions (${commissions.length})` },
          { key: "notes", label: `Internal Notes (${notes.length})` },
          { key: "activity", label: `Activity Log (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 font-medium whitespace-nowrap transition-colors border-b-2 -mb-[2px] ${
              activeTab === tab.key
                ? "border-red-500 text-white font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Contact & Business Info */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Building className="w-4 h-4 text-red-400" /> Business Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Full Name</p>
                  <p className="text-gray-200 font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email Address</p>
                  <p className="text-gray-200 font-mono text-xs">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
                  <p className="text-gray-200 font-mono text-xs">{user.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">WhatsApp</p>
                  <p className="text-gray-200 font-mono text-xs">{profile.whatsapp || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Company / Firm</p>
                  <p className="text-gray-200">{profile.companyName || "Independent"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Designation</p>
                  <p className="text-gray-200">{profile.designation || "Partner"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Location</p>
                  <p className="text-gray-200">
                    {[profile.city, profile.state, profile.country].filter(Boolean).join(", ") || "Unspecified"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Website</p>
                  {profile.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-400 hover:underline flex items-center gap-1 text-xs truncate"
                    >
                      {profile.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-gray-500">None</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links & Referral URL */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-3">Partner Shareable Links</h3>
              <p className="text-xs text-gray-400 mb-4">
                These are the direct links attributed to this partner for project onboarding and lead capture.
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Direct Project Start Link</p>
                  <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/10 p-2.5 rounded-lg text-xs font-mono text-gray-300">
                    <span className="truncate">
                      {typeof window !== "undefined" ? `${window.location.origin}/project/start/${profile.referralCode}` : `/project/start/${profile.referralCode}`}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${typeof window !== "undefined" ? window.location.origin : ""}/project/start/${profile.referralCode}`,
                          "projectLink"
                        )
                      }
                      className="text-red-400 hover:text-white shrink-0 ml-2 font-sans font-medium"
                    >
                      {copiedField === "projectLink" ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">General Lead Referral Link</p>
                  <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/10 p-2.5 rounded-lg text-xs font-mono text-gray-300">
                    <span className="truncate">
                      {typeof window !== "undefined" ? `${window.location.origin}/lead/${profile.referralCode}` : `/lead/${profile.referralCode}`}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${typeof window !== "undefined" ? window.location.origin : ""}/lead/${profile.referralCode}`,
                          "leadLink"
                        )
                      }
                      className="text-red-400 hover:text-white shrink-0 ml-2 font-sans font-medium"
                    >
                      {copiedField === "leadLink" ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Commission Rule & Compliance Summary */}
          <div className="space-y-6">
            {/* Commission Override Card */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[#C2A878]" /> Commission Override
                </h3>
                {!editingCommission && (
                  <button
                    onClick={() => setEditingCommission(true)}
                    className="text-xs text-red-400 hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>

              {editingCommission ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400">
                    Set a custom commission rate percentage for this specific broker, or leave blank to use global tier defaults.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={customRate}
                      onChange={(e) => setCustomRate(e.target.value)}
                      placeholder="e.g. 10"
                      className="bg-[#0a0a0a] border border-white/10 rounded p-2 text-sm text-white w-28 focus:outline-none focus:border-red-500"
                    />
                    <span className="text-white text-sm font-bold">%</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSaveCommissionRate}
                      disabled={savingCommission}
                      className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                    >
                      {savingCommission ? "Saving..." : "Save Rate"}
                    </button>
                    <button
                      onClick={() => setEditingCommission(false)}
                      className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold font-mono text-white">
                      {dossier.commissionConfig?.customRate != null
                        ? `${dossier.commissionConfig.customRate}%`
                        : "Global Tier"}
                    </span>
                    {dossier.commissionConfig?.customRate != null && (
                      <span className="text-xs text-[#C2A878] font-medium bg-[#C2A878]/10 px-2 py-0.5 rounded">
                        Custom Override
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {dossier.commissionConfig?.customRate != null
                      ? "Custom flat commission applied to all closed projects attributed to this partner."
                      : "Default standard tier applied (typically 10% on first milestone, 5% on balance)."}
                  </p>
                </div>
              )}
            </div>

            {/* Compliance & Policy Acceptance Card */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-6 text-sm">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Compliance Status
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-gray-400">Terms & Policy:</span>
                  <span className={kyc.termsAccepted ? "text-green-400 font-semibold" : "text-amber-400"}>
                    {kyc.termsAccepted ? "Accepted" : "Pending Signature"}
                  </span>
                </div>
                {kyc.termsAcceptedAt && (
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Accepted On:</span>
                    <span className="text-gray-200">{format(new Date(kyc.termsAcceptedAt), "MMM d, yyyy")}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-gray-400">KYC Status:</span>
                  <span className="font-semibold text-white uppercase">{kyc.status}</span>
                </div>
                {kyc.verifiedAt && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-gray-400">Verified On:</span>
                    <span className="text-gray-200">{format(new Date(kyc.verifiedAt), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. KYC & PAYOUT TAB */}
      {activeTab === "kyc" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Tax & Banking Details */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C2A878]" /> Tax & Identity Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">PAN Number (Section 194H)</p>
                  <p className="font-mono text-base font-bold text-white tracking-wider">
                    {kyc.panNumber || <span className="text-gray-500 font-sans text-xs">Not submitted</span>}
                  </p>
                </div>
                <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">GSTIN (Optional)</p>
                  <p className="font-mono text-base font-bold text-white tracking-wider">
                    {kyc.gstNumber || <span className="text-gray-500 font-sans text-xs">Not registered / exempt</span>}
                  </p>
                </div>
              </div>

              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" /> Payout Disbursement Method
              </h3>
              {kyc.payoutMethod ? (
                <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-lg text-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-gray-400 text-xs">Method</span>
                    <span className="font-bold text-white uppercase">{kyc.payoutMethod}</span>
                  </div>
                  {kyc.payoutMethod === "BANK_TRANSFER" && kyc.payoutDetails && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-500">Account Holder</p>
                        <p className="text-white font-medium">{kyc.payoutDetails.accountHolder || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bank Name</p>
                        <p className="text-white font-medium">{kyc.payoutDetails.bankName || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Account Number</p>
                        <p className="font-mono text-white">{kyc.payoutDetails.accountNumber || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">IFSC Code</p>
                        <p className="font-mono text-white">{kyc.payoutDetails.ifsc || "N/A"}</p>
                      </div>
                    </div>
                  )}
                  {kyc.payoutMethod === "UPI" && kyc.payoutDetails && (
                    <div className="text-xs">
                      <p className="text-gray-500">UPI ID</p>
                      <p className="font-mono text-white text-sm">{kyc.payoutDetails.upiId || "N/A"}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-lg text-center text-gray-500 text-xs">
                  No payout method configured yet by partner.
                </div>
              )}
            </div>
          </div>

          {/* Admin KYC Review Panel */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-white/10 rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Admin KYC Decision
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Approve or reject this partner's tax identifiers and bank account for commission payouts.
              </p>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Current Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      kyc.status === "VERIFIED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : kyc.status === "REJECTED"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}
                  >
                    {kyc.status}
                  </span>
                </div>
                {kyc.remarks && (
                  <p className="text-xs text-gray-400 mt-2 bg-[#0a0a0a] p-2.5 rounded border border-white/5">
                    "{kyc.remarks}"
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10">
                <label className="block text-xs text-gray-400">Review Remarks / Instructions</label>
                <textarea
                  rows={3}
                  value={kycRemarks}
                  onChange={(e) => setKycRemarks(e.target.value)}
                  placeholder="Enter remarks explaining approval or specific rejection reasons..."
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 resize-none"
                />

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setKycAction("approve");
                      handleKycReview();
                    }}
                    disabled={submittingKyc}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {submittingKyc && kycAction === "approve" ? "Processing..." : "Approve KYC"}
                  </button>
                  <button
                    onClick={() => {
                      setKycAction("reject");
                      handleKycReview();
                    }}
                    disabled={submittingKyc}
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {submittingKyc && kycAction === "reject" ? "Processing..." : "Reject KYC"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LEADS TAB */}
      {activeTab === "leads" && (
        <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Attributed Referral Leads</h3>
            <span className="text-xs text-gray-400">Total: {leads.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#0d0d0d] text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Lead Code</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">Service Interest</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No leads attributed to this partner yet.
                    </td>
                  </tr>
                ) : (
                  leads.map((l: any) => (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-red-400 font-semibold">{l.leadCode}</td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{l.name}</div>
                        <div className="text-xs text-gray-500">{l.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-300">{l.serviceInterest || "General Inquiry"}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {l.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {format(new Date(l.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PROJECTS TAB */}
      {activeTab === "projects" && (
        <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Referred Client Projects</h3>
            <span className="text-xs text-gray-400">Total: {projects.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#0d0d0d] text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium">Client</th>
                  <th className="px-6 py-3 font-medium">Service</th>
                  <th className="px-6 py-3 font-medium">Budget</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No client projects submitted yet.
                    </td>
                  </tr>
                ) : (
                  projects.map((p: any) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{p.projectName}</div>
                        <div className="font-mono text-xs text-red-400">{p.projectCode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-300">{p.clientName}</div>
                        <div className="text-xs text-gray-500">{p.clientEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-300">{p.requiredService}</td>
                      <td className="px-6 py-4 font-mono text-xs text-white">{p.projectBudget}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/crm/partner-projects/${p.id}`}
                          className="text-xs text-red-400 hover:text-white font-medium"
                        >
                          View Project →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CONTRACTS TAB */}
      {activeTab === "contracts" && (
        <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Client Partner Contracts</h3>
            <span className="text-xs text-gray-400">Total: {contracts.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#0d0d0d] text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Contract Title</th>
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No contracts generated for this partner's projects yet.
                    </td>
                  </tr>
                ) : (
                  contracts.map((c: any) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{c.title || "Standard Services Agreement"}</td>
                      <td className="px-6 py-4 text-xs text-gray-300">
                        {c.partnerProject?.projectName || "Linked Project"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {format(new Date(c.updatedAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. COMMISSIONS TAB */}
      {activeTab === "commissions" && (
        <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Commissions Ledger</h3>
            <span className="text-xs text-gray-400">Total Records: {commissions.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#0d0d0d] text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium">Project Value</th>
                  <th className="px-6 py-3 font-medium">Rate</th>
                  <th className="px-6 py-3 font-medium">Commission Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No commission records generated yet.
                    </td>
                  </tr>
                ) : (
                  commissions.map((c: any) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">
                        {c.partnerProject?.projectName || "Direct Project"}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-300">
                        ₹{(c.projectValue || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-300">{c.commissionRate}%</td>
                      <td className="px-6 py-4 font-mono text-sm font-bold text-[#C2A878]">
                        ₹{(c.commissionAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            c.status === "PAID"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : c.status === "ELIGIBLE"
                              ? "bg-[#C2A878]/10 text-[#C2A878] border border-[#C2A878]/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {format(new Date(c.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. INTERNAL NOTES TAB */}
      {activeTab === "notes" && (
        <div className="bg-[#111] border border-white/5 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-base font-semibold text-white">Internal Staff Notes</h3>
              <p className="text-xs text-gray-400">
                Confidential notes recorded by AXIVON team members. Never visible to the partner.
              </p>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-medium">
              Internal Only
            </span>
          </div>

          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Record account history, interview notes, or operational updates..."
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingNote || !newNote.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> {submittingNote ? "Saving..." : "Add Note"}
              </button>
            </div>
          </form>

          <div className="space-y-3 pt-2">
            {notes.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No internal notes logged for this partner yet.</p>
            ) : (
              notes.map((n: any) => (
                <div key={n.id} className="p-4 bg-[#0a0a0a] border border-white/5 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-semibold text-gray-200">{n.authorName}</span>
                    <span className="font-mono text-[11px] text-gray-500">
                      {n.createdAt ? format(new Date(n.createdAt), "MMM d, yyyy 'at' HH:mm") : ""}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{n.note}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 8. ACTIVITY LOG TAB */}
      {activeTab === "activity" && (
        <div className="bg-[#111] border border-white/5 rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">Partner Audit Trail</h3>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No audit records found.</p>
            ) : (
              auditLogs.map((log: any) => (
                <div key={log.id} className="p-3 bg-[#0a0a0a] border border-white/5 rounded-lg flex items-start justify-between text-xs">
                  <div>
                    <span className="font-mono text-red-400 font-semibold">{log.action}</span>
                    <p className="text-gray-400 text-[11px] mt-0.5">{log.resource}</p>
                  </div>
                  <span className="font-mono text-gray-500 text-[11px]">
                    {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ACCOUNT ACTION MODAL */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 p-6 rounded-xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">
              {actionModal === "resend_activation" && "Resend Account Activation Link"}
              {actionModal === "suspend" && "Suspend Partner Account"}
              {actionModal === "reactivate" && "Reactivate Partner Account"}
            </h3>

            {actionResult ? (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-300">
                {actionResult}
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {actionModal === "resend_activation" &&
                    `This will generate a fresh activation token and email it directly to ${user.email}.`}
                  {actionModal === "suspend" &&
                    "Suspending this account immediately blocks portal access and halts commission disbursements until reactivated."}
                  {actionModal === "reactivate" &&
                    "This restores full access to the broker portal and resumes active status."}
                </p>

                {(actionModal === "suspend" || actionModal === "reactivate") && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Reason (Optional)</label>
                    <textarea
                      rows={3}
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Add reason for audit record..."
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 resize-none"
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setActionModal(null);
                  setActionResult(null);
                }}
                className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                disabled={submittingAction}
              >
                Close
              </button>
              {!actionResult && (
                <button
                  onClick={handleAccountAction}
                  disabled={submittingAction}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    actionModal === "suspend"
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {submittingAction ? "Processing..." : "Confirm Action"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
