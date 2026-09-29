"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

function PartnerActivationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing activation token.");
    }
  }, [token]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await fetch("/api/v1/public/business-partner/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to activate account");
      }

      setSuccess(true);
      setPartnerDetails(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (success && partnerDetails) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111] p-8 rounded-sm border border-white/10 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Account Activated</h1>
          <p className="text-gray-400 mb-6">Welcome to the AXIVON Partner Program!</p>
          
          <div className="bg-[#0a0a0a] p-4 rounded-sm border border-white/5 mb-6 text-left">
            <p className="text-sm text-gray-500 mb-1">Partner ID</p>
            <p className="text-lg font-mono text-[#e8a064] mb-4">{partnerDetails.partnerId}</p>
            
            <p className="text-sm text-gray-500 mb-1">Referral Code</p>
            <div className="flex items-center justify-between bg-[#1a1a1a] p-2 rounded border border-white/10 mb-4">
              <p className="font-mono text-white text-sm">{partnerDetails.referralCode}</p>
              <button 
                onClick={() => navigator.clipboard.writeText(partnerDetails.referralCode)}
                className="text-xs text-[#e8a064] hover:text-white"
              >
                Copy
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-1">Referral Link</p>
            <div className="flex items-center justify-between bg-[#1a1a1a] p-2 rounded border border-white/10">
              <p className="font-mono text-white text-xs truncate max-w-[200px] sm:max-w-xs">
                {typeof window !== "undefined" ? `${window.location.origin}/project/start/${partnerDetails.referralCode}` : ""}
              </p>
              <button 
                onClick={() => navigator.clipboard.writeText(typeof window !== "undefined" ? `${window.location.origin}/project/start/${partnerDetails.referralCode}` : "")}
                className="text-xs text-[#e8a064] hover:text-white shrink-0 ml-2"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="text-left mb-6">
            <p className="text-sm font-semibold text-white mb-2">Onboarding Checklist:</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Partner account activated</li>
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Partner identity generated</li>
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Referral code generated</li>
              <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Referral link generated</li>
            </ul>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-sm">
              <p className="text-xs text-blue-400 font-medium mb-1">Next Steps:</p>
              <ul className="text-xs text-blue-300 space-y-1 list-disc pl-4">
                <li>Start referring potential clients</li>
                <li>Use your referral link for onboarding projects</li>
                <li>Track opportunities from your Partner Dashboard</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="w-full bg-[#e8a064] text-black font-semibold py-3 rounded-sm hover:bg-white transition-colors"
          >
            Go to Partner Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Activate Account</h1>
          <p className="text-gray-400">Set your password to activate your Partner Account</p>
        </div>

        <div className="bg-[#111] p-6 rounded-sm border border-white/10 shadow-2xl">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-[#e8a064]"
                placeholder="Minimum 8 characters"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-[#e8a064]"
                placeholder="Confirm your new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-[#e8a064] text-black font-semibold py-3 mt-4 rounded-sm hover:bg-white transition-colors disabled:opacity-50"
            >
              {loading ? "Activating..." : "Activate & Set Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PartnerActivationPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 text-gray-500">Loading...</div>}>
      <PartnerActivationContent />
    </React.Suspense>
  );
}
