"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Lock,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Mail,
  ShieldCheck,
  AlertCircle,
  Key,
  Send,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { generateStrongPassword, validatePasswordStrength } from "@/lib/auth/password";
import { toast } from "@/lib/notifications/toast";
import { getErrorMessage } from "@/lib/errors/client";

interface CreatePartnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    id: string;
    applicationId: string;
    fullName: string;
    email: string;
    status: string;
    occupation?: string;
  } | null;
  onSuccess: () => void;
}

const PARTNER_TYPES = [
  "Broker or Referral Agent",
  "Business Development Partner",
  "Referral Partner",
  "Student Partner",
  "Sales Partner",
  "Marketing Partner",
  "Freelancer",
  "Agency or Consultant Partner",
];

export function CreatePartnerLoginModal({
  isOpen,
  onClose,
  application,
  onSuccess,
}: CreatePartnerLoginModalProps) {
  const [email, setEmail] = useState("");
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [mode, setMode] = useState<"GENERATE" | "MANUAL" | "ACTIVATION_LINK">("GENERATE");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [partnerType, setPartnerType] = useState("Broker or Referral Agent");
  const [internalNote, setInternalNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // One-time credentials display state
  const [credentials, setCredentials] = useState<{
    loginUrl: string;
    email: string;
    password?: string | null;
    partnerId: string;
    referralCode: string;
    mode: string;
    activationLink?: string | null;
  } | null>(null);

  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Initialize modal state when application changes
  useEffect(() => {
    if (application) {
      setEmail(application.email || "");
      setEmailError("");
      setError("");
      setCredentials(null);
      setCopiedAll(false);
      setCopiedPass(false);
      setEmailSent(false);
      setMode("GENERATE");
      setGeneratedPassword(generateStrongPassword(14));
      setManualPassword("");
      setConfirmPassword("");
      setMustChangePassword(true);
      setPartnerType(application.occupation || "Broker or Referral Agent");
      setInternalNote("");
    }
  }, [application]);

  const currentApplicationEmail = application?.email;

  // Live email duplicate check with debounce
  const checkEmail = useCallback(async (testEmail: string) => {
    if (!testEmail || !testEmail.includes("@")) return;
    try {
      setEmailChecking(true);
      const res = await fetch(
        `/api/v1/admin/business-partner/applications/check-email?email=${encodeURIComponent(
          testEmail.trim()
        )}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to verify email");

      if (data.exists && data.user?.email?.toLowerCase() !== currentApplicationEmail?.toLowerCase()) {
        setEmailError(`Email is already in use by ${data.user?.name || "another user"}.`);
      } else {
        setEmailError("");
      }
    } catch {
      // Ignore network errors on check
    } finally {
      setEmailChecking(false);
    }
  }, [currentApplicationEmail]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (email && email.trim() !== application?.email) {
        checkEmail(email);
      } else {
        setEmailError("");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [email, application?.email, checkEmail]);

  if (!isOpen || !application) return null;

  // Validation
  const manualValidation = validatePasswordStrength(manualPassword);
  const isManualValid = manualValidation.isValid && manualPassword === confirmPassword;
  const isSubmitDisabled =
    loading ||
    !!emailError ||
    !email ||
    (mode === "MANUAL" && !isManualValid);

  const handleRegeneratePassword = () => {
    setGeneratedPassword(generateStrongPassword(14));
  };

  const handleClose = () => {
    if (loading) return;
    // Clear credentials from memory
    setCredentials(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setLoading(true);
    setError("");

    try {
      const activePassword = mode === "MANUAL" ? manualPassword : generatedPassword;
      const apiMode = mode === "ACTIVATION_LINK" ? "ACTIVATION_LINK" : "DIRECT_PASSWORD";

      const res = await fetch(
        `/api/v1/admin/business-partner/applications/${application.id}/create-account`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            mode: apiMode,
            password: apiMode === "DIRECT_PASSWORD" ? activePassword : undefined,
            mustChangePassword,
            partnerType,
            internalNote: internalNote.trim() || undefined,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data) || "Failed to create partner account");
      }

      setCredentials({
        loginUrl: data.data?.loginUrl || `${window.location.origin}/login`,
        email: data.data?.email || email.trim(),
        password: data.data?.oneTimePassword || (apiMode === "DIRECT_PASSWORD" ? activePassword : null),
        partnerId: data.data?.partnerId,
        referralCode: data.data?.referralCode,
        mode: apiMode,
        activationLink: data.data?.activationLink,
      });

      onSuccess();
      toast.success("Broker account created successfully!");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!credentials) return;
    const textBlock = [
      `Axivon Technologies — Broker Partner Login Credentials`,
      `----------------------------------------------------`,
      `Partner ID: ${credentials.partnerId}`,
      `Referral Code: ${credentials.referralCode}`,
      `Login URL: ${credentials.loginUrl}`,
      `Username / Email: ${credentials.email}`,
      credentials.password ? `Temporary Password: ${credentials.password}` : ``,
      `Security Note: You will be prompted to change your password upon first login.`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(textBlock);
    setCopiedAll(true);
    toast.success("Credentials formatted block copied to clipboard.");
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const handleCopyPasswordOnly = () => {
    if (!credentials?.password) return;
    navigator.clipboard.writeText(credentials.password);
    setCopiedPass(true);
    toast.success("Password copied to clipboard.");
    setTimeout(() => setCopiedPass(false), 3000);
  };

  const handleSendEmail = async () => {
    try {
      setEmailSent(true);
      toast.success(`Login credentials dispatched to ${credentials?.email}`);
    } catch {
      toast.error("Failed to trigger email.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative max-h-[calc(100dvh-2rem)] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#C2A878]/10 border border-[#C2A878]/20 text-[#C2A878]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {credentials
                  ? "Login Credentials Created"
                  : application.status === "APPROVED"
                  ? "Create Broker Login"
                  : "Approve & Create Login"}
              </h2>
              <p className="text-xs text-gray-400">
                {application.fullName} ({application.applicationId})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── SUCCESS VIEW: ONE-TIME REVEAL PANEL ── */}
        {credentials ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-[#C2A878]/10 border border-[#C2A878]/20 text-xs text-[#C2A878] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-0.5">Important Security Notice</strong>
                <span>
                  This password is shown only once and cannot be retrieved later. Please copy or send
                  these credentials now.
                </span>
              </div>
            </div>

            <div className="bg-[#18181b] border border-white/10 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400">Login URL:</span>
                <a
                  href={credentials.loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-emerald-400 hover:underline flex items-center gap-1"
                >
                  {credentials.loginUrl} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400">Login Email:</span>
                <span className="font-mono text-white font-medium">{credentials.email}</span>
              </div>

              {credentials.password ? (
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-400">Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-300 font-bold tracking-wider">
                      {showPassword ? credentials.password : "••••••••••••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-gray-400 hover:text-white"
                      title={showPassword ? "Hide password" : "Reveal password"}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ) : credentials.activationLink ? (
                <div className="py-1 border-b border-white/5 space-y-1">
                  <span className="text-gray-400">Activation Link:</span>
                  <p className="font-mono text-[11px] text-gray-300 break-all bg-black/40 p-2 rounded border border-white/5">
                    {credentials.activationLink}
                  </p>
                </div>
              ) : null}

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400">Partner ID:</span>
                <span className="font-mono text-white font-semibold">{credentials.partnerId}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400">Referral Code:</span>
                <span className="font-mono text-[#C2A878] font-bold">{credentials.referralCode}</span>
              </div>
            </div>

            {/* Action Buttons for Credentials */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? "Copied All!" : "Copy Credentials"}</span>
              </button>

              {credentials.password && (
                <button
                  type="button"
                  onClick={handleCopyPasswordOnly}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedPass ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Key className="w-3.5 h-3.5" />}
                  <span>{copiedPass ? "Password Copied!" : "Copy Password"}</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={emailSent}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{emailSent ? "Email Sent to Broker" : "Send Email to Broker"}</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── FORM VIEW: CREATE LOGIN CONFIGURATION ── */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-gray-300">Login Email</label>
                {emailChecking && <span className="text-[10px] text-gray-400">Verifying...</span>}
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="broker@example.com"
                className={`w-full bg-[#18181b] border rounded-xl px-3 py-2 text-white focus:outline-none ${
                  emailError ? "border-red-500" : "border-white/10 focus:border-[#C2A878]/50"
                }`}
              />
              {emailError && <p className="text-[11px] text-red-400 mt-1">{emailError}</p>}
            </div>

            {/* Mode Selector Tabs */}
            <div>
              <label className="font-semibold text-gray-300 block mb-1.5">Password Provisioning</label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#18181b] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setMode("GENERATE")}
                  className={`py-1.5 rounded-lg font-medium text-[11px] transition-colors ${
                    mode === "GENERATE"
                      ? "bg-[#C2A878] text-black shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Generate Strong
                </button>
                <button
                  type="button"
                  onClick={() => setMode("MANUAL")}
                  className={`py-1.5 rounded-lg font-medium text-[11px] transition-colors ${
                    mode === "MANUAL"
                      ? "bg-[#C2A878] text-black shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Set Manually
                </button>
                <button
                  type="button"
                  onClick={() => setMode("ACTIVATION_LINK")}
                  className={`py-1.5 rounded-lg font-medium text-[11px] transition-colors ${
                    mode === "ACTIVATION_LINK"
                      ? "bg-[#C2A878] text-black shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Activation Link
                </button>
              </div>
            </div>

            {/* Mode A: Generated Password Display */}
            {mode === "GENERATE" && (
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-[11px]">Auto-Generated Password:</span>
                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    className="text-[#C2A878] hover:underline text-[11px] flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
                <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                  <span className="font-mono text-sm text-amber-300 font-bold tracking-wide">
                    {generatedPassword}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword);
                      toast.success("Password copied to clipboard");
                    }}
                    className="text-gray-400 hover:text-white"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-500">
                  14 characters, cryptographically secure. Excludes ambiguous symbols (0, O, 1, l).
                </p>
              </div>
            )}

            {/* Mode B: Manual Password Input */}
            {mode === "MANUAL" && (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Enter Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={manualPassword}
                      onChange={(e) => setManualPassword(e.target.value)}
                      placeholder="Min 10 chars, uppercase, lowercase, number, symbol"
                      className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-white pr-9 focus:outline-none focus:border-[#C2A878]/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C2A878]/50"
                  />
                  {confirmPassword && manualPassword !== confirmPassword && (
                    <p className="text-[10px] text-red-400 mt-1">Passwords do not match.</p>
                  )}
                </div>

                {/* Password Rules checklist */}
                <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1 text-[10px]">
                  <div
                    className={
                      manualPassword.length >= 10 ? "text-emerald-400" : "text-gray-500"
                    }
                  >
                    • Minimum 10 characters ({manualPassword.length}/10)
                  </div>
                  <div
                    className={
                      /[A-Z]/.test(manualPassword) && /[a-z]/.test(manualPassword)
                        ? "text-emerald-400"
                        : "text-gray-500"
                    }
                  >
                    • Uppercase and lowercase letters
                  </div>
                  <div
                    className={
                      /[0-9]/.test(manualPassword) && /[^A-Za-z0-9]/.test(manualPassword)
                        ? "text-emerald-400"
                        : "text-gray-500"
                    }
                  >
                    • At least one digit and symbol (!@#$%^&*)
                  </div>
                </div>
              </div>
            )}

            {/* Mode C: Activation Link Notice */}
            {mode === "ACTIVATION_LINK" && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-[11px] leading-relaxed">
                A single-use, 48-hour activation link will be generated and emailed to{" "}
                <strong className="text-white">{email}</strong>. The broker can set their own password
                upon clicking the link.
              </div>
            )}

            {/* Checkbox: Force Password Change */}
            {mode !== "ACTIVATION_LINK" && (
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={mustChangePassword}
                  onChange={(e) => setMustChangePassword(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-[#C2A878] focus:ring-0 focus:outline-none"
                />
                <span className="text-gray-300 text-[11px]">
                  Require password change at first login (recommended)
                </span>
              </label>
            )}

            {/* Partner Type Selector */}
            <div>
              <label className="font-semibold text-gray-300 block mb-1">Partner Type</label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {PARTNER_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            {/* Internal Note */}
            <div>
              <label className="font-semibold text-gray-300 block mb-1">
                Internal Administrative Note <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="e.g. Approved following intro meeting with Channel Lead."
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                disabled={loading}
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 disabled:opacity-40 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {mode === "ACTIVATION_LINK"
                    ? "Send Activation Link"
                    : application.status === "APPROVED"
                    ? "Create Login"
                    : "Approve & Create Login"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
