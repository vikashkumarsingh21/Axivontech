"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Trash2,
  X,
  ShieldOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/lib/notifications/toast";

interface BulkBrokerActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  brokers: any[];
  onSuccess: () => void;
}

export function BulkBrokerActionModal({
  isOpen,
  onClose,
  selectedIds,
  brokers,
  onSuccess,
}: BulkBrokerActionModalProps) {
  const [action, setAction] = useState<"DEACTIVATE" | "DELETE">("DEACTIVATE");
  const [reason, setReason] = useState("");
  const [confirmationWord, setConfirmationWord] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<any | null>(null);

  if (!isOpen || selectedIds.length === 0) return null;

  const selectedBrokers = brokers.filter((b) => selectedIds.includes(b.id));

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError("Please provide a valid reason (min 5 characters).");
      return;
    }
    if (action === "DELETE" && confirmationWord !== "DELETE") {
      setError("Please type DELETE to confirm bulk deletion.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch("/api/v1/admin/brokers/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          brokerIds: selectedIds,
          reason: reason.trim(),
          confirmationWord: action === "DELETE" ? "DELETE" : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to execute bulk broker action.");
      }

      setResults(data);
      toast.success(
        action === "DEACTIVATE"
          ? `Bulk deactivation completed: ${data.succeededCount} deactivated.`
          : `Bulk deletion completed: ${data.succeededCount} deleted, ${data.skippedCount} skipped.`
      );
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during bulk operation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0E1116] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#151A21]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg border ${
                action === "DEACTIVATE"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {action === "DEACTIVATE" ? (
                <ShieldOff className="w-5 h-5" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Bulk Partner Action</h3>
              <p className="text-xs text-gray-400">
                Selected: <span className="font-semibold text-white">{selectedIds.length}</span> partners
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {results ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#151A21] border border-white/10 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bulk Action Complete</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-[#0B0D10] rounded border border-white/5">
                    <span className="text-gray-400 block text-[11px]">Processed</span>
                    <span className="text-sm font-bold text-gray-200">{results.totalRequested}</span>
                  </div>
                  <div className="p-2 bg-[#0B0D10] rounded border border-emerald-500/20">
                    <span className="text-emerald-400 block text-[11px]">Succeeded</span>
                    <span className="text-sm font-bold text-emerald-400">{results.succeededCount}</span>
                  </div>
                  <div className="p-2 bg-[#0B0D10] rounded border border-amber-500/20">
                    <span className="text-amber-400 block text-[11px]">Skipped</span>
                    <span className="text-sm font-bold text-amber-400">{results.skippedCount}</span>
                  </div>
                </div>

                {/* Per-item Breakdown */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pt-2 text-xs">
                  {results.results?.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 bg-[#0B0D10] rounded border border-white/5 flex items-start justify-between gap-2"
                    >
                      <div className="truncate">
                        <span className="font-mono text-[11px] text-gray-400">{r.brokerId}</span>
                        <p className="text-[11px] text-gray-300 truncate">{r.message}</p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${
                          r.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              {/* Action Choice Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#151A21] rounded-lg border border-white/5">
                <button
                  type="button"
                  onClick={() => setAction("DEACTIVATE")}
                  className={`py-2 px-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    action === "DEACTIVATE"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <ShieldOff className="w-3.5 h-3.5" /> Bulk Deactivate
                </button>
                <button
                  type="button"
                  onClick={() => setAction("DELETE")}
                  className={`py-2 px-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    action === "DELETE"
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Bulk Delete
                </button>
              </div>

              {/* Explanatory Banner */}
              {action === "DEACTIVATE" ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200/90 leading-relaxed">
                  <span className="font-semibold text-amber-300 block mb-1">
                    Option A (Safe Deactivation):
                  </span>
                  Suspends logins, revokes active sessions, and deactivates referral codes. All leads,
                  projects, commissions, documents, and audit logs are safely retained.
                </div>
              ) : (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-200/90 leading-relaxed">
                  <span className="font-semibold text-red-400 block mb-1">
                    Zero-Dependency Restriction:
                  </span>
                  Bulk delete will ONLY delete brokers that have zero leads, projects, contracts, documents,
                  or commissions. Any broker with existing business records will be{" "}
                  <span className="font-semibold text-white">automatically skipped</span>.
                </div>
              )}

              {/* List of Selected Brokers */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">Selected Partners:</label>
                <div className="max-h-32 overflow-y-auto bg-[#151A21] border border-white/5 rounded-lg p-2.5 divide-y divide-white/5 space-y-1">
                  {selectedBrokers.map((b) => (
                    <div key={b.id} className="pt-1 first:pt-0 flex items-center justify-between text-xs">
                      <span className="text-gray-200 font-medium truncate max-w-[200px]">
                        {b.name}
                      </span>
                      <span className="text-gray-500 font-mono text-[11px]">{b.email}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Reason <span className="text-amber-400">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Reason for bulk ${action.toLowerCase()}...`}
                  rows={2}
                  required
                  className="w-full bg-[#151A21] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              {/* If DELETE, require confirmation word */}
              {action === "DELETE" && (
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
              )}

              {/* Actions */}
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
                    reason.trim().length < 5 ||
                    (action === "DELETE" && confirmationWord !== "DELETE")
                  }
                  className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    action === "DEACTIVATE"
                      ? "bg-amber-600 hover:bg-amber-500 shadow-amber-950/40"
                      : "bg-red-600 hover:bg-red-500 shadow-red-950/40"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                    </>
                  ) : action === "DEACTIVATE" ? (
                    <>
                      <ShieldOff className="w-3.5 h-3.5" /> Deactivate {selectedIds.length} Partners
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" /> Bulk Delete Qualified
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
