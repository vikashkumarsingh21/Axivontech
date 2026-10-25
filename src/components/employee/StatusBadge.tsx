import React from "react";
import { variants, dotColors } from "./status-styles";

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
    if (s.includes("APPROV") || s.includes("COMPLET") || s.includes("RESOLV") || s.includes("PRESENT") || s.includes("ACTIVE") || s.includes("SUBMITTED")) {
      computedVariant = "success";
    } else if (s.includes("REJECT") || s.includes("CANCEL") || s.includes("FAIL") || s.includes("ABSENT") || s.includes("URGENT") || s.includes("CLOSED") || s.includes("OVERDUE") || s.includes("BLOCKED")) {
      computedVariant = "error";
    } else if (s.includes("PEND") || s.includes("IN_PROGRESS") || s.includes("REVIEW") || s.includes("HIGH") || s.includes("HALF") || s.includes("PARTIAL")) {
      computedVariant = "warning";
    } else if (s.includes("OPEN") || s.includes("INFO") || s.includes("NEW")) {
      computedVariant = "info";
    }
  }

  const content = children || status?.replace(/_/g, " ") || "";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all ${variants[computedVariant]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[computedVariant]}`} />
      <span>{content}</span>
    </span>
  );
}
