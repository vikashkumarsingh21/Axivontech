"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Trash2,
  X,
  ExternalLink,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "@/lib/notifications/toast";

interface DeleteApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any | null;
  onSuccess: () => void;
}

export function DeleteApplicationModal({
  isOpen,
  onClose,
  application,
  onSuccess,
}: DeleteApplicationModalProps) {
  const [reason, setReason] = useState("");
  const [revokeInvite, setRevokeInvite] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const isBrokerLinked =
    Boolean(application.linkedUser) ||
    application.accountStatus === "ACTIVE" ||
    application.accountStatus === "PASSWORD_CHANGE_REQUIRED" ||
    application.accountStatus === "DISABLED";

  const isPendingActivation = application.accountStatus === "CREATION_PENDING";

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError("Please provide a valid deletion reason (at least 5 characters).");
      return;
    }
    if (!confirmed) {
      setError("Please confirm your intention to delete this application.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(
        `/api/v1/admin/business-partner/applications/${application.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: reason.trim(),
            revokePendingInvite: isPendingActivation ? revokeInvite : false,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to delete application.");
      }

      toast.success(data.message || "Application deleted successfully.");
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
      <div className="relative w-full max-w-xl bg-[#0E1116] border border-red-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Delete Partner Application</h3>
              <p className="text-xs text-gray-400">
                Application: <span className="font-mono text-red-300">{application.applicationId}</span>
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
        <form onSubmit={handleDelete} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Application Details Summary */}
          <div className="bg-[#151A21] border border-white/5 rounded-lg p-4 space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 block">Applicant Name:</span>
                <span className="text-gray-200 font-medium text-sm">{application.fullName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Email Address:</span>
                <span className="text-gray-200 font-mono text-xs">{application.email}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Status:</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-white/5 text-gray-300 border border-white/10">
                  {application.status}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Submission Date:</span>
                <span className="text-gray-300">
                  {application.createdAt ? format(new Date(application.createdAt), "PPP") : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Broker Protection Notice */}
          {isBrokerLinked ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-medium text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Associated Broker Account Detected</span>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                This application is linked to an existing business partner account. Deleting this
                application will <span className="font-semibold text-white">NOT</span> delete the broker&apos;s
                login account, client projects, leads, commissions, or contracts.
              </p>
              <div className="pt-1">
                <Link
                  href={
                    application.linkedUser?.brokerProfileId
                      ? `/admin/crm/brokers/${application.linkedUser.brokerProfileId}`
                      : `/admin/crm/brokers`
                  }
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                >
                  View Associated Broker Profile <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : isPendingActivation ? (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-medium text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Pending Account Invitation</span>
              </div>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                An activation invite was issued for this applicant, but account registration has not been
                completed.
              </p>
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={revokeInvite}
                  onChange={(e) => setRevokeInvite(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                />
                <span>Revoke pending invitation token and onboarding access</span>
              </label>
            </div>
          ) : (
            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-xs text-gray-400">
              <span className="text-red-400 font-medium">Permanent Action:</span> Deleting this application
              will remove the submission history and associated meeting records.
            </div>
          )}

          {/* Deletion Reason */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-300">
              Reason for Deletion <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Duplicate submission, applicant requested withdrawal, spam test entry..."
              rows={3}
              required
              className="w-full bg-[#151A21] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 resize-none"
            />
            <p className="text-[11px] text-gray-500">
              This reason will be recorded in the security audit logs for compliance tracking.
            </p>
          </div>

          {/* Explicit Confirmation Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-white/5 text-red-500 focus:ring-0"
              />
              <span>
                I understand this application record will be permanently deleted and cannot be undone.
              </span>
            </label>
          </div>

          {/* Action Footer */}
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
                  <Trash2 className="w-3.5 h-3.5" /> Permanently Delete Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
