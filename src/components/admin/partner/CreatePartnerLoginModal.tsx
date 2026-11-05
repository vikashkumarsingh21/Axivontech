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
  Loader2,
  ExternalLink,
  User,
  Phone,
  MapPin,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { generateStrongPassword, validatePasswordStrength } from "@/lib/auth/password-utils";
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
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
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
  const [emailConflictType, setEmailConflictType] = useState<string>("NONE");

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
    name: string;
    password?: string | null;
    partnerId: string;
    referralCode: string;
    applicationId: string;
    mode: string;
    mustChangePassword: boolean;
    activationLink?: string | null;
    emailConfigured?: boolean;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Initialize modal state when opened with an application
  useEffect(() => {
    if (isOpen && application) {
      setEmail(application.email || "");
      setEmailError("");
      setEmailConflictType("NONE");
      setError("");
      setCredentials(null);
      setCopiedKey(null);
      setEmailSending(false);
      setEmailSent(false);
      setMode("GENERATE");
      setGeneratedPassword(generateStrongPassword(14));
      setManualPassword("");
      setConfirmPassword("");
      setMustChangePassword(true);
      setPartnerType(application.occupation || "Broker or Referral Agent");
      setInternalNote("");
    }
  }, [isOpen, application]);

  // Live email duplicate check with debounce
  const checkEmail = useCallback(
    async (testEmail: string) => {
      if (!testEmail || !testEmail.includes("@")) return;
      try {
        setEmailChecking(true);
        const appIdParam = application?.id ? `&applicationId=${encodeURIComponent(application.id)}` : "";
        const res = await fetch(
          `/api/v1/admin/business-partner/applications/check-email?email=${encodeURIComponent(
            testEmail.trim()
          )}${appIdParam}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to verify email");

        setEmailConflictType(data.conflictType || "NONE");

        if (!data.canProceed && data.message) {
          setEmailError(data.message);
        } else {
          setEmailError("");
        }
      } catch {
        // Network errors on pre-check are non-fatal
      } finally {
        setEmailChecking(false);
      }
    },
    [application?.id]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (email && email.trim() !== application?.email) {
        checkEmail(email);
      } else {
        setEmailError("");
        setEmailConflictType("NONE");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [email, application?.email, checkEmail]);

  if (!isOpen || !application) return null;

  // Manual Password Validation Rules
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
            loginEmail: email.trim(),
            mode: apiMode,
            password: apiMode === "DIRECT_PASSWORD" ? activePassword : undefined,
            mustChangePassword,
            partnerType,
            internalNote: internalNote.trim() || undefined,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(json) || "Failed to create partner account");
      }

      const accountData = json.data || {};
      setCredentials({
        loginUrl: accountData.loginUrl || `${window.location.origin}/login`,
        email: accountData.email || email.trim(),
        name: accountData.name || application.fullName,
        password: accountData.oneTimePassword || (apiMode === "DIRECT_PASSWORD" ? activePassword : null),
        partnerId: accountData.partnerId,
        referralCode: accountData.referralCode,
        applicationId: accountData.applicationId || application.applicationId,
        mode: apiMode,
        mustChangePassword: accountData.mustChangePassword ?? mustChangePassword,
        activationLink: accountData.activationLink,
        emailConfigured: !!accountData.emailConfigured,
      });

      onSuccess();
      toast.success(
        accountData.isExisting
          ? "Partner profile linked to existing account."
          : "Broker partner account created successfully!"
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`${label} copied to clipboard.`);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}.`);
    }
  };

  const handleCopyCredentials = () => {
    if (!credentials) return;
    const textBlock = [
      `AXIVON TECHNOLOGIES — BUSINESS PARTNER LOGIN CREDENTIALS`,
      `======================================================`,
      `Partner Name: ${credentials.name}`,
      `Application ID: ${credentials.applicationId}`,
      `Partner ID: ${credentials.partnerId}`,
      `Referral Code: ${credentials.referralCode}`,
      `Login URL: ${credentials.loginUrl}`,
      `Login ID (Email): ${credentials.email}`,
      credentials.password ? `Temporary Password: ${credentials.password}` : ``,
      credentials.activationLink ? `Activation Link: ${credentials.activationLink}` : ``,
      `Account Status: ACTIVE ${credentials.mustChangePassword ? "(PASSWORD CHANGE REQUIRED)" : ""}`,
      `Security Notice: Please replace your temporary password upon first sign-in.`,
    ]
      .filter(Boolean)
      .join("\n");

    handleCopy(textBlock, "all", "Full credential details");
  };

  const handleSendEmail = async () => {
    if (!credentials || !credentials.emailConfigured) return;
    try {
      setEmailSending(true);
      const res = await fetch(`/api/v1/admin/brokers/${credentials.partnerId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend_activation",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(data) || "Failed to dispatch email");
      setEmailSent(true);
      toast.success(`Activation details emailed to ${credentials.email}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setEmailSending(false);
    }
  };

  if (!isOpen || !application) return null;

  const isApproved = application.status === "APPROVED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141416] border border-white/10 rounded-2xl w-full max-w-xl p-5 sm:p-6 space-y-5 shadow-2xl relative max-h-[calc(100dvh-2rem)] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#C2A878]/10 border border-[#C2A878]/20 text-[#C2A878]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {credentials
                  ? "Partner Account Created Successfully"
                  : isApproved
                  ? "Create Broker Login"
                  : "Approve & Create Login"}
              </h2>
              <p className="text-xs text-gray-400">
                {application.fullName} • <span className="font-mono">{application.applicationId}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── SUCCESS VIEW: ONE-TIME REVEAL PANEL (PHASE 4) ── */}
        {credentials ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <strong className="block font-semibold text-white mb-0.5">
                  Partner Account Active & Ready for Sign-in
                </strong>
                <span>
                  The applicant can now log in using their registered email as the Login ID. For security,
                  the temporary password is shown only now and will not be displayed again.
                </span>
              </div>
            </div>

            {/* Credentials Card */}
            <div className="bg-[#18181b] border border-white/10 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400 font-medium">Partner Name:</span>
                <span className="text-white font-semibold">{credentials.name}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400 font-medium">Login URL:</span>
                <a
                  href={credentials.loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  {credentials.loginUrl} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400 font-medium">Login ID (Registered Email):</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white font-semibold">{credentials.email}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(credentials.email, "email", "Login ID")}
                    className="p-1 text-gray-400 hover:text-white"
                    title="Copy Login ID"
                  >
                    {copiedKey === "email" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {credentials.password ? (
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-400 font-medium">Temporary Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-300 font-bold tracking-wider text-sm bg-black/40 px-2.5 py-1 rounded border border-white/10">
                      {showPassword ? credentials.password : "••••••••••••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-gray-400 hover:text-white"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(credentials.password!, "password", "Password")}
                      className="p-1 text-gray-400 hover:text-white"
                      title="Copy Password"
                    >
                      {copiedKey === "password" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ) : credentials.activationLink ? (
                <div className="py-1 border-b border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Activation Link:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(credentials.activationLink!, "link", "Activation Link")}
                      className="text-gray-400 hover:text-white text-[11px] flex items-center gap-1"
                    >
                      {copiedKey === "link" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Link</span>
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-gray-300 break-all bg-black/40 p-2 rounded border border-white/5">
                    {credentials.activationLink}
                  </p>
                </div>
              ) : null}

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400 font-medium">Account Status:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ACTIVE • {credentials.mustChangePassword ? "PASSWORD CHANGE REQUIRED" : "ACTIVE"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-400 font-medium">Partner ID:</span>
                <span className="font-mono text-white font-semibold">{credentials.partnerId}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 font-medium">Referral Code:</span>
                <span className="font-mono text-[#C2A878] font-bold">{credentials.referralCode}</span>
              </div>
            </div>

            {/* Outbound Email Status Notification (Truthful handling - Phase 4) */}
            {credentials.emailConfigured ? (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center justify-between">
                <span>Email service is active. You can send activation details directly.</span>
                <button
                  type="button"
                  disabled={emailSending || emailSent}
                  onClick={handleSendEmail}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium flex items-center gap-1 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{emailSent ? "Email Sent" : emailSending ? "Sending..." : "Send Email"}</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-0.5">
                  <span className="font-semibold block text-white">Outbound Email Service Not Configured</span>
                  <span>
                    No external email service (Resend or Webhook) is connected. Please copy the login
                    credentials below and share them manually with the partner.
                  </span>
                </div>
              </div>
            )}

            {/* Quick Action Buttons for Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCopy(credentials.email, "email_btn", "Login ID")}
                className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedKey === "email_btn" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy Login ID</span>
              </button>

              {credentials.password && (
                <button
                  type="button"
                  onClick={() => handleCopy(credentials.password!, "pass_btn", "Password")}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedKey === "pass_btn" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Key className="w-3.5 h-3.5" />
                  )}
                  <span>Copy Password</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyCredentials}
                className="px-3 py-2.5 rounded-xl bg-[#C2A878]/15 hover:bg-[#C2A878]/25 border border-[#C2A878]/30 text-[#E5D2A6] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedKey === "all" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy All Details</span>
              </button>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── FORM VIEW: APPLICANT REVIEW & ACCOUNT PROVISIONING ── */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Applicant Information Summary (Phase 2 & Phase 3) */}
            <div className="bg-[#18181b] border border-white/10 rounded-xl p-3.5 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                Applicant Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#C2A878]" />
                  <span className="text-white font-medium">{application.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono text-gray-200">{application.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{application.phone || "No phone provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    {application.city || "N/A"}, {application.country || "India"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span>Status: <strong className="text-white">{application.status.replace(/_/g, " ")}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-gray-400" />
                  <span>Type: {application.occupation || "Broker Partner"}</span>
                </div>
              </div>
            </div>

            {/* Login Email Field & Notice */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-gray-300">
                  Login ID (Registered Email)
                </label>
                {emailChecking && <span className="text-[10px] text-gray-400">Verifying...</span>}
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@example.com"
                className={`w-full bg-[#18181b] border rounded-xl px-3.5 py-2.5 text-white focus:outline-none ${
                  emailError ? "border-red-500" : "border-white/10 focus:border-[#C2A878]/50"
                }`}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                The partner will use this registered email address to log in to the Broker Portal.
              </p>
              {emailError && (
                <div className="mt-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Password Provisioning Mode Selector */}
            <div>
              <label className="font-semibold text-gray-300 block mb-1.5">Temporary Password Creation</label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#18181b] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setMode("GENERATE")}
                  className={`py-1.5 rounded-lg font-medium text-[11px] transition-colors ${
                    mode === "GENERATE"
                      ? "bg-[#C2A878] text-black shadow-sm font-semibold"
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
                      ? "bg-[#C2A878] text-black shadow-sm font-semibold"
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
                      ? "bg-[#C2A878] text-black shadow-sm font-semibold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Activation Link
                </button>
              </div>
            </div>

            {/* Mode A: Generated Strong Password */}
            {mode === "GENERATE" && (
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-[11px]">Auto-Generated Password:</span>
                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    className="text-[#C2A878] hover:underline text-[11px] flex items-center gap-1 font-medium"
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
                  14 characters cryptographically secure. Excludes ambiguous symbols for easy transcription.
                </p>
              </div>
            )}

            {/* Mode B: Manual Password Input */}
            {mode === "MANUAL" && (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Enter Temporary Password
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
                    Confirm Temporary Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password to verify"
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C2A878]/50"
                  />
                  {confirmPassword && manualPassword !== confirmPassword && (
                    <p className="text-[10px] text-red-400 mt-1">Passwords do not match.</p>
                  )}
                </div>

                {/* Password Rules checklist */}
                <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1 text-[10px]">
                  <div className={manualPassword.length >= 10 ? "text-emerald-400" : "text-gray-500"}>
                    • Minimum 10 characters ({manualPassword.length}/10)
                  </div>
                  <div
                    className={
                      /[A-Z]/.test(manualPassword) && /[a-z]/.test(manualPassword)
                        ? "text-emerald-400"
                        : "text-gray-500"
                    }
                  >
                    • Both uppercase and lowercase letters
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
                A single-use, 48-hour activation link will be generated for{" "}
                <strong className="text-white">{email}</strong>. The partner can choose their own password
                upon visiting the link.
              </div>
            )}

            {/* Mandatory First Login Password Change Flag */}
            {mode !== "ACTIVATION_LINK" && (
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={mustChangePassword}
                  onChange={(e) => setMustChangePassword(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-[#C2A878] focus:ring-0 focus:outline-none"
                />
                <span className="text-gray-300 text-[11px]">
                  Require password change at first login (mandatory security recommendation)
                </span>
              </label>
            )}

            {/* Partner Designation / Type */}
            <div>
              <label className="font-semibold text-gray-300 block mb-1">Partner Designation / Role</label>
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

            {/* Internal Administrative Note */}
            <div>
              <label className="font-semibold text-gray-300 block mb-1">
                Internal Administrative Note <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="e.g. Approved following intro meeting with Partner Operations."
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            {/* Dialog Action Buttons */}
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
                    ? "Generate Activation Link"
                    : isApproved
                    ? "Create Account & Login"
                    : "Approve & Create Account"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
