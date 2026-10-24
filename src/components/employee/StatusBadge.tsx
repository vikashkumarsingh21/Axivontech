import React from "react";

const variants = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-xs",
  error: "bg-rose-500/10 text-rose-400 border-rose-500/25 shadow-xs",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-xs",
  info: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25 shadow-xs",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25 shadow-xs",
  neutral: "bg-slate-800/80 text-slate-300 border-slate-700/80",
  purple: "bg-violet-500/10 text-violet-400 border-violet-500/25 shadow-xs",
};

export function StatusBadge({
  children,
  variant,
  status,
  className = "",
}: {
  children?: React.ReactNode;
  variant?: keyof typeof variants;
  status?: string;
  className?: string;
}) {
  let computedVariant: keyof typeof variants = variant || "neutral";
  if (status && !variant) {
    const s = status.toUpperCase();
    if (s.includes("APPROV") || s.includes("COMPLET") || s.includes("RESOLV") || s.includes("PRESENT") || s.includes("ACTIVE")) {
      computedVariant = "success";
    } else if (s.includes("REJECT") || s.includes("CANCEL") || s.includes("FAIL") || s.includes("ABSENT") || s.includes("URGENT") || s.includes("CLOSED")) {
      computedVariant = "error";
    } else if (s.includes("PEND") || s.includes("IN_PROGRESS") || s.includes("REVIEW") || s.includes("HIGH") || s.includes("HALF")) {
      computedVariant = "warning";
    } else if (s.includes("OPEN") || s.includes("INFO") || s.includes("NEW")) {
      computedVariant = "info";
    }
  }

  const content = children || status?.replace(/_/g, " ") || "";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${variants[computedVariant]} ${className}`}
    >
      {content}
    </span>
  );
}
