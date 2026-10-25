import React from "react";

export type StatusCategory = "lead" | "project" | "contract" | "payment" | "commission" | "general";

interface BrokerStatusBadgeProps {
  status: string;
  category?: StatusCategory;
  className?: string;
  label?: string;
}

export function BrokerStatusBadge({
  status,
  category = "general",
  className = "",
  label,
}: BrokerStatusBadgeProps) {
  const normStatus = (status || "").toUpperCase().replace(/[\s-]/g, "_");

  // Determine palette tier: success, warning, error, info, neutral, accent
  let tier: "success" | "warning" | "error" | "info" | "neutral" | "accent" = "neutral";

  switch (normStatus) {
    // Success / Completed / Verified / Paid
    case "PAID":
    case "COMPLETED":
    case "VERIFIED":
    case "CONVERTED":
    case "QUALIFIED":
    case "APPROVED":
    case "ACTIVE":
      tier = "success";
      break;

    // Action needed / Review / Requested / Pending
    case "PENDING":
    case "PENDING_REVIEW":
    case "PROJECT_REQUESTED":
    case "REQUESTED":
    case "UNDER_REVIEW":
    case "PROCESSING":
    case "PROPOSAL_SENT":
      tier = "warning";
      break;

    // Rejected / Cancelled / Lost
    case "REJECTED":
    case "CANCELLED":
    case "LOST":
    case "DISQUALIFIED":
    case "SUSPENDED":
    case "INACTIVE":
      tier = "error";
      break;

    // In Progress / Sent / Downloaded
    case "IN_PROGRESS":
    case "SENT":
    case "DOWNLOADED":
    case "SIGNED":
    case "CONTACTED":
    case "NEW":
      tier = "info";
      break;

    // Eligible
    case "ELIGIBLE":
      tier = "accent";
      break;

    default:
      tier = "neutral";
  }

  const tierStyles = {
    success: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      dot: "bg-amber-400",
    },
    error: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
      dot: "bg-red-400",
    },
    info: {
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      text: "text-sky-400",
      dot: "bg-sky-400",
    },
    accent: {
      bg: "bg-[#C2A878]/10",
      border: "border-[#C2A878]/25",
      text: "text-[#C2A878]",
      dot: "bg-[#C2A878]",
    },
    neutral: {
      bg: "bg-[#171A1F]",
      border: "border-[#22262D]",
      text: "text-[#8B94A1]",
      dot: "bg-[#8B94A1]",
    },
  };

  const style = tierStyles[tier];

  // Friendly human readable label
  const displayLabel =
    label ||
    normStatus
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border select-none ${style.bg} ${style.border} ${style.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      <span className="truncate">{displayLabel}</span>
    </span>
  );
}
