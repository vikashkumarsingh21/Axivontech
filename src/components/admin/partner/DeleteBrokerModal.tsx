"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Trash2,
  X,
  ShieldOff,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  FileText,
  Briefcase,
  Users,
  DollarSign,
  FileCheck,
  Lock,
} from "lucide-react";
import { toast } from "@/lib/notifications/toast";

interface DeleteBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  broker: any | null;
  onSuccess: () => void;
}

export function DeleteBrokerModal({
  isOpen,
  onClose,
  broker,
  onSuccess,
}: DeleteBrokerModalProps) {
  const [activeTab, setActiveTab] = useState<"DEACTIVATE" | "DELETE">("DEACTIVATE");
  const [loadingDependencies, setLoadingDependencies] = useState(false);
  const [dependencyData, setDependencyData] = useState<any | null>(null);

  const [deactivateReason, setDeactivateReason] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [confirmationWord, setConfirmationWord] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && broker) {
      setActiveTab("DEACTIVATE");
      setDeactivateReason("");
      setDeleteReason("");
      setConfirmationWord("");
      setError(null);
      fetchDependencies();
    }
  }, [isOpen, broker]);

  const fetchDependencies = async () => {
    if (!broker) return;
    try {
      setLoadingDependencies(true);
      const res = await fetch(`/api/v1/admin/brokers/${broker.id}/dependency-check`);
      const data = await res.json();
      if (res.ok && data.success) {
        setDependencyData(data.data);
      } else {
        throw new Error(data.message || "Failed to check account dependencies.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to check dependencies.");
    } finally {
      setLoadingDependencies(false);
    }
  };

  if (!isOpen || !broker) return null;

  const counts = dependencyData?.counts || {
    leads: 0,
    projects: 0,
    commissions: 0,
    contracts: 0,
    documents: 0,
    payments: 0,
    total: 0,
  };

  const hasDependencies = counts.total > 0;
  const canPermanentlyDelete = dependencyData?.canPermanentlyDelete ?? false;

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deactivateReason.trim() || deactivateReason.trim().length < 5) {
      setError("Please provide a valid deactivation reason (min 5 characters).");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(`/api/v1/admin/brokers/${broker.id}/deactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: deactivateReason.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to deactivate broker.");
      }

      toast.success(data.message || "Broker account deactivated successfully.");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermanentDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPermanentlyDelete) {
      setError("Permanent deletion is strictly blocked because this broker has associated business records.");
      return;
    }
    if (!deleteReason.trim() || deleteReason.trim().length < 5) {
      setError("Please provide a valid deletion reason (min 5 characters).");
      return;
    }
    if (confirmationWord !== "DELETE") {
      setError("Please type DELETE to confirm permanent removal.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(`/api/v1/admin/brokers/${broker.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: deleteReason.trim(),
          confirmationWord: "DELETE",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to permanently delete broker.");
      }

      toast.success(data.message || "Broker account permanently deleted.");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0E1116] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#151A21]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Deactivate or Delete Broker</h3>
              <p className="text-xs text-gray-400">
                Partner: <span className="text-gray-200 font-medium">{broker.name}</span>{" "}
                <span className="font-mono text-gray-500 text-[11px]">({broker.email})</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Broker Dependency Summary Grid */}
          <div className="bg-[#151A21] border border-white/5 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Associated Business Records Audit
              </span>
              {loadingDependencies ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Auditing records...
                </div>
              ) : (
                <span
                  className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    hasDependencies
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {hasDependencies ? `${counts.total} Records Found` : "Zero Dependencies"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="bg-[#0B0D10] p-2.5 rounded border border-white/5 flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> Leads
                </span>
                <span className="font-semibold text-gray-200">{counts.leads}</span>
              </div>
              <div className="bg-[#0B0D10] p-2.5 rounded border border-white/5 flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Projects
                </span>
                <span className="font-semibold text-gray-200">{counts.projects}</span>
              </div>
              <div className="bg-[#0B0D10] p-2.5 rounded border border-white/5 flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-purple-400" /> Contracts
                </span>
                <span className="font-semibold text-gray-200">{counts.contracts}</span>
              </div>
              <div className="bg-[#0B0D10] p-2.5 rounded border border-white/5 flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-orange-400" /> Documents
                </span>
                <span className="font-semibold text-gray-200">{counts.documents}</span>
              </div>
              <div className="bg-[#0B0D10] p-2.5 rounded border border-white/5 flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Commissions
                </span>
                <span className="font-semibold text-gray-200">{counts.commissions}</span>
              </div>
              <div className="bg-[#0B0D10] p-2.5 rounded border border-white/5 flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Payouts
                </span>
                <span className="font-semibold text-gray-200">{counts.payments}</span>
              </div>
            </div>
          </div>

          {/* Tab Selector: Option A vs Option B */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#151A21] rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => setActiveTab("DEACTIVATE")}
              className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === "DEACTIVATE"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ShieldOff className="w-3.5 h-3.5" /> Option A: Deactivate (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("DELETE")}
              className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === "DELETE"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" /> Option B: Permanent Delete
            </button>
          </div>

          {/* TAB 1: OPTION A — DEACTIVATE & KEEP HISTORY */}
          {activeTab === "DEACTIVATE" && (
            <form onSubmit={handleDeactivate} className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3.5 text-xs text-amber-200/90 space-y-2">
                <span className="font-semibold text-amber-300 block">
                  Safe Deactivation &amp; Full History Preservation:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-amber-200/80">
                  <li>Broker login is immediately disabled and active sessions revoked.</li>
                  <li>Referral code is deactivated (blocks new incoming lead attribution).</li>
                  <li>
                    All existing leads ({counts.leads}), projects ({counts.projects}), contracts,
                    commissions, and audit logs are <span className="font-semibold text-white">100% retained</span>.
                  </li>
                  <li>Account can be reactivated anytime if business relationship resumes.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Deactivation Reason <span className="text-amber-400">*</span>
                </label>
                <textarea
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  placeholder="e.g. Partner requested pause, contract expired, inactivity..."
                  rows={3}
                  required
                  className="w-full bg-[#151A21] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || deactivateReason.trim().length < 5}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-amber-950/40"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deactivating...
                    </>
                  ) : (
                    <>
                      <ShieldOff className="w-3.5 h-3.5" /> Deactivate Broker (Keep History)
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: OPTION B — PERMANENT DELETION */}
          {activeTab === "DELETE" && (
            <form onSubmit={handlePermanentDelete} className="space-y-4">
              {!canPermanentlyDelete ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-red-400 font-semibold">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Permanent Deletion Strictly Blocked</span>
                  </div>
                  <p className="text-red-200/90 leading-relaxed">
                    This broker account has <span className="font-semibold text-white">{counts.total}</span> associated
                    business, CRM, project, or financial records. In accordance with Axivon governance and
                    financial compliance policies, accounts with historical transactions cannot be destroyed.
                  </p>
                  <p className="text-gray-300">
                    Please use <span className="font-semibold text-amber-300">Option A (Deactivate &amp; Keep History)</span> to
                    disable this account safely without breaking company financial records.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("DEACTIVATE")}
                    className="mt-2 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-xs font-semibold transition-colors"
                  >
                    Switch to Option A (Deactivate)
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3.5 text-xs text-red-200/90 space-y-2">
                    <span className="font-semibold text-red-400 block">
                      Strict Zero-Dependency Verified:
                    </span>
                    <p className="leading-relaxed text-gray-300">
                      This broker has 0 leads, 0 projects, 0 contracts, and 0 commissions. Permanent deletion
                      will remove credentials, user roles, and partner profile entirely.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-300">
                      Reason for Permanent Deletion <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="e.g. Created in error, test account, duplicate registration..."
                      rows={2}
                      required
                      className="w-full bg-[#151A21] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-300">
                      Type <span className="font-mono text-red-400 font-bold">DELETE</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmationWord}
                      onChange={(e) => setConfirmationWord(e.target.value)}
                      placeholder="DELETE"
                      className="w-full bg-[#151A21] border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        deleteReason.trim().length < 5 ||
                        confirmationWord !== "DELETE"
                      }
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-red-950/40"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" /> Permanently Delete Account
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
