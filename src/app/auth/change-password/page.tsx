"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Eye, EyeOff, Check, X, ArrowRight, Loader2, LogOut } from "lucide-react";
import { parseApiResponse, getErrorMessage } from "@/lib/errors/client";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Live Password Validation
  const hasMinLength = newPassword.length >= 10;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const isDifferent = currentPassword.length > 0 && newPassword.length > 0 ? currentPassword !== newPassword : true;
  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 ? newPassword === confirmPassword : true;

  const isFormValid =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSymbol &&
    isDifferent &&
    newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setError("");

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

      const parsed = await parseApiResponse(res);

      if (!parsed.ok) {
        setError(parsed.errorMessage || "Failed to update password. Please check your credentials.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(parsed.data?.redirectUrl || "/broker/onboarding");
      }, 1200);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#C2A878] selection:text-[#0a0a0a]">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-lg w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C2A878]/10 border border-[#C2A878]/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#C2A878]" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">Axivon Technologies</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto my-8 bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C2A878] via-emerald-500 to-[#C2A878]" />

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C2A878]/10 border border-[#C2A878]/20 text-[#C2A878] text-[11px] font-semibold mb-3">
            <Lock className="w-3 h-3" /> Security Requirement
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Set Your Permanent Password</h1>
          <p className="text-gray-400 text-xs leading-relaxed">
            For your security, you must replace the temporary password issued for your partner account before continuing to the platform.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">Password Updated!</h2>
            <p className="text-xs text-gray-300">Redirecting to your partner onboarding workspace...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Current / Temporary Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter the password provided by admin"
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C2A878]/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 10 characters"
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C2A878]/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Rules Checklist */}
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 text-[11px]">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400" : "text-gray-500"}`}>
                {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>At least 10 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpper && hasLower ? "text-emerald-400" : "text-gray-500"}`}>
                {hasUpper && hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>Uppercase and lowercase letters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber && hasSymbol ? "text-emerald-400" : "text-gray-500"}`}>
                {hasNumber && hasSymbol ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>At least one number & one symbol (!@#$%^&*)</span>
              </div>
              {currentPassword && newPassword && (
                <div className={`flex items-center gap-1.5 ${isDifferent ? "text-emerald-400" : "text-red-400"}`}>
                  {isDifferent ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Cannot reuse temporary password</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your new password"
                  className={`w-full bg-[#18181b] border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none pr-10 ${
                    confirmPassword && !passwordsMatch
                      ? "border-red-500/50"
                      : "border-white/10 focus:border-[#C2A878]/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-[11px] text-red-400 mt-1">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C2A878] to-[#b39564] hover:opacity-95 disabled:opacity-40 text-black font-semibold text-sm transition-all shadow-lg shadow-[#C2A878]/20 flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving New Password...
                </>
              ) : (
                <>
                  <span>Save Password &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Axivon Technologies. All rights reserved.
      </div>
    </div>
  );
}
