"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  MailCheck,
} from "lucide-react";
import { parseApiResponse, getErrorMessage } from "@/lib/errors/client";
import { toast } from "@/lib/notifications/toast";

export default function VerifyEmailChangePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{
    valid: boolean;
    newEmail?: string;
    userName?: string;
    error?: string;
  } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Validate token on initial load
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No verification token was provided in the URL.");
      return;
    }

    fetch(`/api/v1/auth/email-change/verify?token=${encodeURIComponent(token)}`)
      .then((res) => parseApiResponse(res))
      .then((parsed) => {
        const data = parsed.data || parsed.raw;
        if (!parsed.ok || !data?.valid) {
          const msg = parsed.errorMessage || data?.error || "This verification link is invalid or has expired.";
          setError(msg);
          setTokenInfo({ valid: false, error: msg });
        } else {
          setTokenInfo({
            valid: true,
            newEmail: data.newEmail,
            userName: data.userName,
          });
        }
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // 2. Perform verification confirmation
  const handleConfirmVerification = async () => {
    if (!token) return;
    setVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/email-change/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const parsed = await parseApiResponse(res);
      if (!parsed.ok) {
        const msg = parsed.errorMessage || "Failed to verify email change.";
        setError(msg);
        toast.error(msg);
        return;
      }

      const successMsg = parsed.data?.message || parsed.raw?.message || "Email address updated successfully!";
      setSuccess(successMsg);
      toast.success(successMsg);
    } catch (err: unknown) {
      const cleanErr = getErrorMessage(err);
      setError(cleanErr);
      toast.error(cleanErr);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F5F7] flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <Image
            src="/assets/logo/logo-full.png"
            alt="Axivon Technologies"
            width={160}
            height={42}
            className="h-8 w-auto brightness-0 invert opacity-90"
            priority
          />
        </div>
        <p className="text-xs font-mono text-[#7E8997] tracking-wider uppercase">
          Identity &amp; Account Protection System
        </p>
      </div>

      {/* Main Verification Card */}
      <div className="w-full max-w-md bg-[#151A21] border border-[#29313B] rounded-2xl p-6 sm:p-8 shadow-xl">
        {loading ? (
          <div className="text-center py-8 space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <h2 className="text-base font-semibold text-[#F3F5F7]">Validating Security Token</h2>
            <p className="text-xs text-[#7E8997]">Please wait while we verify your change request...</p>
          </div>
        ) : success ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F3F5F7]">Email Change Verified</h2>
              <p className="text-xs text-emerald-400 mt-1 font-medium">{success}</p>
            </div>
            <div className="p-3.5 bg-[#10151B] border border-[#29313B] rounded-xl text-left text-xs text-[#7E8997] space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Account Updated</span>
              </div>
              <p>Your new email is now active for account notifications and future sign-in sessions.</p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-xs"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F3F5F7]">Verification Failed</h2>
              <p className="text-xs text-red-400 mt-1 leading-relaxed">{error}</p>
            </div>
            <div className="p-3.5 bg-[#10151B] border border-[#29313B] rounded-xl text-left text-xs text-[#7E8997] space-y-1">
              <p className="font-semibold text-[#A7B0BC]">Common causes:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>The link has exceeded the 60-minute expiration window.</li>
                <li>The verification link was already used.</li>
                <li>A newer email change request superseded this one.</li>
              </ul>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#1B222B] hover:bg-[#202833] text-[#F3F5F7] border border-[#29313B] px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          /* Ready to confirm */
          <div className="text-center py-2 space-y-5">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <MailCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F3F5F7]">Confirm Email Update</h2>
              <p className="text-xs text-[#7E8997] mt-1">
                Hi <strong>{tokenInfo?.userName || "there"}</strong>, please confirm that you want to set your primary email to:
              </p>
            </div>

            <div className="p-4 bg-[#10151B] border border-[#29313B] rounded-xl">
              <span className="text-xs font-mono text-[#566171] uppercase tracking-wider block mb-1">
                New Email Address
              </span>
              <span className="font-mono text-sm text-emerald-400 font-bold break-all">
                {tokenInfo?.newEmail}
              </span>
            </div>

            <div className="p-3.5 bg-[#10151B] border border-amber-500/20 rounded-xl text-left text-xs text-amber-300/80 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Security Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Confirming this action will immediately change your primary account email. A security notification will be sent to your old address.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <button
                onClick={handleConfirmVerification}
                disabled={verifying}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-[#04130E] font-bold px-4 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm &amp; Update Email Address</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-[#566171]">
        &copy; {new Date().getFullYear()} Axivon Technologies. Protected by Axivon ONE Identity Protocol.
      </div>
    </div>
  );
}
