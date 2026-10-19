"use client";

import React, { useState, useRef } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { TurnstileWidget, TurnstileWidgetRef } from "@/components/ui/TurnstileWidget";

interface LeadCaptureProps {
  onComplete: (name: string) => void;
  onCancel: () => void;
}

export function LeadCapture({ onComplete, onCancel }: LeadCaptureProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceInterest: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();

    if (!cleanName || !cleanEmail) {
      setError("Please provide both your name and email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: formData.phone.trim() || undefined,
          serviceInterest: formData.serviceInterest.trim() || undefined,
          message: formData.message.trim() || undefined,
          source: "WEBSITE_CHATBOT",
          captchaToken: captchaToken || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onComplete(cleanName);
        }, 1500);
      } else {
        turnstileRef.current?.reset();
        setCaptchaToken("");
        setError(data.error || "Failed to submit request. Please try again.");
      }
    } catch {
      turnstileRef.current?.reset();
      setCaptchaToken("");
      setError("Network connection issue. Please check your connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center bg-[#171C23] rounded-xl border border-[#10B981]/30 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]/15 text-[#10B981] mb-2">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h4 className="text-xs font-semibold text-[#F3F5F7]">Request Confirmed</h4>
        <p className="text-[11px] text-[#A7B0BC] mt-0.5">
          Our core engineering team will contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#29313B] bg-[#171C23] p-3.5 shadow-sm text-xs">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#29313B]">
        <div className="h-2 w-2 rounded-full bg-[#10B981]" />
        <span className="font-semibold text-[#F3F5F7] tracking-tight">
          Request Project Consultation
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <label className="block text-[10px] font-mono font-medium text-[#7D8795] uppercase mb-1">
            Your Name <span className="text-[#10B981]">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg bg-[#101318] border border-[#29313B] px-3 py-2 text-xs text-[#F3F5F7] placeholder-[#7D8795] focus:border-[#10B981] focus:outline-none transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono font-medium text-[#7D8795] uppercase mb-1">
            Work Email <span className="text-[#10B981]">*</span>
          </label>
          <input
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-lg bg-[#101318] border border-[#29313B] px-3 py-2 text-xs text-[#F3F5F7] placeholder-[#7D8795] focus:border-[#10B981] focus:outline-none transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-mono font-medium text-[#7D8795] uppercase mb-1">
              Phone / WhatsApp
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg bg-[#101318] border border-[#29313B] px-3 py-2 text-xs text-[#F3F5F7] placeholder-[#7D8795] focus:border-[#10B981] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-medium text-[#7D8795] uppercase mb-1">
              Service
            </label>
            <input
              type="text"
              placeholder="e.g. Web / Mobile / AI"
              value={formData.serviceInterest}
              onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
              className="w-full rounded-lg bg-[#101318] border border-[#29313B] px-3 py-2 text-xs text-[#F3F5F7] placeholder-[#7D8795] focus:border-[#10B981] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono font-medium text-[#7D8795] uppercase mb-1">
            Project Overview (Optional)
          </label>
          <textarea
            placeholder="Tell us what you are looking to build, timeline, or key objectives..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={2}
            className="w-full rounded-lg bg-[#101318] border border-[#29313B] px-3 py-2 text-xs text-[#F3F5F7] placeholder-[#7D8795] focus:border-[#10B981] focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Honeypot field for anti-bot protection */}
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
        <div className="flex justify-center pt-1 overflow-hidden">
          <TurnstileWidget
            ref={turnstileRef}
            action="chatbot_lead"
            size="compact"
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken("")}
            onError={() => setCaptchaToken("")}
          />
        </div>

        <p className="text-[10px] text-[#7E8997] text-center leading-tight">
          By submitting, you agree to our{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#10B981] hover:underline">
            Privacy Policy
          </a>{" "}
          under the DPDP Act 2023.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 rounded-lg border border-[#29313B] text-xs font-medium text-[#A7B0BC] hover:bg-[#1D242D] hover:text-[#F3F5F7] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#10B981] text-[#04130E] font-semibold text-xs hover:bg-[#059669] transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Request</span>
                <Send className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
