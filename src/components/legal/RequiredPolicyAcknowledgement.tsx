"use client";

import React, { useId } from "react";
import Link from "next/link";
import { AlertCircle, ShieldCheck } from "lucide-react";

export interface RequiredPolicyAcknowledgementProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  policySlug?: string;
  policyTitle?: string;
  policyHref?: string;
  policyVersion?: string;
  error?: string | null;
  errorMessage?: string | null;
  disabled?: boolean;
  className?: string;
  id?: string;
  showVersionBadge?: boolean;
}

export const RequiredPolicyAcknowledgement: React.FC<RequiredPolicyAcknowledgementProps> = ({
  checked,
  onChange,
  policySlug = "privacy-policy",
  policyTitle = "Privacy Policy",
  policyHref = "/privacy-policy",
  policyVersion,
  error,
  errorMessage,
  disabled = false,
  className = "",
  id: customId,
  showVersionBadge = false,
}) => {
  const activeError = error || errorMessage;
  const generatedId = useId();
  const inputId = customId || `policy-ack-${generatedId}`;
  const errorId = `policy-error-${generatedId}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-start gap-3 select-none">
        <div className="flex items-center h-5 mt-0.5">
          <input
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            aria-required="true"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="w-4 h-4 rounded border-[#29313B] bg-[#10151B] text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0 focus:ring-1 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed accent-emerald-500"
          />
        </div>
        <label
          htmlFor={inputId}
          className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed cursor-pointer"
        >
          <span>I have read and acknowledge the </span>
          <Link
            href={policyHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 font-medium transition-colors inline-flex items-center gap-1"
          >
            {policyTitle}
          </Link>
          <span className="text-red-400 font-semibold ml-0.5">*</span>
          {showVersionBadge && policyVersion && (
            <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-2.5 h-2.5" />
              v{policyVersion}
            </span>
          )}
        </label>
      </div>

      {activeError && (
        <div
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-red-400 font-medium pl-7 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
};
