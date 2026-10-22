"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Lock, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

function ClientActivationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Activation token is missing. Please use the secure activation link sent to your work email.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Activation token is missing. Please verify your activation link.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/client/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to activate client account. The token may be expired or already used.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during account activation.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Account Activated</h1>
          <p className="text-sm text-gray-400 mb-6">
            Your AXIVON ONE Client Portal account is now active and ready. You can sign in using your work email and newly set password.
          </p>

          <div className="bg-[#161616] border border-white/5 rounded-xl p-4 text-left text-xs text-gray-400 space-y-2 mb-8">
            <div className="flex items-center gap-2 text-white font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Client Portal Access Granted</span>
            </div>
            <p>• Track milestones, deliverable sign-offs, and project progression.</p>
            <p>• Access verified deliverables, UAT testing environments, and project files.</p>
            <p>• Review and manage invoices and technical project reports.</p>
          </div>

          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold text-sm transition-colors"
          >
            Sign In to AXIVON ONE
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Client Account Activation
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Set Up Your Account</h1>
          <p className="text-xs text-gray-400">
            Welcome to the AXIVON ONE Client Portal. Please choose a secure password to activate your workspace access.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Activation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              New Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !token}
                placeholder="At least 8 characters"
                className="w-full h-11 px-3.5 pr-10 bg-[#161616] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Confirm Password <span className="text-red-400">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || !token}
              placeholder="Re-enter your password"
              className="w-full h-11 px-3.5 bg-[#161616] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-[#04130E] font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Activating Workspace...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Activate & Enter Portal
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500">
            Already activated?{" "}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Sign In to AXIVON ONE
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ClientActivationPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-500 text-sm">
          Loading activation portal...
        </div>
      }
    >
      <ClientActivationContent />
    </React.Suspense>
  );
}
