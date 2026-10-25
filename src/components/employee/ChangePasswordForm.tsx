"use client";

import { useState, useRef } from "react";
import { EpButton } from "@/components/employee/EpButton";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { TurnstileWidget, TurnstileWidgetRef } from "@/components/ui/TurnstileWidget";
import { parseApiResponse, getErrorMessage } from "@/lib/errors/client";
import { toast } from "@/lib/notifications/toast";

export function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/employee/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, captchaToken }),
      });

      const parsed = await parseApiResponse(res);
      if (!parsed.ok) {
        turnstileRef.current?.reset();
        setCaptchaToken("");
        const msg = parsed.errorMessage || "Failed to change password";
        setError(msg);
        toast.error(msg);
        return;
      }

      const msg = parsed.data?.message || parsed.raw?.message || "Password changed successfully";
      setSuccess(msg);
      toast.success(msg);
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setIsOpen(false), 3000);
    } catch (err: unknown) {
      turnstileRef.current?.reset();
      setCaptchaToken("");
      const cleanErr = getErrorMessage(err);
      setError(cleanErr);
      toast.error(cleanErr);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <EpButton variant="secondary" size="sm" onClick={() => setIsOpen(true)}>
        Change Password
      </EpButton>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-xl bg-[#232324] border border-[#2E2E30] space-y-4">
      <h4 className="text-sm font-semibold text-[#EDEBE6]">Change Password</h4>

      {success && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#4F9D83]/10 border border-[#4F9D83]/25 text-[#4F9D83] text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#C46A62]/10 border border-[#C46A62]/25 text-[#C46A62] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#B3AFA6] mb-1">Current Password</label>
          <input
            type="password"
            required
            value={formData.currentPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
            className="w-full bg-[#1A1A1B] border border-[#2E2E30] rounded-lg px-3 py-2 text-xs text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#B3AFA6] mb-1">New Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={formData.newPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
            className="w-full bg-[#1A1A1B] border border-[#2E2E30] rounded-lg px-3 py-2 text-xs text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#B3AFA6] mb-1">Confirm New Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={formData.confirmPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full bg-[#1A1A1B] border border-[#2E2E30] rounded-lg px-3 py-2 text-xs text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
          />
        </div>

        {/* Honeypot field for bot deterrence */}
        <input
          type="text"
          name="website_trap"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
          style={{ display: "none" }}
        />

        {/* Cloudflare Turnstile Verification */}
        <div className="pt-2 flex justify-center">
          <TurnstileWidget
            ref={turnstileRef}
            action="change_password"
            size="compact"
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken("")}
            onError={() => setCaptchaToken("")}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <EpButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              setError(null);
              setSuccess(null);
            }}
          >
            Cancel
          </EpButton>
          <EpButton type="submit" variant="primary" size="sm" loading={loading}>
            Save Password
          </EpButton>
        </div>
      </form>
    </div>
  );
}
