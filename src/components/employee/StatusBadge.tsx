const variants = {
  success: "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20",
  error: "bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  info: "bg-[#5FA8A0]/10 text-[#5FA8A0] border-[#5FA8A0]/20",
  neutral: "bg-[#171A1F] text-[#8B94A1] border-[#22262D]",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function StatusBadge({ 
  children, 
  variant,
  status,
}: { 
  children?: React.ReactNode; 
  variant?: keyof typeof variants;
  status?: string;
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${variants[computedVariant]}`}>
      {content}
    </span>
  );
}
