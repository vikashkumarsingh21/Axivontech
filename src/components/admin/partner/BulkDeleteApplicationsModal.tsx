"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/lib/notifications/toast";

interface BulkDeleteApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  applications: any[];
  onSuccess: () => void;
}

export function BulkDeleteApplicationsModal({
  isOpen,
  onClose,
  selectedIds,
  applications,
  onSuccess,
}: BulkDeleteApplicationsModalProps) {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || selectedIds.length === 0) return null;

  const selectedItems = applications.filter((app) => selectedIds.includes(app.id));

  const handleBulkDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError("Please provide a valid deletion reason (at least 5 characters).");
      return;
    }
    if (!confirmed) {
      setError("Please confirm your intention to delete the selected applications.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch("/api/v1/admin/business-partner/applications/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: selectedIds,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to bulk delete applications.");
      }

      toast.success(
        `Successfully deleted ${data.deletedCount} application(s). Linked broker accounts remain preserved.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during bulk deletion.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0E1116] border border-red-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Bulk Delete Applications</h3>
              <p className="text-xs text-gray-400">
                Selected: <span className="font-semibold text-red-300">{selectedIds.length}</span> application(s)
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
        <form onSubmit={handleBulkDelete} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200/90 leading-relaxed">
            <span className="font-semibold text-amber-300 block mb-1">Important Safety Notice:</span>
            Deleting these partner applications will remove application logs and scheduled meetings. If any
            applicant already has an active Broker Account, their account and business records will remain safe
            and intact.
          </div>

          {/* List of Applications to be deleted */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-300">
              Applications to be removed:
            </label>
            <div className="max-h-36 overflow-y-auto bg-[#151A21] border border-white/5 rounded-lg p-2.5 divide-y divide-white/5 space-y-1">
              {selectedItems.map((app) => (
                <div key={app.id} className="pt-1 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-200 font-medium">{app.fullName}</span>
                    <span className="text-gray-500 font-mono text-[11px] ml-2">({app.applicationId})</span>
                  </div>
                  <span className="text-gray-400 text-[11px]">{app.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deletion Reason */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-300">
              Reason for Bulk Deletion <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Bulk cleanup of outdated spam or rejected submissions..."
              rows={3}
              required
              className="w-full bg-[#151A21] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 resize-none"
            />
          </div>

          {/* Confirmation */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-white/5 text-red-500 focus:ring-0"
              />
              <span>
                I confirm that I want to permanently delete these {selectedIds.length} application records.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
              disabled={submitting || !confirmed || reason.trim().length < 5}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-red-950/40"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" /> Delete {selectedIds.length} Application(s)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
