"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Key,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { generateStrongPassword, validatePasswordStrength } from "@/lib/auth/password";
import { toast } from "@/lib/notifications/toast";
import { getErrorMessage } from "@/lib/errors/client";

interface ResetBrokerPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokerId: string;
  brokerEmail: string;
  brokerName: string;
  partnerId?: string;
  referralCode?: string;
}

export function ResetBrokerPasswordModal({
  isOpen,
  onClose,
  brokerId,
  brokerEmail,
  brokerName,
  partnerId,
  referralCode,
}: ResetBrokerPasswordModalProps) {
  const [mode, setMode] = useState<"GENERATE" | "MANUAL" | "ACTIVATION_LINK">("GENERATE");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Success view state
  const [createdCredentials, setCreatedCredentials] = useState<{
    loginUrl: string;
    email: string;
    password?: string;
    mustChangePassword?: boolean;
    partnerId?: string;
    referralCode?: string;
    activationLink?: string;
    isLinkMode?: boolean;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword(generateStrongPassword(14));
      setShowPassword(false);
      setMode("GENERATE");
      setMustChangePassword(true);
      setCreatedCredentials(null);
      setCopiedKey(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegenerate = () => {
    setPassword(generateStrongPassword(14));
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCopyAll = async () => {
    if (!createdCredentials) return;
    const block = [
      `AXIVON BROKER CREDENTIALS`,
      `========================`,
      `Name: ${brokerName}`,
      `Login URL: ${createdCredentials.loginUrl}`,
      `Email: ${createdCredentials.email}`,
      createdCredentials.password ? `Temporary Password: ${createdCredentials.password}` : "",
      createdCredentials.partnerId ? `Partner ID: ${createdCredentials.partnerId}` : "",
      createdCredentials.referralCode ? `Referral Code: ${createdCredentials.referralCode}` : "",
      createdCredentials.mustChangePassword
        ? `Note: You will be asked to choose a new password upon first sign-in.`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    await handleCopy(block, "all");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "ACTIVATION_LINK") {
        const res = await fetch(`/api/v1/admin/brokers/${brokerId}/actions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reset_password",
            mode: "ACTIVATION_LINK",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(getErrorMessage(data) || "Failed to send reset link");

        setCreatedCredentials({
          loginUrl: window.location.origin + "/login",
          email: brokerEmail,
          activationLink: data.activationLink,
          isLinkMode: true,
        });
        toast.success("Reset link generated successfully");
      } else {
        // Direct password
        const validation = validatePasswordStrength(password);
        if (!validation.isValid) {
          toast.warning(validation.errors[0] || "Password does not meet complexity requirements");
          setSubmitting(false);
          return;
        }

        const res = await fetch(`/api/v1/admin/brokers/${brokerId}/actions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reset_password",
            password: password.trim(),
            requirePasswordChange: mustChangePassword,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(getErrorMessage(data) || "Failed to reset password");

        setCreatedCredentials({
          loginUrl: data.data?.loginUrl || window.location.origin + "/login",
          email: data.data?.email || brokerEmail,
          password: data.data?.password || password.trim(),
          mustChangePassword: data.data?.mustChangePassword ?? mustChangePassword,
          partnerId: data.data?.partnerId || partnerId,
          referralCode: data.data?.referralCode || referralCode,
          isLinkMode: false,
        });
        toast.success("Password reset successfully");
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161618]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Reset Broker Password</h2>
              <p className="text-xs text-gray-400">{brokerName} ({brokerEmail})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {createdCredentials ? (
            /* One-Time Credentials Display */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-white">
                    {createdCredentials.isLinkMode
                      ? "Activation Link Dispatched"
                      : "Password Reset Completed"}
                  </p>
                  <p className="text-gray-300">
                    {createdCredentials.isLinkMode
                      ? `A reset link was sent to ${createdCredentials.email}.`
                      : "These credentials are ready for the broker. The password will not be viewable again after closing."}
                  </p>
                </div>
              </div>

              {!createdCredentials.isLinkMode && (
                <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
                      Login Email
                    </label>
                    <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-200">
                      <span>{createdCredentials.email}</span>
                      <button
                        onClick={() => handleCopy(createdCredentials.email, "email")}
                        className="text-gray-400 hover:text-white"
                        title="Copy Email"
                      >
                        {copiedKey === "email" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {createdCredentials.password && (
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
                        New Temporary Password
                      </label>
                      <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400">
                        <span>
                          {showPassword
                            ? createdCredentials.password
                            : "•".repeat(createdCredentials.password.length)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="text-gray-400 hover:text-white"
                            title={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(createdCredentials.password!, "password")
                            }
                            className="text-gray-400 hover:text-white"
                            title="Copy Password"
                          >
                            {copiedKey === "password" ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleCopyAll}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      {copiedKey === "all" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Copy Credentials Block
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>
                  For security compliance, passwords are only transmitted once and never stored in plain text.
                </span>
              </div>
            </div>
          ) : (
            /* Configuration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Reset Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("GENERATE");
                      setPassword(generateStrongPassword(14));
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      mode === "GENERATE"
                        ? "bg-red-500/20 border-red-500/40 text-red-300"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    Auto-Generate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("MANUAL");
                      setPassword("");
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      mode === "MANUAL"
                        ? "bg-red-500/20 border-red-500/40 text-red-300"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    Set Manually
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("ACTIVATION_LINK")}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      mode === "ACTIVATION_LINK"
                        ? "bg-red-500/20 border-red-500/40 text-red-300"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    Activation Link
                  </button>
                </div>
              </div>

              {/* Password Fields */}
              {mode !== "ACTIVATION_LINK" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300">
                      {mode === "GENERATE" ? "Generated Strong Password" : "New Password"}
                    </label>
                    {mode === "GENERATE" && (
                      <button
                        type="button"
                        onClick={handleRegenerate}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
                      >
                        <RefreshCw className="w-3 h-3" /> Regenerate
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      readOnly={mode === "GENERATE"}
                      className={`w-full bg-[#0c0c0e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono pr-20 focus:outline-none focus:border-red-500/50 ${
                        mode === "GENERATE" ? "bg-white/5" : ""
                      }`}
                      placeholder={mode === "MANUAL" ? "Enter min 10 chars..." : ""}
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password rules indicator for manual mode */}
                  {mode === "MANUAL" && (
                    <div className="text-[11px] text-gray-500 space-y-0.5 pt-1">
                      <p>Rules: 10+ characters, 1 uppercase, 1 lowercase, 1 digit, 1 symbol</p>
                    </div>
                  )}

                  {/* Force Change Password Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={mustChangePassword}
                      onChange={(e) => setMustChangePassword(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-red-500 focus:ring-0"
                    />
                    <span className="text-xs text-gray-300 font-medium">
                      Require password change at first login
                    </span>
                  </label>
                </div>
              )}

              {mode === "ACTIVATION_LINK" && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-start gap-2.5">
                  <LinkIcon className="w-4 h-4 flex-shrink-0 text-blue-400 mt-0.5" />
                  <p>
                    A single-use, 48-hour activation link will be generated and emailed directly to{" "}
                    <strong className="text-white">{brokerEmail}</strong>.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
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
