"use client";

import React, { useState } from "react";
import { Lock, KeyRound, CheckCircle2, AlertTriangle, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export function ExecutiveSecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password validation checks
  const hasMinLength = newPassword.length >= 10;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isFormValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol && passwordsMatch && currentPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!passwordsMatch) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password cannot be the same as your current password.");
      return;
    }

    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      setError("New password does not meet the executive security policy requirements.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || data.error || "Failed to change password. Please verify your current password.");
        setLoading(false);
        return;
      }

      setSuccess("Your executive password has been updated securely. All other active sessions have been invalidated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError("An unexpected network error occurred while updating your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 sm:p-7 space-y-6">
      {/* Section Header */}
      <div className="flex items-start justify-between border-b border-[#29313B] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#D6B779]/10 text-[#D6B779] border border-[#D6B779]/20">
              <KeyRound className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-[#F3F5F7]">Executive Password &amp; Credentials</h2>
          </div>
          <p className="text-xs text-[#7E8997] mt-1">
            Update your personal executive login credentials. Each executive account maintains isolated authentication.
            Neither executive can view or alter the other's credentials.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Bcrypt Hash Encrypted</span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-xs text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-xs text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Password Form */}
      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-[#A7B0BC] mb-1.5">
            Current Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              required
              className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-xs text-[#F3F5F7] placeholder-[#566171] focus:outline-hidden focus:border-[#D6B779] focus:ring-1 focus:ring-[#D6B779] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#566171] hover:text-[#A7B0BC]"
              aria-label={showCurrent ? "Hide current password" : "Show current password"}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-[#A7B0BC] mb-1.5">
            New Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter a new strong password (minimum 10 characters)"
              required
              className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-xs text-[#F3F5F7] placeholder-[#566171] focus:outline-hidden focus:border-[#D6B779] focus:ring-1 focus:ring-[#D6B779] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#566171] hover:text-[#A7B0BC]"
              aria-label={showNew ? "Hide new password" : "Show new password"}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="bg-[#10151B] border border-[#29313B] rounded-xl p-3.5 space-y-2">
          <span className="text-[11px] font-semibold text-[#7E8997] block">Password Security Requirements:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400" : "text-[#566171]"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>At least 10 characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-400" : "text-[#566171]"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>One uppercase letter</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-400" : "text-[#566171]"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>One lowercase letter</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400" : "text-[#566171]"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>One number (0-9)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasSymbol ? "text-emerald-400" : "text-[#566171]"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>One special character (!@#$%...)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-400" : "text-[#566171]"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Passwords match</span>
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-[#A7B0BC] mb-1.5">
            Confirm New Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-xs text-[#F3F5F7] placeholder-[#566171] focus:outline-hidden focus:border-[#D6B779] focus:ring-1 focus:ring-[#D6B779] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#566171] hover:text-[#A7B0BC]"
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D6B779] hover:bg-[#c2a466] disabled:opacity-40 disabled:cursor-not-allowed text-[#0E1116] text-xs font-bold transition-all shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying &amp; Updating...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Update Executive Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
